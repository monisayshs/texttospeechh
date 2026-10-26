/**
 * Cloudflare Pages Functions — Catch-All Router
 * Translates Web Standard Request/Response into existing Node-style (req, res) handlers.
 * Requires: nodejs_compat compatibility flag in wrangler.toml
 */

import { connect } from 'cloudflare:sockets';

if (typeof globalThis !== 'undefined') {
  globalThis.cfConnect = connect;
}

const contentHandler = require('../src/api/contentHandler');
const seoHandler = require('../src/api/seoHandler');
const sitemapHandler = require('../src/api/sitemapHandler');
const generateHandler = require('../src/api/generateHandler');
const statusHandler = require('../src/api/statusHandler');
const uploadHandler = require('../src/api/uploadHandler');
const voicesHandler = require('../src/api/voicesHandler');
const languagesHandler = require('../src/api/languagesHandler');
const jobsHandler = require('../src/api/jobsHandler');
const contactHandler = require('../api/contact');
const indexNowHandler = require('../api/index-now');
const { get404Page, get500Page, get403Page, get429Page, get503Page } = require('../src/pages/errorPages');

/**
 * Security headers + HTML edge caching (SEO audit 2026-10-26, Phase 1).
 *
 * Why here: Cloudflare Pages applies public/_headers ONLY to static-asset
 * responses, so the `/*` security block reached 1 of 109 pages (the static
 * homepage) and none of the 108 function-rendered pages; no CSP existed
 * anywhere. Emitting the headers from this function layer covers every page
 * the router produces or passes through.
 */
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// CSP inventoried from what the pages actually load: self-hosted fonts/CSS/JS,
// inline theme/analytics bootstrap scripts (hence 'unsafe-inline'), GA4 via
// googletagmanager.com + google-analytics.com endpoints, Microsoft Clarity via
// clarity.ms, and TTS audio via same-origin /api responses + blob: URLs.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests"
].join('; ');

function withSecurityHeaders(response) {
  const res = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(name, value);
  }
  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('text/html') && !res.headers.has('Content-Security-Policy')) {
    res.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  }
  return res;
}

// Anonymous HTML is stored in the Cache API for 1h (stale-while-revalidate
// covers the refresh) so repeat edge hits skip function execution entirely.
const HTML_EDGE_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

async function finalizeResponse(response, edgeCache, cacheKey, waitUntil) {
  let res = response;
  if (edgeCache && cacheKey && res.status === 200) {
    const contentType = res.headers.get('Content-Type') || '';
    if (contentType.includes('text/html') && !res.headers.has('Set-Cookie')) {
      try {
        res = new Response(res.body, res);
        res.headers.set('Cache-Control', HTML_EDGE_CACHE_CONTROL);
        const cacheCopy = res.clone();
        const putPromise = edgeCache.put(cacheKey, cacheCopy).catch(() => {});
        if (typeof waitUntil === 'function') waitUntil(putPromise);
        else await putPromise;
      } catch (e) { /* a cache-store failure must never break the page */ }
    }
  }
  return withSecurityHeaders(res);
}

/**
 * Static file extensions that should be served directly by Cloudflare Pages CDN.
 * These bypass the function entirely unless they match special routes (robots.txt, llms.txt, etc.)
 */
const STATIC_EXTENSIONS = new Set([
  'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp',
  'woff', 'woff2', 'ttf', 'eot', 'webmanifest', 'map', 'mp3', 'mp4'
]);

/**
 * Special static files that should NOT be passed through to CDN
 * because they need dynamic handling or are served from known paths.
 */
const SPECIAL_STATIC_FILES = new Set([
  '/robots.txt', '/llms.txt', '/ads.txt'
]);

/**
 * Bridge Cloudflare env bindings to process.env for backward compatibility
 */
function bridgeEnvToProcess(env) {
  if (!env) return;
  const keys = [
    'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION',
    'KOKORO_API_ENDPOINT', 'COSYVOICE_API_ENDPOINT',
    'RESEND_API_KEY', 'INDEXNOW_STRICT'
  ];
  for (const key of keys) {
    if (env[key]) {
      process.env[key] = env[key];
    }
  }
}

