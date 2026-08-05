const { PROGRAMMATIC_ROUTER, KEYWORD_REDIRECTS, OLD_BLOG_REDIRECTS } = require('../seo/programmaticPages');
const { LEGAL_PAGES } = require('../pages/legalPages');
const { TEXT_TO_SPEECH_PILLAR_PAGE } = require('../pages/textToSpeechPillar');
const { TEXT_TO_SPEECH_SUBPAGES } = require('../pages/textToSpeechSubpages');
const { BLOG_ARTICLES_MAP, getBlogHubPage } = require('../pages/textToSpeechBlogHub');
const { getSaaSFooterHtml } = require('../pages/footerComponent');
const schemaGenerator = require('../seo/schemaGenerator');
const hreflangMap = require('../seo/hreflangMap');
const { getAllTrackingSnippetsHtml } = require('../seo/gaSnippet');

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

// Comprehensive 301 Redirect Mapping for Hub & Spoke Consolidation
const AUTO_REDIRECT_MAP = {
  "blog": "text-to-speech/blog",
  "blog/text-to-speech": "text-to-speech",
  "blog/ai-text-to-speech": "text-to-speech/ai-text-to-speech",
  "blog/free-text-to-speech": "text-to-speech/free-text-to-speech",
  "blog/online-text-to-speech": "text-to-speech/online-text-to-speech",
  "blog/text-to-voice": "text-to-speech/text-to-voice",
  "blog/voice-generator": "text-to-speech/voice-generator",
  "blog/read-aloud": "text-to-speech/read-aloud",
  "blog/pdf-to-speech": "text-to-speech/pdf-to-speech",
  "blog/word-to-speech": "text-to-speech/word-to-speech",
  "blog/best-ai-voices": "text-to-speech/blog/best-ai-voices",
  "blog/how-text-to-speech-works": "text-to-speech/blog/how-text-to-speech-works",
  "blog/text-to-speech-for-students": "text-to-speech/blog/text-to-speech-for-students",
  "blog/text-to-speech-for-youtube": "text-to-speech/blog/text-to-speech-for-youtube",
  "blog/elevenlabs-alternatives": "text-to-speech/blog/elevenlabs-alternatives",

  // Legacy Keyword Aliases
  "keyword/text-to-speech-free": "text-to-speech/free-text-to-speech",
  "keyword/free-ai-texttospeechh.com": "text-to-speech",
  "keyword/faceless-youtube-ai-voice": "text-to-speech/blog/text-to-speech-for-youtube",
  "keyword/ai-voice-cloning": "text-to-speech/ai-text-to-speech",
  "keyword/ai-text-to-speech": "text-to-speech/ai-text-to-speech",
  "keyword/free-text-to-speech": "text-to-speech/free-text-to-speech",
  "keyword/online-text-to-speech": "text-to-speech/online-text-to-speech",
  "keyword/text-to-voice": "text-to-speech/text-to-voice",
  "keyword/voice-generator": "text-to-speech/voice-generator"
};

function getRequestPathname(req) {
  const rawUrl = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url || '/';
  try {
    const parsed = new URL(rawUrl, DOMAIN);
    return parsed.pathname;
  } catch (e) {
    return rawUrl.split('?')[0];
  }
}

