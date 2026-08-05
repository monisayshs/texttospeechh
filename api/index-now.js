const https = require('https');
const {
  HOST,
  INDEXNOW_KEY,
  KEY_LOCATION,
  SEARCH_ENGINE_ENDPOINTS,
  isValidKey,
  isValidUrl,
  urlBelongsToHost
} = require('../src/seo/indexNowConfig');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function forwardToEngine(endpoint, payload) {
  return new Promise((resolve) => {
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
        timeout: 10000
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

async function submitToEngines(payload) {
  const results = await Promise.all(
    SEARCH_ENGINE_ENDPOINTS.map((endpoint) => forwardToEngine(endpoint, payload))
  );
  return results;
}

async function handlePost(req, res) {
  let raw = '';
  for await (const chunk of req) raw += chunk;

  let body;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON payload' });
  }

  const { host, key, keyLocation, urlList } = body || {};

  if (!isValidKey(key)) {
    return sendJson(res, 400, { error: 'Key must be 8-128 chars of [a-zA-Z0-9-]' });
  }
  if (key !== INDEXNOW_KEY) {
    return sendJson(res, 403, { error: 'Key does not match the hosted key file' });
  }
  if (!host || host !== HOST) {
    return sendJson(res, 422, { error: `Host must be ${HOST}` });
  }
  if (!Array.isArray(urlList) || urlList.length === 0 || urlList.length > 10000) {
    return sendJson(res, 422, { error: 'urlList must contain 1-10000 URLs' });
  }
  for (const url of urlList) {
    if (!isValidUrl(url) || !urlBelongsToHost(url, HOST)) {
      return sendJson(res, 422, { error: `URL does not belong to host: ${url}` });
    }
  }

  const payload = {
    host,
    key,
    keyLocation: keyLocation || KEY_LOCATION,
    urlList
  };

  const results = await submitToEngines(payload);
  const forwarded = results.map((r) => ({
    endpoint: r.endpoint,
    status: r.statusCode,
    accepted: r.statusCode === 200 || r.statusCode === 202
  }));

  sendJson(res, 200, { ok: true, results: forwarded });
}

function handleGet(req, res) {
  const reqUrl = new URL(req.url, `https://${req.headers.host || HOST}`);
  const url = reqUrl.searchParams.get('url');
  const key = reqUrl.searchParams.get('key');

  if (!isValidKey(key)) {
    return sendJson(res, 400, { error: 'Key must be 8-128 chars of [a-zA-Z0-9-]' });
  }
  if (key !== INDEXNOW_KEY) {
    return sendJson(res, 403, { error: 'Key does not match the hosted key file' });
  }
  if (!url || !isValidUrl(url)) {
    return sendJson(res, 400, { error: 'url parameter is required and must be a valid URL' });
  }
  if (!urlBelongsToHost(url, HOST)) {
    return sendJson(res, 422, { error: `URL does not belong to host: ${url}` });
  }

  const payload = {
    host: HOST,
    key,
    keyLocation: KEY_LOCATION,
    urlList: [url]
  };

  submitToEngines(payload)
    .then((results) => {
      const forwarded = results.map((r) => ({
        endpoint: r.endpoint,
        status: r.statusCode,
        accepted: r.statusCode === 200 || r.statusCode === 202
      }));
      sendJson(res, 200, { ok: true, results: forwarded });
    })
    .catch((err) => sendJson(res, 500, { error: err.message }));
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') return await handleGet(req, res);
    if (req.method === 'POST') return await handlePost(req, res);
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  } catch (err) {
    return sendJson(res, 500, { error: err.message });
  }
};

module.exports.submitToEngines = submitToEngines;
module.exports.forwardToEngine = forwardToEngine;
