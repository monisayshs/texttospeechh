const { PROGRAMMATIC_ROUTER } = require('./programmaticPages');
const { LEGAL_PAGES } = require('../pages/legalPages');

const DOMAIN = "https://texttospeechh.com";

function getSitemapIndexXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap-main.xml</loc>
    <lastmod>2026-07-24</lastmod>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-programmatic.xml</loc>
    <lastmod>2026-07-24</lastmod>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap-legal.xml</loc>
    <lastmod>2026-07-24</lastmod>
  </sitemap>
</sitemapindex>`;
}

function getSitemapMainXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

function getSitemapProgrammaticXml() {
  const urls = Object.keys(PROGRAMMATIC_ROUTER).map(slug => `
  <url>
    <loc>${DOMAIN}/${slug}</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

function getSitemapLegalXml() {
  const urls = Object.keys(LEGAL_PAGES).map(slug => `
  <url>
    <loc>${DOMAIN}/${slug === 'privacy' ? 'privacy-policy' : slug === 'cookie' ? 'cookie-policy' : slug === 'refund' ? 'refund-policy' : slug === 'community' ? 'community-guidelines' : slug}</loc>
    <lastmod>2026-07-24</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

module.exports = {
  DOMAIN,
  getSitemapIndexXml,
  getSitemapMainXml,
  getSitemapProgrammaticXml,
  getSitemapLegalXml
};
