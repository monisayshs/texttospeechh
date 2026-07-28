const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');

// Favicon SVG based on logo-icon.svg design, optimized for favicon use
// Centers the logo content and adds solid background for visibility at small sizes
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="barGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#60A5FA" />
    </linearGradient>
  </defs>
  <!-- Solid rounded background -->
  <rect x="0" y="0" width="512" height="512" rx="96" fill="url(#bgGrad)" />
  <!-- White soundwave equalizer bars -->
  <g transform="translate(64, 64)">
    <rect x="60" y="180" width="24" height="100" rx="12" fill="#FFFFFF" opacity="0.8" />
    <rect x="104" y="120" width="24" height="220" rx="12" fill="#FFFFFF" opacity="0.9" />
    <rect x="148" y="70" width="24" height="280" rx="12" fill="#FFFFFF" />
    <!-- T-S crossbar -->
    <path d="M 40 110 H 344 C 357 110 368 121 368 134 V 134 C 368 147 357 158 344 158 H 40 C 27 158 16 147 16 134 V 134 C 16 121 27 110 40 110 Z" fill="#FFFFFF" />
    <rect x="212" y="100" width="24" height="240" rx="12" fill="#FFFFFF" />
    <rect x="256" y="140" width="24" height="180" rx="12" fill="#FFFFFF" opacity="0.9" />
    <rect x="300" y="200" width="24" height="80" rx="12" fill="#FFFFFF" opacity="0.8" />
  </g>
</svg>`;

// Apple Touch Icon — uses the original logo gradients on dark/transparent bg
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="barGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#60A5FA" />
    </linearGradient>
  </defs>
  <!-- Outer Rounded Container -->
  <rect x="0" y="0" width="512" height="512" rx="96" fill="url(#primaryGrad)" opacity="0.12" />
  <g transform="translate(64, 64)">
    <rect x="60" y="180" width="24" height="100" rx="12" fill="#06B6D4" />
    <rect x="104" y="120" width="24" height="220" rx="12" fill="url(#primaryGrad)" />
    <rect x="148" y="70" width="24" height="280" rx="12" fill="#3B82F6" />
    <path d="M 40 110 H 344 C 357 110 368 121 368 134 V 134 C 368 147 357 158 344 158 H 40 C 27 158 16 147 16 134 V 134 C 16 121 27 110 40 110 Z" fill="url(#primaryGrad)" />
    <rect x="212" y="100" width="24" height="240" rx="12" fill="url(#primaryGrad)" />
    <rect x="256" y="140" width="24" height="180" rx="12" fill="#06B6D4" />
    <rect x="300" y="200" width="24" height="80" rx="12" fill="#3B82F6" />
  </g>
</svg>`;

async function generatePNG(svgContent, width, outputPath) {
  await sharp(Buffer.from(svgContent))
    .resize(width, width)
    .png()
    .toFile(outputPath);
  const stats = fs.statSync(outputPath);
  console.log(`  ${path.basename(outputPath)} (${width}x${width}) — ${stats.size} bytes`);
}

// ICO writer — wraps a PNG inside a valid ICO container
function createIco(pngBuffer) {
  const numImages = 1;
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);      // reserved
  icoHeader.writeUInt16LE(1, 2);      // ICO type
  icoHeader.writeUInt16LE(numImages, 4);

  const dirEntry = Buffer.alloc(16);
  const pngSize = pngBuffer.length;
  const offset = 6 + 16; // header + 1 entry

  dirEntry.writeUInt8(0, 0);   // width (0 = 256)
  dirEntry.writeUInt8(0, 1);   // height (0 = 256)
  dirEntry.writeUInt8(0, 2);   // colors
  dirEntry.writeUInt8(0, 3);   // reserved
  dirEntry.writeUInt16LE(1, 4);  // planes
  dirEntry.writeUInt16LE(32, 6); // bpp
  dirEntry.writeUInt32LE(pngSize, 8);
  dirEntry.writeUInt32LE(offset, 12);

  return Buffer.concat([icoHeader, dirEntry, pngBuffer]);
}

async function main() {
  console.log('Generating favicon files from logo-icon.svg design...\n');

  // 1. Write the favicon SVG
  fs.writeFileSync(path.join(PUBLIC, 'favicon.svg'), faviconSvg, 'utf8');
  console.log('  favicon.svg — 512x512 SVG favicon');

  // 2. Generate 16x16 PNG
  await generatePNG(faviconSvg, 16, path.join(PUBLIC, 'favicon-16x16.png'));

  // 3. Generate 32x32 PNG
  await generatePNG(faviconSvg, 32, path.join(PUBLIC, 'favicon-32x32.png'));

  // 4. Generate favicon.ico (PNG wrapped in ICO)
  const png32 = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
  const icoBuffer = createIco(png32);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), icoBuffer);
  console.log(`  favicon.ico — ${icoBuffer.length} bytes (32x32 PNG in ICO)`);

  // 5. Apple Touch Icon (180x180)
  await generatePNG(appleTouchSvg, 180, path.join(PUBLIC, 'apple-touch-icon.png'));

  // 6. Android Chrome 192x192
  await generatePNG(appleTouchSvg, 192, path.join(PUBLIC, 'android-chrome-192x192.png'));

  // 7. Android Chrome 512x512
  await generatePNG(appleTouchSvg, 512, path.join(PUBLIC, 'android-chrome-512x512.png'));

  console.log('\nAll favicon files generated successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});