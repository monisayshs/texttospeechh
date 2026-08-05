# Content Quality Findings

## Overview
- **Score: 70/100**
- Primary page (/text-to-speech) scored **96/100** on QRG-aligned quality (density 1.0, 5,941 tokens, 1,871 visible words).
- FAQ answers are visible on-page (matches FAQPage schema).
- Unique meta descriptions on all pages.

## High Findings

### 1. 12+ thin pages under 300 words
| Page | Words |
|------|-------|
| /language/english | 230 |
| /language/hindi | 234 |
| /language/spanish | 222 |
| /language/urdu | 228 |
| /text-to-speech/voice-generator | 231 |
| /text-to-speech/word-to-speech | 231 |
| /text-to-speech/read-aloud | 238 |
| /text-to-speech/pdf-to-speech | 249 |
| /text-to-speech/text-to-voice | 251 |
| /text-to-speech/online-text-to-speech | 279 |
| /text-to-speech/free-text-to-speech | 323 |
| /contact | 284 |

These are doorway-style thin pages with limited unique value.

### 2. Doorway-pattern /keyword/* URLs
- `/keyword/free-ai-texttospeechh.com` → 308 → `/text-to-speech`
- `/keyword/text-to-speech-free` → 308 → `/text-to-speech/free-text-to-speech`
Google flags keyword-stuffed URL patterns as doorway pages.

## Medium Findings

### 3. Readability very low
- Flesch-Kincaid Grade Level: **15.2**
- Flesch Reading Ease: **16.0**
- Avg sentence: ~17 words, heavy jargon (Tacotron 2, HiFi-GAN, WaveNet). Reads at post-graduate level despite mass-market topic.

### 4. Weak E-E-A-T
- No named human author — Article author is the Organization only.
- No visible publish date in HTML (JSON-LD only).
- Domain registered 2026-07-27 (9 days old at audit time).
- Organization `sameAs` lists a single Instagram profile.

## Evidence
- `content-quality.json`: filler_score 0, ai_pattern_score 3, overall_quality 96.
- Readability computed from trafilatura-extracted text of /text-to-speech.
