/**
 * Automated Google AdSense Readiness Audit Scanner
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const HTML_PATH = path.join(PUBLIC_DIR, 'index.html');
const ADS_PATH = path.join(PUBLIC_DIR, 'ads.txt');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_PATH = path.join(PUBLIC_DIR, 'robots.txt');

const TARGET_DOMAIN = 'https://www.texttospeechh.com';

function runAudit() {
  console.log('=================================================');
  console.log('GOOGLE ADSENSE READINESS AUDIT SCAN');
  console.log('=================================================');

  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const ads = fs.readFileSync(ADS_PATH, 'utf8');
  const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const robots = fs.readFileSync(ROBOTS_PATH, 'utf8');

  const checks = [
    { name: '1. Privacy Policy link present in footer', test: html.includes('/privacy-policy') },
    { name: '2. About Us link present in navigation', test: html.includes('/about') },
    { name: '3. Contact Support link present', test: html.includes('/contact') },
    { name: '4. Terms of Service link present', test: html.includes('/terms') },
    { name: '5. Disclaimer link present', test: html.includes('/disclaimer') },
    { name: '6. XML Sitemap present & valid', test: sitemap.includes(TARGET_DOMAIN) },
    { name: '7. Robots.txt present & valid', test: robots.includes(TARGET_DOMAIN) },
    { name: '8. ads.txt file present at root', test: ads.includes('Website: https://www.texttospeechh.com') },
    { name: '9. Cookie Notice / GDPR Consent Banner present', test: html.includes('id="cookie-banner"') },
    { name: '10. Top Utility Navigation Bar present', test: html.includes('class="top-utility-bar"') },
    { name: '11. Multi-column SaaS Footer present', test: html.includes('class="saas-footer"') },
    { name: '12. Copyright statement present with current year', test: html.includes('© 2026 TextToSpeechH AI') },
    { name: '13. Manual AdSense Placeholder Slots Removed (Auto Ads Ready)', test: !html.includes('adsense-slot') },
    { name: '14. Independent Trademark Disclaimer Box present', test: html.includes('Trademark Disclaimer') },
    { name: '15. Original Core Value Proposition & Tool Controls', test: html.includes('Free AI Voice Generator') },
    { name: '16. Feature Cards (Long Queue, File Import, MP3 Export)', test: html.includes('feature-card') },
    { name: '17. Mobile Viewport Responsiveness meta tag', test: html.includes('name="viewport"') },
    { name: '18. Canonical Tag to prevent duplicate content penalty', test: html.includes(`href="${TARGET_DOMAIN}/"`) },
    { name: '19. Favicon & PWA Asset Links present', test: html.includes('rel="icon"') },
    { name: '20. Single H1 Heading for AdSense Quality Policy', test: (html.match(/<h1/g) || []).length === 1 }
  ];

  let passed = 0;
  checks.forEach(c => {
    if (c.test) {
      console.log(`[PASS] ${c.name}`);
      passed++;
    } else {
      console.log(`[FAIL] ${c.name}`);
    }
  });

  console.log('-------------------------------------------------');
  console.log(`ADSENSE APPROVAL READINESS SCORE: ${Math.round((passed / checks.length) * 100)}% (${passed}/${checks.length} criteria met)`);
  console.log('=================================================\n');

  if (passed !== checks.length) {
    process.exit(1);
  }
}

runAudit();
