const faqEngine = require('../content/faqEngine');
const eeatGuidelines = require('../content/eeatGuidelines');
const educationalGuides = require('../content/educationalGuides');
const { getSaaSFooterHtml } = require('../pages/footerComponent');
const { getGoogleAnalyticsHtml } = require('../seo/gaSnippet');

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

function renderFaqDirectoryPage() {
  const eeatHeader = eeatGuidelines.getEeatHeaderHtml("FAQ Directory");
  const footerHtml = getSaaSFooterHtml();
  const gaHtml = getGoogleAnalyticsHtml();

  const faqList = faqEngine.FAQ_REPOSITORY.slice(0, 30); // Render top 30 featured FAQs

  const faqItemsHtml = faqList.map(f => `
    <div class="faq-card" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:20px; border-radius:12px; margin-bottom:15px;">
      <h3 style="font-size:1.1rem; color:#00f2fe; margin-bottom:8px;">${f.q}</h3>
      <p style="font-size:0.95rem; color:#d0d7de; line-height:1.6;">${f.a}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${gaHtml}
  <title>Frequently Asked Questions (FAQ) | ${BRAND_NAME}</title>
  <meta name="description" content="Find answers to all frequently asked questions about ${BRAND_NAME} free AI text-to-speech, MP3 downloads, language support, and commercial usage.">
  <link rel="canonical" href="${DOMAIN}/faq">
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
      <p class="subtitle">Master FAQ & Help Directory</p>
    </header>

    <main class="main-card glass-panel" style="margin-bottom:30px;">
      ${eeatHeader}
      <h1 style="font-size:2rem; margin-bottom:15px;" class="accent-text">Frequently Asked Questions</h1>
      <p style="color:#8e9bb0; margin-bottom:25px;">Explore comprehensive answers regarding speech synthesis, audio exports, document uploads, and licensing.</p>
      
      <div class="faq-list">
        ${faqItemsHtml}
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

function renderGuidePage(guideData, slug) {
  const eeatHeader = eeatGuidelines.getEeatHeaderHtml(guideData.h1);
  const footerHtml = getSaaSFooterHtml();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guideData.title}</title>
  <meta name="description" content="${guideData.metaDesc}">
  <link rel="canonical" href="${DOMAIN}/${slug}">
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
      <p class="subtitle">Educational Resource & Technical Guide</p>
    </header>

    <main class="main-card glass-panel" style="margin-bottom:30px;">
      ${eeatHeader}
      <h1 style="font-size:2rem; margin-bottom:15px;" class="accent-text">${guideData.h1}</h1>
      <div class="page-body-content" style="line-height:1.7; font-size:1rem; color:#d0d7de;">
        ${guideData.content}
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

  if (reqUrl === 'faq') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderFaqDirectoryPage());
    return true;
  }

  if (educationalGuides.EDUCATIONAL_GUIDES[reqUrl]) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderGuidePage(educationalGuides.EDUCATIONAL_GUIDES[reqUrl], reqUrl));
    return true;
  }

  return false;
};
