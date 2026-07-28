const { PROGRAMMATIC_ROUTER } = require('../seo/programmaticPages');
const { LEGAL_PAGES } = require('../pages/legalPages');
const { CONTENT_HUB_ARTICLES } = require('../pages/blogHub');
const { getSaaSFooterHtml } = require('../pages/footerComponent');
const schemaGenerator = require('../seo/schemaGenerator');
const hreflangMap = require('../seo/hreflangMap');
const { getAllTrackingSnippetsHtml } = require('../seo/gaSnippet');

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

function renderSeoPage(pageData, pathSlug) {
  const canonicalUrl = `${DOMAIN}/${pathSlug}`;
  const orgSchema = JSON.stringify(schemaGenerator.getOrganizationSchema());
  const webSiteSchema = JSON.stringify(schemaGenerator.getWebSiteSchema());
  const softwareSchema = JSON.stringify(schemaGenerator.getSoftwareApplicationSchema());
  const faqSchema = JSON.stringify(schemaGenerator.getFAQSchema());
  const breadcrumbSchema = JSON.stringify(schemaGenerator.getBreadcrumbSchema([
    { name: "Home", url: DOMAIN },
    { name: pageData.h1, url: canonicalUrl }
  ]));

  const hreflangTags = hreflangMap.getHreflangHtmlTags();
  const footerHtml = getSaaSFooterHtml();
  const trackingHtml = getAllTrackingSnippetsHtml();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

${trackingHtml}

  <!-- SEO Primary Meta Tags -->
  <title>${pageData.title}</title>
  <meta name="title" content="${pageData.title}">
  <meta name="description" content="${pageData.metaDesc}">
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
  <meta property="og:title" content="${pageData.title}">
  <meta property="og:description" content="${pageData.metaDesc}">
  <meta property="og:image" content="${DOMAIN}/og-image.png">

  <!-- Twitter Cards -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${canonicalUrl}">
  <meta property="twitter:title" content="${pageData.title}">
  <meta property="twitter:description" content="${pageData.metaDesc}">
  <meta property="twitter:image" content="${DOMAIN}/og-image.png">

  <!-- JSON-LD Schemas -->
  <script type="application/ld+json">${orgSchema}</script>
  <script type="application/ld+json">${webSiteSchema}</script>
  <script type="application/ld+json">${softwareSchema}</script>
  <script type="application/ld+json">${faqSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>

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
        <li><a href="/about" ${pathSlug === 'about' ? 'class="active"' : ''}>About Us</a></li>
        <li><a href="/contact" ${pathSlug === 'contact' ? 'class="active"' : ''}>Contact</a></li>
        <li><a href="/privacy-policy" ${pathSlug === 'privacy-policy' ? 'class="active"' : ''}>Privacy Policy</a></li>
        <li><a href="/terms" ${pathSlug === 'terms' ? 'class="active"' : ''}>Terms of Service</a></li>
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
            <h1>${pageData.h1}</h1>
          </a>
        </div>
        <div class="status-pill-group">
          <span class="status-pill provider-pill">Engine: Kokoro / Edge Active</span>
          <span class="status-pill">Trust Governance</span>
        </div>
      </div>
      <p class="subtitle">${pageData.metaDesc}</p>
    </header>

    <!-- Main Card Panel -->
    <main class="main-card glass-panel">
      <div class="page-body-content">
        ${pageData.content}
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

async function seoHandler(req, res) {
  try {
    const reqUrl = req.url || '/';
    const parsedUrl = new URL(reqUrl, DOMAIN);
    let pathSlug = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    if (!pathSlug) return false;

    let pageData = null;

    // 1. Legal Pages (/about, /privacy-policy, /terms, /disclaimer, /contact)
    if (pathSlug === 'about' && LEGAL_PAGES.about) pageData = LEGAL_PAGES.about;
    else if ((pathSlug === 'privacy-policy' || pathSlug === 'privacy') && LEGAL_PAGES.privacy) pageData = LEGAL_PAGES.privacy;
    else if ((pathSlug === 'terms' || pathSlug === 'terms-of-service') && LEGAL_PAGES.terms) pageData = LEGAL_PAGES.terms;
    else if (pathSlug === 'disclaimer' && LEGAL_PAGES.disclaimer) pageData = LEGAL_PAGES.disclaimer;
    else if (pathSlug === 'contact' && LEGAL_PAGES.contact) pageData = LEGAL_PAGES.contact;
    else if (LEGAL_PAGES[pathSlug]) pageData = LEGAL_PAGES[pathSlug];

    // 2. Programmatic SEO Pages (/keyword/*, /language/*)
    if (!pageData && PROGRAMMATIC_ROUTER && PROGRAMMATIC_ROUTER[pathSlug]) {
      pageData = PROGRAMMATIC_ROUTER[pathSlug];
    }

    // 3. Blog Hub Articles (/blog/*)
    if (!pageData && CONTENT_HUB_ARTICLES && CONTENT_HUB_ARTICLES[pathSlug]) {
      pageData = CONTENT_HUB_ARTICLES[pathSlug];
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

// Export both the main handler function AND renderSeoPage helper
module.exports = seoHandler;
module.exports.seoHandler = seoHandler;
module.exports.renderSeoPage = renderSeoPage;
