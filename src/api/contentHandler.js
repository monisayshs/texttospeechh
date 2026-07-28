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
    <div class="faq-card glass-panel" style="padding:20px; border-radius:12px; margin-bottom:15px;">
      <h3 style="font-size:1.1rem; color:var(--accent-color); margin-bottom:8px;">${f.q}</h3>
      <p style="font-size:0.95rem; line-height:1.6;">${f.a}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="system">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Prevent FOUC Theme Script -->
  <script>
    (function() {
      var saved = localStorage.getItem('theme_preference') || 'system';
      var theme = saved;
      if (saved === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>

${trackingHtml}

  <!-- Supabase JS Client SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
    window.SUPABASE_URL = 'https://eghpuhwywutglbtqheda.supabase.co';
  </script>

  <title>Frequently Asked Questions (FAQ) | ${BRAND_NAME}</title>
  <meta name="description" content="Find answers to all frequently asked questions about ${BRAND_NAME} free AI text-to-speech, MP3 downloads, language support, and commercial usage.">
  <link rel="canonical" href="${DOMAIN}/faq">
  <link rel="stylesheet" href="/style.css?v=5.0.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Ambient Particle Background -->
  <div class="particle-background" id="particle-bg"></div>

  <!-- Top Utility Navigation Bar -->
  <div class="top-utility-bar">
    <nav class="top-utility-nav" aria-label="Top Utility Navigation">
      <ul>
        <div class="top-nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/disclaimer">Disclaimer</a></li>
        </div>
        <!-- Light / Dark / System Theme Switcher -->
        <div class="theme-selector-group">
          <select id="theme-select" class="theme-select" aria-label="Select Theme Mode">
            <option value="system">💻 System</option>
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </div>
      </ul>
    </nav>
  </div>

  <div class="app-container">
    <header class="app-header">
      <div class="logo-badge">
        <a href="/" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:10px;">
          <img src="/logo-icon.svg" alt="TextToSpeechH AI Logo Icon" class="logo-badge-icon">
          <h1>TextToSpeechH <span class="accent-text">AI</span></h1>
        </a>
      </div>
      <p class="subtitle">Master FAQ & Help Directory</p>
    </header>

    <main class="main-card glass-panel">
      ${eeatHeader}
      <h1 style="font-size:2rem; margin-bottom:15px;">Frequently Asked Questions</h1>
      <p style="margin-bottom:25px;">Explore comprehensive answers regarding speech synthesis, audio exports, document uploads, and licensing.</p>
      
      <div class="faq-list">
        ${faqItemsHtml}
      </div>

      <div style="margin-top:30px;">
        <a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">◀ Try ${BRAND_NAME} Voice Generator</a>
      </div>
    </main>

    ${footerHtml}
  </div>

  <!-- Floating Chat & Support Trigger Button -->
  <button type="button" class="floating-chat-trigger" id="floating-chat-trigger" aria-label="Support & Feedback Chat">
    <span>💬</span> Support & Feedback
  </button>

  <!-- Floating Chat & Support Widget Flyout Modal -->
  <div class="chat-widget-modal hidden" id="chat-widget-modal">
    <div class="chat-widget-header">
      <h3>💬 Support & Feedback</h3>
      <button type="button" class="close-modal-btn" id="close-chat-btn">✖</button>
    </div>

    <div class="chat-category-tabs" id="chat-category-tabs">
      <button type="button" class="chat-tab active" data-category="feedback">💬 Feedback</button>
      <button type="button" class="chat-tab" data-category="bug">🐛 Bug</button>
      <button type="button" class="chat-tab" data-category="feature">💡 Feature</button>
      <button type="button" class="chat-tab" data-category="support">🎧 Support</button>
    </div>

    <input type="text" id="chat-name-input" class="chat-input-field" placeholder="Your Name (Optional)">
    <input type="email" id="chat-email-input" class="chat-input-field" placeholder="Your Email (Optional)">
    <textarea id="chat-message-input" class="chat-input-field" rows="4" placeholder="How can we help you or improve TextToSpeechH AI?"></textarea>

    <button type="button" class="chat-submit-btn" id="chat-submit-btn">Send Message</button>
  </div>

  <script src="/app.js?v=5.0.0"></script>
</body>
</html>`;
}

function renderGuidePage(guideData, slug) {
  const eeatHeader = eeatGuidelines.getEeatHeaderHtml(guideData.h1);
  const footerHtml = getSaaSFooterHtml();
  const trackingHtml = getAllTrackingSnippetsHtml();

  return `<!DOCTYPE html>
<html lang="en" data-theme="system">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Prevent FOUC Theme Script -->
  <script>
    (function() {
      var saved = localStorage.getItem('theme_preference') || 'system';
      var theme = saved;
      if (saved === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>

${trackingHtml}

  <!-- Supabase JS Client SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
    window.SUPABASE_URL = 'https://eghpuhwywutglbtqheda.supabase.co';
  </script>

  <title>${guideData.title}</title>
  <meta name="description" content="${guideData.metaDesc}">
  <link rel="canonical" href="${DOMAIN}/${slug}">
  <link rel="stylesheet" href="/style.css?v=5.0.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Ambient Particle Background -->
  <div class="particle-background" id="particle-bg"></div>

  <!-- Top Utility Navigation Bar -->
  <div class="top-utility-bar">
    <nav class="top-utility-nav" aria-label="Top Utility Navigation">
      <ul>
        <div class="top-nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/disclaimer">Disclaimer</a></li>
        </div>
        <!-- Light / Dark / System Theme Switcher -->
        <div class="theme-selector-group">
          <select id="theme-select" class="theme-select" aria-label="Select Theme Mode">
            <option value="system">💻 System</option>
            <option value="light">☀️ Light</option>
            <option value="dark">🌙 Dark</option>
          </select>
        </div>
      </ul>
    </nav>
  </div>

  <div class="app-container">
    <header class="app-header">
      <div class="logo-badge">
        <a href="/" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:10px;">
          <img src="/logo-icon.svg" alt="TextToSpeechH AI Logo Icon" class="logo-badge-icon">
          <h1>${guideData.h1}</h1>
        </a>
      </div>
      <p class="subtitle">${guideData.metaDesc}</p>
    </header>

    <main class="main-card glass-panel">
      ${eeatHeader}
      <div class="guide-body-content">
        ${guideData.content}
      </div>

      <div style="margin-top:30px;">
        <a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">◀ Try ${BRAND_NAME} Voice Generator</a>
      </div>
    </main>

    ${footerHtml}
  </div>

  <!-- Floating Chat & Support Trigger Button -->
  <button type="button" class="floating-chat-trigger" id="floating-chat-trigger" aria-label="Support & Feedback Chat">
    <span>💬</span> Support & Feedback
  </button>

  <!-- Floating Chat & Support Widget Flyout Modal -->
  <div class="chat-widget-modal hidden" id="chat-widget-modal">
    <div class="chat-widget-header">
      <h3>💬 Support & Feedback</h3>
      <button type="button" class="close-modal-btn" id="close-chat-btn">✖</button>
    </div>

    <div class="chat-category-tabs" id="chat-category-tabs">
      <button type="button" class="chat-tab active" data-category="feedback">💬 Feedback</button>
      <button type="button" class="chat-tab" data-category="bug">🐛 Bug</button>
      <button type="button" class="chat-tab" data-category="feature">💡 Feature</button>
      <button type="button" class="chat-tab" data-category="support">🎧 Support</button>
    </div>

    <input type="text" id="chat-name-input" class="chat-input-field" placeholder="Your Name (Optional)">
    <input type="email" id="chat-email-input" class="chat-input-field" placeholder="Your Email (Optional)">
    <textarea id="chat-message-input" class="chat-input-field" rows="4" placeholder="How can we help you or improve TextToSpeechH AI?"></textarea>

    <button type="button" class="chat-submit-btn" id="chat-submit-btn">Send Message</button>
  </div>

  <script src="/app.js?v=5.0.0"></script>
</body>
</html>`;
}

module.exports = {
  renderFaqDirectoryPage,
  renderGuidePage
};
