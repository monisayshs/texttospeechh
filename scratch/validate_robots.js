const fs = require('fs');
const path = require('path');

const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
const content = fs.readFileSync(robotsPath, 'utf8');

console.log('=== ROBOTS.TXT VALIDATION ===');
console.log(content);

if (content.includes('User-agent:') && content.includes('Sitemap: https://www.texttospeechh.com/sitemap.xml')) {
  console.log('\n[PASS] robots.txt is valid & production ready!');
} else {
  console.error('\n[FAIL] robots.txt validation failed!');
  process.exit(1);
}
