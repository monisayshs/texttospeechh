# Permanent Project Memory & State — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Source of truth for repository status, environment state, SEO metrics, known issues, technical debt, and roadmap |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Version release, deployment, major feature completion, new technical debt discovery, roadmap update |
| **Update Frequency** | Medium — updated whenever permanent project state evolves |
| **Last Verified** | 2026-08-07 |
| **Verified Against** | `api/index.js`, `dev-server.js`, `vercel.json`, `src/services/*`, `src/providers/*`, `src/seo/*`, `public/*` |
| **Related Documents** | [AGENTS.md](AGENTS.md), [SESSION.md](SESSION.md), [TASKS.md](TASKS.md), [DECISIONS.md](DECISIONS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. System & Deployment Status

- **Project Version**: `1.0.0`
- **Production URL**: `https://www.texttospeechh.com`
- **Hosting Platform**: Vercel (Hobby Tier Serverless Functions v2)
- **Primary Domain**: `www.texttospeechh.com`
- **Production Health**: Operational (Implemented, Ready for Review)
- **Node.js Environment**: Node 18+ Runtime
- **Dev Environment Entry**: `node dev-server.js` (runs custom HTTP server on port 3000)

---

## 2. SEO & Webmaster Discovery Status

- **Google Search Console**: `TODO (Needs Verification)` (verify if domain property is connected)
- **Bing Webmaster Tools**: Configured (IndexNow Active)
- **IndexNow Integration**:
  - Key File: `public/b92a2552d2aec9f72edbb0f9b5671603.txt`
  - Key String: `b92a2552d2aec9f72edbb0f9b5671603`
  - Postbuild Automation: `scripts/notify-indexnow.js` (Triggers on `npm run postbuild` or `npm run indexnow`)
  - Endpoint Bridge: `/api/index-now` and `/indexnow`
- **Analytics & Telemetry**:
  - Google Analytics 4: `G-VXH6Y61FQ0` (Loaded deferred for performance)
  - Microsoft Clarity: `xt0hsu1r65` (Loaded deferred)
- **Sitemap Architecture**:
  - Index Sitemap: `https://www.texttospeechh.com/sitemap.xml`
  - Sub-Sitemap 1: `sitemap-main.xml` (Core pillar, hubs, tools)
  - Sub-Sitemap 2: `sitemap-programmatic.xml` (Keyword & language spoke pages)
  - Sub-Sitemap 3: `sitemap-legal.xml` (Legal & static pages)
- **AI Crawler & Discovery Policy**:
  - Robots Policy: `public/robots.txt` (Allows GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended)
  - LLM Documentation: `public/llms.txt` (AI-readable API & project overview)

---

## 3. Architecture & Subsystem State

- **TTS Engine Chain**:
  - Provider 1: Kokoro Provider (`src/providers/kokoro/kokoroProvider.js`)
  - Provider 2: CosyVoice Provider (`src/providers/cosyvoice/cosyvoiceProvider.js`)
  - Provider 3 (Fallback): Edge TTS Provider (`src/providers/edge/edgeProvider.js` using `msedge-tts`)
- **Queue & Async Processing**:
  - Memory & Disk State: `/tmp/tts_jobs` (Serverless-compatible persistent job store)
  - Status Polling: `/api/status` endpoint
- **Security & Sanitization**:
  - Rate Limiting: Memory-backed sliding window in `src/services/securityService.js`
  - File Validation: Native extension check (`mammoth` for DOCX, `pdf-parse` for PDF, plain text)
- **SEO & Content System**:
  - Hub & Spoke Engine: `src/seo/programmaticPages.js` & `src/api/seoHandler.js`
  - FAQ Engine: `src/content/faqEngine.js` (Contains FAQ Q&A pairs)
  - Schema Generator: `src/seo/schemaGenerator.js` (JSON-LD Organization, SoftwareApplication, FAQ, BreadcrumbList, Article)

---

## 4. Known Technical Debt & Deficiencies

> [!WARNING]
> The following issues represent acknowledged technical debt. Review before refactoring related modules.

1. **Synthetic FAQ Variation**: FAQ entries `faq-25` through `faq-150` in `src/content/faqEngine.js` contain repetitive mechanical string variations designed for keyword coverage. Needs replacement with richer curated queries.
2. **Lack of Automated Unit Tests**: The repository relies on manual verification and dev-server testing (`dev-server.js`). Needs a lightweight test runner (e.g., Node test runner / `node:test`).
3. **In-Memory Rate Limiting**: `securityService.js` uses an in-memory Map for rate limiting. In Vercel serverless multi-instance deployments, rate limits are isolated per function instance. Future fix: KV store integration if abuse occurs.
4. **CSS Cache Version Tagging**: Cache-busting tag `style.css?v=8.2.0` in HTML templates is updated manually rather than automatically during build.

---

## 5. Strategic Project Roadmap

### Phase 1: Core Foundation (Implemented)
- [x] Multi-provider load balancer (Kokoro → CosyVoice → Edge)
- [x] Serverless-friendly file parsing (`pdf-parse`, `mammoth`)
- [x] Async job queue with `/tmp/` persistence
- [x] Programmatic Hub-and-Spoke SEO engine & 301 redirect map
- [x] FAQ engine & JSON-LD schema suite
- [x] IndexNow postbuild automation script

### Phase 2: Intelligence & Optimization (In Progress)
- [/] Universal AI-Native Project Intelligence System v2.1 Patched
- [ ] Core Web Vitals optimization (CSS inline critical path, JS bundle split)
- [ ] Automated route & API endpoint test runner

### Phase 3: Creator Features & Expansion (Planned — TODO: Needs Verification)
- [ ] Advanced SSML / Pitch / Speed controls in UI
- [ ] Additional localized spoken languages (Japanese, Korean spoke pages)
- [ ] Web Audio API visualizer & waveform editor
