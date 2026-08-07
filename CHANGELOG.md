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
| **Last Verified** | 2026-08-07 |
| **Verified Against** | Git history & inspected workspace state |
| **Related Documents** | [PROJECT_STATE.md](PROJECT_STATE.md), [DECISIONS.md](DECISIONS.md), [AGENTS.md](AGENTS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## [1.0.0] - 2026-08-07

### Added
- **AI-Native Project Intelligence System v2.1 Patched**:
  - `AGENTS.md`: Entry point and agent guide with repository identity, business philosophy, decision tree, 12-step workflow, safety rules, and Source of Truth policy.
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
