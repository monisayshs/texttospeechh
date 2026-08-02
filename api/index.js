const contentHandler = require('../src/api/contentHandler');
const seoHandler = require('../src/api/seoHandler');
const sitemapHandler = require('../src/api/sitemapHandler');
const generateHandler = require('../src/api/generateHandler');
const statusHandler = require('../src/api/statusHandler');
const uploadHandler = require('../src/api/uploadHandler');
const { 
  get404Page, 
  get500Page, 
  get403Page, 
  get429Page, 
  get503Page 
} = require('../src/pages/errorPages');

function getRequestPathname(req) {
  const rawUrl = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url || '/';
  try {
    const parsed = new URL(rawUrl, 'https://texttospeechh.com');
    return parsed.pathname;
  } catch (e) {
    return rawUrl.split('?')[0];
  }
}

module.exports = async (req, res) => {
  try {
    const pathname = getRequestPathname(req);

    // Diagnostic Error Test Routes (Strict Exact Pathname Matches Only)
    if (pathname === '/500' || pathname === '/500.html') {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get500Page());
    }
    if (pathname === '/403' || pathname === '/403.html') {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get403Page());
    }
    if (pathname === '/429' || pathname === '/429.html') {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get429Page());
    }
    if (pathname === '/503' || pathname === '/503.html') {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get503Page());
    }

    // Backend API Handlers
    if (pathname.startsWith('/api/generate')) {
      return await generateHandler(req, res);
    }
    if (pathname.startsWith('/api/status')) {
      return await statusHandler(req, res);
    }
    if (pathname.startsWith('/api/upload')) {
      return await uploadHandler(req, res);
    }

    // Sitemap Handlers
    if (pathname.startsWith('/sitemap')) {
      if (typeof sitemapHandler === 'function') {
        const isSitemapHandled = await sitemapHandler(req, res);
        if (isSitemapHandled) return;
      }
    }

    // Content Handlers (/faq, /guides/*)
    if (typeof contentHandler === 'function') {
      const isContentHandled = await contentHandler(req, res);
      if (isContentHandled) return;
    }

    // SEO & Legal Page Handlers (/text-to-speech, /about, /privacy-policy, /terms, /disclaimer, /contact, /keyword/*)
    if (typeof seoHandler === 'function') {
      const isSeoHandled = await seoHandler(req, res);
      if (isSeoHandled) return;
    }

    // Unmatched Routes -> 404 Custom Error Page
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(get404Page());

  } catch (err) {
    console.error('[Global Router Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(get500Page());
    }
  }
};
