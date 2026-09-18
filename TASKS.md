# Task Backlog — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Backlog tracking organized into 4 strict lanes: TODO, IN PROGRESS, BLOCKED, COMPLETED |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Task start, progress milestone, blocker encountered, or task completion |
| **Update Frequency** | High — updated whenever task state changes |
| **Last Verified** | 2026-09-18 |
| **Verified Against** | Active workspace state & Cloudflare Pages production deployment |
| **Related Documents** | [SESSION.md](SESSION.md), [PROJECT_STATE.md](PROJECT_STATE.md), [AGENTS.md](AGENTS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. TODO (Pending Tasks)

*Tasks queued for upcoming sessions, ordered by priority (highest first):*

- [ ] **SEO Expansion**: Add Japanese (`/language/japanese`) and Korean (`/language/korean`) voice synthesis landing pages to `src/seo/programmaticPages.js` and `src/seo/sitemapGenerator.js`.
- [ ] **Automated Testing**: Implement a basic zero-dependency Node.js test script (`scripts/test-routes.js` using `node:test`) to verify all API endpoints and page renderers return 200/301 status.
- [ ] **FAQ Quality Enhancement**: Replace synthetic FAQ entries (`faq-25` to `faq-150` in `src/content/faqEngine.js`) with rich, high-intent user questions regarding audio licensing and commercial YouTube usage.
- [ ] **Core Web Vitals Optimization**: Inline critical path CSS from `public/style.css` into server-rendered HTML page head tags to reduce First Contentful Paint (FCP).
- [ ] **Build Process Auto-Versioning**: Update `package.json` build script to automatically append git commit hash to `style.css` asset query parameters.

---

## 2. IN PROGRESS (Active Work)

*Tasks currently being executed in the active session:*

- *(None currently in progress — post-migration master task completed)*

---

## 3. BLOCKED (Impeded Tasks)

*Tasks that cannot proceed due to external or technical dependencies:*

- *(None currently blocked)*

---

## 4. COMPLETED (Finished Tasks)

*Recently completed work items (kept for historical context):*

- [x] **Full Vercel to Cloudflare Platform Migration**:
  - Built `functions/[[path]].js` Pages Functions catch-all serverless router.
  - Built `cloudflare:sockets` EdgeProvider socket transport for Microsoft Neural Speech.
  - Configured Cloudflare KV (`TTS_JOBS_KV`) & R2 (`TTS_AUDIO_R2`) storage bindings.
  - Deployed commit `0fab799` to Cloudflare Pages Production (`texttospeechh.pages.dev`).
  - Activated Cloudflare Authoritative DNS (`aurora.ns.cloudflare.com` & `bruce.ns.cloudflare.com`).
  - Verified live production domain traffic (`texttospeechh.com` & `www.texttospeechh.com`), SSL, APIs, and TTS synthesis.
  - Retained Vercel production as zero-downtime backup rollback target.
- [x] **Repository Discovery & Analysis**: Inspected dev-server, Vercel router, providers, services, SEO engine, content handlers, and assets.
- [x] **Architecture v2.1 Design**: Designed 12-file vendor-neutral Markdown intelligence system architecture.
- [x] **IndexNow Postbuild Automation**: Implemented `scripts/notify-indexnow.js` with non-blocking error handling to notify Bing Webmaster on deployment.
- [x] **Hub-and-Spoke SEO Restructure**: Consolidated legacy routes into unified canonical `/text-to-speech/*` structure with 301 redirects.
- [x] **Multi-Provider Failover LoadBalancer**: Built `LoadBalancer.js` supporting Kokoro, CosyVoice, Edge, and Azure TTS with exponential backoff.
- [x] **Disk & KV Queue Processing**: Built `queueService.js` utilizing KV & R2 storage for long text synthesis on serverless.
- [x] **Deferred Telemetry Loading**: Updated GA4 (`G-VXH6Y61FQ0`) and Microsoft Clarity (`xt0hsu1r65`) loading scripts to prevent blocking initial render.
