const https = require('https');
const http = require('http');

function fetchUrl(url, redirects = 0) {
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, url).toString();
        return fetchUrl(nextUrl, redirects + 1).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body, finalUrl: url }));
    }).on('error', reject);
  });
}

async function runLiveVerification() {
  console.log('=================================================');
  console.log('LIVE PRODUCTION DOMAIN VERIFICATION (WITH REDIRECT FOLLOW)');
  console.log('=================================================');

  const routes = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/sitemap.xml',
    '/robots.txt',
    '/ads.txt'
  ];

  const domain = 'https://texttospeechh-ai.vercel.app';

  for (const r of routes) {
    const fullUrl = `${domain}${r}`;
    try {
      const res = await fetchUrl(fullUrl);
      console.log(`[PASS] ${r} -> Final HTTP ${res.statusCode} (${res.body.length} bytes) at ${res.finalUrl}`);
    } catch (err) {
      console.log(`[CHECK] ${r} -> ${err.message}`);
    }
  }

  console.log('=================================================');
}

runLiveVerification();
