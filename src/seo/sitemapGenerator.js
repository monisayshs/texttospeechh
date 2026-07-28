/**
 * TextToSpeechH AI - Production XML Sitemap Generator Module
 */

const BASE_URL = 'https://www.texttospeechh.com';

const PUBLIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  { url: '/disclaimer', priority: '0.4', changefreq: 'yearly' }
];

const BLOG_ROUTES = [
  { url: '/blog/text-to-speech-complete-guide', priority: '0.9', changefreq: 'monthly' },
  { url: '/blog/ultimate-ai-texttospeechh.com-guide', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog/ai-voiceover-for-youtube-shorts', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog/text-to-speech-audiobook-creation', priority: '0.8', changefreq: 'monthly' }
];

const KEYWORD_ROUTES = [
  { url: '/keyword/ai-text-to-speech', priority: '0.7', changefreq: 'monthly' },
  { url: '/keyword/free-text-to-speech', priority: '0.7', changefreq: 'monthly' },
  { url: '/keyword/online-text-to-speech', priority: '0.7', changefreq: 'monthly' },
  { url: '/keyword/text-to-voice', priority: '0.7', changefreq: 'monthly' },
  { url: '/keyword/voice-generator', priority: '0.7', changefreq: 'monthly' }
];

function generateXmlSitemap() {
  const dateStr = new Date().toISOString().split('T')[0];
  const allRoutes = [...PUBLIC_ROUTES, ...BLOG_ROUTES, ...KEYWORD_ROUTES];
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
  PUBLIC_ROUTES
};
