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

  <!-- Supabase JS Client SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
    window.SUPABASE_URL = 'https://eghpuhwywutglbtqheda.supabase.co';
  </script>

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

  <!-- Floating Feedback Trigger Button -->
  <button type="button" class="floating-feedback-trigger" id="floating-feedback-trigger" aria-label="Give Feedback">
    <span>💬</span> Feedback
  </button>

  <!-- Floating Feedback Modal -->
  <div class="modal-overlay hidden" id="feedback-modal">
    <div class="modal-card glass-panel">
      <div class="modal-header">
        <h3>💬 Share Product Feedback</h3>
        <button type="button" class="close-modal-btn" id="close-feedback-btn">✖</button>
      </div>

      <!-- Step 1: Google Login Button -->
      <div id="auth-step-container">
        <button type="button" class="google-auth-btn" id="google-auth-btn">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          <span>Continue with Google</span>
        </button>
        <p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">Log in with Google to submit verified feedback.</p>
      </div>

      <!-- Step 2: Feedback Submission Form -->
      <div id="feedback-form-container" class="hidden">
        <p id="user-info-text" style="font-size:0.85rem; color:var(--accent-blue); margin-bottom:10px; font-weight:600; text-align:center;"></p>
        
        <div class="star-rating" id="star-rating">
          <span data-rating="1">★</span>
          <span data-rating="2">★</span>
          <span data-rating="3">★</span>
          <span data-rating="4">★</span>
          <span data-rating="5" class="active">★</span>
        </div>

        <div class="input-group">
          <textarea id="feedback-text" placeholder="Tell us how we can improve TextToSpeechH AI..." rows="4"></textarea>
        </div>

        <button type="button" class="primary-btn" id="submit-feedback-btn" style="width:100%;">
          <span>Submit Feedback</span>
        </button>
      </div>

    </div>
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
