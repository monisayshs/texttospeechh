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
    if (env && (env.TTS_JOBS_KV || env.TTS_AUDIO_R2)) {
      // 1) Save binary MP3 audio to R2 FIRST, in its own try/catch.
      // R2 has no daily put cap; this must survive KV quota blocks (2026-10-07:
      // 3x "KV daily operation limit exceeded" — the old code skipped the R2 put
      // whenever the KV put threw, silently losing the user's audio).
      // 2026-10-29: track whether the audio ACTUALLY persisted (one retry).
      // The old code set hasAudio=true in the KV meta even when this put had
      // failed, so /api/status claimed COMPLETED and the download 404'd —
      // the user got silence with no error.
      let audioPersisted = !job.audioBuffer; // no audio = nothing to lose
      if (job.audioBuffer && env.TTS_AUDIO_R2) {
        for (let r2Attempt = 1; r2Attempt <= 2 && !audioPersisted; r2Attempt++) {
          try {
            await env.TTS_AUDIO_R2.put(`audio/${job.id}.mp3`, job.audioBuffer, {
              httpMetadata: { contentType: 'audio/mpeg' }
            });
            audioPersisted = true;
          } catch (e) {
            console.warn(`[QueueService] R2 audio save warning (attempt ${r2Attempt}/2):`, e.message);
          }
        }
      }

      // 2) Save metadata to Cloudflare KV with 1-hour auto-expiration.
      // Free tier = 1,000 puts/day; when exceeded, puts throw 429 until the
      // 00:00 UTC reset. Caught here so one blocked write never kills the job.
      if (env.TTS_JOBS_KV) {
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
            hasAudio: !!job.audioBuffer && audioPersisted,
            audioSize: job.audioBuffer ? job.audioBuffer.length : 0,
            // Read-Along: persist merged word timings so /api/status can serve them
            hasWordTimings: !!(job.wordTimings && job.wordTimings.length > 0),
            wordTimings: job.wordTimings || null
          };
          // Audio generated but storage failed twice: report the job as
          // FAILED with a clear reason instead of COMPLETED-with-no-audio,
          // so the user sees an honest Retry instead of a dead player.
          if (job.state === 'COMPLETED' && job.audioBuffer && !audioPersisted) {
            meta.state = 'FAILED';
            meta.error = 'Audio was generated but could not be stored. Please retry.';
          }
          await env.TTS_JOBS_KV.put(`job:${job.id}`, JSON.stringify(meta), { expirationTtl: 3600 });
        } catch (e) {
          console.warn('[QueueService] Cloudflare KV save warning:', e.message);
        }
      }
      return;
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
    // No saveJob here: the enqueue save already persisted the job (state QUEUED,
    // progress 0), and the frontend progress UI reads the same fields either way.
    // Saves ~1 KV put per job — free tier is capped at 1,000 puts/day
    // (quota exceeded 3x on 2026-10-06/07).

    console.log(`[QueueService] Processing Job ${job.id} (${job.totalChunks} chunks)...`);

    const audioChunks = [];
    const chunkTimingInputs = []; // Read-Along: [{buffer, timings}] per chunk for offset merging
    const startTime = Date.now();

    try {
      // Bounded-concurrency chunk synthesis (2026-10-29 fix): chunks used to
      // synthesize strictly one-by-one, so a 6-chunk script took ~14s and a
      // 20-chunk script could pass 45s+ inside a single request — long
      // enough for users to give up on "Synthesizing...". Three parallel
      // workers keep result order (stored by chunk index) while cutting
      // wall-clock time roughly 3x; 3 stays within edge connection limits.
      const MAX_PARALLEL_CHUNKS = 3;
      let nextChunkIdx = 0;
      let firstChunkError = null;
      const chunkWorker = async () => {
        while (true) {
          if (firstChunkError) return;
          const i = nextChunkIdx++;
          if (i >= job.chunks.length) return;
          const chunkText = job.chunks[i];
          try {
            const chunkAudio = await loadBalancer.synthesizeWithFailover(
              chunkText,
              job.options,
              (msg) => console.log(`[QueueService][Job ${job.id}] ${msg}`)
            );
            audioChunks[i] = chunkAudio;
            // Read-Along: capture per-chunk word timings (null when provider has none, e.g. failover)
            chunkTimingInputs[i] = { buffer: chunkAudio, timings: (chunkAudio && chunkAudio.wordTimings) || null };
          } catch (e) {
            if (!firstChunkError) firstChunkError = e;
            return;
          }

          job.processedChunks += 1;
          job.progress = Math.round((job.processedChunks / job.totalChunks) * 100);

          const elapsedSec = (Date.now() - startTime) / 1000;
          const avgChunkSec = elapsedSec / job.processedChunks;
          const remainingChunks = job.totalChunks - job.processedChunks;
          job.etaSeconds = Math.max(0, Math.ceil(remainingChunks * avgChunkSec));

          // Throttled intermediate progress save: every 5th chunk only.
          // KV writes are capped at 1,000/day on the free tier and per-chunk saves
          // were exhausting the quota (90% alert on 2026-09-26). The completion save
          // below always persists the final state, so the last chunk is skipped here.
          // Progress bar keeps working: saves still land ~every 12s (5 chunks x ~2.5s).
          const isLastChunk = job.processedChunks === job.totalChunks;
          if (job.totalChunks > 1 && !isLastChunk && (job.processedChunks % 5 === 0)) {
            await this.saveJob(job, env);
          }
        }
      };
      const workers = [];
      for (let w = 0; w < Math.min(MAX_PARALLEL_CHUNKS, job.chunks.length); w++) {
        workers.push(chunkWorker());
      }
      await Promise.all(workers);
      if (firstChunkError) throw firstChunkError;

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
