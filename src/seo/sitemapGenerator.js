const DOMAIN = "https://texttospeechh-ai.vercel.app";

function getSitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/about</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/contact</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/privacy-policy</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${DOMAIN}/terms</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${DOMAIN}/disclaimer</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${DOMAIN}/404</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>
  <url>
    <loc>${DOMAIN}/500</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>
</urlset>`;
}

module.exports = {
  DOMAIN,
  getSitemapXml,
  getSitemapIndexXml: getSitemapXml,
  getSitemapMainXml: getSitemapXml,
  getSitemapProgrammaticXml: getSitemapXml,
  getSitemapLegalXml: getSitemapXml
};
