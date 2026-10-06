/**
 * TextToSpeechH AI - Production XML Sitemap Generator Module
 * Canonical Host: https://www.texttospeechh.com
 *
 * Generates a clean sitemap index plus per-category sitemaps. Only live,
 * HTTP-200 routes are included. No doorway URLs, no redirecting URLs, and
 * no dead URLs are emitted.
 */

const { BLOG_ARTICLES_MAP } = require('../pages/textToSpeechBlogHub');
const { PROGRAMMATIC_ROUTER } = require('./programmaticPages');
const { EDUCATIONAL_GUIDES } = require('../content/educationalGuides');

const BASE_URL = 'https://www.texttospeechh.com';
// Dynamic lastmod: computed per-request (not at module load) so every crawl
// gets today's date. Module-level `new Date()` can freeze at the worker's
// cold-start time (or epoch) in serverless runtimes, so never cache it here.
function getLastMod() {
  return new Date().toISOString().split('T')[0];
}

// Per-section lastmod (YYYY-MM-DD) — real content-change dates, refreshed from
// git history on 2026-10-06. Blog articles use their own dateModified from
// BLOG_ARTICLES_MAP (see parseArticleDate below), so they are always exact.
// NOTE for future editors: when you change a section's content, bump its date
// here. Production has no .git, so these cannot be computed at runtime.
const SECTION_LASTMOD = {
  '/': '2026-10-05',                    // public/index.html
  '/text-to-speech': '2026-09-28',      // src/pages/textToSpeechPillar.js
  '/text-to-speech/blog': '2026-10-05', // src/pages/textToSpeechBlogHub.js
  '/about': '2026-09-28',               // src/pages/legalPages.js
  '/contact': '2026-09-28',             // src/pages/legalPages.js
  '/faq': '2026-10-05',                 // src/api/contentHandler.js
  '__legal': '2026-09-28',              // src/pages/legalPages.js
  '__spokes': '2026-10-06',             // src/pages/textToSpeechSubpages.js
  '__programmatic': '2026-10-06',       // src/seo/programmaticPages.js
  '__guides': '2026-09-28'              // src/content/educationalGuides.js
};

// "August 2, 2026" -> "2026-08-02". Returns null when unparseable.
function parseArticleDate(str) {
  if (!str) return null;
  const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(str.trim());
  if (!m) return null;
  const months = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
  const mm = months[m[1].toLowerCase()];
  if (!mm) return null;
  return `${m[3]}-${mm}-${m[2].padStart(2, '0')}`;
}

const PUBLIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily', lastmod: SECTION_LASTMOD['/'] },
  { url: '/text-to-speech', priority: '1.0', changefreq: 'daily', lastmod: SECTION_LASTMOD['/text-to-speech'] },
  { url: '/text-to-speech/blog', priority: '0.9', changefreq: 'daily', lastmod: SECTION_LASTMOD['/text-to-speech/blog'] },
  { url: '/about', priority: '0.8', changefreq: 'monthly', lastmod: SECTION_LASTMOD['/about'] },
  { url: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: SECTION_LASTMOD['/contact'] },
  { url: '/faq', priority: '0.6', changefreq: 'monthly', lastmod: SECTION_LASTMOD['/faq'] }
];

