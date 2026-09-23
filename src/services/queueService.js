const crypto = require('crypto');
const scriptEngine = require('./scriptEngine');
const loadBalancer = require('./loadBalancer');
const audioPipeline = require('./audioPipeline');
const wordTimingService = require('./wordTimingService');

/**
 * Detect if running inside Cloudflare Workers/Pages (no filesystem access)
 */
function isCloudflareRuntime() {
  return (typeof globalThis.caches !== 'undefined' && typeof globalThis.caches.default !== 'undefined') ||
         (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers');
}

/**
 * Lazy-load filesystem modules (unavailable in Workers runtime)
 */
let fs, path, os, TMP_JOBS_DIR;
function initFilesystem() {
  if (fs) return true;
  try {
    fs = require('fs');
    path = require('path');
    os = require('os');
    TMP_JOBS_DIR = path.join(os.tmpdir(), 'tts_jobs');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Production Request Queue Service with KV/R2 (Cloudflare) and Disk Persistence (/tmp, Node/Vercel) support.
 */
class QueueService {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.activeWorkerCount = 0;
    this.maxConcurrentWorkers = 2;

    // Only set up filesystem and intervals in full Node environments
    if (!isCloudflareRuntime()) {
      if (initFilesystem()) {
        this.ensureTmpDir();
      }

      // Auto-cleanup expired jobs (guarded for serverless/edge worker compatibility)
      const isStandardNodeEnv = typeof process !== 'undefined' && process.versions && process.versions.node && typeof process.env !== 'undefined' && !process.env.CF_PAGES && !process.env.VERCEL;
      if (isStandardNodeEnv && typeof setInterval !== 'undefined') {
        try {
          setInterval(() => this.cleanupExpiredJobs(), 15 * 60 * 1000);
        } catch (e) {
          // Ignore interval setup in stateless environments
        }
      }
    }
  }

  ensureTmpDir() {
    if (!initFilesystem()) return;
    try {
      if (!fs.existsSync(TMP_JOBS_DIR)) {
        fs.mkdirSync(TMP_JOBS_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('[QueueService] Failed to create tmp dir:', e.message);
    }
  }

  async saveJob(job, env = null) {
    // Cloudflare KV & R2 Storage Adapter
    if (env && env.TTS_JOBS_KV) {
      try {
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
          audioSize: job.audioBuffer ? job.audioBuffer.length : 0,
          // Read-Along: persist merged word timings so /api/status can serve them
          hasWordTimings: !!(job.wordTimings && job.wordTimings.length > 0),
          wordTimings: job.wordTimings || null
        };

        // Save metadata to Cloudflare KV with 1-hour auto-expiration
        await env.TTS_JOBS_KV.put(`job:${job.id}`, JSON.stringify(meta), { expirationTtl: 3600 });

        // Save binary MP3 audio to Cloudflare R2
        if (job.audioBuffer && env.TTS_AUDIO_R2) {
          await env.TTS_AUDIO_R2.put(`audio/${job.id}.mp3`, job.audioBuffer, {
            httpMetadata: { contentType: 'audio/mpeg' }
          });
        }
        return;
      } catch (e) {
        console.warn('[QueueService] Cloudflare KV/R2 save warning:', e.message);
      }
    }

    // Default Node / Vercel Filesystem Fallback (skip if fs unavailable)
    if (initFilesystem()) {
      this.saveJobToDisk(job);
    }
  }

  async loadJob(jobId, env = null) {
    // Cloudflare KV & R2 Storage Adapter
    if (env && env.TTS_JOBS_KV) {
      try {
        const metaStr = await env.TTS_JOBS_KV.get(`job:${jobId}`);
        if (!metaStr) return null;

        const meta = JSON.parse(metaStr);
        let audioBuffer = null;

        if (meta.hasAudio && env.TTS_AUDIO_R2) {
          const r2Obj = await env.TTS_AUDIO_R2.get(`audio/${jobId}.mp3`);
          if (r2Obj) {
            const arrBuf = await r2Obj.arrayBuffer();
            audioBuffer = Buffer.from(arrBuf);
          }
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
        console.warn('[QueueService] Cloudflare KV/R2 load warning:', e.message);
      }
    }

    // Default Node / Vercel Filesystem Fallback
    if (initFilesystem()) {
      return this.loadJobFromDisk(jobId);
    }
    return null;
  }

  saveJobToDisk(job) {
    if (!initFilesystem()) return;
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
        audioSize: job.audioBuffer ? job.audioBuffer.length : 0,
        // Read-Along: persist merged word timings so /api/status can serve them
        hasWordTimings: !!(job.wordTimings && job.wordTimings.length > 0),
        wordTimings: job.wordTimings || null
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
    if (!initFilesystem()) return null;
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
  async createJobAsync(text, options = {}, priority = 'NORMAL', env = null) {
    const jobId = crypto.randomBytes(12).toString('hex');
    const chunks = scriptEngine.splitScript(text);
    const wordCount = text.trim().split(/\s+/).length;

    console.log('[DIAG queueService.createJobAsync] options:', JSON.stringify(options), '| voice:', options.voice, '| rate:', options.rate, '| pitch:', options.pitch, '| style:', options.style);

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
    await this.saveJob(job, env);

    console.log(`[QueueService] Enqueued Job ${jobId} (${wordCount} words, ${chunks.length} chunks)`);

    // In Serverless or Single-Request mode, synthesize immediately
    await this.processJob(job, env);

    return await this.getJobStatusAsync(jobId, env);
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
    if (initFilesystem()) {
      this.saveJobToDisk(job);
    }

    this.processJob(job).catch(err => console.error('[QueueService] Async job error:', err));

    return this.getJobStatus(jobId);
  }

  /**
   * Async Get job progress status (KV/R2 Aware)
   */
  async getJobStatusAsync(jobId, env = null) {
    let job = this.jobs.get(jobId);
    if (!job) {
      job = await this.loadJob(jobId, env);
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
      audioSize: job.audioBuffer ? job.audioBuffer.length : 0,
      audioBuffer: job.audioBuffer || null,
      // Read-Along: word timings for the merged audio (null when unavailable)
      wordTimings: job.wordTimings || null,
      readAlongAvailable: !!(job.wordTimings && job.wordTimings.length > 0),
      providerUsed: job.providerUsed || 'unknown',
      diagnosticVoice: job.options.voice,
      diagnosticRate: job.options.rate,
      diagnosticPitch: job.options.pitch,
      diagnosticStyle: job.options.style
    };
  }

  /**
   * Get job progress status (Sync fallback for local Node)
   */
  getJobStatus(jobId) {
    let job = this.jobs.get(jobId);
    if (!job) {
      if (initFilesystem()) {
        job = this.loadJobFromDisk(jobId);
      }
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
   * Async Get job final merged audio buffer (KV/R2 Aware)
   */
  async getJobAudioAsync(jobId, env = null) {
    let job = this.jobs.get(jobId);
    if (!job || !job.audioBuffer) {
      job = await this.loadJob(jobId, env);
    }
    if (!job || !job.audioBuffer) return null;
    return job.audioBuffer;
  }

  /**
   * Get job final merged audio buffer (Sync fallback for local Node)
   */
  getJobAudio(jobId) {
    let job = this.jobs.get(jobId);
    if (!job || !job.audioBuffer) {
      if (initFilesystem()) {
        job = this.loadJobFromDisk(jobId);
      }
    }
    if (!job || !job.audioBuffer) return null;
    return job.audioBuffer;
  }

  /**
   * Worker loop processing single job
   */
  async processJob(job, env = null) {
    job.state = 'PROCESSING';
    job.updatedAt = Date.now();
    await this.saveJob(job, env);

    console.log(`[QueueService] Processing Job ${job.id} (${job.totalChunks} chunks)...`);

    const audioChunks = [];
    const chunkTimingInputs = []; // Read-Along: [{buffer, timings}] per chunk for offset merging
    const startTime = Date.now();

    try {
      for (let i = 0; i < job.chunks.length; i++) {
        const chunkText = job.chunks[i];
        console.log('[DIAG queueService.processJob] Calling loadBalancer with options.voice:', job.options.voice, '| rate:', job.options.rate, '| pitch:', job.options.pitch, '| style:', job.options.style);
        const chunkAudio = await loadBalancer.synthesizeWithFailover(
          chunkText,
          job.options,
          (msg) => console.log(`[QueueService][Job ${job.id}] ${msg}`)
        );

        audioChunks.push(chunkAudio);
        // Read-Along: capture per-chunk word timings (null when provider has none, e.g. failover)
        chunkTimingInputs.push({ buffer: chunkAudio, timings: (chunkAudio && chunkAudio.wordTimings) || null });
        job.processedChunks = i + 1;
        job.progress = Math.round(((i + 1) / job.totalChunks) * 100);

        const elapsedSec = (Date.now() - startTime) / 1000;
        const avgChunkSec = elapsedSec / (i + 1);
        const remainingChunks = job.totalChunks - (i + 1);
        job.etaSeconds = Math.max(0, Math.ceil(remainingChunks * avgChunkSec));

        // Save intermediate progress for multi-chunk jobs (skip for 1-chunk jobs as final save is done next)
        if (job.totalChunks > 1) {
          await this.saveJob(job, env);
        }
      }

       job.audioBuffer = audioPipeline.processAndMergeChunks(audioChunks, job.options);
      // Read-Along: merge per-chunk word timings with cumulative audio-duration offsets.
      // Stays null when no provider emitted timings (failover) — frontend hides the toggle.
      try {
        const mergedTimings = wordTimingService.mergeChunkTimings(chunkTimingInputs);
        if (mergedTimings.timings && mergedTimings.timings.length > 0) {
          job.wordTimings = mergedTimings.timings;
          console.log(`[QueueService] Job ${job.id} word timings merged: ${job.wordTimings.length} words, audio duration ~${mergedTimings.totalDurationMs}ms`);
        }
      } catch (e) {
        console.warn(`[QueueService] Job ${job.id} word timing merge failed (non-fatal):`, e.message);
      }
      job.providerUsed = audioChunks.length > 0 && audioChunks[0] && audioChunks[0].providerUsed ? audioChunks[0].providerUsed : 'unknown';
      job.state = 'COMPLETED';
      job.progress = 100;
      job.etaSeconds = 0;
      job.updatedAt = Date.now();

      await this.saveJob(job, env);
      console.log(`[DIAG queueService.processJob] Job ${job.id} COMPLETED! Size: ${job.audioBuffer.length} bytes. providerUsed: ${job.providerUsed || 'unknown'} | voice: ${job.options.voice} | rate: ${job.options.rate} | pitch: ${job.options.pitch} | style: ${job.options.style}`);

    } catch (err) {
      console.error(`[QueueService] Job ${job.id} FAILED:`, err);
      job.state = 'FAILED';
      job.error = err.message || 'Speech synthesis failed after failover retries.';
      job.updatedAt = Date.now();
      await this.saveJob(job, env);
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