/**
 * Build a Node-style mock request object from a Web Standard Request
 */
async function buildMockReq(request, env) {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  let bodyBuffer = null;
  let parsedBody = {};

  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    try {
      const arrayBuffer = await request.arrayBuffer();
      bodyBuffer = Buffer.from(arrayBuffer);
      if (bodyBuffer.length > 0) {
        try {
          parsedBody = JSON.parse(bodyBuffer.toString('utf-8'));
        } catch (e) {
          // Not JSON — keep parsedBody empty, raw buffer available
        }
      }
    } catch (e) {
      // Body read failed — proceed without body
    }
  }

  const reqHeaders = {};
  for (const [k, v] of request.headers.entries()) {
    reqHeaders[k] = v;
  }

  return {
    url: request.url,
    method: request.method,
    headers: reqHeaders,
    query: queryParams,
    body: (parsedBody && Object.keys(parsedBody).length > 0) ? parsedBody : (bodyBuffer || {}),
    rawBody: bodyBuffer,
    env: env,
    socket: {
      remoteAddress: reqHeaders['cf-connecting-ip'] || reqHeaders['x-forwarded-for'] || '127.0.0.1'
    },
    [Symbol.asyncIterator]: async function* () {
      if (bodyBuffer) yield bodyBuffer;
    }
  };
}

/**
 * Build a Node-style mock response object that accumulates headers/body
 * and can be converted to a Web Standard Response at the end.
 */
function buildMockRes() {
  let statusCode = 200;
  const resHeaders = new Headers();
  let responseBody = null;
  let headersSent = false;

  const mockRes = {
    get statusCode() { return statusCode; },
    set statusCode(code) { statusCode = code; },
    get headersSent() { return headersSent; },
    set headersSent(val) { headersSent = val; },

    status(code) {
      statusCode = code;
      return mockRes;
    },

    setHeader(name, value) {
      resHeaders.set(name, String(value));
      return mockRes;
    },

    getHeader(name) {
      return resHeaders.get(name);
    },

    json(data) {
      resHeaders.set('Content-Type', 'application/json; charset=utf-8');
      responseBody = JSON.stringify(data);
      headersSent = true;
    },

    write(chunk) {
      const chunkBuf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      if (!responseBody) {
        responseBody = chunkBuf;
      } else {
        const existing = Buffer.isBuffer(responseBody) ? responseBody : Buffer.from(String(responseBody));
        responseBody = Buffer.concat([existing, chunkBuf]);
      }
    },

    end(chunk) {
      if (chunk !== undefined && chunk !== null) {
        if (!responseBody) {
          responseBody = Buffer.isBuffer(chunk) ? chunk : String(chunk);
        } else {
          const chunkBuf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
          const existing = Buffer.isBuffer(responseBody) ? responseBody : Buffer.from(String(responseBody));
          responseBody = Buffer.concat([existing, chunkBuf]);
        }
      }
      headersSent = true;
    },

    redirect(code, destination) {
      statusCode = code;
      resHeaders.set('Location', destination);
      responseBody = `Redirecting to ${destination}`;
      headersSent = true;
    },

    // Convert accumulated state to a Web Standard Response
    toResponse() {
      const validStatus = (typeof statusCode === 'number' && statusCode >= 200 && statusCode <= 599) ? statusCode : 200;
      return new Response(responseBody || '', {
        status: validStatus,
        headers: resHeaders
      });
    }
  };

  return mockRes;
}

