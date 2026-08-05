/**
 * Analytics & Telemetry Snippets Provider (GA4 & Microsoft Clarity)
 * GA4 Measurement ID: G-VXH6Y61FQ0
 * Clarity Project ID: xt0hsu1r65
 *
 * Scripts are deferred behind requestIdleCallback / window.load so they do
 * not block first paint (LCP). This is a Core Web Vitals improvement.
 */
const GA_MEASUREMENT_ID = 'G-VXH6Y61FQ0';
const CLARITY_PROJECT_ID = 'xt0hsu1r65';

function getDeferredAnalyticsScript() {
  return `  <!-- Deferred Analytics (GA4 + Clarity) - loaded after idle/load to protect LCP -->
  <script>
    function loadTtsAnalytics() {
      var dl = window.dataLayer || (window.dataLayer = []);
      function gtag(){dl.push(arguments);}
      var gh = document.createElement('script');
      gh.async = true;
      gh.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
      document.head.appendChild(gh);
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
      var ch = document.createElement('script');
      ch.async = true;
      ch.src = 'https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}';
      document.head.appendChild(ch);
    }
    if ('requestIdleCallback' in window) { requestIdleCallback(loadTtsAnalytics, { timeout: 3000 }); }
    else { window.addEventListener('load', loadTtsAnalytics, { once: true }); }
  </script>`;
}

function getGoogleAnalyticsHtml() {
  return getDeferredAnalyticsScript();
}

function getMicrosoftClarityHtml() {
  return "";
}

function getAllTrackingSnippetsHtml() {
  return getDeferredAnalyticsScript();
}

module.exports = {
  GA_MEASUREMENT_ID,
  CLARITY_PROJECT_ID,
  getGoogleAnalyticsHtml,
  getMicrosoftClarityHtml,
  getAllTrackingSnippetsHtml
};