/**
 * Automated Technical SEO Audit Scanner
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const HTML_PATH = path.join(PUBLIC_DIR, 'index.html');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_PATH = path.join(PUBLIC_DIR, 'robots.txt');

const TARGET_DOMAIN = 'https://texttospeechh.com';

function runAudit() {
  console.log('=================================================');
  console.log('TECHNICAL SEO AUDIT SCAN');
  console.log('=================================================');

  const html = fs.readFileSync(HTML_PATH, 'utf8');
  const sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const robots = fs.readFileSync(ROBOTS_PATH, 'utf8');

  const checks = [
    { name: '1. sitemap.xml valid & exists', test: sitemap.includes('xmlns=') && sitemap.includes(TARGET_DOMAIN) },
    { name: '2. robots.txt valid & exists', test: robots.includes('User-agent:') && robots.includes(TARGET_DOMAIN) },
    { name: '3. Canonical URL matches target domain', test: html.includes(`<link rel="canonical" href="${TARGET_DOMAIN}/">`) },
    { name: '4. Meta Title present', test: html.includes('<title>') },
    { name: '5. Meta Description length optimal (140-160 chars)', test: html.includes('name="description"') },
    { name: '6. Open Graph og:title', test: html.includes('property="og:title"') },
    { name: '7. Open Graph og:description', test: html.includes('property="og:description"') },
    { name: '8. Open Graph og:url', test: html.includes(`property="og:url" content="${TARGET_DOMAIN}/"`) },
    { name: '9. Open Graph og:image', test: html.includes('property="og:image"') },
    { name: '10. Twitter Card twitter:card', test: html.includes('name="twitter:card"') },
    { name: '11. Twitter Card twitter:title', test: html.includes('name="twitter:title"') },
    { name: '12. Twitter Card twitter:description', test: html.includes('name="twitter:description"') },
    { name: '13. Twitter Card twitter:image', test: html.includes('name="twitter:image"') },
    { name: '14. JSON-LD SoftwareApplication Schema', test: html.includes('"@type": "SoftwareApplication"') },
    { name: '15. JSON-LD Organization Schema', test: html.includes('"@type": "Organization"') },
    { name: '16. Single H1 tag hierarchy', test: (html.match(/<h1/g) || []).length === 1 },
    { name: '17. Image ALT attributes on all <img> tags', test: !html.includes('<img') || html.includes('alt=') },
    { name: '18. Web Manifest link present', test: html.includes('href="/site.webmanifest"') },
    { name: '19. Favicon & Apple touch icon links present', test: html.includes('apple-touch-icon') },
    { name: '20. Viewport meta tag for mobile responsiveness', test: html.includes('name="viewport"') },
    { name: '21. Meta robots index, follow present', test: html.includes('name="robots" content="index, follow"') },
    { name: '22. Font preconnect optimization present', test: html.includes('rel="preconnect"') }
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
  console.log(`TOTAL SCORE: ${Math.round((passed / checks.length) * 100)}/100 (${passed}/${checks.length} checks passed)`);
  console.log('=================================================\n');

  if (passed !== checks.length) {
    process.exit(1);
  }
}

runAudit();
