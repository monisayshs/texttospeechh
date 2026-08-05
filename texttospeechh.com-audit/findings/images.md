# Images Findings

## Overview
- **Score: 82/100**

## What Works
- The only 2 `<img>` tags on the audited page have descriptive alt text (`TextToSpeechH AI Logo Icon`, `TextToSpeechH AI Emblem`).
- og-image.png (38 KB) and logo.svg (1.7 KB) are lightweight.
- SVG logo for scalable branding.

## Findings

### Medium
- **No content or illustrative images anywhere.** The 36 live pages contain only logo images. No hero imagery, screenshots, diagrams, or product visuals. This limits:
  - Image-search SERP visibility (Google Images traffic)
  - Rich snippet eligibility for SoftwareApplication schema (screenshot required)
  - LCP element options (currently a text hero renders late)

## Recommendations
1. Add a hero/screenshot image to tool pages (WebP/AVIF, ~1200px) with keyword-rich alt text.
2. Add `screenshot` property to SoftwareApplication schema.
3. Add Open Graph / Twitter images per-page if og-image.png is reused sitewide.
4. Lazy-load below-fold images; preload the hero image.

## Alt Text Audit
- No missing alt attributes detected across the crawl.
- Images total: 2 per page (both logos).
