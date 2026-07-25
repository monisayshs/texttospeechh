const crypto = require('crypto');
const scriptEngine = require('./scriptEngine');
const loadBalancer = require('./loadBalancer');
const audioPipeline = require('./audioPipeline');

/**
 * Production Request Queue Service with Concurrency Control,
 * FIFO Priority Levels, Pause/Resume, Cancellation, and Real-Time ETA.
 */
class QueueService {
  constructor() {
    this.jobs = new Map();
    this.queue = []; // List of pending jobIds
    this.activeWorkerCount = 0;
    this.maxConcurrentWorkers = 2;

    // Auto-cleanup expired jobs every 15 minutes (older than 1 hour)
    setInterval(() => this.cleanupExpiredJobs(), 15 * 60 * 1000);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create & enqueue a new voice synthesis job
   */
  createJob(text, options = {}, priority = 'NORMAL') {
    const jobId = crypto.randomBytes(12).toString('hex');
    const chunks = scriptEngine.splitScript(text);
    const wordCount = text.trim().split(/\s+/).length;

    const job = {
      id: jobId,
      textLength: text.length,
      wordCount: wordCount,
      chunks: chunks,
      totalChunks: chunks.length,
      processedChunks: 0,
      progress: 0,
      etaSeconds: Math.ceil(chunks.length * 2.5), // Initial ETA estimation
      priority: priority, // 'HIGH' | 'NORMAL' | 'LOW'
      state: 'QUEUED',
      options: options,
      audioBuffer: null,
      error: null,
      abortController: new AbortController(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.jobs.set(jobId, job);

    // Insert job into queue based on priority
    if (priority === 'HIGH') {
      this.queue.unshift(jobId);
    } else {
      this.queue.push(jobId);
    }

    console.log(`[QueueService] Enqueued Job ${jobId} (${wordCount} words, ${chunks.length} chunks, Priority: ${priority})`);
    setImmediate(() => this.dispatchWorkers());

    return this.getJobStatus(jobId);
  }

  /**
   * Get job progress status
   */
  getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return {
      jobId: job.id,
      state: job.state,
      progress: job.progress,
      processedChunks: job.processedChunks,
      totalChunks: job.totalChunks,
      etaSeconds: job.etaSeconds,
      wordCount: job.wordCount,
      error: job.error,
      hasAudio: !!job.audioBuffer,
      audioSize: job.audioBuffer ? job.audioBuffer.length : 0
    };
  }

  /**
   * Get job final merged audio buffer
   */
  getJobAudio(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || job.state !== 'COMPLETED' || !job.audioBuffer) return null;
    return job.audioBuffer;
  }

  /**
   * Pause a running or queued job
   */
  pauseJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job && (job.state === 'QUEUED' || job.state === 'PROCESSING')) {
      job.state = 'PAUSED';
      console.log(`[QueueService] Job ${jobId} PAUSED.`);
      return true;
    }
    return false;
  }

  /**
   * Resume a paused job
   */
  resumeJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job && job.state === 'PAUSED') {
      job.state = 'QUEUED';
      this.queue.push(jobId);
      console.log(`[QueueService] Job ${jobId} RESUMED.`);
      setImmediate(() => this.dispatchWorkers());
      return true;
    }
    return false;
  }

  /**
   * Cancel a running or queued job
   */
  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job && job.state !== 'COMPLETED' && job.state !== 'CANCELLED') {
      job.state = 'CANCELLED';
      job.error = 'Job cancelled by user.';
      if (job.abortController) {
        job.abortController.abort();
      }
      console.log(`[QueueService] Job ${jobId} CANCELLED.`);
      return true;
    }
    return false;
  }

  /**
   * Dispatch background worker tasks based on worker concurrency limit
   */
  async dispatchWorkers() {
    while (this.activeWorkerCount < this.maxConcurrentWorkers && this.queue.length > 0) {
      const jobId = this.queue.shift();
      const job = this.jobs.get(jobId);

      if (!job || job.state === 'CANCELLED' || job.state === 'PAUSED') {
        continue;
      }

      this.activeWorkerCount++;
      this.processJob(job).finally(() => {
        this.activeWorkerCount--;
        this.dispatchWorkers();
      });
    }
  }

  /**
   * Worker loop processing single job
   */
  async processJob(job) {
    job.state = 'PROCESSING';
    job.updatedAt = Date.now();
    console.log(`[QueueService] Worker starting Job ${job.id} (${job.totalChunks} chunks)...`);

    const audioChunks = [];
    const startTime = Date.now();

    try {
      for (let i = 0; i < job.chunks.length; i++) {
        // Handle cancellation / pause
        if (job.state === 'CANCELLED' || job.state === 'PAUSED') {
          console.log(`[QueueService] Worker stopped Job ${job.id} due to state: ${job.state}`);
          return;
        }

        const chunkText = job.chunks[i];
        console.log(`[QueueService][Job ${job.id}] Synthesizing chunk ${i + 1}/${job.totalChunks}...`);

        const chunkAudio = await loadBalancer.synthesizeWithFailover(
          chunkText,
          job.options,
          (msg) => console.log(`[QueueService][Job ${job.id}] ${msg}`)
        );

        audioChunks.push(chunkAudio);
        job.processedChunks = i + 1;
        job.progress = Math.round(((i + 1) / job.totalChunks) * 100);

        // Recalculate live ETA in seconds
        const elapsedSec = (Date.now() - startTime) / 1000;
        const avgChunkSec = elapsedSec / (i + 1);
        const remainingChunks = job.totalChunks - (i + 1);
        job.etaSeconds = Math.max(0, Math.ceil(remainingChunks * avgChunkSec));

        if (i < job.chunks.length - 1) {
          await this.sleep(200); // 200ms inter-chunk delay
        }
      }

      // Pass chunks through Audio Normalization & Merging Pipeline
      job.audioBuffer = audioPipeline.processAndMergeChunks(audioChunks, job.options);
      job.state = 'COMPLETED';
      job.progress = 100;
      job.etaSeconds = 0;
      job.updatedAt = Date.now();

      console.log(`[QueueService] Job ${job.id} COMPLETED cleanly! Final MP3 Size: ${job.audioBuffer.length} bytes.`);

    } catch (err) {
      console.error(`[QueueService] Job ${job.id} FAILED:`, err);
      job.state = 'FAILED';
      job.error = err.message || 'Speech synthesis failed after multi-provider failover retries.';
      job.updatedAt = Date.now();
    }
  }

  /**
   * Cleanup jobs older than 1 hour to prevent memory leaks
   */
  cleanupExpiredJobs() {
    const now = Date.now();
    const expiryWindow = 60 * 60 * 1000;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt > expiryWindow) {
        this.jobs.delete(jobId);
        console.log(`[QueueService] Purged expired job ${jobId}`);
      }
    }
  }
}

module.exports = new QueueService();
