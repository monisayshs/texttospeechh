const faqEngine = require('../content/faqEngine');
const eeatGuidelines = require('../content/eeatGuidelines');
const educationalGuides = require('../content/educationalGuides');
const { getSaaSFooterHtml } = require('../pages/footerComponent');
const { getAllTrackingSnippetsHtml } = require('../seo/gaSnippet');

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

function renderFaqDirectoryPage() {
  const eeatHeader = eeatGuidelines.getEeatHeaderHtml("FAQ Directory");
  const footerHtml = getSaaSFooterHtml();
  const trackingHtml = getAllTrackingSnippetsHtml();

  const faqList = faqEngine.FAQ_REPOSITORY.slice(0, 30);

  const faqItemsHtml = faqList.map(f => `
    <div class="feature-card glass-panel" style="margin-bottom:16px;">
      <h3 style="font-size:1.15rem; color:var(--accent-blue); margin-bottom:8px;">${f.q}</h3>
      <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6;">${f.a}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

${trackingHtml}

  <title>Frequently Asked Questions (FAQ) | ${BRAND_NAME}</title>
  <meta name="description" content="Find answers to all frequently asked questions about ${BRAND_NAME} free AI text-to-speech, MP3 downloads, language support, and commercial usage.">
  <link rel="canonical" href="${DOMAIN}/faq">

  <!-- Favicon & PWA Assets -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <link rel="stylesheet" href="/style.css?v=8.0.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
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
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/disclaimer">Disclaimer</a></li>
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
            <h1>Frequently Asked Questions</h1>
          </a>
        </div>
        <div class="status-pill-group">
          <span class="status-pill provider-pill">Engine: Kokoro / Edge Active</span>
          <span class="status-pill">FAQ & Help Hub</span>
        </div>
      </div>
      <p class="subtitle">Find comprehensive answers regarding speech synthesis, audio exports, document uploads, and licensing.</p>
    </header>

    <main class="main-card glass-panel">
      ${eeatHeader}
      
      <div class="faq-list" style="margin-top:20px;">
        ${faqItemsHtml}
      </div>

      <div style="margin-top:32px;">
        <a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">◀ Return to Voice Generator</a>
      </div>
    </main>

    ${footerHtml}
  </div>

  

  <script src="/app.js?v=8.0.0"></script>
</body>
</html>`;
}

function renderGuidePage(guideData, slug) {
  const eeatHeader = eeatGuidelines.getEeatHeaderHtml(guideData.h1);
  const footerHtml = getSaaSFooterHtml();
  const trackingHtml = getAllTrackingSnippetsHtml();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

${trackingHtml}

  <title>${guideData.title}</title>
  <meta name="description" content="${guideData.metaDesc}">
  <link rel="canonical" href="${DOMAIN}/${slug}">

  <!-- Favicon & PWA Assets -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <link rel="stylesheet" href="/style.css?v=8.0.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
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
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/disclaimer">Disclaimer</a></li>
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
            <h1>${guideData.h1}</h1>
          </a>
        </div>
        <div class="status-pill-group">
          <span class="status-pill provider-pill">Engine: Kokoro / Edge Active</span>
          <span class="status-pill">Guide Article</span>
        </div>
      </div>
      <p class="subtitle">${guideData.metaDesc}</p>
    </header>

    <main class="main-card glass-panel">
      ${eeatHeader}
      <div class="page-body-content" style="margin-top:20px;">
        ${guideData.content}
      </div>

      <div style="margin-top:32px;">
        <a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">◀ Return to Voice Generator</a>
      </div>
    </main>

    ${footerHtml}
  </div>

  

  <script src="/app.js?v=8.0.0"></script>
</body>
</html>`;
}

function getRequestPathname(req) {
  const rawUrl = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url || '/';
  try {
    const parsed = new URL(rawUrl, DOMAIN);
    return parsed.pathname;
  } catch (e) {
    return rawUrl.split('?')[0];
  }
}

async function contentHandler(req, res) {
  try {
    const pathname = getRequestPathname(req);
    const pathSlug = pathname.replace(/^\/+|\/+$/g, '');

    if (pathSlug === 'faq' || pathSlug === 'faq.html') {
      const html = renderFaqDirectoryPage();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    const guidesMap = educationalGuides.EDUCATIONAL_GUIDES || educationalGuides;
    if (guidesMap && guidesMap[pathSlug]) {
      const html = renderGuidePage(guidesMap[pathSlug], pathSlug);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return true;
    }

    return false;
  } catch (err) {
    console.error('[Content Handler Error]:', err);
    return false;
  }
}

module.exports = contentHandler;
module.exports.contentHandler = contentHandler;
module.exports.renderFaqDirectoryPage = renderFaqDirectoryPage;
module.exports.renderGuidePage = renderGuidePage;
