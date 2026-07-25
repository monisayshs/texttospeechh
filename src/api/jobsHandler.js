const queueService = require('../services/queueService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const metrics = queueService.getQueueMetrics ? queueService.getQueueMetrics() : { activeJobs: 0, totalProcessed: 1, status: 'HEALTHY' };

  res.status(200).json({
    success: true,
    service: 'TextToSpeechH AI Synthesis Queue',
    status: 'ACTIVE',
    metrics: metrics
  });
};
