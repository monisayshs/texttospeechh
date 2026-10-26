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

- **Project Version**: `1.6.0`
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
- **Latest Blog Route (2026-10-26)**: `/text-to-speech/blog/funny-text-to-speech` published ("funny text to speech" 590/mo + "text to speech funny" 210/mo USA, LOW, Planner-verified; "20% voice, 80% writing" deadpan angle + celebrity-voice commercial-use catch; completes the humour cluster with robot-voice-generator, Twitch and Discord guides); internal links to robot-voice-generator, twitch-text-to-speech-guide, discord-text-to-speech-guide, tiktok-text-to-speech, /text-to-speech; sitemap auto-includes it via `BLOG_ARTICLES_LIST`/`BLOG_ARTICLES_MAP` in `src/pages/textToSpeechBlogHub.js`. Blog now carries 61 listed / 59 mapped articles. Same day: `/text-to-speech/blog/best-italian-text-to-speech-tools` published ("italian text to speech" 110/mo + "text to speech italian" 40/mo + "italian accent generator" 210/mo USA, LOW, Planner-verified; double-consonant + word-stress honesty angle; built to lift the `/language/italian` page from ~pos 72); internal links to /language/italian (×3), best-french-text-to-speech-tools, best-spanish-text-to-speech-tools, best-arabic-text-to-speech-tools, best-free-text-to-speech-tools; sitemap auto-includes it via `BLOG_ARTICLES_LIST`/`BLOG_ARTICLES_MAP` in `src/pages/textToSpeechBlogHub.js`. Blog now carries 60 listed / 58 mapped articles. Same day: `/text-to-speech/blog/text-to-speech-chromebook-guide` published ("text to speech chromebook" 480/mo USA, LOW, Planner-verified; Select to Speak steps + ChromeVox warning + honest built-in limits + browser AI-voice upgrade; completes the Mac/Windows/Chromebook device series); internal links to /text-to-speech (×2), read-aloud-chrome-extensions, windows-text-to-speech-guide, mac-text-to-speech-guide, best-free-text-to-speech-tools; sitemap auto-includes it via `BLOG_ARTICLES_LIST`/`BLOG_ARTICLES_MAP` in `src/pages/textToSpeechBlogHub.js`. Blog now carries 59 listed / 57 mapped articles. Same day: `/text-to-speech/blog/best-french-text-to-speech-tools` published ("french text to speech" 590/mo + "text to speech french" 210/mo USA, LOW, Planner-verified; silent-letter/liaison honesty angle + European vs Canadian French breakdown; supports the `/language/french` page at ~pos 17); internal links to /language/french (×3), best-spanish-text-to-speech-tools, best-arabic-text-to-speech-tools, best-free-text-to-speech-tools; sitemap auto-includes it via `BLOG_ARTICLES_LIST`/`BLOG_ARTICLES_MAP` in `src/pages/textToSpeechBlogHub.js`. Blog now carries 58 listed / 56 mapped articles. Same day: `/text-to-speech/blog/best-spanish-text-to-speech-tools` published ("spanish text to speech" 1,300/mo USA, LOW, Planner-verified; accent-honesty guide angle — Mexican vs Castilian vs US Spanish; twin of the Arabic tools guide, the site's #2 page); internal links to /language/spanish (×3), best-arabic-text-to-speech-tools, best-free-text-to-speech-tools; sitemap auto-includes it via `BLOG_ARTICLES_LIST`/`BLOG_ARTICLES_MAP` in `src/pages/textToSpeechBlogHub.js`. Blog now carries 57 listed / 55 mapped articles. Previous (2026-10-25): `/text-to-speech/blog/robot-voice-generator` published ("robot voice generator" 6,600/mo USA, LOW; ~10,500/mo all-LOW cluster; SERP = tool pages only, guide gap); internal links to /text-to-speech, twitch-text-to-speech-guide, best-ai-voice-changers; sitemap auto-includes it via `BLOG_ARTICLES_LIST`/`BLOG_ARTICLES_MAP` in `src/pages/textToSpeechBlogHub.js`. Blog now carries 56 listed / 54 mapped articles. Same day: `/text-to-speech/blog/twitch-text-to-speech-guide` ("twitch text to speech" 2,900/mo USA, LOW + twitch tts 2,900 LOW cluster). Previous (2026-10-24): `/text-to-speech/blog/audioshake-studio-guide` (AudioShake creator-workflow guide promised to Jeffrey/AudioShake; honest first-party test findings incl. two-speaker failure + re-test/update promise line); earlier same day: `/text-to-speech/blog/british-accent-generator` ("british accent generator" 1,300/mo USA, LOW + supporting British TTS cluster, all LOW).
- **Blog Consolidation (2026-10-22)**: the duplicate Oct 5 guide `/text-to-speech/blog/tiktok-text-to-speech-guide` was removed from the blog list/map and 301-redirected to `/text-to-speech/blog/tiktok-text-to-speech` (`public/_redirects` + `OLD_BLOG_REDIRECTS` in `src/seo/programmaticPages.js`); all internal links repointed to the new slug.
- **SEO Audit Phase 1 Fixes (2026-10-26)**: full-site audit scored 72/100 (report in `~/workspace/texttospeechh-audit/`); the five user-approved Phase 1 fixes are live: (1) `renderSeoPage` renders a visible FAQ accordion whenever an article's `faqs` array feeds FAQPage schema but the body lacks it (22 articles of the Oct 14–26 batch fixed at template level); (2) Article schema dates are ISO-8601 via `toISODate()` in `src/seo/schemaGenerator.js`, and both `/guide/*` Articles now carry dates from guide data fields; (3) the 3 formerly orphan use-case pages (podcast-generator, elearning-narration, tiktok-voiceover) are linked from the global footer; (4) the CapCut guide's 404 internal link repointed to `text-to-speech-for-youtube`; (5) `functions/[[path]].js` emits security headers + CSP on all function responses (the `public/_headers` block only ever reached static assets) and edge-caches anonymous GET HTML in the Cache API (s-maxage=3600, stale-while-revalidate=86400).

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
