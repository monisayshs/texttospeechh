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
