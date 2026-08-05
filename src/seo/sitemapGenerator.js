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
const LAST_MOD = '2026-08-05';

const PUBLIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/text-to-speech', priority: '1.0', changefreq: 'daily' },
  { url: '/text-to-speech/blog', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' }
];

const LEGAL_ROUTES = [
  { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  { url: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
  { url: '/cookie-policy', priority: '0.4', changefreq: 'yearly' },
  { url: '/dmca', priority: '0.4', changefreq: 'yearly' },
  { url: '/accessibility', priority: '0.4', changefreq: 'monthly' },
  { url: '/community-guidelines', priority: '0.4', changefreq: 'monthly' }
];

const STATIC_SPOKE_ROUTES = [
  { url: '/text-to-speech/ai-text-to-speech', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/free-text-to-speech', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/online-text-to-speech', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/text-to-voice', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/voice-generator', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/read-aloud', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/pdf-to-speech', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/word-to-speech', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/txt-to-speech', priority: '0.8', changefreq: 'monthly' }
];

function getDynamicBlogRoutes() {
  if (!BLOG_ARTICLES_MAP) return [];
  return Object.keys(BLOG_ARTICLES_MAP).map(slug => ({
    url: `/${slug.replace(/^\/+/, '')}`,
    priority: '0.8',
    changefreq: 'monthly'
  }));
}

function getProgrammaticRoutes() {
  if (!PROGRAMMATIC_ROUTER) return [];
  return Object.keys(PROGRAMMATIC_ROUTER).map(slug => ({
    url: `/${slug.replace(/^\/+/, '')}`,
    priority: '0.6',
    changefreq: 'monthly'
  }));
}

function getGuideRoutes() {
  if (!EDUCATIONAL_GUIDES) return [];
  return Object.keys(EDUCATIONAL_GUIDES).map(slug => ({
    url: `/${slug.replace(/^\/+/, '')}`,
    priority: '0.6',
    changefreq: 'monthly'
  }));
}

function toUrlBlocks(routes) {
  return routes.map(r => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${LAST_MOD}</lastmod>
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
${toUrlBlocks(allRoutes)}
</urlset>`;
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
${toUrlBlocks(routes)}
</urlset>`;
}

function getSitemapProgrammaticXml() {
  const routes = getProgrammaticRoutes();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${toUrlBlocks(routes)}
</urlset>`;
}

function getSitemapLegalXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${toUrlBlocks(LEGAL_ROUTES)}
</urlset>`;
}

function getSitemapIndexXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-main.xml</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-programmatic.xml</loc>
    <lastmod>${LAST_MOD}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-legal.xml</loc>
    <lastmod>${LAST_MOD}</lastmod>
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
  LAST_MOD,
  PUBLIC_ROUTES,
  LEGAL_ROUTES,
  STATIC_SPOKE_ROUTES,
  getDynamicBlogRoutes,
  getProgrammaticRoutes,
  getGuideRoutes
};
