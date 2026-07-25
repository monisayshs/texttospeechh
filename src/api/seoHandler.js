const { PROGRAMMATIC_ROUTER } = require('../seo/programmaticPages');
const { LEGAL_PAGES } = require('../pages/legalPages');
const { CONTENT_HUB_ARTICLES } = require('../pages/blogHub');
const { getSaaSFooterHtml } = require('../pages/footerComponent');
const schemaGenerator = require('../seo/schemaGenerator');
const hreflangMap = require('../seo/hreflangMap');

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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.metaDesc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">
  ${hreflangTags}

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

  <link rel="stylesheet" href="/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Top Utility Navigation Bar -->
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
  </div>

  <div class="app-container">
    <header class="app-header">
      <div class="logo-badge">
        <a href="/" style="text-decoration:none; color:inherit;">
          <h1>TextToSpeechH <span class="accent-text">AI</span></h1>
        </a>
      </div>
      <p class="subtitle">Convert text into realistic AI voices instantly using ${BRAND_NAME}</p>
    </header>

    <main class="main-card glass-panel" style="margin-bottom:30px;">
      <h1 style="font-size:2rem; margin-bottom:15px;" class="accent-text">${pageData.h1}</h1>
      <div class="page-body-content" style="line-height:1.7; font-size:1rem; color:#d0d7de;">
        ${pageData.content}
      </div>
      <div style="margin-top:30px;">
        <a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">◀ Try ${BRAND_NAME} Voice Generator</a>
      </div>
    </main>

    ${footerHtml}
  </div>
</body>
</html>`;
}

module.exports = async (req, res) => {
  const reqUrl = req.url.split('?')[0].replace(/^\/+|\/+$/g, '');

  // Check programmatic pages
  if (PROGRAMMATIC_ROUTER[reqUrl]) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderSeoPage(PROGRAMMATIC_ROUTER[reqUrl], reqUrl));
    return true;
  }

  // Check content hub articles
  if (CONTENT_HUB_ARTICLES[reqUrl]) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderSeoPage(CONTENT_HUB_ARTICLES[reqUrl], reqUrl));
    return true;
  }

  // Check legal pages
  let legalKey = reqUrl;
  if (reqUrl === 'privacy-policy') legalKey = 'privacy';
  if (reqUrl === 'cookie-policy') legalKey = 'cookie';
  if (reqUrl === 'refund-policy') legalKey = 'refund';
  if (reqUrl === 'community-guidelines') legalKey = 'community';

  if (LEGAL_PAGES[legalKey]) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderSeoPage(LEGAL_PAGES[legalKey], reqUrl));
    return true;
  }

  return false;
};
