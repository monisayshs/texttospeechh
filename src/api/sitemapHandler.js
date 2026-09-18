const sitemapGenerator = require('../seo/sitemapGenerator');

function getPathname(req) {
  const rawUrl = req.url || '/';
  try {
    const parsed = new URL(rawUrl, 'https://www.texttospeechh.com');
    return parsed.pathname;
  } catch (e) {
    return rawUrl.split('?')[0];
  }
}

module.exports = async (req, res) => {
  const pathname = getPathname(req);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  if (pathname === '/sitemap.xml') {
    res.end(sitemapGenerator.getSitemapIndexXml());
    return true;
  }
  if (pathname === '/sitemap-main.xml') {
    res.end(sitemapGenerator.getSitemapMainXml());
    return true;
  }
  if (pathname === '/sitemap-programmatic.xml') {
    res.end(sitemapGenerator.getSitemapProgrammaticXml());
    return true;
  }
  if (pathname === '/sitemap-legal.xml') {
    res.end(sitemapGenerator.getSitemapLegalXml());
    return true;
  }

  return false;
};
