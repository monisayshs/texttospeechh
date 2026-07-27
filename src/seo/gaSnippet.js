/**
 * Google Analytics 4 (GA4) Global Snippet Provider
 * Measurement ID: G-VXH6Y61FQ0
 */
const GA_MEASUREMENT_ID = 'G-VXH6Y61FQ0';

function getGoogleAnalyticsHtml() {
  return `  <!-- Google Analytics (GA4) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  </script>`;
}

module.exports = {
  GA_MEASUREMENT_ID,
  getGoogleAnalyticsHtml
};
