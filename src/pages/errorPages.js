/**
 * TextToSpeechH AI — Custom Production Error Pages & UI Components
 * Brand: TextToSpeechH AI
 * Domain: https://www.texttospeechh.com
 */

const { getAllTrackingSnippetsHtml } = require('../seo/gaSnippet');

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";
const CONTACT_EMAIL = "hello@texttospeechh.com";

function renderBaseErrorPage({ statusCode, title, message, actionText, actionUrl, retryButton }) {
  const trackingHtml = getAllTrackingSnippetsHtml();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
${trackingHtml}
  <title>${statusCode} ${title} | ${BRAND_NAME}</title>
  <meta name="description" content="${statusCode} - ${title} on ${BRAND_NAME}.">
  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <script>
    (function(){var t=localStorage.getItem('tts_theme');if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})();
  </script>
</head>
<body style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem;">

  <div class="glass-panel" style="max-width: 580px; width: 100%; padding: 3rem 2.5rem; text-align: center; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-xl);">
    
    <div style="font-size: 4rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem;">
      ${statusCode}
    </div>

    <h1 style="font-size: 1.8rem; color: var(--color-text); margin-bottom: 1rem; font-weight: 700;">${title}</h1>

    <p style="font-size: 1.05rem; color: var(--color-text-secondary); line-height: 1.7; margin-bottom: 2rem;">
      ${message}
    </p>

    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      ${retryButton ? `<button onclick="window.location.reload()" class="secondary-btn" style="padding: 12px 24px; cursor: pointer;">🔄 Try Again</button>` : ''}
      <a href="${actionUrl || '/'}" class="primary-btn" style="text-decoration: none; padding: 12px 28px; border-radius: 30px; display: inline-flex; align-items: center; gap: 8px; font-weight: 600;">
        ${actionText || '⚡ Return to Homepage'}
      </a>
    </div>

    <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-muted);">
      Need assistance? Contact our team at <a href="mailto:${CONTACT_EMAIL}" style="color: var(--color-primary); text-decoration: none;">${CONTACT_EMAIL}</a>
    </div>
  </div>

</body>
</html>`;
}

function get404Page() {
  return renderBaseErrorPage({
    statusCode: "404",
    title: "Page Not Found",
    message: "The page or route you are looking for has been moved, renamed, or does not exist on TextToSpeechH AI.",
    actionText: "⚡ Return to Voice Generator",
    actionUrl: "/"
  });
}

function get500Page() {
  return renderBaseErrorPage({
    statusCode: "500",
    title: "Internal Server Error",
    message: "An unexpected serverless runtime error occurred. Our automated system monitors have been notified.",
    actionText: "⚡ Return to Voice Generator",
    actionUrl: "/",
    retryButton: true
  });
}

function get403Page() {
  return renderBaseErrorPage({
    statusCode: "403",
    title: "Access Restricted",
    message: "You do not have authorization to access this protected system resource.",
    actionText: "⚡ Return to Homepage",
    actionUrl: "/"
  });
}

function get429Page() {
  return renderBaseErrorPage({
    statusCode: "429",
    title: "Rate Limit Exceeded",
    message: "Too many voice generation requests were detected from your IP address. Please wait 60 seconds before initiating more synthesis jobs.",
    actionText: "⚡ Return to Voice Generator",
    actionUrl: "/",
    retryButton: true
  });
}

function get503Page() {
  return renderBaseErrorPage({
    statusCode: "503",
    title: "Scheduled Maintenance",
    message: "TextToSpeechH AI is currently undergoing scheduled infrastructure upgrades to improve neural speech synthesis speed.",
    actionText: "⚡ Return to Voice Generator",
    actionUrl: "/",
    retryButton: true
  });
}

function getOfflinePage() {
  return renderBaseErrorPage({
    statusCode: "Offline",
    title: "No Internet Connection",
    message: "You are currently offline. Please check your Wi-Fi connection or mobile data network to continue generating AI voiceovers.",
    actionText: "⚡ Retry Connection",
    actionUrl: "/",
    retryButton: true
  });
}

module.exports = {
  get404Page,
  get500Page,
  get403Page,
  get429Page,
  get503Page,
  getOfflinePage
};
