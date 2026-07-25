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

    // Queue-based synthesis pipeline for maximum reliability & zero request timeouts
    const jobInfo = queueService.createJob(sanitizedText, options, priority || 'NORMAL');
    
    res.status(200).json({
      message: 'Voice synthesis job enqueued successfully.',
      jobId: jobInfo.jobId,
      totalChunks: jobInfo.totalChunks,
      wordCount: jobInfo.wordCount,
      etaSeconds: jobInfo.etaSeconds,
      statusUrl: `/api/status?jobId=${jobInfo.jobId}`,
      downloadUrl: `/api/status?jobId=${jobInfo.jobId}&download=true`
    });

  } catch (err) {
    console.error('[generateHandler] Error:', err);
    res.status(500).json({ error: err.message || 'Speech synthesis failed. Please try again.' });
  }
};
