const contentHandler = require('../src/api/contentHandler');
const seoHandler = require('../src/api/seoHandler');
const sitemapHandler = require('../src/api/sitemapHandler');
const generateHandler = require('../src/api/generateHandler');
const statusHandler = require('../src/api/statusHandler');
const uploadHandler = require('../src/api/uploadHandler');
const { get404Page, get500Page } = require('../src/pages/errorPages');

module.exports = async (req, res) => {
  try {
    const reqUrl = req.url || '/';

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
