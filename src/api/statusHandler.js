const queueService = require('../services/queueService');

/**
 * Format current timestamp as YYYYMMDD-HHMMSS for clean semantic downloads
 */
function getFormattedFilename() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const timeStr = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `texttospeechh-voice-${dateStr}-${timeStr}.mp3`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { jobId, download, action } = { ...(req.query || {}), ...(req.body || {}) };

  if (!jobId) {
    res.status(400).json({ error: 'jobId parameter is required.' });
    return;
  }

  // Handle Job Control Actions (pause, resume, cancel)
  if (action) {
    if (action === 'pause') {
      const ok = queueService.pauseJob(jobId);
      res.status(200).json({ success: ok, message: ok ? 'Job paused' : 'Could not pause job' });
      return;
    }
    if (action === 'resume') {
      const ok = queueService.resumeJob(jobId);
      res.status(200).json({ success: ok, message: ok ? 'Job resumed' : 'Could not resume job' });
      return;
    }
    if (action === 'cancel') {
      const ok = queueService.cancelJob(jobId);
      res.status(200).json({ success: ok, message: ok ? 'Job cancelled' : 'Could not cancel job' });
      return;
    }
  }

  // Handle Binary Audio Stream Download (Format: texttospeechh-voice-YYYYMMDD-HHMMSS.mp3)
  if (download === 'true') {
    const audioBuffer = queueService.getJobAudio(jobId);
    if (!audioBuffer) {
      res.status(404).json({ error: 'Audio not found or job has not completed yet.' });
      return;
    }

    const filename = getFormattedFilename();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.end(audioBuffer);
    return;
  }

  // Return job status JSON
  const status = queueService.getJobStatus(jobId);
  if (!status) {
    res.status(404).json({ error: 'Job not found or expired.' });
    return;
  }

  res.status(200).json(status);
};