/**
 * Main Cloudflare Pages Functions entry point
 */
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // SEO Safety: Redirect all *.pages.dev requests to official domain www.texttospeechh.com
  // Also send X-Robots-Tag: noindex, follow to prevent duplicate indexing on preview domains.
  if (url.hostname.endsWith('.pages.dev')) {
    const targetUrl = `https://www.texttospeechh.com${url.pathname}${url.search}`;
    return new Response(`Redirecting to ${targetUrl}`, {
      status: 301,
      headers: {
        'Location': targetUrl,
        'X-Robots-Tag': 'noindex, follow',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // Static asset passthrough — let Cloudflare Pages CDN handle these directly
  const lastDot = pathname.lastIndexOf('.');
  if (lastDot > 0) {
    const ext = pathname.substring(lastDot + 1).toLowerCase();
    if (STATIC_EXTENSIONS.has(ext) && !SPECIAL_STATIC_FILES.has(pathname) && !pathname.startsWith('/sitemap')) {
      return next();
    }
  }

  // === HTML edge cache lookup (SEO audit 2026-10-26, Phase 1) ===
  // Eligible: anonymous GET page requests only — no query string, no /api/,
  // no Cookie/Authorization headers. The tool is anonymous and public (theme
  // is client-side localStorage; no auth or per-user HTML exists), so cached
  // HTML is identical for every visitor.
  const cacheEligible =
    request.method === 'GET' &&
    !url.search &&
    !pathname.startsWith('/api/') &&
    !request.headers.has('Cookie') &&
    !request.headers.has('Authorization');
  const edgeCache = cacheEligible ? caches.default : null;
  const cacheKey = cacheEligible ? new Request(url.toString(), { method: 'GET' }) : null;
  if (edgeCache) {
    try {
      const cached = await edgeCache.match(cacheKey);
      if (cached) return withSecurityHeaders(cached);
    } catch (e) { /* a cache-read failure must never break the page */ }
  }

  // Bridge Cloudflare env bindings to process.env
  bridgeEnvToProcess(env);

  const mockReq = await buildMockReq(request, env);
  const mockRes = buildMockRes();

  try {
    // === API Route Dispatch ===
    if (pathname.startsWith('/api/generate')) {
      await generateHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/status')) {
      await statusHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/upload')) {
      await uploadHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/voices')) {
      await voicesHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/languages')) {
      await languagesHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/jobs')) {
      await jobsHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/contact')) {
      await contactHandler(mockReq, mockRes);
    } else if (pathname.startsWith('/api/index-now') || pathname === '/indexnow') {
      await indexNowHandler(mockReq, mockRes);

    // === Diagnostic Error Pages ===
    } else if (pathname === '/500' || pathname === '/500.html') {
      mockRes.statusCode = 500;
      mockRes.setHeader('Content-Type', 'text/html; charset=utf-8');
      mockRes.end(get500Page());
    } else if (pathname === '/403' || pathname === '/403.html') {
      mockRes.statusCode = 403;
      mockRes.setHeader('Content-Type', 'text/html; charset=utf-8');
      mockRes.end(get403Page());
    } else if (pathname === '/429' || pathname === '/429.html') {
      mockRes.statusCode = 429;
      mockRes.setHeader('Content-Type', 'text/html; charset=utf-8');
      mockRes.end(get429Page());
    } else if (pathname === '/503' || pathname === '/503.html') {
      mockRes.statusCode = 503;
      mockRes.setHeader('Content-Type', 'text/html; charset=utf-8');
      mockRes.end(get503Page());

    // === Sitemap Routes ===
    } else if (pathname.startsWith('/sitemap')) {
      const isHandled = await sitemapHandler(mockReq, mockRes);
      if (!isHandled) {
        return next();
      }

    // === Content & SEO SSR Pages ===
    } else {
      const isContentHandled = await contentHandler(mockReq, mockRes);
      if (!isContentHandled) {
        const isSeoHandled = await seoHandler(mockReq, mockRes);
        if (!isSeoHandled) {
          // Try static asset fallback from Cloudflare Pages CDN
          const staticRes = await next();
          if (staticRes && staticRes.status !== 404) {
            return finalizeResponse(staticRes, edgeCache, cacheKey, context.waitUntil.bind(context));
          }
          // Return custom 404 page
          mockRes.statusCode = 404;
          mockRes.setHeader('Content-Type', 'text/html; charset=utf-8');
          mockRes.end(get404Page());
        }
      }
    }

    return finalizeResponse(mockRes.toResponse(), edgeCache, cacheKey, context.waitUntil.bind(context));

  } catch (err) {
    console.error('[Cloudflare Pages Function Router Error]:', err);
    const errorHeaders = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
    return withSecurityHeaders(new Response(get500Page(), { status: 500, headers: errorHeaders }));
  }
}
