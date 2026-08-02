const src = require('fs').readFileSync('./scratch/old_legal_pages_utf8.js', 'utf8');
const privacyStart = src.indexOf('  privacy:');
const termsStart = src.indexOf('  terms:');
if (privacyStart > 0 && termsStart > 0) {
  const block = src.substring(privacyStart, termsStart);
  require('fs').writeFileSync('./scratch/old_privacy_block.txt', block, 'utf8');
  console.log('Privacy block extracted, length:', block.length);

  const marker = 'content: `';
  const contentIdx = block.indexOf(marker);
  const contentEnd = block.lastIndexOf('`');
  if (contentIdx > 0) {
    const content = block.substring(contentIdx + marker.length, contentEnd);
    console.log('Content length:', content.length);
    require('fs').writeFileSync('./scratch/old_privacy_content.txt', content, 'utf8');
    console.log('Privacy content saved to scratch/old_privacy_content.txt');
  }
} else {
  console.log('privacy block not found, privacyStart:', privacyStart, 'termsStart:', termsStart);
}
