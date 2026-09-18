const queueService = require('../services/queueService');
const securityService = require('../services/securityService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // Synthesize audio job cleanly (Serverless, Cloudflare & Localhost compatible)
    const jobInfo = await queueService.createJobAsync(sanitizedText, options, priority || 'NORMAL', req.env);
    const audioBuffer = await queueService.getJobAudioAsync(jobInfo.jobId, req.env);
    const audioBase64 = audioBuffer ? audioBuffer.toString('base64') : null;
    const providerUsed = jobInfo.providerUsed || 'unknown';
    const diagVoice = jobInfo.diagnosticVoice || options.voice;
    const diagRate = jobInfo.diagnosticRate || options.rate;
    const diagPitch = jobInfo.diagnosticPitch || options.pitch;
    const diagStyle = jobInfo.diagnosticStyle || options.style;

    console.log('[DIAG generateHandler] job completed. providerUsed:', providerUsed, '| diagVoice:', diagVoice, '| diagRate:', diagRate, '| diagPitch:', diagPitch, '| diagStyle:', diagStyle, '| audioSize:', audioBuffer ? audioBuffer.length : 0);
    
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
          audioSize: 0
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
      audioBase64: audioBase64,
      audioDataUri: audioBase64 ? `data:audio/mpeg;base64,${audioBase64}` : null,
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
        audioSize: audioBuffer ? audioBuffer.length : 0
      }
    });

  } catch (err) {
    console.error('[generateHandler] Error:', err);
    res.status(500).json({ error: err.message || 'Speech synthesis failed. Please try again.' });
  }
};
