# Permanent Project Memory & State — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Source of truth for repository status, environment state, SEO metrics, known issues, technical debt, and roadmap |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Version release, deployment, major feature completion, new technical debt discovery, roadmap update |
| **Update Frequency** | Medium — updated whenever permanent project state evolves |
| **Last Verified** | 2026-09-22 |
| **Verified Against** | `functions/[[path]].js`, `wrangler.toml`, `src/providers/edge/edgeProvider.js`, `src/seo/hreflangMap.js` |
| **Related Documents** | [AGENTS.md](AGENTS.md), [SESSION.md](SESSION.md), [TASKS.md](TASKS.md), [DECISIONS.md](DECISIONS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. System & Deployment Status

- **Project Version**: `1.5.0`
- **Production URL**: `https://www.texttospeechh.com`
- **Hosting Platform**: Cloudflare Pages + Workers (Project `texttospeechh`) with Vercel Rollback Target
- **Primary Domain**: `www.texttospeechh.com`
- **Authoritative DNS**: Cloudflare DNS (`aurora.ns.cloudflare.com`, `bruce.ns.cloudflare.com`)
- **Cloudflare Zone Status**: **ACTIVE** (Zone ID: `517b6807c6949698a3bba05a0ca7bde0`)
- **Production Health**: Operational (`EdgeProvider` via `cloudflare:sockets`, KV & R2 Storage verified 100%)
- **Node.js Environment**: Node 18+ Runtime / `nodejs_compat` (Date `2026-08-19`)
- **Dev Environment Entry**: `node dev-server.js` (runs custom HTTP server on port 3000)

---

## 2. SEO & Webmaster Discovery Status

- **Google Search Console**: Preserved verification TXT token `google-site-verification=lxQ4hGS4qhOVlzh3p153RFZBufGkzo3Fx0CzjMha-bk`
- **Bing Webmaster Tools**: Configured (IndexNow Active)
- **IndexNow Integration**:
  - Key File: `public/b92a2552d2aec9f72edbb0f9b5671603.txt`
  - Key String: `b92a2552d2aec9f72edbb0f9b5671603`
  - Postbuild Automation: `scripts/notify-indexnow.js`
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
  - Primary Provider: Edge TTS Provider (`src/providers/edge/edgeProvider.js` using `cloudflare:sockets` TLS transport for Microsoft Neural Speech)
  - Fallback Provider 1: Kokoro Provider (`src/providers/kokoro/kokoroProvider.js`)
  - Fallback Provider 2: CosyVoice Provider (`src/providers/cosyvoice/cosyvoiceProvider.js`)
  - Fallback Provider 3: Azure Provider (`src/providers/azure/azureProvider.js`)
- **Cloud Storage & Queue Processing**:
  - Job Metadata Storage: Cloudflare KV Namespace (`TTS_JOBS_KV`, ID `d63d268287be400a9e8f45858647619c`)
  - Binary Audio Storage: Cloudflare R2 Bucket (`TTS_AUDIO_R2`, Bucket `tts-audio-store`)
  - Status Polling: `/api/status` endpoint
- **Security & Sanitization**:
  - Rate Limiting: Memory-backed sliding window in `src/services/securityService.js`
  - File Validation: Native extension check (`mammoth` for DOCX, `pdf-parse` for PDF, plain text)
- **SEO & Content System**:
  - Hub & Spoke Engine: `src/seo/programmaticPages.js` & `src/api/seoHandler.js`
  - FAQ Engine: `src/content/faqEngine.js`
  - Schema Generator: `src/seo/schemaGenerator.js`

---

## 4. Known Technical Debt & Deficiencies

1. **Synthetic FAQ Variation**: FAQ entries `faq-25` through `faq-150` in `src/content/faqEngine.js` contain repetitive mechanical string variations designed for keyword coverage.
2. **Lack of Automated Unit Tests**: Relies on manual verification and dev-server testing (`dev-server.js`).
3. **In-Memory Rate Limiting**: `securityService.js` uses an in-memory Map for rate limiting. In Cloudflare Workers multi-instance deployments, rate limits are isolated per worker instance.

---

## 5. Strategic Project Roadmap

### Phase 1: Core Foundation & Cloudflare Migration (Implemented & Active)
- [x] Multi-provider load balancer (`EdgeProvider` with `cloudflare:sockets` → Kokoro → CosyVoice → Azure)
- [x] Cloudflare Pages + Workers serverless catch-all router (`functions/[[path]].js`)
- [x] Cloudflare KV (`TTS_JOBS_KV`) & R2 (`TTS_AUDIO_R2`) audio persistence
- [x] Cloudflare DNS Zone activation (`aurora.ns.cloudflare.com`, `bruce.ns.cloudflare.com`)
- [x] Programmatic Hub-and-Spoke SEO engine & 301 redirect map
- [x] FAQ engine & JSON-LD schema suite

### Phase 2: Intelligence & Optimization (In Progress)
- [/] Universal AI-Native Project Intelligence System v2.1
- [ ] Core Web Vitals optimization (CSS inline critical path, JS bundle split)
- [ ] Automated route & API endpoint test runner
