/**
 * Analytics & Telemetry Snippets Provider (GA4 & Microsoft Clarity)
 * GA4 Measurement ID: G-VXH6Y61FQ0
 * Clarity Project ID: xt0hsu1r65
 *
 * GA4 is deferred behind interaction/timeout so it does not block first
 * paint (LCP). Microsoft Clarity loads IMMEDIATELY in <head> because it
 * must capture the full session from page load -- lazy-loading it was
 * silently dropping early-bounce sessions (fixed 2026-10-06).
 */
const GA_MEASUREMENT_ID = 'G-VXH6Y61FQ0';
const CLARITY_PROJECT_ID = 'xt0hsu1r65';
const ADSENSE_PUBLISHER_ID = 'ca-pub-3696622100066669';

function getDeferredAnalyticsScript() {
  return `  <!-- Deferred Analytics (GA4) - loaded on interaction to protect mobile LCP -->
  <script>
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', '${GA_MEASUREMENT_ID}');
    function loadTtsAnalytics() {
      if (window._analyticsLoaded) return;
      window._analyticsLoaded = true;
      var gh = document.createElement('script');
      gh.async = true;
      gh.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
      document.head.appendChild(gh);
    }
    ['mousemove', 'touchstart', 'scroll', 'keydown'].forEach(function(evt) {
      window.addEventListener(evt, loadTtsAnalytics, { once: true, passive: true });
    });
    setTimeout(loadTtsAnalytics, 7000);
  </script>`;
}

function getGoogleAnalyticsHtml() {
  return getDeferredAnalyticsScript();
}

function getMicrosoftClarityHtml() {
  return `  <!-- Microsoft Clarity - loads immediately to capture full sessions (was lazy-loaded, losing early-bounce data; fixed 2026-10-06) -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
  </script>`;
}

function getAllTrackingSnippetsHtml() {
  return getMicrosoftClarityHtml() + "\n" + getDeferredAnalyticsScript();
}

/**
 * Google AdSense loader — site ownership verification + ad library.
 * Added 2026-11-05 for the AdSense application (pub-3696622100066669).
 * Deliberately NOT part of getAllTrackingSnippetsHtml(): error pages
 * (404/500) must not carry it. No ad units are placed yet.
 */
function getAdSenseHtml() {
  return `  <!-- Google AdSense - site ownership verification & ad library (application submitted 2026-11-05) -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}"
       crossorigin="anonymous"></script>`;
}

module.exports = {
  GA_MEASUREMENT_ID,
  CLARITY_PROJECT_ID,
  ADSENSE_PUBLISHER_ID,
  getGoogleAnalyticsHtml,
  getMicrosoftClarityHtml,
  getAllTrackingSnippetsHtml,
  getAdSenseHtml
};