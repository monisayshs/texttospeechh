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

## [Unreleased] - 2026-08-18

### Added
- **Homepage WebSite JSON-LD structured-data block** (`public/index.html`):
  - Added a static `<script type="application/ld+json">` block with `@type: WebSite`, `name: "TextToSpeechH AI"`, `alternateName: "TextToSpeechH"`, and `url: https://www.texttospeechh.com/`.
  - No `potentialAction` / `SearchAction` was added.
  - Existing `SoftwareApplication` and `Organization` JSON-LD blocks were not modified.
  - No sitemap, robots.txt, canonical, redirect, or indexing configuration was changed.

### Fixed
- **SEO title length fix for `/text-to-speech` pillar page**:
  - Reduced `<title>` and `<meta name="title">` from 81 characters to 59 characters to meet the 70-character SEO best-practice limit.
  - New title: `Text to Speech: AI Voice Synthesis Guide | TextToSpeechH AI`.
  - Source of truth updated in `src/pages/textToSpeechPillar.js`; `meta[name="title"]`, Open Graph, Twitter, Article JSON-LD `headline`, and canonical URL are synchronized automatically via `renderSeoPage()` in `src/api/seoHandler.js`.
  - Verified via local dev server (`node dev-server.js`) on `http://localhost:3000/text-to-speech`.

- **WebSite JSON-LD Schema Alignment** (`src/seo/schemaGenerator.js`):
  - Removed invalid `potentialAction` / `SearchAction` block targeting non-existent `/search?q=` endpoint across all server-rendered pages.
  - Added `alternateName: "TextToSpeechH"` to align `getWebSiteSchema()` with `public/index.html`.

- **Subpage & Comparison SEO Title Length Optimization**:
  - `src/pages/textToSpeechSubpages.js`: Trimmed titles on `/text-to-speech/free-text-to-speech` (72->67), `/text-to-speech/text-to-voice` (71->65), `/text-to-speech/word-to-speech` (71->59), and `/text-to-speech/txt-to-speech` (71->65) to strictly stay within the 70-character limit.
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
