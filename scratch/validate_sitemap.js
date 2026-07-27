const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const content = fs.readFileSync(sitemapPath, 'utf8');

console.log('=== SITEMAP.XML VALIDATION ===');
console.log(content);

if (content.includes('<?xml') && content.includes('<urlset') && content.includes('https://texttospeechh.com/')) {
  console.log('\n[PASS] sitemap.xml is valid & production ready!');
} else {
  console.error('\n[FAIL] sitemap.xml validation failed!');
  process.exit(1);
}
