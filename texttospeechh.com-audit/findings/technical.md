# Technical SEO Findings

## Overview
- **Score: 68/100**
- HTTPS enforced with 308 non-www → www redirect and HSTS.
- Clean robots.txt (allows all crawlers, blocks /api/, error pages, /scratch/, /tmp/).
- Vercel CDN with Brotli compression.

## Crawl Summary
- 47 URLs fetched: 36 × HTTP 200, 11 × HTTP 404.
- All 36 live pages emit canonical, meta description, H1, and JSON-LD.

## Critical Findings

### 1. 11 broken URLs (9 unique targets) return HTTP 404
Every page's footer links to pages that don't exist:
- `/cookie-policy` (404) — linked from **all 36 pages**
- `/dmca` (404) — linked from **all 36 pages**
- `/language/french` (404) — linked from **all 36 pages**
- `/language/german` (404) — linked from **all 36 pages**
- `/accessibility` (404) — homepage
- `/community-guidelines` (404) — homepage
- `/blog/ultimate-ai-texttospeechh.com-guide` (404) — homepage
- `/blog/text-to-speech-audiobook-creation` (404) — homepage
- `/text-to-speech/txt-to-speech` (404) — linked from blog post text-to-speech-for-students

**Fix:** create the missing pages or 301-redirect each to the nearest live equivalent.

### 2. Sitemap contains dead URLs, redirecting URLs, and misses live blog posts
sitemap.xml (21 URLs) problems:
- **4 dead URLs (404):** `/blog/text-reader`, `/blog/ultimate-ai-texttospeechh.com-guide`, `/blog/ai-voiceover-for-youtube-shorts`, `/blog/text-to-speech-audiobook-creation`
- **9 redirecting URLs:** every `/blog/*` tool page 308-redirects to `/text-to-speech/*`
- **Missing:** the 5 live blog posts (`/text-to-speech/blog/best-ai-voices`, `elevenlabs-alternatives`, `how-text-to-speech-works`, `text-to-speech-for-students`, `text-to-speech-for-youtube`) and the blog hub

**Fix:** regenerate sitemap from the live URL list; re-submit in Search Console.

### 3. Hreflang locale targets all 404
Every page declares 10 hreflang alternates pointing to:
`https://texttospeechh.com/uk`, `/ca`, `/au`, `/hi`, `/de`, `/fr`, `/es`, `/ja`, `/pt` — **all return HTTP 404**. The existing `/language/*` pages are not referenced. No self-referencing hreflang.

## High Findings

### 4. Canonical host inconsistent with redirect target
Inner pages canonicalize to `https://texttospeechh.com/...` (non-www) which 308-redirects to `www`. Homepage canonical correctly uses www.

### 5. Security headers incomplete
Only `Strict-Transport-Security` returned. Missing CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

## Low Findings
- robots.txt `Sitemap:` line references non-www hostname.
- No lazy-loading / preload of core assets.

## Evidence
- robots.txt: fetched 2026-08-04, allows Googlebot/Bingbot/*.
- `home-raw.html`, `crawl-data.json`, `sitemap.xml` in audit artifacts.
