const fs = require('fs');
const path = require('path');
const {
  HOST,
  INDEXNOW_KEY,
  KEY_LOCATION,
  UNIVERSAL_ENDPOINT,
  BING_ENDPOINT
} = require('../src/seo/indexNowConfig');

const sitemapGenerator = require('../src/seo/sitemapGenerator');

const STATE_FILE = path.join(__dirname, '.indexnow-state.json');
const BASE_URL = `https://${HOST}`;

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
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
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

async function main() {
  console.log('[IndexNow] Auto-submission after deploy');
  console.log(`[IndexNow] Host: ${HOST}`);
  console.log(`[IndexNow] Key: ${INDEXNOW_KEY}`);
  console.log(`[IndexNow] Key file: ${KEY_LOCATION}`);

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
      `[IndexNow] ${ok ? 'PASS' : 'FAIL'} ${endpoint} -> HTTP ${res.statusCode}` +
        (res.body ? ` | ${res.body.slice(0, 200)}` : '')
    );
  }

  const allOk = results.every((r) => r.statusCode === 200 || r.statusCode === 202);
  if (allOk) {
    urlsToSubmit.forEach((u) => (state.submitted[u] = now));
    saveState(state);
    console.log(`[IndexNow] Submitted ${urlsToSubmit.length} URLs to ${endpoints.length} engines. State saved.`);
  } else {
    console.error('[IndexNow] One or more submissions failed. State NOT advanced.');
  }

  // IndexNow submission is best-effort. A transient failure must NEVER block a
  // deployment: sitemaps + robots.txt remain the persistent discovery mechanism.
  if (process.env.INDEXNOW_STRICT === '1') {
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
    process.exit(process.env.INDEXNOW_STRICT === '1' ? 2 : 0);
  });
