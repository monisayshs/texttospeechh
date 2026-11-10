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
 * GET /api/stats           → JSON, last 31 days (today first)
 * GET /api/stats?days=7    → JSON, last 7 days
 * GET /stats?key=…         → the same data as a simple HTML dashboard page
 *                             (rendered by renderDashboard below; the /stats
 *                             route is wired in the two routers)
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
    // Dashboard asks for its key on the page itself instead of a dead 403.
    if (req.dashboard) {
      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(renderKeyForm(req.query && req.query.key ? 'Galat key hai — dobara check karke daalo.' : ''));
      return;
    }
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
    if (req.dashboard) {
      res.status(200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(renderDashboard(counters, totals));
      return;
    }
    res.status(200).json({
      note: 'Counts are jobs FINISHED that UTC day, persisted in batches of 10 per instance — a day can read up to ~9 low at any moment. Dates are UTC (Cloudflare quota days).',
      days: counters,
      totals
    });
  } catch (err) {
    console.error('[statsHandler] Error:', err);
    if (req.dashboard) {
      res.status(500);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(renderKeyForm('Abhi data nahi aa raha — thodi der baad dobara kholo.'));
      return;
    }
    res.status(500).json({ error: 'Stats unavailable right now.' });
  }
};

const DASH_CSS = `
  :root{ --ink:#17202b; --mut:#68707d; --line:#e7e4dc; --paper:#faf8f3; --card:#fff; --gold:#c8a24a; --teal:#0f766e; --red:#b3261e; }
  *{box-sizing:border-box} body{margin:0;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
  .wrap{max-width:760px;margin:0 auto;padding:18px 14px 40px}
  h1{font-size:21px;margin:4px 0 2px} .dot{color:var(--gold)}
  .sub{color:var(--mut);font-size:13px;margin-bottom:16px;line-height:1.5}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
  .stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 10px;text-align:center}
  .stat b{display:block;font-size:24px;line-height:1.1}
  .stat span{font-size:12px;color:var(--mut)}
  .stat.gold b{color:var(--gold)} .stat.teal b{color:var(--teal)} .stat.red b{color:var(--red)}
  table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  th,td{padding:10px 12px;text-align:left;font-size:14px;border-bottom:1px solid var(--line)}
  th{background:#f3efe6;color:var(--mut);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
  tr:last-child td{border-bottom:none}
  td.n{text-align:right;font-variant-numeric:tabular-nums} th.n{text-align:right}
  .today{background:#fdf6e0;font-weight:600}
  .foot{color:var(--mut);font-size:12.5px;line-height:1.6;margin-top:14px}
  .box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 16px;max-width:440px;margin:8vh auto 0}
  .box input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:9px;font-size:15px;margin:10px 0}
  .box button{width:100%;padding:11px;border:none;border-radius:9px;background:var(--gold);color:#fff;font-size:15px;font-weight:600;cursor:pointer}
  .err{color:var(--red);font-size:13.5px;min-height:18px}
`;

function fmtDate(iso) {
  // '2026-11-10' → '10 Nov 2026' — fixed English month names, no locale risk.
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${months[(m || 1) - 1]} ${y}`;
}

function renderKeyForm(errorText) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Voice Stats — Key</title><style>${DASH_CSS}</style></head>
<body><div class="wrap">
  <div class="box">
    <h1>Voice Stats <span class="dot">●</span></h1>
    <div class="sub">Ye page sirf tumhare liye hai. Apni private key daalo:</div>
    <form method="get" action="/stats">
      <input name="key" type="password" placeholder="Private key" autocomplete="off">
      <div class="err">${errorText || ''}</div>
      <button type="submit">Kholo</button>
    </form>
  </div>
</div></body></html>`;
}

function renderDashboard(counters, totals) {
  const today = counters[0] || { completed: 0, failed: 0 };
  const rows = counters.map((c, i) => `
      <tr${i === 0 ? ' class="today"' : ''}>
        <td>${fmtDate(c.date)}${i === 0 ? ' (aaj)' : ''}</td>
        <td class="n">${c.completed}</td>
        <td class="n">${c.failed}</td>
        <td class="n">${c.completed + c.failed}</td>
      </tr>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Voice Stats — Dashboard</title><style>${DASH_CSS}</style></head>
<body><div class="wrap">
  <h1>Voice Stats <span class="dot">●</span> Dashboard</h1>
  <div class="sub">Roz kitni voice bani — pichhle 31 din. TextToSpeechH AI ka apna data.</div>
  <div class="stats">
    <div class="stat gold"><b>${today.completed}</b><span>Aaj bani (voice)</span></div>
    <div class="stat teal"><b>${totals.completed}</b><span>31 din — kul bani</span></div>
    <div class="stat red"><b>${totals.failed}</b><span>31 din — fail</span></div>
  </div>
  <table>
    <thead><tr><th>Tareekh</th><th class="n">Voice bani</th><th class="n">Fail</th><th class="n">Kul</th></tr></thead>
    <tbody>${rows}
    </tbody>
  </table>
  <div class="foot">Note: ginti har 10 voice ke batch me save hoti hai, isliye kisi bhi pal asal ginti se 9 tak kam dikh sakti hai. Tareekh UTC (London) hisab se hai — Cloudflare ki roz ki limit bhi usi par reset hoti hai (IST me din subah 5:30 baje badalta hai).</div>
</div></body></html>`;
}

module.exports.renderDashboard = renderDashboard;
module.exports.renderKeyForm = renderKeyForm;