function renderSeoPage(pageData, pathSlug) {
  if (!pageData) return "";
  const canonicalUrl = `${DOMAIN}/${pathSlug}`;
  const orgSchema = JSON.stringify(schemaGenerator.getOrganizationSchema());
  const webSiteSchema = JSON.stringify(schemaGenerator.getWebSiteSchema());
  const softwareSchema = JSON.stringify(schemaGenerator.getSoftwareApplicationSchema());
  const faqSchema = JSON.stringify(schemaGenerator.getFAQSchema());
  const breadcrumbSchema = JSON.stringify(schemaGenerator.getBreadcrumbSchema([
    { name: "Home", url: DOMAIN },
    { name: "Text to Speech", url: `${DOMAIN}/text-to-speech` },
    ...(pathSlug !== "text-to-speech" ? [{ name: pageData.h1 || pageData.title || pathSlug, url: canonicalUrl }] : [])
  ]));

  const articleSchema = (pathSlug.startsWith("text-to-speech/blog/") || pathSlug === "text-to-speech")
    ? `<script type="application/ld+json">${JSON.stringify(schemaGenerator.getArticleSchema(pageData.title || "Text to Speech", pageData.metaDesc || "", canonicalUrl, pageData.datePublished, pageData.dateModified))}</script>\n  `
    : "";

  const category = pageData.category ? `<span class="blog-category" style="font-size:0.8em; color:#00c896; text-transform:uppercase; letter-spacing:1px; font-weight:600;">${pageData.category}</span>` : '';
  const readingTime = pageData.readingTime ? `<span class="blog-reading-time" style="font-size:0.85em; opacity:0.6; margin-left:12px;">${pageData.readingTime}</span>` : '';

  const hreflangTags = hreflangMap.getHreflangHtmlTags(pathSlug);
  const footerHtml = getSaaSFooterHtml();
  const trackingHtml = getAllTrackingSnippetsHtml();

  const isArticle = pathSlug.startsWith("text-to-speech/blog/") || pathSlug === "text-to-speech";
  const authorBylineHtml = isArticle ? `
      <div class="article-byline" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin:14px 0 4px; padding:12px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:0.85rem; color:#8e9bb0;">
        <span style="display:inline-flex; align-items:center; gap:8px;"><strong style="color:#e8eef7;">By TextToSpeechH AI Editorial Team</strong></span>
        <span aria-hidden="true">|</span>
        <span>Published: <strong style="color:#e8eef7;">${pageData.datePublished || "July 29, 2026"}</strong></span>
        <span aria-hidden="true">|</span>
        <span>Last Updated: <strong style="color:#e8eef7;">${pageData.dateModified || pageData.datePublished || "July 29, 2026"}</strong></span>
        <span aria-hidden="true">|</span>
        <span>Fact-Checked by <strong style="color:#e8eef7;">TextToSpeechH AI Research Team</strong></span>
      </div>` : '';

  const referencesHtml = isArticle ? `
      <div class="article-references" style="margin-top:36px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
        <h3 style="font-size:1.05rem; color:#00c896; margin:0 0 12px;">Sources & References</h3>
        <ul style="margin:0; padding-left:18px; line-height:1.9; font-size:0.85rem; color:#8e9bb0;">
          <li>W3C Web Accessibility Initiative — "Audio Content" & text-to-speech guidance: <a href="https://www.w3.org/WAI/media/av/audio/" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;">www.w3.org/WAI/media/av/audio/</a></li>
          <li>Wikipedia — Speech Synthesis & Speech Recognition: <a href="https://en.wikipedia.org/wiki/Speech_synthesis" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;">en.wikipedia.org/wiki/Speech_synthesis</a></li>
          <li>van den Oord et al. — WaveNet: A Generative Model for Raw Audio: <a href="https://arxiv.org/abs/1609.03499" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;">arxiv.org/abs/1609.03499</a></li>
          <li>Shen et al. — Natural TTS Synthesis by Conditioning WaveNet on Mel Spectrogram Predictions (Tacotron 2): <a href="https://arxiv.org/abs/1712.05884" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;">arxiv.org/abs/1712.05884</a></li>
          <li>Google — Neural Text-to-Speech & AI Overview documentation: <a href="https://cloud.google.com/text-to-speech" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;">cloud.google.com/text-to-speech</a></li>
        </ul>
      </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

${trackingHtml}

  <!-- SEO Primary Meta Tags -->
  <title>${pageData.title || "Text to Speech | TextToSpeechH AI"}</title>
  <meta name="title" content="${pageData.title || "Text to Speech"}">
  <meta name="description" content="${pageData.metaDesc || ""}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  ${hreflangTags}

  <!-- Favicon & PWA Assets -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- OpenGraph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${pageData.title || ""}">
  <meta property="og:description" content="${pageData.metaDesc || ""}">
  <meta property="og:image" content="${DOMAIN}/og-image.png">

  <!-- Twitter Cards -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${canonicalUrl}">
  <meta property="twitter:title" content="${pageData.title || ""}">
  <meta property="twitter:description" content="${pageData.metaDesc || ""}">
  <meta property="twitter:image" content="${DOMAIN}/og-image.png">

  <!-- JSON-LD Schemas -->
  <script type="application/ld+json">${orgSchema}</script>
  <script type="application/ld+json">${webSiteSchema}</script>
  <script type="application/ld+json">${softwareSchema}</script>
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  ${articleSchema}

  <link rel="stylesheet" href="/style.css?v=8.2.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <script>
    (function(){var t=localStorage.getItem('tts_theme');if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})();
  </script>
</head>
<body>
  <!-- Ambient Particle Background -->
  <div class="particle-background" id="particle-bg"></div>

  <!-- Sticky Top Utility Navigation Bar -->
  <div class="top-utility-bar">
    <nav class="top-utility-nav" aria-label="Top Utility Navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/text-to-speech" ${pathSlug.startsWith('text-to-speech') ? 'class="active"' : ''}>Text to Speech</a></li>
        <li><a href="/about" ${pathSlug === 'about' ? 'class="active"' : ''}>About Us</a></li>
        <li><a href="/contact" ${pathSlug === 'contact' ? 'class="active"' : ''}>Contact</a></li>
        <li><a href="/privacy-policy" ${pathSlug === 'privacy-policy' ? 'class="active"' : ''}>Privacy Policy</a></li>
        <li><a href="/terms" ${pathSlug === 'terms' || pathSlug === 'terms-of-service' ? 'class="active"' : ''}>Terms of Service</a></li>
        <li><a href="/disclaimer" ${pathSlug === 'disclaimer' ? 'class="active"' : ''}>Disclaimer</a></li>
      </ul>
    </nav>
    <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to dark mode" title="Toggle theme">
      <svg class="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
  </div>

  <div class="app-container">
    <!-- Header with Official Logo Emblem matching Home Page -->
    <header class="app-header">
      <div class="header-top-bar">
        <div class="logo-badge">
          <a href="/" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:10px;">
            <img src="/logo-icon.svg" alt="TextToSpeechH AI Logo Icon" class="logo-badge-icon">
            <h1>${pageData.h1 || pageData.title}</h1>
          </a>
        </div>
        <div class="status-pill-group">
          <span class="status-pill provider-pill">Engine: Kokoro / Edge Active</span>
          <span class="status-pill">Trust Governance</span>
        </div>
      </div>
      <p class="subtitle">${category}${readingTime} ${pageData.metaDesc || ""}</p>
    </header>

    <!-- Main Card Panel -->
    <main class="main-card glass-panel">
      ${authorBylineHtml}
      <div class="page-body-content">
        ${pageData.content || ""}
      </div>
      ${referencesHtml}
      <div style="margin-top:32px; display:flex; gap:12px; flex-wrap:wrap;">
        <a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">◀ Try Voice Generator Tool</a>
        ${pathSlug !== 'text-to-speech' ? `<a href="/text-to-speech" style="display:inline-flex; text-decoration:none; background:rgba(0,200,150,0.15); color:#00c896; padding:10px 20px; border-radius:8px; font-weight:600;">Text to Speech Main Guide ◀</a>` : ''}
      </div>
    </main>

    ${footerHtml}
  </div>

  <script src="/app.js?v=8.2.0"></script>
</body>
</html>`;
}

