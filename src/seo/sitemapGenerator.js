/**
 * TextToSpeechH AI - Production XML Sitemap Generator Module
 */

const BASE_URL = 'https://www.texttospeechh.com';

const PUBLIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/text-to-speech', priority: '1.0', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { url: '/terms', priority: '0.4', changefreq: 'yearly' },
  { url: '/disclaimer', priority: '0.4', changefreq: 'yearly' }
];

const SPOKE_ROUTES = [
  { url: '/text-to-speech/ai-text-to-speech', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/free-text-to-speech', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/online-text-to-speech', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/text-to-voice', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/voice-generator', priority: '0.9', changefreq: 'weekly' },
  { url: '/text-to-speech/read-aloud', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/pdf-to-speech', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/word-to-speech', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/blog', priority: '0.9', changefreq: 'daily' },
  { url: '/text-to-speech/blog/best-ai-voices', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/blog/how-text-to-speech-works', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/blog/text-to-speech-for-students', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/blog/text-to-speech-for-youtube', priority: '0.8', changefreq: 'monthly' },
  { url: '/text-to-speech/blog/elevenlabs-alternatives', priority: '0.8', changefreq: 'monthly' }
];

function generateXmlSitemap() {
  const dateStr = new Date().toISOString().split('T')[0];
  const allRoutes = [...PUBLIC_ROUTES, ...SPOKE_ROUTES];
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
