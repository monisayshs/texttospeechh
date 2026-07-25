const contentHandler = require('../src/api/contentHandler');
const seoHandler = require('../src/api/seoHandler');
const sitemapHandler = require('../src/api/sitemapHandler');
const generateHandler = require('../src/api/generateHandler');
const statusHandler = require('../src/api/statusHandler');
const uploadHandler = require('../src/api/uploadHandler');

module.exports = async (req, res) => {
  const reqUrl = req.url || '/';

  if (reqUrl.startsWith('/api/generate')) {
    return generateHandler(req, res);
  }
  if (reqUrl.startsWith('/api/status')) {
    return statusHandler(req, res);
  }
  if (reqUrl.startsWith('/api/upload')) {
    return uploadHandler(req, res);
  }

  if (reqUrl.startsWith('/sitemap')) {
    const isSitemapHandled = await sitemapHandler(req, res);
    if (isSitemapHandled) return;
  }

  const isContentHandled = await contentHandler(req, res);
  if (isContentHandled) return;

  const isSeoHandled = await seoHandler(req, res);
  if (isSeoHandled) return;

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<h1>404 - Page Not Found</h1>');
};
