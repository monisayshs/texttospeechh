const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const scriptEngine = require('./scriptEngine');
const loadBalancer = require('./loadBalancer');
const audioPipeline = require('./audioPipeline');

const TMP_JOBS_DIR = path.join(os.tmpdir(), 'tts_jobs');

/**
 * Production Request Queue Service with Disk Persistence (/tmp) & Serverless Function Compatibility.
 */
class QueueService {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.activeWorkerCount = 0;
    this.maxConcurrentWorkers = 2;

    this.ensureTmpDir();

    // Auto-cleanup expired jobs
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupExpiredJobs(), 15 * 60 * 1000);
    }
  }

  ensureTmpDir() {
    try {
      if (!fs.existsSync(TMP_JOBS_DIR)) {
        fs.mkdirSync(TMP_JOBS_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[QueueService] Failed to create tmp dir:', e.message);
    }
  }

  saveJobToDisk(job) {
    try {
      this.ensureTmpDir();
      const metaPath = path.join(TMP_JOBS_DIR, `${job.id}.json`);
      const meta = {
        id: job.id,
        state: job.state,
        progress: job.progress,
        processedChunks: job.processedChunks,
        totalChunks: job.totalChunks,
        etaSeconds: job.etaSeconds,
        wordCount: job.wordCount,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        hasAudio: !!job.audioBuffer,
        audioSize: job.audioBuffer ? job.audioBuffer.length : 0
      };
      fs.writeFileSync(metaPath, JSON.stringify(meta), 'utf-8');

      if (job.audioBuffer) {
        const audioPath = path.join(TMP_JOBS_DIR, `${job.id}.mp3`);
        fs.writeFileSync(audioPath, job.audioBuffer);
      }
    } catch (e) {
      console.warn('[QueueService] Disk save warning:', e.message);
    }
  }

  loadJobFromDisk(jobId) {
    try {
      const metaPath = path.join(TMP_JOBS_DIR, `${jobId}.json`);
      if (!fs.existsSync(metaPath)) return null;

      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      const audioPath = path.join(TMP_JOBS_DIR, `${jobId}.mp3`);
      let audioBuffer = null;
      if (fs.existsSync(audioPath)) {
        audioBuffer = fs.readFileSync(audioPath);
      }

      const job = {
        ...meta,
        audioBuffer: audioBuffer,
        chunks: [],
        options: {}
      };

      this.jobs.set(jobId, job);
      return job;
    } catch (e) {
      return null;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create & enqueue a new voice synthesis job
   */
  async createJobAsync(text, options = {}, priority = 'NORMAL') {
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
      etaSeconds: Math.ceil(chunks.length * 2.5),
      priority: priority,
      state: 'QUEUED',
      options: options,
      audioBuffer: null,
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.jobs.set(jobId, job);
    this.saveJobToDisk(job);

    console.log(`[QueueService] Enqueued Job ${jobId} (${wordCount} words, ${chunks.length} chunks)`);

    // In Serverless or Single-Request mode, synthesize immediately
    await this.processJob(job);
    this.saveJobToDisk(job);

    return this.getJobStatus(jobId);
  }

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
      etaSeconds: Math.ceil(chunks.length * 2.5),
      priority: priority,
      state: 'QUEUED',
      options: options,
      audioBuffer: null,
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.jobs.set(jobId, job);
    this.saveJobToDisk(job);

    this.processJob(job).catch(err => console.error('[QueueService] Async job error:', err));

    return this.getJobStatus(jobId);
  }

  /**
   * Get job progress status
   */
  getJobStatus(jobId) {
    let job = this.jobs.get(jobId);
    if (!job) {
      job = this.loadJobFromDisk(jobId);
    }
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
    let job = this.jobs.get(jobId);
    if (!job || !job.audioBuffer) {
      job = this.loadJobFromDisk(jobId);
    }
    if (!job || !job.audioBuffer) return null;
    return job.audioBuffer;
  }

  /**
   * Worker loop processing single job
   */
  async processJob(job) {
    job.state = 'PROCESSING';
    job.updatedAt = Date.now();
    this.saveJobToDisk(job);

    console.log(`[QueueService] Processing Job ${job.id} (${job.totalChunks} chunks)...`);

    const audioChunks = [];
    const startTime = Date.now();

    try {
      for (let i = 0; i < job.chunks.length; i++) {
        const chunkText = job.chunks[i];
        const chunkAudio = await loadBalancer.synthesizeWithFailover(
          chunkText,
          job.options,
          (msg) => console.log(`[QueueService][Job ${job.id}] ${msg}`)
        );

        audioChunks.push(chunkAudio);
        job.processedChunks = i + 1;
        job.progress = Math.round(((i + 1) / job.totalChunks) * 100);

        const elapsedSec = (Date.now() - startTime) / 1000;
        const avgChunkSec = elapsedSec / (i + 1);
        const remainingChunks = job.totalChunks - (i + 1);
        job.etaSeconds = Math.max(0, Math.ceil(remainingChunks * avgChunkSec));

        this.saveJobToDisk(job);
      }

      job.audioBuffer = audioPipeline.processAndMergeChunks(audioChunks, job.options);
      job.state = 'COMPLETED';
      job.progress = 100;
      job.etaSeconds = 0;
      job.updatedAt = Date.now();

      this.saveJobToDisk(job);
      console.log(`[QueueService] Job ${job.id} COMPLETED! Size: ${job.audioBuffer.length} bytes.`);

    } catch (err) {
      console.error(`[QueueService] Job ${job.id} FAILED:`, err);
      job.state = 'FAILED';
      job.error = err.message || 'Speech synthesis failed after failover retries.';
      job.updatedAt = Date.now();
      this.saveJobToDisk(job);
    }
  }

  cleanupExpiredJobs() {
    const now = Date.now();
    const expiryWindow = 60 * 60 * 1000;

    for (const [jobId, job] of this.jobs.entries()) {
      if (now - job.createdAt > expiryWindow) {
        this.jobs.delete(jobId);
      }
    }
  }
}

module.exports = new QueueService();
