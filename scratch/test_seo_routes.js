const seoHandler = require('../src/api/seoHandler');
const { generateXmlSitemap } = require('../src/seo/sitemapGenerator');

async function testRoutes() {
  const routesToTest = [
    '/text-to-speech',
    '/text-to-speech/ai-text-to-speech',
    '/text-to-speech/free-text-to-speech',
    '/text-to-speech/online-text-to-speech',
    '/text-to-speech/text-to-voice',
    '/text-to-speech/voice-generator',
    '/text-to-speech/read-aloud',
    '/text-to-speech/pdf-to-speech',
    '/text-to-speech/word-to-speech',
    '/text-to-speech/blog',
    '/text-to-speech/blog/best-ai-voices',
    '/text-to-speech/blog/how-text-to-speech-works',
    '/text-to-speech/blog/text-to-speech-for-students',
    '/text-to-speech/blog/text-to-speech-for-youtube',
    '/text-to-speech/blog/elevenlabs-alternatives'
  ];

  console.log("Testing SEO Handler Routes...");
  for (const r of routesToTest) {
    let htmlOutput = '';
    const req = { url: r };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      end(data) { htmlOutput = data; }
    };
    const handled = await seoHandler(req, res);
    if (!handled || !htmlOutput.includes('<!DOCTYPE html>')) {
      console.error(`FAILED route: ${r}`);
      process.exit(1);
    }
    console.log(`PASS route: ${r} (${htmlOutput.length} bytes)`);
  }

  const sitemap = generateXmlSitemap();
  if (!sitemap.includes('/text-to-speech') || !sitemap.includes('/text-to-speech/blog')) {
    console.error("FAILED sitemap verification");
    process.exit(1);
  }
  console.log("PASS sitemap verification");
  console.log("ALL ROUTES VERIFIED SUCCESSFULLY!");
}

testRoutes().catch(err => {
  console.error("Error testing routes:", err);
  process.exit(1);
});
