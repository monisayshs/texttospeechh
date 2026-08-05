# On-Page SEO Findings

## Overview
- **Score: 78/100**
- Every page has a unique title, meta description, canonical, and single H1. Clean heading hierarchy.
- lang="en", Open Graph + Twitter Card present.

## Findings

### Critical
- **Hreflang locale targets all 404.** Every page declares hreflang to `/uk`, `/ca`, `/au`, `/hi`, `/de`, `/fr`, `/es`, `/ja`, `/pt` — all return 404. `/language/*` pages exist but aren't referenced. No self-referencing hreflang. This actively harms international targeting signals.

### High
- **Title tags too long on ~30 pages (66-88 chars).** Examples: how-text-to-speech-works (88), elevenlabs-alternatives (82), text-to-speech-for-students (82), text-to-speech-for-youtube (76). Brand suffix `| TextToSpeechH AI` pushes keywords past the ~60-char SERP limit.

### Medium
- **Meta descriptions over 160 chars:** /privacy-policy (233), /terms (180), /about (198), /text-to-speech (161), /keyword/free-ai-texttospeechh.com (161), /text-to-speech/blog (161), /text-to-speech/blog/best-ai-voices (167).

### Low
- No visible publish date / author byline on articles (JSON-LD only).
- Homepage title is 66 chars and reads "Free AI Voice Generator & Text to Speech Online" while H1 is "Free AI Voice Generator" — minor keyword inconsistency.

## Title Length Audit Summary
- 36 live pages, 30 with titles >60 chars.
- Blog hub (/text-to-speech/blog) title 67 chars.