async function seoHandler(req, res) {
  try {
    const pathname = getRequestPathname(req);
    let pathSlug = pathname.replace(/^\/+|\/+$/g, '');

    if (!pathSlug) return false;

    // 0. 301 Permanent Redirects for consolidation
    const redirectKey = Object.keys(AUTO_REDIRECT_MAP).find(k => k === pathSlug) ||
                        (KEYWORD_REDIRECTS && KEYWORD_REDIRECTS[pathSlug]) ||
                        (OLD_BLOG_REDIRECTS && OLD_BLOG_REDIRECTS[pathSlug]);

    if (AUTO_REDIRECT_MAP[pathSlug] || (KEYWORD_REDIRECTS && KEYWORD_REDIRECTS[pathSlug]) || (OLD_BLOG_REDIRECTS && OLD_BLOG_REDIRECTS[pathSlug])) {
      const redirectTarget = AUTO_REDIRECT_MAP[pathSlug] || KEYWORD_REDIRECTS[pathSlug] || OLD_BLOG_REDIRECTS[pathSlug];
      const destination = `/${redirectTarget}`;
      if (typeof res.redirect === 'function') {
        res.redirect(301, destination);
      } else {
        res.statusCode = 301;
        res.setHeader('Location', destination);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`<html><head><meta http-equiv="refresh" content="0;url=${destination}"><title>301 Permanent Redirect</title></head><body><a href="${destination}">Redirecting to ${destination}</a></body></html>`);
      }
      return true;
    }

    // 1. Dedicated Top-Level Pillar Page (/text-to-speech)
    if (pathSlug === 'text-to-speech') {
      const html = renderSeoPage(TEXT_TO_SPEECH_PILLAR_PAGE, pathSlug);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    // 2. Supporting Spokes (/text-to-speech/*)
    if (TEXT_TO_SPEECH_SUBPAGES[pathSlug]) {
      const html = renderSeoPage(TEXT_TO_SPEECH_SUBPAGES[pathSlug], pathSlug);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    // 3. Blog Hub (/text-to-speech/blog)
    if (pathSlug === 'text-to-speech/blog') {
      const blogHubData = getBlogHubPage();
      const html = renderSeoPage(blogHubData, pathSlug);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    // 4. Blog Articles under Hub (/text-to-speech/blog/*)
    if (BLOG_ARTICLES_MAP[pathSlug]) {
      const html = renderSeoPage(BLOG_ARTICLES_MAP[pathSlug], pathSlug);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    // 5. Legal Pages
    let pageData = null;
    if (pathSlug === 'about' && LEGAL_PAGES.about) pageData = LEGAL_PAGES.about;
    else if ((pathSlug === 'privacy-policy' || pathSlug === 'privacy') && LEGAL_PAGES.privacy) pageData = LEGAL_PAGES.privacy;
    else if ((pathSlug === 'terms' || pathSlug === 'terms-of-service') && LEGAL_PAGES.terms) pageData = LEGAL_PAGES.terms;
    else if (pathSlug === 'disclaimer' && LEGAL_PAGES.disclaimer) pageData = LEGAL_PAGES.disclaimer;
    else if (pathSlug === 'contact' && LEGAL_PAGES.contact) pageData = LEGAL_PAGES.contact;
    else if (LEGAL_PAGES[pathSlug]) pageData = LEGAL_PAGES[pathSlug];

    // 6. Programmatic Comparison Hub (/compare/*, /language/*)
    if (!pageData && PROGRAMMATIC_ROUTER && PROGRAMMATIC_ROUTER[pathSlug]) {
      pageData = PROGRAMMATIC_ROUTER[pathSlug];
    }

    if (pageData) {
      const html = renderSeoPage(pageData, pathSlug);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    return false;
  } catch (err) {
    console.error('[SEO Handler Error]:', err);
    return false;
  }
}

module.exports = seoHandler;
module.exports.seoHandler = seoHandler;
module.exports.renderSeoPage = renderSeoPage;
