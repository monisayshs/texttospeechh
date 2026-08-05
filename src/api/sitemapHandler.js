const sitemapGenerator = require('../seo/sitemapGenerator');

module.exports = async (req, res) => {
  const reqUrl = req.url.split('?')[0];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  if (reqUrl === '/sitemap.xml') {
    res.end(sitemapGenerator.getSitemapIndexXml());
    return true;
  }
  if (reqUrl === '/sitemap-main.xml') {
    res.end(sitemapGenerator.getSitemapMainXml());
    return true;
  }
  if (reqUrl === '/sitemap-programmatic.xml') {
    res.end(sitemapGenerator.getSitemapProgrammaticXml());
    return true;
  }
  if (reqUrl === '/sitemap-legal.xml') {
    res.end(sitemapGenerator.getSitemapLegalXml());
    return true;
  }

  return false;
};
