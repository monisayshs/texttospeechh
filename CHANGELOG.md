# Changelog — TextToSpeechH AI

All notable changes to the TextToSpeechH AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Historical log of software releases, structural changes, and documentation milestones |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Every feature release, bug fix, deployment, or documentation milestone |
| **Update Frequency** | Medium — updated with every meaningful commit or release |
| **Last Verified** | 2026-09-18 |
| **Verified Against** | Git history & Cloudflare Pages Production state |
| **Related Documents** | [PROJECT_STATE.md](PROJECT_STATE.md), [DECISIONS.md](DECISIONS.md), [AGENTS.md](AGENTS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## [Unreleased]

### Added
- **Blog image rollout Batch 3 — 4 Week-3 articles (2026-10-06)**: wired 9 custom WebP images (flat teal/navy/coral style, no readable text, ≤1600px, <120 KB) into the 4 articles published 2026-10-05. `tiktok-text-to-speech-guide`: hero (phone + voiceover waveform, 1600x900, eager + fetchpriority) + 4-step workflow diagram (1600x533) + built-in-vs-AI comparison visual (1600x1067). `ai-voiceover-powerpoint-guide`: slide-deck hero (1600x900, eager) + 4-step script→MP3→insert→export diagram (1600x533). `play-ht-alternatives`: shutdown-migration hero (1600x900, eager) + API-vs-voiceover two-paths diagram (1600x1067). `text-to-speech-elearning-narration`: course-player hero (1600x900, eager) + 5-step narration workflow diagram (1600x533). All: keyword-rich file names under `public/images/blog/<slug>/`, keyword-rich alt text, real width/height, figcaptions, per-article `ogImage` set (og:image/twitter:image/Article schema). Wiring in `src/pages/textToSpeechBlogHub.js` follows the Batch 1/2 pattern exactly. User approved.
- **Blog image rollout Batch 2b — deferred images + 5 zero-image articles (2026-10-06)**: image pipeline recovered; completed all Batch 2 deferrals. (A) `ai-audiobook-generator-guide`: wired the already-generated `audiobook-workflow-steps.webp` (2736x912, 93 KB, 4-step workflow diagram) before the workflow section. (B) `how-text-to-speech-works`: generated + wired `how-text-to-speech-works-hero.webp` (1600x900, 64 KB, text-to-neural-network-to-speaker concept) as hero (eager + fetchpriority) and set its `ogImage` (was falling back to default). (C) `free-text-to-speech-pdf-to-audio`: generated + wired `pdf-to-audio-workflow-steps.webp` (1600x533, 21 KB, 4-step PDF-to-MP3 diagram) before the step-by-step section. (D) 5 articles with zero images, 2 visuals each (hero eager + in-content lazy): `text-to-speech-for-students` (study hero + 5-step study-workflows diagram), `murf-ai-free-alternative` (locked-vs-free comparison hero + choose-your-tool funnel), `text-to-speech-for-podcast-free` (podcast mic hero + script-to-episode workflow), `ai-voice-cloning-guide` (voice-duplication hero + 3-step cloning diagram), `best-ai-voice-generators-free` (5 voice avatars hero + faceless-YouTube workflow). All 13 images: custom WebP, flat teal/navy/coral style, no readable text, ≤1600px, <120 KB, keyword-rich file names under `public/images/blog/<slug>/`, keyword-rich alt text, real width/height, figcaptions, per-article `ogImage` set. Wiring in `src/pages/textToSpeechBlogHub.js` follows the Batch 1 pattern exactly.

### Changed
- **SEO audit technical quick wins (2026-10-06)** — 4 small behind-the-scenes fixes, user approved completing remaining audit work: (1) logo `<img>` width/height: added `width="26" height="26"` (matches CSS render size; SVG is square) to all logo images missing dimensions — `src/api/contentHandler.js` (FAQ + guide headers), `src/api/seoHandler.js` (page header), `src/pages/footerComponent.js`, `public/index.html` (footer) — eliminates the CLS risk the audit flagged (~143 instances site-wide via shared templates); (2) pillar link: added the missing `/text-to-speech/txt-to-speech` link ("TXT to Speech") to the Spoke Links Hub box in `src/pages/textToSpeechPillar.js` — pillar now links all 9 programmatic tool pages; (3) self-hosted Inter font + preload: fonts were loaded from Google Fonts CDN (dynamic per-UA woff2 URLs, un-preloadable), so Inter v20 variable font (latin subset, 48 KB) is now self-hosted at `public/fonts/inter-latin.woff2` with `@font-face` (font-display: swap) at the top of `public/style.css`, `<link rel="preload" as="font" type="font/woff2" crossorigin>` added to `public/index.html`, `src/api/seoHandler.js`, `src/api/contentHandler.js` (both heads), `src/pages/errorPages.js`, and the Google Fonts stylesheet/preconnect tags removed from all of them (static 404/500/offline.html keep their separate Outfit font — out of scope); (4) real sitemap lastmod: `src/seo/sitemapGenerator.js` no longer stamps every URL with today's date — blog articles now use their real `dateModified`/`datePublished` from `BLOG_ARTICLES_MAP`, other sections use per-section content-change dates from git history (mapping dated 2026-10-06 with a bump-on-edit note), and the sitemap index uses the max section date per file. XML validity verified locally.

### Changed
- **Thin-page expansion Batch 2 — pdf-to-speech, read-aloud, online-text-to-speech, youtube-voiceover (2026-10-06)** (`src/pages/textToSpeechSubpages.js`, `src/seo/programmaticPages.js`): applied the 4 user-approved expansion drafts. pdf-to-speech (~349→~1,087 words): added "How PDF to Speech Actually Works", "Who Turns PDFs into Audio?" (4 use-cases: students/researchers, commuters, professionals, low-vision readers), honest "Where PDF to Speech Shines — and Where It Doesn't" (scanned/image-PDF caveat), 5 new FAQs + existing file-size FAQ, `faqs` array (6) for FAQPage JSON-LD, readingTime 7→8 min. read-aloud (~385→~1,056 words): added "How Read Aloud Actually Works" (incl. read-along highlighting), "Who Uses Read Aloud?" (4 use-cases: dyslexia/ADHD students, language learners, proofreaders, professionals), honest dyslexia note (aid, not treatment), 4 new FAQs + 2 existing, `faqs` array (6), readingTime 6→7 min. online-text-to-speech (~394→~1,075 words): added "How Online Text to Speech Actually Works" (incl. needs-internet caveat), "Who Uses Online Text to Speech?" (4 use-cases: creators, students/teachers, podcasters, professionals), honest "Browser vs Desktop Software" comparison, 5 new FAQs + 2 existing, `faqs` array (7), readingTime 6→7 min. use-case/youtube-voiceover (~318→~1,059 words): added "How YouTube Voiceovers Actually Work", "Who Uses AI Voiceovers on YouTube?" (4 use-cases incl. Hindi/regional creators), honest "The Honest Truth About AI Voices and YouTube Monetization" (voiceover alone doesn't guarantee monetization), 4 new FAQs + existing monetization FAQ, `faqs` array (5), added missing `"readingTime": "7 min read"`, and added parent back-links (YouTube voiceover guide article, sibling audiobook use-case, main text-to-speech guide) — note: no /use-case hub page exists (404), so links point at the closest parents. All existing sections kept verbatim. Drafts: `~/workspace/seo/total-audit-2026-10-05/draft-{pdf-to-speech,read-aloud,online-text-to-speech,youtube-voiceover}-expansion.md`. User approved ("chaaron pages approved hain — live deploy kardo").

### Added
- **Blog image rollout Batch 2 — partial (2026-10-05)**: the image-generation pipeline was unavailable for most of this batch (upstream errors on 7 of 8 requests; failed requests not retried per policy). One hero was generated and wired before the outage: `free-text-to-speech-pdf-to-audio` got `pdf-to-audio-hero.webp` (1600x533, 53 KB, flat teal/navy/coral style, no readable text) with keyword-rich alt, real width/height, eager loading + fetchpriority, figcaption, and per-article `ogImage` set (og:image/twitter:image/Article schema via existing `seoHandler.js` support). The 2 deferred Batch 1 retries (`audiobook-workflow-steps` diagram, `how-text-to-speech-works` hero + ogImage) and the remaining 5 Batch 2 articles (`text-to-speech-for-students`, `murf-ai-free-alternative`, `text-to-speech-for-podcast-free`, `ai-voice-cloning-guide`, `best-ai-voice-generators-free` — next 6 by GSC 28-day impressions after Batch 1) are deferred to a follow-up batch once the image pipeline recovers.

- **Blog image rollout Batch 1 — top-6 traffic articles (2026-10-05)**: generated 11 custom WebP illustrations (flat teal/navy/coral style, no readable text, ≤1600px wide, all under 120 KB) in `public/images/blog/<slug>/` and wired them into the 6 highest-impression blog articles of the last 28 days (GSC): `elevenlabs-alternatives` (2: hero + free-limits chart), `best-ai-voices` (3: hero + neural-voice diagram + tuning workflow), `ai-audiobook-generator-guide` (1: hero), `text-to-speech-for-youtube` (2: hero + editing workflow), `how-text-to-speech-works` (1: 3-stage pipeline), `ai-video-dubbing-guide` (2: hero + dubbing process). Each image has keyword-rich alt text, real width/height, lazy-loading (hero eager), and a figcaption. Renderer now supports per-article `ogImage` (`src/api/seoHandler.js` uses it for og:image/twitter:image; `src/seo/schemaGenerator.js` `getArticleSchema` accepts an optional image) — 5 of the 6 articles set it. Two planned images (audiobook workflow diagram, how-TTS hero) failed at generation (upstream unavailable) and are deferred to Batch 2. User approved the image style from samples.

### Changed
- **Thin-page expansion Batch 1 — word-to-speech, voice-generator, text-to-voice (2026-10-05)** (`src/pages/textToSpeechSubpages.js`): applied the 3 user-approved expansion drafts. word-to-speech (~326→~995 words): added "How Word to Speech Actually Works", "Who Converts Word Documents to Speech?" (4 use-cases: authors, students, professionals, creators), honest "DOCX vs TXT vs PDF: Which Converts Best?" (incl. complex-layout caveat), 5 new FAQs + existing .doc FAQ, `faqs` array (6) for FAQPage JSON-LD, readingTime 6→7 min. voice-generator (~327→~980 words): added "How an AI Voice Generator Actually Works", "What People Make With an AI Voice Generator" (4 use-cases: Shorts/YouTube, podcasters, authors, businesses), honest "AI Voice vs Hiring a Voice Actor" (admits humans win on deep emotion), 5 new FAQs + existing monetization FAQ, `faqs` array (6), readingTime 7→8 min. text-to-voice (~338→~906 words): added "How Text to Voice Conversion Actually Works", "Who Uses a Text to Voice Converter?" (4 use-cases: creators, students, professionals, accessibility), honest "Text to Voice vs Old-Fashioned TTS" (incl. no-voice-cloning caveat), 4 new FAQs + 2 existing FAQs, `faqs` array (6), readingTime 6→7 min. All existing sections kept verbatim. Drafts: `~/workspace/seo/total-audit-2026-10-05/draft-{word-to-speech,voice-generator,text-to-voice}-expansion.md`. User approved ("teeno pages approved hain — live deploy kardo").
- **Thin-page expansion: /text-to-speech/txt-to-speech (2026-10-05)** (`src/pages/textToSpeechSubpages.js`): applied the user-approved expansion draft — page grows from ~278 to ~1,011 visible words. Added "How TXT to Speech Actually Works" (plain-language 3-step process), "Who Uses TXT to Speech?" (4 concrete use-case subsections: students, content creators, accessibility, developers/professionals), "Why It's Free — and Why There's No Signup" (honest no-account model explanation), and a 6-question FAQ block (40–60 word direct answers) with a matching `faqs` array so FAQPage JSON-LD emits. Existing sections kept verbatim; `readingTime` bumped 5→7 min. Draft: `~/workspace/seo/total-audit-2026-10-05/draft-txt-to-speech-expansion.md`. User approved ("isko code mein update karke live deploy kardo").
- **SEO audit Commit C — homepage links to all 9 programmatic tool pages (2026-10-05)** (`public/index.html`): added a "Free AI Voice Tools" internal-linking block (same `use-case-seo-block glass-panel` pattern as the YouTube/PDF-to-Audio blocks) between the PDF to Audio section and the FAQ — links all 9 `/text-to-speech/*` tool landing pages with keyword-rich anchors (AI Text to Speech, Free Text to Speech, Text to Speech Online, Text to Voice Converter, AI Voice Generator, Read Aloud Tool, PDF to Speech Converter, Word to Speech Converter, TXT to Speech Converter), one supporting line each. Previously only 2 of 9 were reachable from the homepage. User approved via total-SEO-audit action plan.
- **SEO audit Commit A — /faq template fix (2026-10-05)** (`src/api/contentHandler.js`, `renderFaqDirectoryPage`): the /faq page was the weakest indexed page — added the shared head pattern: og:title, og:description, og:image, og:url, og:site_name, twitter:card (summary_large_image) + title/desc/image, plus Organization and BreadcrumbList JSON-LD via `schemaGenerator` (FAQPage schema unchanged). User approved via total-SEO-audit action plan.
- **SEO audit Commit B — title/description trims for CTR (2026-10-05)**: trimmed all 25 titles >60 chars (worst 80 rendered) to ≤60 and all 7 descriptions >160 chars (worst 204) to 150–160. Keyword kept at the start of each; brand suffix dropped where it pushed titles over 60. Files: `src/pages/textToSpeechBlogHub.js` (17 titles + 7 descriptions), `src/seo/programmaticPages.js` (8 titles). Full before→after list: `~/workspace/seo/total-audit-2026-10-05/title-trims-2026-10-05.md`. User approved via total-SEO-audit action plan.

### Added
- **New article: Audible AI audiobooks (2026-10-02)** (`src/pages/textToSpeechBlogHub.js`, `text-to-speech/blog/audible-ai-audiobook-features`): "Audible Adds AI to Audiobooks: What Authors Need to Know (2026)" — from the 2 Oct daily SEO draft; user approved the draft ("bohot behtareen, timely aur honest") and said "publish kardo". Timely coverage of Audible's Oct 1, 2026 announcement (Character Guide, Interactive Story, Visual Explorer debuting with Dracula and 1984), honest ACX vs Spotify/Kobo/Google Play AI-narration rules, the free 5-step AI audiobook workflow, and a studio-vs-AI cost table. 5 FAQs with matching FAQPage schema. Per user request, a "Related Guides" block at the end interlinks `ai-audiobook-generator-guide`, `ai-audiobook-narration-authors`, and `/use-case/audiobook-generator`. Pushed via gh.py put (d437fdf); remote verified via gh.py cat; production confirmed HTTP 200 with correct title, Related Guides block, and FAQPage schema. Request Indexing pending (user does it himself from the live URL).

### Changed
- **SEO actions (2026-10-02)** — from the 2 Oct daily SEO report (user directive), all in `src/seo/programmaticPages.js`:
  - **Audiobook use-case page** (`/use-case/audiobook-generator`): FAQ accordion headings bumped from H4 to H3 (4 questions) for stronger on-page targeting — FAQPage schema (from the `faqs` array) unchanged and still valid.
  - **Language pages** (all 12: english, hindi, urdu, spanish, arabic, french, german, japanese, portuguese, italian, russian, turkish): titles verified already unique; added a unique 2-paragraph intro to each page in its own language (use-case led, human tone) right after the definition box to thicken thin content.
  - **Comparison pages** (all 8 `/compare/*`): added a visible "✓ Updated October 2026" freshness badge at the top of each page and set `dateModified: 2026-10-02`.
  - Pushed via gh.py put (commit 4453798); remote content verified via gh.py cat; local synced to origin/main; all three changes confirmed live on production HTML.
- **SEO CTR tweaks (2026-10-01)** — from the 1 Oct daily SEO report (user directive):
  - **Audiobook use-case page** (`src/seo/programmaticPages.js`, `/use-case/audiobook-generator`): expanded FAQs from 2 to 4 — added "What is the best free AI audiobook generator?" and "How do I turn a PDF book into an audiobook for free?" targeting the page-1 ranking queries ("ai audiobook generator" #6.4, "audiobook generator" #10.1); new Q&As added to both the `faqs` array (FAQPage schema) and the visible FAQ accordion verbatim. Title tweaked to "AI Audiobook Generator: Free Book Narration | TextToSpeechH"; meta description rewritten as a click-focused pitch ("no signup, no fees") to convert 44 weekly impressions into clicks.
  - **Arabic language page** (`src/seo/programmaticPages.js`, `/language/arabic`): title rewritten from Arabic-only to "Free Arabic Text to Speech | TextToSpeechH AI" and meta description made bilingual (English lead + Arabic tail) — the ranking query "arabic text to speech" (position 5, zero clicks) is English, so English-first SERP copy targets the CTR gap.
  - **elevenlabs-alternatives internal links**: verified already live — the "Want the full side-by-side?" box after the head-to-head section already links `/compare/texttospeechh-vs-elevenlabs` and `/compare/texttospeechh-vs-naturalreader` (added 2026-09-29). No change needed; reported back to user instead of duplicating.

### Added
- **New article: Free text-to-speech without login (2026-10-01)** (`src/pages/textToSpeechBlogHub.js`, `text-to-speech/blog/free-text-to-speech-no-signup`): "Free Text to Speech Without Login: 7 Tools for 2026" — from the 1 Oct daily SEO draft; user approved the draft verbatim and said "publish kardo". Targets `text to speech free no sign up` (Google Ads USA volume 260/mo, LOW competition). Roundup of 7 no-signup tools (TextToSpeechH 10K words/request lead, TTS.ai, Notevibes, TextToVoice.org, Forewrite, Edge Read Aloud, Google TTS) with an honest comparison table, 3 commercial-use caveats, and a 2-minute first-voiceover walkthrough. 6 FAQs with matching FAQPage schema, contextual internal links to elevenlabs-alternatives and the AI audiobook generator guide. Pushed via gh.py put (cef50f4); Cloudflare Pages redeploys from main. Request Indexing pending (user does it himself from the live URL).
- **New article: ElevenLabs v4 free guide (2026-09-29)** (`src/pages/textToSpeechBlogHub.js`, `text-to-speech/blog/elevenlabs-v4-free-guide`): "ElevenLabs v4 Is Here: Try Expressive AI Voices Free" — timely launch coverage (Eleven v4 + v4 Turbo, Sep 28, 2026) with the honest cost breakdown ($22/M-char intro API pricing, free-tier caps, no commercial use on free) and the free playbook for expressive voiceovers (script emotion, voice-for-mood, speed/pitch levers, audiobook chapter workflow). 5 FAQs with matching FAQPage schema, contextual internal links to elevenlabs-alternatives and the AI audiobook guide. Published on explicit user approval ("publish kardo"); typo report investigated first — the reported `[whispers` missing-bracket typo did not exist in the source draft (PDF rendering issue), so the article shipped as-written.

### Changed
- **SEO quick wins (2026-09-29)** — three internal-linking + title optimizations from the daily SEO report:
  - **Audiobook use-case page** (`src/seo/programmaticPages.js`, `/use-case/audiobook-generator`): title rewritten to front-load the exact ranking query — "AI Audiobook Generator: Free Book Narration | TextToSpeechH" (was "Free AI Audiobook & Long Script Generator | TextToSpeechH AI"). Added contextual in-content link to the `/text-to-speech/blog/ai-audiobook-generator-guide` walkthrough in the page's opening paragraph.
  - **elevenlabs-alternatives article** (`src/pages/textToSpeechBlogHub.js`): added a "Want the full side-by-side?" contextual box directly after the head-to-head comparison table linking all four comparison pages (`/compare/texttospeechh-vs-elevenlabs`, `-vs-playht`, `-vs-lovo`, `-vs-naturalreader`) to distribute authority from the site's highest-traffic article (74 users/week).
  - **Blog hub** (`src/pages/textToSpeechBlogHub.js`, `/text-to-speech/blog`): added a "Browse voices by language" section linking all 10 language pages (English, Hindi, Urdu, Arabic, Spanish, French, German, Japanese, Portuguese, Italian) between the article grid and the CTA box.
- **Full-site SEO audit fixes (2026-09-28)**: comprehensive crawl of all 61 sitemap URLs found zero indexing blockers (all 200, single H1, self-canonical, no duplicate titles/descriptions, zero missing alt text). Fixes applied:
  - **FAQPage schema/content alignment** (`src/api/seoHandler.js`): `renderSeoPage()` now emits FAQPage JSON-LD only when a page defines page-specific `faqs`. Removed the generic default-FAQ fallback that caused schema/visible-content mismatches on ~20 pages (legal, comparison, language, use-case, pillar, blog hub, 15 articles, TTS subpages).
  - **Page-specific FAQs added**: 8 comparison pages, 2 use-case pages, 5 language pages (english/hindi/french/german/japanese), 7 TTS subpages, and all 15 blog articles now carry `faqs` arrays extracted verbatim from their visible FAQ sections — FAQPage schema matches on-page Q&A exactly.
  - **Guide pages SEO** (`src/api/contentHandler.js`): `renderGuidePage()` previously shipped zero JSON-LD and no robots/OG/Twitter meta. Now emits Organization + WebSite + Article (no invented dates) + BreadcrumbList JSON-LD, `robots: index, follow`, and full Open Graph / Twitter Card tags for both guides.
  - **Meta trims**: 6 titles >70 chars and 14 descriptions >160 chars shortened to within limits across guides, legal pages, pillar, blog hub, 3 blog articles, and 2 programmatic pages.
- **Audiobook article CTR fix** (`src/pages/textToSpeechBlogHub.js`, `ai-audiobook-generator-guide`): title tag rewritten to lead with the exact ranking query — "AI Audiobook Generator: Turn Any Book Into an Audiobook (Free)" (was "How to Create Audiobooks from Text (Free AI Guide)"); H1 aligned to match; meta description rewritten as a click-focused pitch (free, no signup, no studio, 10-hour-book workflow). `dateModified` bumped to September 27, 2026. Article ranks #2 for "ai audiobook generator" with impressions but zero clicks — new title/meta target the CTR gap.
- **Internal links to best-ai-voices** (`src/pages/textToSpeechBlogHub.js`): added contextual in-content links to `/text-to-speech/blog/best-ai-voices` from three related articles (best-ai-voice-generators-free, elevenlabs-alternatives, ai-audiobook-generator-guide) to push it from ~position 10.4 toward page one. `dateModified` updated on the two comparison articles.

### Verified (no change needed)
- **Homepage duplicate FAQ H2**: checked live homepage and `public/index.html` — only ONE "Frequently Asked Questions" H2 exists. The earlier report finding was a false positive; nothing to merge.
- **Blog hub server-side rendering**: checked live `/text-to-speech/blog` — all 13 article cards are present in the server-rendered HTML (no client-side rendering). Google can crawl the article list directly; no fix needed.

---

## [1.7.2] - 2026-09-26

### Fixed
- **KV write quota exhaustion (free tier 1,000 writes/day)** (`src/services/queueService.js`):
  - Root cause: `processJob` saved job metadata to KV (`TTS_JOBS_KV.put`) on **every** processed chunk. A 10-chunk TTS job burned ~13 writes (create + processing + 10 chunk saves + completion); ~80 jobs/day hit 90% of the daily free-tier quota (Cloudflare alert 2026-09-26), after which new TTS jobs would fail with KV 429s until the next-day reset.
  - Intermediate progress saves are now **throttled to every 5th chunk** (last chunk skipped — the completion save always persists final state). Same 10-chunk job now costs ~4 writes instead of ~13 (~70% fewer writes).
  - No UX change: progress bar keeps updating (saves still land roughly every ~12s), audio generation path untouched, create/processing/completion/failure saves unchanged.

---

### Fixed
- **Homepage SEO fixes from single-page audit** (`public/index.html`):
  - Meta description rewritten to remove brand-name repetition (was flagged as templated metadata spending SERP characters on the brand): now "Convert text into realistic AI voices instantly. Free online text-to-speech with natural voices, MP3 downloads & multi-language support. No sign-up needed." (155 chars, in the 150–160 target range). Applied to `description`, `og:description`, and `twitter:description`.
  - Vague H2 headings made descriptive: search modal title "Search TextToSpeechH AI" → "Search"; footer brand heading "TextToSpeechH AI" → "TextToSpeechH AI — Free Text to Speech Platform".
  - Freshness signal: footer copyright bar now shows "Last updated: September 2026".
  - E-E-A-T trust signal: footer brand column now includes "Built by the TextToSpeechH AI team." linking to `/about`, alongside the existing official contact email.

## [1.7.0] - 2026-09-23

### Added
- **Read-Along word-by-word highlighting (opt-in)** (`src/services/wordTimingService.js`, Edge provider, queue, API, frontend):
  - Edge `wordBoundaryEnabled` turned on across all three synthesis paths (Cloudflare raw socket, Node `ws`, local `msedge-tts`); `Path:audio.metadata` frames parsed into compact `{s,e,w}` word timings (ms); fail-closed so synthesis never breaks when metadata is unavailable.
  - Per-chunk timings merged with measured MP3 frame-walk durations; merged `wordTimings` + `readAlongAvailable` persisted in KV/disk metadata and returned by `/api/generate` (instant and poll paths).
  - Frontend: hidden **"Read-Along: OFF"** toggle appears near the player only when timings exist; the highlight box opens and live highlighting starts **only on user click** — never automatically after generation. Toggle OFF hides the box and stops the loop. Handles pause/resume/seek/stop/end/regeneration, auto-scroll, mobile, dark mode, and no-timing/failover providers (button stays hidden, normal playback untouched).
  - Verified end-to-end through the real production code path (live Bing synthesis, 3 chunks, 240/240 words, monotonic, final word inside measured audio duration) and in a real workerd runtime.

## [1.6.2] - 2026-09-23

### Fixed
- **PDF text extraction still failing in production for subset-font PDFs** (`src/services/fileParser.js`):
  - Root cause of the v1.6.1 follow-up: pdf-parse v2 **cannot run in the Cloudflare Workers/Pages runtime at all** — its bundled web build requires DOM APIs (`DOMMatrix is not defined` in workerd), so the primary engine throws on every PDF in production and extraction always fell through to the font-unaware fallback.
  - Added a dependency-free **ToUnicode-aware extraction engine** (new secondary engine, runs before the legacy raw scan): resolves each page's font resources, parses fonts' ToUnicode CMaps (`bfchar`/`bfrange`, 1- and 2-byte codes), and decodes `Tj`/`TJ`/`'`/`"` text-showing operators per active font (`Tf`). Handles `Identity-H` subset fonts from Chrome "Print → Save as PDF" (Skia/PDF), hex strings, TJ kerning arrays, and inline-image skipping.
  - Verified in a real workerd runtime (`wrangler dev`): the previously failing `Application_Print_Preview.pdf` now extracts 6,557 clean characters (100% word recall vs pdf-parse v2 reference); simple WinAnsi PDFs and the garbage-input guard behavior unchanged.
  - No new dependencies (per repo policy).

## [1.6.1] - 2026-09-23

### Fixed
- **PDF text extraction returning garbage characters** (`src/services/fileParser.js`, `package.json`):
  - Root cause: `package.json` declared `"pdf-parse": "*"`, so production installed v2.4.5 — but the parser code was written for the v1 API (`require('pdf-parse')` as a callable function). In v2 the module exports a `PDFParse` class instead, so the primary engine silently skipped every PDF and all extraction fell through to the naive raw-stream fallback, which emits symbol soup for PDFs with subset/custom font encodings.
  - Primary engine rewritten for the pdf-parse v2 API (`new PDFParse({ data })` → `getText()`), with legacy v1 function fallback kept for safety.
  - Pinned `pdf-parse` to `^2.4.5` in `package.json` (matches `package-lock.json`).
  - Added `looksLikeGarbage()` readability heuristic: if extracted text scores as undecodable symbol soup, extraction now fails with a clear user-facing message ("This PDF uses a font encoding we cannot read… try re-exporting as a standard PDF or paste the text manually") instead of filling the TTS textarea with garbage. The frontend already surfaces this as a `File Import Error` toast.

## [1.6.0] - 2026-09-23

### Added
- **Week 1 Quick-Win Content Cluster — 4 New Blog Articles + 2 H2 Fold-ins** (user-approved drafts, SERP weakness-verified 2026-09-23):
  - NEW `text-to-speech/blog/free-text-to-speech-pdf-to-audio` — "Free Text to Speech: Convert PDF to Audio" (how-to guide; targets `free text to speech pdf to audio`, weakest SERP: old/spam PDFs ranking).
  - NEW `text-to-speech/blog/text-to-speech-for-podcast-free` — "Text to Speech for Podcast: Free Tools Guide" (creator workflow script→MP3; targets `text to speech for podcast free`, press-release-only SERP).
  - NEW `text-to-speech/blog/murf-ai-free-alternative` — "Murf AI Free Alternative: 7 Best Picks (2026)" (targets `murf ai free alternative`; honest per-gap ranking vs Murf's 10-min lifetime free plan).
  - NEW `text-to-speech/blog/best-ai-voice-generators-free` H2 + `text-to-speech/blog/best-free-text-to-speech-tools` H2 fold-ins: "Free TTS With No Character Limit" and "AI Voice Generators That Work Without Sign-Up" sections added before FAQ (TOC updated, FAQ renumbered) — cannibalization-safe alternative to standalone articles.
  - All articles: keyword in first 100 words, direct answer in opening, H2/H3 hierarchy, comparison tables, FAQ sections, CTA box before FAQ with per-article tool route, descriptive-anchor internal links, 1–2 external authority links, `datePublished`/`dateModified` = 2026-09-23, ≤64-char SERP titles.
  - New slugs auto-included in `sitemap-main.xml` via `getDynamicBlogRoutes()` (11 blog articles total).
- **Fact-checked free-tier claims** (official pricing pages / site claims, 2026-09-23): Murf AI free = 10 min lifetime, no downloads, no commercial rights ($19/mo Creator); Speechify free = ~10 basic voices, 1.5x speed cap; TTSMaker 20,000 chars/week; NaturalReader unlimited basic + 20 min/day premium; TextaVoice claims flagged as unverified company claims; Play.ht omitted from Murf draft (free plan unverified). Zero "we tested" claims.

## [1.5.0] - 2026-09-23

### Added
- **First SEO Content Cluster — 2 New Blog Articles + 1 Refresh**:
  - NEW `text-to-speech/blog/best-free-text-to-speech-tools` — "Best Free Text to Speech Tools Tested in 2026" (utility angle: PDF reading, no-signup tools, multilingual voices; targets `free text to speech` 10K–100K).
  - NEW `text-to-speech/blog/best-ai-voice-generators-free` — "Best AI Voice Generators With Free Plans (2026)" (creator angle: faceless YouTube, voice realism scores, cloning safety, monetization rules; targets `ai voice generator` 10K–100K).
  - REFRESHED `text-to-speech/blog/elevenlabs-alternatives` — "7 Best Free ElevenLabs Alternatives (2026)": re-ranked by free-tier generosity, creator filter, new Privacy Score section, "Why People Leave ElevenLabs", 10 FAQs (was 20 thin Q&As).
  - All articles: keyword in first 100 words, H2/H3 structure, comparison tables, descriptive-anchor internal linking (no generic anchors), 1–2 external authority links, FAQ sections, `datePublished`/`dateModified` = 2026-09-23, ≤60-char SERP titles.
  - New slugs auto-included in `sitemap-main.xml` via `getDynamicBlogRoutes()`.
- **Fact-Checked Free-Tier Claims**: TTSMaker 20,000 chars/week (official pricing page), NaturalReader free = unlimited basic voices + 20 min/day premium voices, ElevenLabs 10,000 chars/month — verified 2026-09-23; remaining figures hedged as "at time of writing".

## [1.4.1] - 2026-09-23

### Fixed
- **SEO Audit Fixes (Technical SEO Audit 2026-09-23)**:
  - Added `FAQPage` JSON-LD structured data to `/faq` (built from all 30 visible Q&As) and to the homepage FAQ accordion section (4 Q&As) — unlocks FAQ rich-result eligibility.
  - Added missing `<meta name="robots" content="index, follow">` to `/faq` for consistency.
  - Sitemap `lastmod` is now dynamic: `src/seo/sitemapGenerator.js` emits today's date on every generation instead of the hardcoded `2026-08-05`.
  - Sitemap `lastmod` is computed per-request (not at module load): serverless cold-starts were freezing the date at epoch (`1970-01-01`) on Cloudflare — fixed 2026-09-23.
  - Shortened SERP titles to ≤60 characters: homepage (66→56), all 5 blog articles, and `/language/hindi` (120→79 bytes).

## [1.4.0] - 2026-09-22

### Added
- **Global Multilingual SEO Expansion (12 Top Search Languages)**:
  - Added dedicated native language landing pages for 12 top global search languages: English (`/language/english`), Hindi (`/language/hindi`), Urdu (`/language/urdu`), Spanish (`/language/spanish`), Arabic (`/language/arabic`), French (`/language/french`), German (`/language/german`), Japanese (`/language/japanese`), Portuguese (`/language/portuguese`), Italian (`/language/italian`), Russian (`/language/russian`), and Turkish (`/language/turkish`).
  - Implemented translated native titles, meta descriptions, definition boxes, voice model comparison tables, FAQs, and native CTA buttons (e.g. French: *"Générer de l'Audio"*, German: *"Audio generieren"*, Japanese: *"日本語音声を作成する"*).
- **Hreflang International Target Matrix**:
  - Updated `src/seo/hreflangMap.js` to automatically emit self-referencing and bidirectional `<link rel="alternate" hreflang="xx">` tags (`en`, `hi`, `ur`, `es`, `ar`, `fr`, `de`, `ja`, `pt`, `it`, `ru`, `tr`) plus `x-default` pointing to `https://www.texttospeechh.com/`.
- **Footer Navigation & Sitemap Integration**:
  - Updated `src/pages/footerComponent.js` to list all 12 languages in the footer matrix, eliminating orphan pages.
  - Automatically included all 12 language routes in XML sitemap generation.

## [1.3.0] - 2026-09-22

### Added / Fixed
- **PDF Annotation, Sticky Note & Comment Extraction Engine**:
  - Implemented `extractPdfAnnotations(buffer)` in `src/services/fileParser.js` to parse PDF `/Subtype /(Text|FreeText|Highlight|Popup|Stamp|Ink|Underline|Squiggly|StrikeOut|Caret)` objects and `/Contents` string dictionaries.
  - Automatically appends extracted PDF reviewer comments and sticky notes to the main text stream, ensuring both document body text and annotations are synthesized into neural audio MP3 recordings.
- **Duplicate Content Protection for Cloudflare `.pages.dev` Subdomains**:
  - Configured automatic **301 Permanent Redirect** in `functions/[[path]].js` for all `*.pages.dev` requests directing traffic and bots exclusively to `https://www.texttospeechh.com${pathname}${search}`.
  - Added `X-Robots-Tag: noindex, follow` header to all `*.pages.dev` responses to instruct search engine crawlers to de-index preview subdomains and consolidate domain authority on `www.texttospeechh.com`.
- **IndexNow Engine Submission (Option A)**:
  - Executed `scripts/notify-indexnow.js` to notify search engines of all 46 sitemap URLs. Verified live key endpoint `https://www.texttospeechh.com/b92a2552d2aec9f72edbb0f9b5671603.txt`.
- **Core Spoke Pages Content Expansion (Option B)**:
  - Expanded all 9 core keyword spoke pages in `src/pages/textToSpeechSubpages.js` to 681 - 977 words each with neural architecture explanations, comparison matrices, and FAQ accordions.
- **Phase 1 SEO Fixes**:
  - Fixed truncated About-page meta description in `src/pages/legalPages.js` and centralized HTML attribute escaping in `src/api/seoHandler.js`.
  - Standardized homepage URL formatting in `src/seo/schemaGenerator.js` to `https://www.texttospeechh.com/`.
  - Added `noindex, follow` directive header to search handler `src/api/searchHandler.js`.
- **Phase 2A Internal Link Architecture**:
  - Added "Compare TTS Tools" link matrix to footer in `src/pages/footerComponent.js`, eliminating 12 orphan pages.
  - Replaced generic `"Read Full Guide →"` anchors with descriptive anchor text in `src/pages/blogPages.js`.
- **Phase 2B Programmatic Content Expansion**:
  - Expanded all 8 competitor comparison pages in `src/seo/programmaticPages.js` to 674 - 710 words each with comparative matrices, pros/cons boxes, and FAQ accordions.
- **Phase 2C High-Intent Use-Case Landing Spokes**:
  - Created `/use-case/youtube-voiceover` (605 words) and `/use-case/audiobook-generator` (679 words) landing spokes and added them to navigation, footer, and sitemaps.

---

## [1.2.0] - 2026-09-19

### Added / Fixed
- **Google Analytics 4 Custom Conversion Event Tracking**: Implemented non-blocking, PII-compliant custom conversion event tracking in `public/app.js` under GA4 Measurement ID `G-VXH6Y61FQ0`:
  - `generate_tts`: Triggered on successful voice synthesis completion (instant audio payload or multi-chunk async job completion). Captures safe parameters `selected_voice`, `text_length_bucket`, and `tone_style`.
  - `upload_file`: Triggered on successful document text extraction (`.txt`, `.docx`, `.pdf`). Captures safe parameter `file_type`.
  - `download_audio`: Triggered when user clicks/initiates MP3 audio download. Captures safe parameter `selected_voice`.
  - `contact_submit`: Triggered on successful contact form submission (`/api/contact`). Captures safe parameter `form_name`.
- **Global GA4 Command Queue Initialization (`window.gtag`)**: Fixed custom event dispatch reliability by initializing `window.dataLayer = window.dataLayer || []` and `window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); }` globally in `src/seo/gaSnippet.js` at startup before deferred `gtag.js` script load. Ensured `trackGA4Event()` in `public/app.js` dispatches via standard GA4 `window.gtag('event', ...)` command queue format.

---

## [1.1.0] - 2026-09-18

### Added / Deployed
- **Full Vercel to Cloudflare Migration**: Completed full production migration of TextToSpeechH AI platform from Vercel to Cloudflare Pages + Workers.
- **Cloudflare Authoritative DNS Activation**: Updated registrar nameservers at Hostinger to Cloudflare's assigned pair (`aurora.ns.cloudflare.com` & `bruce.ns.cloudflare.com`). Cloudflare Zone `texttospeechh.com` is active (`status: ACTIVE`).
- **Cloudflare Pages Production Deployment**: Deployed commit `0fab799` to Cloudflare Pages Production project `texttospeechh` (`https://texttospeechh.pages.dev`).
- **Cloudflare Socket Transport for EdgeProvider**: Integrated `cloudflare:sockets` TLS TCP socket transport into `src/providers/edge/edgeProvider.js`, enabling native Microsoft Neural Speech synthesis on Cloudflare Workers without external hosting or third-party proxy dependencies.
- **Cloudflare Pages Functions Router**: Built `functions/[[path]].js` catch-all serverless router translating Web Standard Request/Response into Node-style `(req, res)` handlers.
- **Cloudflare KV & R2 Storage Bindings**: Integrated `TTS_JOBS_KV` for asynchronous job metadata tracking and `TTS_AUDIO_R2` (`tts-audio-store`) for binary MP3 audio file persistence.
- **Apex 301 Edge Redirect**: Configured Cloudflare Single Redirect rule (`http.host == "texttospeechh.com"` -> `https://www.texttospeechh.com${http.request.uri.path}`).

### Verified (Production Verification)
- Tested on live production (`https://texttospeechh.com` & `https://www.texttospeechh.com`):
  - Homepage & Static Assets: `HTTP 200 OK` (`Server: cloudflare`, `cf-ray` active)
  - `/api/voices` & `/api/languages`: `HTTP 200 OK`
  - Hindi TTS (`hi-IN-MadhurNeural`): `HTTP 200 OK`, `state: COMPLETED`, `providerUsed: EdgeProvider`, 82,967 bytes Base64 MP3
  - English TTS (`en-US-GuyNeural`): `HTTP 200 OK`, `state: COMPLETED`, `providerUsed: EdgeProvider`, 78,359 bytes Base64 MP3
  - KV & R2 Storage Delivery: `HTTP 200 OK`, `Content-Type: audio/mpeg`, 63,648 bytes binary MP3 stream download
  - SEO Assets: `/robots.txt` (200 OK), `/sitemap.xml` (200 OK), `/ads.txt` (200 OK), Canonical URL `https://www.texttospeechh.com/`
  - Failure Case: `HTTP 400 Bad Request` on empty text parameter
  - Vercel Rollback Backup: Vercel production project retained intact as backup rollback infrastructure.

### Known Non-Critical Item
- **Microsoft Clarity Analytics Telemetry Warning**: Third-party script `https://www.clarity.ms/tag/xt0hsu1r65` emits a minor console error in browser devtools. Application functionality, voice listing, TTS synthesis, audio player, and downloads operate 100% cleanly without impact.

---

## [1.0.0] - 2026-08-07

### Added
- **AI-Native Project Intelligence System v2.1 Patched**:
  - `AGENTS.md`: Entry point and agent guide with repository identity, business philosophy, decision tree, 12-step workflow, safety rules, Source of Truth policy, **Intelligent Task Classification & Context Loading Protocol**, and **Continuous Repository Learning Protocol** (Section 7.1).
  - `CONTEXT.md`: Business mission, product purpose, target audience, revenue model, and strategic roadmap.
  - `SESSION.md`: Ephemeral working memory for active AI session state and handoff notes.
  - `PROJECT_STATE.md`: Single source of truth for permanent project state, deployment info, SEO metrics, and technical debt.
  - `TASKS.md`: Task backlog organized into 4 strict lanes (`TODO`, `IN PROGRESS`, `BLOCKED`, `COMPLETED`).
  - `CHANGELOG.md`: Structured release log adhering to Keep a Changelog.
  - `DECISIONS.md`: Architectural Decision Records (ADRs) and Lessons Learned database.
  - `docs/architecture.md`: System architecture guide featuring full ASCII runtime sequence diagram.
  - `docs/seo-system.md`: Documentation of the Hub-and-Spoke SEO engine, sitemaps, JSON-LD schemas, and IndexNow.
  - `docs/api-reference.md`: Serverless API endpoint reference.
  - `docs/deployment.md`: Vercel deployment guide, environment variable inventory, and step-by-step failure recovery workflow.
