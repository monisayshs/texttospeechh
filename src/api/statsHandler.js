const queueService = require('../services/queueService');

// Private stats token — NOT the IndexNow key (that key is public by protocol
// design: it is served at the site root as a .txt file for anyone to read).
// Thor flagged this on 2026-11-10: daily volumes are the owner's business
// data, so this endpoint gets its own token that is published nowhere.
// Owner's read URL: /api/stats?key=<token>
const STATS_KEY = 'b4303179065a354841e0615986c12d5b';

/**
 * Owner-only daily usage counters — how many voice generations finished per
 * UTC day (completed + failed). Added 2026-11-10 on the owner's request
 * ("laga do taaki pata chal sake kitni voice generate ho rahi h").
 *
 * Guard: requires a private token (see STATS_KEY below) — sent as the `key`
 * query param or the `x-stats-key` header. Deliberately NOT the IndexNow
 * key: that key is public by protocol design. The token is never logged or
 * echoed; a wrong key gets the same flat 403 as a missing one.
 * GET /api/stats           → last 31 days (today first)
 * GET /api/stats?days=7    → last 7 days
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Stats-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const provided = (req.query && req.query.key) || req.headers['x-stats-key'] || '';
  const expected = STATS_KEY;
  if (!expected || !provided || provided !== expected) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const daysRaw = parseInt((req.query && req.query.days) || '31', 10);
  const days = Number.isFinite(daysRaw) ? Math.min(92, Math.max(1, daysRaw)) : 31;

  try {
    const counters = await queueService.getDailyCounters(req.env, days);
    const totals = counters.reduce(
      (acc, d) => ({ completed: acc.completed + d.completed, failed: acc.failed + d.failed }),
      { completed: 0, failed: 0 }
    );
    res.status(200).json({
      note: 'Counts are jobs FINISHED that UTC day, persisted in batches of 50 per instance — a day can read up to ~49 low at any moment. Dates are UTC (Cloudflare quota days).',
      days: counters,
      totals
    });
  } catch (err) {
    console.error('[statsHandler] Error:', err);
    res.status(500).json({ error: 'Stats unavailable right now.' });
  }
};
