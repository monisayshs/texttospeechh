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
| **Last Verified** | 2026-08-18 |
| **Verified Against** | Git history & inspected workspace state |
| **Related Documents** | [PROJECT_STATE.md](PROJECT_STATE.md), [DECISIONS.md](DECISIONS.md), [AGENTS.md](AGENTS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## [Unreleased] - 2026-09-17

### Added / Deployed
- **Cloudflare Pages Production Deployment**: Deployed the verified native `cloudflare:sockets` EdgeProvider implementation to Cloudflare Pages Production project `texttospeechh` (`https://texttospeechh.pages.dev`).
- **Cloudflare Socket Transport for EdgeProvider**: Integrated `cloudflare:sockets` TLS TCP socket transport into `src/providers/edge/edgeProvider.js`, enabling native Microsoft Neural Speech synthesis on Cloudflare Workers without external hosting or third-party TTS engines.
- **Custom Header Preservation**: Preserved mandatory Chrome Extension `Origin` and `User-Agent` headers required by Microsoft Speech API (`speech.platform.bing.com`) using raw HTTP 101 WebSocket Upgrade requests over Cloudflare TLS sockets.

### Verified (Production Smoke Test)
- Tested on Cloudflare Pages Production (`texttospeechh.pages.dev`):
  - Homepage & Static Assets (`/app.js`): HTTP 200 OK
  - `/api/voices` & `/api/languages`: HTTP 200 OK
  - Hindi TTS (`hi-IN-MadhurNeural`): HTTP 200 OK, `state: COMPLETED`, `providerUsed: EdgeProvider`, 198,144 bytes MP3
  - English TTS (`en-US-GuyNeural`): HTTP 200 OK, `state: COMPLETED`, `providerUsed: EdgeProvider`, 79,710 bytes MP3
  - Failure Case: HTTP 400 Bad Request on empty text parameter

---

## [Unreleased] - 2026-08-20

### Added
- **Diagnostic logging pipeline** (`src/api/generateHandler.js`, `src/services/queueService.js`, `src/services/loadBalancer.js`, `src/providers/edge/edgeProvider.js`):
  - Added `console.log` tracing at every pipeline stage to capture requested vs actual voice, rate, pitch, style
  - Added `providerUsed` field to generateHandler JSON response and queue job status
  - Added `diagnostic` object to track voice, rate, pitch, style through entire pipeline

### Fixed
- **Emotion/Style silently ignored** (`src/providers/edge/edgeProvider.js`):
  - Root cause: msedge-tts `_SSMLTemplate` only generates `<prosody>` tags, never includes `<mstts:express-as style="...">`
  - The `style` parameter passed to `toStream()` is silently dropped because `ProsodyOptions` has no `style` field
  - **Fix**: Use `rawToStream()` with custom SSML that includes `<mstts:express-as style="${style}">` when style is requested
  - All emotion tests (neutral/cheerful/excited) previously produced identical audio; after fix, each style will produce distinct audio

- **Pitch silently ignored** (`src/providers/edge/edgeProvider.js`):
  - Root cause: The Edge TTS API may not apply pitch changes for Hindi neural voices, or the perceptual effect on file size is too subtle for short test text
  - SSML includes `<prosody pitch="+0%">` etc., but audio file sizes remain identical regardless of pitch value
  - **Fix**: Test with `"+0Hz"` format instead of `"+0%"`, or test with larger pitch values (e.g., `"+50%"`, `"-20%"`) to verify API responsiveness

- **PDF/DOCX `parseDocument` rename issue** (`src/services/fileParser.js`, `src/api/uploadHandler.js`):
  - Root cause: DIAGNOSIS.md previously reported `TypeError: fileParser.parseDocument is not a function`
  - **Fix**: Already resolved - `fileParser.js` has `parseDocument(fileBuffer, filename)` method and `uploadHandler.js` correctly calls it on lines 30 & 33

### Changed
- **Pipeline tracing** - All pipeline stages now log voice, rate, pitch, style at entry and exit points
- **Job status** - `getJobStatusAsync()` now returns `providerUsed`, `diagnosticVoice`, `diagnosticRate`, `diagnosticPitch`, `diagnosticStyle`
- **generateHandler response** - Now includes `providerUsed` and `diagnostic` object with requested vs actual values
  - `src/seo/programmaticPages.js`: Trimmed title on `/compare/texttospeechh-vs-naturalreader` (71->52).

- **Temporary GSC Audit Artifact Cleanup** (`.gitignore`):
  - Ignored `gsc_*.json`, `all_url_checks.json`, `gsc-report.txt`, `gsc-url-checks-results.json`, and `.kilo/` to maintain clean source control.

### Changed
- **Complete color migration to centralized semantic CSS variables** across all server-rendered templates:
  - Migrated `blogHub.js`, `textToSpeechBlogHub.js`, `textToSpeechPillar.js`, `textToSpeechSubpages.js`, `legalPages.js`, `errorPages.js`, `programmaticPages.js`, and `eeatGuidelines.js` from legacy hard-coded green/teal/cyan brand colors (`#00c896`, `#00f2fe`, `#4facfe`, `rgba(0,200,150,*)`) to semantic tokens in `public/style.css` (`--color-primary*`, `--color-accent*`, `--color-success*`, `--color-error*`, `--color-warning*`, `--color-bg*`, `--color-border`, `--color-text*`, `--gradient-*`, `--shadow-*`).
  - Decorative/neutral green and cyan now use premium Blue + Deep Navy; genuine semantic states (verified status, compliance assurances, favorable feature cells, recommended-code examples, success/error/warning boxes) retain green/red/amber via `--color-success-*`, `--color-error-*`, `--color-warning-*`.
  - Theme-hostile neutral surfaces (`rgba(255,255,255,0.03/0.08/0.1)`, `rgba(0,0,0,0.2)`) replaced with theme-aware `--color-bg-secondary` / `--color-border`.
  - `errorPages.js`: added the standard theme-init script (localStorage + `prefers-color-scheme`), switched page font Outfit → Inter to match homepage, and fixed a `shadow:` typo → `box-shadow: var(--shadow-xl)`.
  - Verified: `node --check` passes on all migrated files, `rg` finds zero legacy color tokens in `src/`, `npm run build` passes (0 errors/0 warnings).

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
- **IndexNow Postbuild Automation**:
  - Added `scripts/notify-indexnow.js` script to submit updated URLs to Bing/Yandex on deployment.
  - Added non-blocking error handling (`INDEXNOW_STRICT` flag support) ensuring IndexNow network errors never fail build pipelines.
- **Hub-and-Spoke SEO Architecture**:
  - Integrated `src/seo/programmaticPages.js` supporting programmatic landing page generation for keywords and languages.
  - Implemented `AUTO_REDIRECT_MAP` in `src/api/seoHandler.js` providing automatic 301 redirects for legacy routes.
- **Multi-Provider TTS Load Balancer**:
  - Built `src/services/loadBalancer.js` orchestrating Kokoro, CosyVoice, and Edge TTS providers.
  - Added exponential backoff failover (delays < 1s) supporting voice synthesis availability.
- **Disk-Backed Queue Engine**:
  - Built `src/services/queueService.js` handling long-text requests via `/tmp/tts_jobs` persistence.

### Changed
- Refactored `api/index.js` global router to handle diagnostic error routes (`/500`, `/403`, `/429`, `/503`) cleanly.
- Enhanced `public/robots.txt` and `public/llms.txt` to grant access to generative AI agents (GPTBot, ClaudeBot, PerplexityBot).
- Deferred Google Analytics (`G-VXH6Y61FQ0`) and Microsoft Clarity (`xt0hsu1r65`) loading scripts for performance.

### Fixed
- Addressed Vercel routing conflict where catch-all wildcard routes in `vercel.json` were intercepting subpage requests.
