const queueService = require('../services/queueService');
const securityService = require('../services/securityService');

const CURRENT_COMMIT = '18a7cbb';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-App-Commit', CURRENT_COMMIT);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Enforce Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const rateCheck = securityService.checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute before making more requests.' });
    return;
  }

  try {
    const { text, voice, rate, pitch, style, priority } = { ...(req.query || {}), ...(req.body || {}) };

    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({ error: 'Script text parameter is required.' });
      return;
    }

    const sanitizedText = securityService.sanitizeText(text);
    const options = {
      voice: voice || 'en-US-JennyNeural',
      rate: rate || '+0%',
      pitch: pitch || '+0Hz',
      style: style || 'neutral'
    };

    console.log('[DIAG generateHandler] RECEIVED voice:', voice, '| rate:', rate, '| pitch:', pitch, '| style:', style);
    console.log('[DIAG generateHandler] options.voice:', options.voice, '| options.rate:', options.rate, '| options.pitch:', options.pitch, '| options.style:', options.style);

    const tReqStart = Date.now();

    // Synthesize audio job cleanly (Serverless, Cloudflare & Localhost compatible)
    const jobInfo = await queueService.createJobAsync(sanitizedText, options, priority || 'NORMAL', req.env);
    const tJobDone = Date.now();
    const audioBuffer = (jobInfo && jobInfo.audioBuffer) ? jobInfo.audioBuffer : (await queueService.getJobAudioAsync(jobInfo.jobId, req.env));
    const base64Data = audioBuffer ? audioBuffer.toString('base64') : null;
    const tBase64Done = Date.now();
    const providerUsed = jobInfo.providerUsed || 'unknown';
    const diagVoice = jobInfo.diagnosticVoice || options.voice;
    const diagRate = jobInfo.diagnosticRate || options.rate;
    const diagPitch = jobInfo.diagnosticPitch || options.pitch;
    const diagStyle = jobInfo.diagnosticStyle || options.style;

    const socketTimings = (audioBuffer && audioBuffer.timings) ? audioBuffer.timings : {};
    const totalServerMs = tBase64Done - tReqStart;

    res.setHeader('Server-Timing', `t_total;dur=${totalServerMs}, t_synthesis;dur=${tJobDone - tReqStart}, t_socket;dur=${socketTimings.totalSocketMs || 0}`);

    console.log('[DIAG generateHandler] job completed. providerUsed:', providerUsed, '| diagVoice:', diagVoice, '| diagRate:', diagRate, '| diagPitch:', diagPitch, '| diagStyle:', diagStyle, '| audioSize:', audioBuffer ? audioBuffer.length : 0, '| totalServerMs:', totalServerMs);
    
    if (jobInfo.state === 'FAILED' || !audioBuffer || audioBuffer.length === 0) {
      res.status(502).json({
        error: jobInfo.error || `TTS Synthesis failed for voice '${options.voice}'. All configured providers failed.`,
        jobId: jobInfo.jobId,
        state: 'FAILED',
        providerUsed: providerUsed,
        diagnostic: {
          requestedVoice: options.voice,
          requestedRate: options.rate,
          requestedPitch: options.pitch,
          requestedStyle: options.style,
          actualVoice: diagVoice,
          audioSize: 0,
          timings: {
            totalServerMs: totalServerMs,
            synthesisMs: tJobDone - tReqStart
          }
        }
      });
      return;
    }

    res.status(200).json({
      message: 'Voice synthesis job completed successfully.',
      jobId: jobInfo.jobId,
      state: jobInfo.state,
      totalChunks: jobInfo.totalChunks,
      wordCount: jobInfo.wordCount,
      etaSeconds: jobInfo.etaSeconds,
      audioDataUri: base64Data ? `data:audio/mpeg;base64,${base64Data}` : null,
      statusUrl: `/api/status?jobId=${jobInfo.jobId}`,
      downloadUrl: `/api/status?jobId=${jobInfo.jobId}&download=true`,
      providerUsed: providerUsed,
      diagnostic: {
        requestedVoice: options.voice,
        requestedRate: options.rate,
        requestedPitch: options.pitch,
        requestedStyle: options.style,
        actualVoice: diagVoice,
        actualRate: diagRate,
        actualPitch: diagPitch,
        actualStyle: diagStyle,
        audioSize: audioBuffer ? audioBuffer.length : 0,
        timings: {
          totalServerMs: totalServerMs,
          synthesisMs: tJobDone - tReqStart,
          socketConnectMs: socketTimings.connectMs || 0,
          firstByteMs: socketTimings.firstByteMs || 0,
          socketSynthesisMs: socketTimings.synthesisMs || 0,
          socketTotalMs: socketTimings.totalSocketMs || 0
        }
      }
    });

  } catch (err) {
    console.error('[generateHandler] Error:', err);
    res.status(500).json({ error: err.message || 'Speech synthesis failed. Please try again.' });
  }
};
