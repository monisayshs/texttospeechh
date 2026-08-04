/**
 * TextToSpeechH AI - Production XML Sitemap Generator Module
 */

const { BLOG_ARTICLES_MAP } = require('../pages/textToSpeechBlogHub');

const BASE_URL = 'https://texttospeechh.com';

const PUBLIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/text-to-speech', priority: '1.0', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  { url: '/disclaimer', priority: '0.4', changefreq: 'yearly' }
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
  { url: '/text-to-speech/txt-to-speech', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/blog', priority: '0.9', changefreq: 'daily' }
];

function getDynamicBlogRoutes() {
  if (!BLOG_ARTICLES_MAP) return [];
  return Object.keys(BLOG_ARTICLES_MAP).map(slug => ({
    url: `/${slug.replace(/^\/+/, '')}`,
    priority: '0.8',
    changefreq: 'monthly'
  }));
}

function generateXmlSitemap() {
  const dateStr = new Date().toISOString().split('T')[0];
  const dynamicBlogRoutes = getDynamicBlogRoutes();
  const allRoutes = [...PUBLIC_ROUTES, ...STATIC_SPOKE_ROUTES, ...dynamicBlogRoutes];
  
  const urlBlocks = allRoutes.map(r => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlBlocks}
</urlset>`;
}

module.exports = {
  generateXmlSitemap,
  BASE_URL,
  PUBLIC_ROUTES,
  STATIC_SPOKE_ROUTES,
  getDynamicBlogRoutes
};
