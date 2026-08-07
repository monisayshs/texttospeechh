/**
 * IndexNow Post-Deploy Notifier (Best-Effort)
 *
 * This script runs as "postbuild" in package.json. It pings IndexNow
 * endpoints with the site's URL list so search engines discover new
 * pages faster.
 *
 * CRITICAL DESIGN RULE:
 *   IndexNow is best-effort. A failure here must NEVER block a Vercel
 *   deployment. Sitemaps + robots.txt remain the persistent discovery
 *   mechanism. Only when INDEXNOW_STRICT=1 is explicitly set will a
 *   failure produce a non-zero exit code.
 *
 * Every possible crash vector — top-level require(), URL collection,
 * HTTP submission, state persistence — is wrapped so that an uncaught
 * exception can never bubble up to Node's default handler (which would
 * exit 1 and fail the deploy).
 */

const STRICT = process.env.INDEXNOW_STRICT === '1';

// ---------------------------------------------------------------------------
// Safe require wrappers — a broken import must never crash the deploy.
// ---------------------------------------------------------------------------
let fs, path, HOST, INDEXNOW_KEY, KEY_LOCATION, UNIVERSAL_ENDPOINT, BING_ENDPOINT;
let sitemapGenerator;

try {
  fs = require('fs');
  path = require('path');

  const indexNowConfig = require('../src/seo/indexNowConfig');
  HOST = indexNowConfig.HOST;
  INDEXNOW_KEY = indexNowConfig.INDEXNOW_KEY;
  KEY_LOCATION = indexNowConfig.KEY_LOCATION;
  UNIVERSAL_ENDPOINT = indexNowConfig.UNIVERSAL_ENDPOINT;
  BING_ENDPOINT = indexNowConfig.BING_ENDPOINT;

  sitemapGenerator = require('../src/seo/sitemapGenerator');
} catch (requireErr) {
  console.error('[IndexNow] Failed to load dependencies:', requireErr.message || requireErr);
  if (STRICT) {
    console.error('[IndexNow] STRICT mode: aborting deployment due to import failure.');
    process.exit(2);
  }
  console.warn('[IndexNow] Non-strict mode: skipping IndexNow submission (import error). Deployment continues.');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Derived constants (safe — dependencies loaded above)
// ---------------------------------------------------------------------------
const STATE_FILE = path.join(__dirname, '.indexnow-state.json');
const BASE_URL = `https://${HOST}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function collectAllUrls() {
  const routes = [
    ...sitemapGenerator.PUBLIC_ROUTES,
    ...sitemapGenerator.LEGAL_ROUTES,
    ...sitemapGenerator.STATIC_SPOKE_ROUTES,
    ...sitemapGenerator.getDynamicBlogRoutes(),
    ...sitemapGenerator.getProgrammaticRoutes(),
    ...sitemapGenerator.getGuideRoutes()
  ];
  return [...new Set(routes.map((r) => `${BASE_URL}${r.url}`))];
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return { submitted: {} };
  }
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn('[IndexNow] Could not save state file:', e.message);
  }
}

function postJson(endpoint, payload) {
  return new Promise((resolve) => {
    const https = require('https');
    const target = new URL(endpoint);
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: target.hostname,
        port: 443,
        path: target.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 15000
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({ endpoint, statusCode: res.statusCode, body: data })
        );
      }
    );

    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', (err) => resolve({ endpoint, statusCode: 0, body: err.message }));
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('[IndexNow] Auto-submission after deploy');
  console.log(`[IndexNow] Host: ${HOST}`);
  console.log(`[IndexNow] Key: ${INDEXNOW_KEY}`);
  console.log(`[IndexNow] Key file: ${KEY_LOCATION}`);
  console.log(`[IndexNow] Strict mode: ${STRICT ? 'ON' : 'OFF'}`);

  const allUrls = collectAllUrls();
  const state = loadState();
  const now = new Date().toISOString();

  const newUrls = allUrls.filter((u) => !state.submitted[u]);
  const urlsToSubmit = newUrls.length > 0 ? newUrls : allUrls;

  console.log(`[IndexNow] Total URLs in sitemap: ${allUrls.length}`);
  console.log(`[IndexNow] New URLs to notify: ${newUrls.length}`);

  if (urlsToSubmit.length === 0) {
    console.log('[IndexNow] No URLs to submit. Nothing to do.');
    return 0;
  }

  const endpoints = [UNIVERSAL_ENDPOINT, BING_ENDPOINT];
  const results = [];
  for (const endpoint of endpoints) {
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlsToSubmit
    };
    const res = await postJson(endpoint, payload);
    results.push(res);
    const ok = res.statusCode === 200 || res.statusCode === 202;
    console.log(
      `[IndexNow] ${ok ? 'PASS' : 'WARN'} ${endpoint} -> HTTP ${res.statusCode}` +
        (res.body ? ` | ${res.body.slice(0, 200)}` : '')
    );
  }

  const allOk = results.every((r) => r.statusCode === 200 || r.statusCode === 202);
  if (allOk) {
    urlsToSubmit.forEach((u) => (state.submitted[u] = now));
    saveState(state);
    console.log(`[IndexNow] Submitted ${urlsToSubmit.length} URLs to ${endpoints.length} engines. State saved.`);
  } else {
    // Log every non-OK response for debugging, but do NOT throw or return 1.
    const failed = results.filter((r) => r.statusCode !== 200 && r.statusCode !== 202);
    console.warn(`[IndexNow] ${failed.length} of ${endpoints.length} endpoint(s) returned non-OK status.`);
    failed.forEach((r) =>
      console.warn(`  -> ${r.endpoint}: HTTP ${r.statusCode} | ${(r.body || '').slice(0, 300)}`)
    );
    console.warn('[IndexNow] State NOT advanced (will retry on next deploy).');
  }

  // IndexNow submission is best-effort. A transient failure must NEVER block a
  // deployment: sitemaps + robots.txt remain the persistent discovery mechanism.
  if (STRICT) {
    return allOk ? 0 : 1;
  }
  console.warn('[IndexNow] Non-strict mode: deployment continues regardless of submission result.');
  return 0;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    console.error('[IndexNow] Fatal error:', err);
    if (STRICT) {
      process.exit(2);
    }
    console.warn('[IndexNow] Non-strict mode: deployment continues despite fatal error.');
    process.exit(0);
  });
