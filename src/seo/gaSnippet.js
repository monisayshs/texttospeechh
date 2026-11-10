/**
 * Analytics & Telemetry Snippets Provider (GA4 & Microsoft Clarity)
 * GA4 Measurement ID: G-VXH6Y61FQ0
 * Clarity Project ID: xt0hsu1r65
 *
 * GA4 loads IMMEDIATELY (standard async gtag) since 2026-11-10. It used to
 * be deferred behind first interaction / a 7s timeout to protect mobile
 * LCP, but the live data proved the cost: after the 2026-10-26 HTML edge
 * cache shipped, GA4 daily users fell from 55-84 to 2-13 while Clarity
 * kept recording ~59 sessions/day. Referral visitors (the site's biggest
 * channel was ChatGPT) typically never triggered the interaction loader
 * and left inside 7s, so their visits were never counted at all. Page
 * weight is unchanged in spirit: gtag.js is async and non-render-blocking.
 * Microsoft Clarity also loads IMMEDIATELY in <head> because it must
 * capture the full session from page load -- lazy-loading it was
 * silently dropping early-bounce sessions (fixed 2026-10-06).
 */
const GA_MEASUREMENT_ID = 'G-VXH6Y61FQ0';
const CLARITY_PROJECT_ID = 'xt0hsu1r65';
const ADSENSE_PUBLISHER_ID = 'ca-pub-3696622100066669';

function getDeferredAnalyticsScript() {
  // Name kept for call-site compatibility; the snippet is no longer
  // deferred (see header note, 2026-11-10). Standard async gtag install:
  // the library loads in parallel and never blocks rendering, while the
  // config call below queues immediately so no session is missed.
  return `  <!-- Google Analytics (GA4) - standard async install; loads immediately so referral/AI traffic is counted (deferral removed 2026-11-10) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    window.gtag('js', new Date());
    window.gtag('config', '${GA_MEASUREMENT_ID}');
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