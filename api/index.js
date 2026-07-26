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
  get503Page, 
  getOfflinePage 
} = require('../src/pages/errorPages');

module.exports = async (req, res) => {
  try {
    const reqUrl = req.url || '/';

    // Diagnostic Error Test Routes
    if (reqUrl.includes('500')) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get500Page());
    }
    if (reqUrl.includes('403')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get403Page());
    }
    if (reqUrl.includes('429')) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get429Page());
    }
    if (reqUrl.includes('503')) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(get503Page());
    }

    if (reqUrl.startsWith('/api/generate')) {
      return await generateHandler(req, res);
    }
    if (reqUrl.startsWith('/api/status')) {
      return await statusHandler(req, res);
    }
    if (reqUrl.startsWith('/api/upload')) {
      return await uploadHandler(req, res);
    }

    if (reqUrl.startsWith('/sitemap')) {
      const isSitemapHandled = await sitemapHandler(req, res);
      if (isSitemapHandled) return;
    }

    const isContentHandled = await contentHandler(req, res);
    if (isContentHandled) return;

    const isSeoHandled = await seoHandler(req, res);
    if (isSeoHandled) return;

    // Unmatched Routes -> 404 Custom Error Page
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(get404Page());

  } catch (err) {
    console.error('[Global Router Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(get500Page());
  }
};
