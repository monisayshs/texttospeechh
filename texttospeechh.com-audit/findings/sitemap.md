# Sitemap Findings

## Overview
- sitemap.xml fetched from `https://www.texttospeechh.com/sitemap.xml` (3,895 bytes, 21 URLs).
- robots.txt references `Sitemap: https://texttospeechh.com/sitemap.xml` (non-www → redirects).

## Structure
- Format: XML urlset (Sitemaps 0.9), single sitemap (no index).
- `lastmod` values: 2026-07-27 / 2026-07-29.
- `changefreq`/`priority` populated.

## Issues

### Critical
1. **4 dead URLs (404):**
   - `/blog/text-reader`
   - `/blog/ultimate-ai-texttospeechh.com-guide`
   - `/blog/ai-voiceover-for-youtube-shorts`
   - `/blog/text-to-speech-audiobook-creation`

2. **9 redirecting URLs (all /blog/* tool pages 308→/text-to-speech/*):**
   - `/blog/text-to-speech` → `/text-to-speech`
   - `/blog/ai-text-to-speech` → `/text-to-speech/ai-text-to-speech`
   - `/blog/free-text-to-speech` → `/text-to-speech/free-text-to-speech`
   - `/blog/online-text-to-speech` → `/text-to-speech/online-text-to-speech`
   - `/blog/text-to-voice` → `/text-to-speech/text-to-voice`
   - `/blog/voice-generator` → `/text-to-speech/voice-generator`
   - `/blog/read-aloud` → `/text-to-speech/read-aloud`
   - `/blog/pdf-to-speech` → `/text-to-speech/pdf-to-speech`
   - `/blog/word-to-speech` → `/text-to-speech/word-to-speech`

3. **Missing live pages (should be in sitemap):**
   - `/text-to-speech/blog` (hub, priority 0.9)
   - `/text-to-speech/blog/best-ai-voices`
   - `/text-to-speech/blog/elevenlabs-alternatives`
   - `/text-to-speech/blog/how-text-to-speech-works`
   - `/text-to-speech/blog/text-to-speech-for-students`
   - `/text-to-speech/blog/text-to-speech-for-youtube`
   - `/text-to-speech/ai-text-to-speech`, `/free-text-to-speech`, `/online-text-to-speech`, `/text-to-voice`, `/voice-generator`, `/pdf-to-speech`, `/read-aloud`, `/word-to-speech`
   - `/language/english`, `/hindi`, `/spanish`, `/urdu`
   - `/cookie-policy`, `/dmca`, `/accessibility`, `/community-guidelines`

### High
4. **Sitemap references redirecting canonical hosts.** URLs use `https://www.texttospeechh.com` (correct) but robots.txt points to non-www. The /blog/* entries also carry canonical tags pointing to non-www.

## Recommendations
1. Regenerate sitemap from the live crawl URL list (only HTTP 200 pages).
2. Remove dead and redirecting URLs.
3. Use the www hostname consistently.
4. Re-submit in Google Search Console after fixing.
