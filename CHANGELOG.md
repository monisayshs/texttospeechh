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

## [1.4.1] - 2026-09-23

### Fixed
- **SEO Audit Fixes (Technical SEO Audit 2026-09-23)**:
  - Added `FAQPage` JSON-LD structured data to `/faq` (built from all 30 visible Q&As) and to the homepage FAQ accordion section (4 Q&As) — unlocks FAQ rich-result eligibility.
  - Added missing `<meta name="robots" content="index, follow">` to `/faq` for consistency.
  - Sitemap `lastmod` is now dynamic: `src/seo/sitemapGenerator.js` emits today's date on every generation instead of the hardcoded `2026-08-05`.
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