const LEGAL_ROUTES = [
  { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly', lastmod: SECTION_LASTMOD.__legal },
  { url: '/terms', priority: '0.4', changefreq: 'yearly', lastmod: SECTION_LASTMOD.__legal },
  { url: '/disclaimer', priority: '0.4', changefreq: 'yearly', lastmod: SECTION_LASTMOD.__legal },
  { url: '/cookie-policy', priority: '0.4', changefreq: 'yearly', lastmod: SECTION_LASTMOD.__legal },
  { url: '/dmca', priority: '0.4', changefreq: 'yearly', lastmod: SECTION_LASTMOD.__legal },
  { url: '/accessibility', priority: '0.4', changefreq: 'monthly', lastmod: SECTION_LASTMOD.__legal },
  { url: '/community-guidelines', priority: '0.4', changefreq: 'monthly', lastmod: SECTION_LASTMOD.__legal }
];

const STATIC_SPOKE_ROUTES = [
  { url: '/text-to-speech/ai-text-to-speech', priority: '0.9', changefreq: 'weekly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/free-text-to-speech', priority: '0.9', changefreq: 'weekly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/online-text-to-speech', priority: '0.9', changefreq: 'weekly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/text-to-voice', priority: '0.9', changefreq: 'weekly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/voice-generator', priority: '0.9', changefreq: 'weekly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/read-aloud', priority: '0.8', changefreq: 'monthly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/pdf-to-speech', priority: '0.8', changefreq: 'monthly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/word-to-speech', priority: '0.8', changefreq: 'monthly', lastmod: SECTION_LASTMOD.__spokes },
  { url: '/text-to-speech/txt-to-speech', priority: '0.8', changefreq: 'monthly', lastmod: SECTION_LASTMOD.__spokes }
];

function getDynamicBlogRoutes() {
  if (!BLOG_ARTICLES_MAP) return [];
  return Object.keys(BLOG_ARTICLES_MAP).map(slug => {
    const a = BLOG_ARTICLES_MAP[slug] || {};
    return {
      url: `/${slug.replace(/^\/+/, '')}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: parseArticleDate(a.dateModified) || parseArticleDate(a.datePublished) || SECTION_LASTMOD['/text-to-speech/blog']
    };
  });
}

function getProgrammaticRoutes() {
  if (!PROGRAMMATIC_ROUTER) return [];
  return Object.keys(PROGRAMMATIC_ROUTER).map(slug => ({
    url: `/${slug.replace(/^\/+/, '')}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: SECTION_LASTMOD.__programmatic
  }));
}

function getGuideRoutes() {
  if (!EDUCATIONAL_GUIDES) return [];
  return Object.keys(EDUCATIONAL_GUIDES).map(slug => ({
    url: `/${slug.replace(/^\/+/, '')}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: SECTION_LASTMOD.__guides
  }));
}

function routeLastMod(r, fallback) {
  return r.lastmod || SECTION_LASTMOD[r.url] || fallback;
}

function toUrlBlocks(routes, fallback) {
  return routes.map(r => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${routeLastMod(r, fallback)}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');
}

function generateXmlSitemap() {
  const allRoutes = [
    ...PUBLIC_ROUTES,
    ...LEGAL_ROUTES,
    ...STATIC_SPOKE_ROUTES,
    ...getDynamicBlogRoutes(),
    ...getProgrammaticRoutes(),
    ...getGuideRoutes()
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${toUrlBlocks(allRoutes, getLastMod())}
</urlset>`;
}

// Latest lastmod across a set of YYYY-MM-DD date strings.
function maxLastMod(dates) {
  return dates.filter(Boolean).sort().pop() || getLastMod();
}

function mainSitemapLastMod() {
  const blogDates = getDynamicBlogRoutes().map(r => r.lastmod);
  return maxLastMod([
    SECTION_LASTMOD['/'],
    SECTION_LASTMOD['/text-to-speech'],
    SECTION_LASTMOD['/text-to-speech/blog'],
    SECTION_LASTMOD.__spokes,
    SECTION_LASTMOD.__guides,
    ...blogDates
  ]);
}

function getSitemapMainXml() {
  const routes = [
    ...PUBLIC_ROUTES,
    ...STATIC_SPOKE_ROUTES,
    ...getDynamicBlogRoutes(),
    ...getGuideRoutes()
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${toUrlBlocks(routes, getLastMod())}
</urlset>`;
}

function getSitemapProgrammaticXml() {
  const routes = getProgrammaticRoutes();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${toUrlBlocks(routes, getLastMod())}
</urlset>`;
}

function getSitemapLegalXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${toUrlBlocks(LEGAL_ROUTES, getLastMod())}
</urlset>`;
}

function getSitemapIndexXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-main.xml</loc>
    <lastmod>${mainSitemapLastMod()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-programmatic.xml</loc>
    <lastmod>${SECTION_LASTMOD.__programmatic}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-legal.xml</loc>
    <lastmod>${SECTION_LASTMOD.__legal}</lastmod>
  </sitemap>
</sitemapindex>`;
}

module.exports = {
  generateXmlSitemap,
  getSitemapIndexXml,
  getSitemapMainXml,
  getSitemapProgrammaticXml,
  getSitemapLegalXml,
  BASE_URL,
  getLastMod,
  PUBLIC_ROUTES,
  LEGAL_ROUTES,
  STATIC_SPOKE_ROUTES,
  getDynamicBlogRoutes,
  getProgrammaticRoutes,
  getGuideRoutes
};
