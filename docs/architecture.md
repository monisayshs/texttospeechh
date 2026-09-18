# System Architecture — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Technical design, subsystem breakdown, request execution flows, and architectural constraints |
| **Owner** | Repository Maintainers |
| **Update Trigger** | New core service added, TTS provider added/modified, routing architecture changed, security surface modified |
| **Update Frequency** | Low — updated when system architecture evolves |
| **Last Verified** | 2026-09-18 |
| **Verified Against** | `functions/[[path]].js`, `wrangler.toml`, `src/services/*`, `src/providers/*`, `src/api/*` |
| **Related Documents** | [AGENTS.md](../AGENTS.md), [DECISIONS.md](../DECISIONS.md), [docs/api-reference.md](api-reference.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. High-Level Architecture & Runtime Sequence

TextToSpeechH AI operates as a zero-framework, serverless-optimized modular monolith deployed to **Cloudflare Pages + Workers** with authoritative Cloudflare DNS (`aurora.ns.cloudflare.com` & `bruce.ns.cloudflare.com`). In local development, `dev-server.js` provides parity with serverless routing. Vercel is retained as a zero-downtime backup rollback target.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                    public/index.html + app.js                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING LAYER                                │
│  Local: dev-server.js (Node.js HTTP port 3000)                  │
│  Prod:  functions/[[path]].js (Cloudflare Pages Functions)      │
│         + public/_headers & public/_redirects                  │
├─────────┬──────────┬──────────┬──────────┬─────────────────────┤
│ /api/*  │ /sitemap │ /faq,    │ /text-to │ /*  (static)        │
│         │          │ /guide/* │ -speech, │                     │
│         │          │          │ /blog,   │                     │
│         │          │          │ /about.. │                     │
├─────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ API     │ Sitemap  │ Content  │ SEO      │ Cloudflare Pages    │
│ Handlers│ Handler  │ Handler  │ Handler  │ Edge CDN (public/)  │
└────┬────┴──────────┴──────────┴──────────┴─────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────┐               │
│  │ Queue      │ │ Script       │ │ File        │               │
│  │ Service    │ │ Engine       │ │ Parser      │               │
│  │ (KV metadata│ │ (chunk text  │ │ (PDF, DOCX, │               │
│  │  R2 audio) │ │  at sentence │ │  TXT)       │               │
│  │            │ │  boundaries) │ │             │               │
│  └─────┬──────┘ └──────────────┘ └─────────────┘               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────────────────────────────────────┐               │
│  │           LOAD BALANCER (Failover)           │               │
│  │  Edge (cloudflare:sockets) → Kokoro → Cosy   │               │
│  └─────┬────────────┬────────────┬──────────────┘               │
│        ▼            ▼            ▼                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Edge     │ │ Kokoro   │ │ Cosy     │                        │
│  │ Provider │ │ Provider │ │ Provider │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│        │            │            │                               │
│        └────────────┴────────────┘                               │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────┐               │
│  │         AUDIO PIPELINE (merge chunks)         │               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                       MP3 Audio Response
```

---

## 2. Layer & Subsystem Breakdown

### 2.1 Router Layer (`functions/[[path]].js` & `dev-server.js`)
- **Cloudflare Pages Functions Bridge**: Cloudflare Pages routes requests through `functions/[[path]].js`.
- **Socket Transport Initialization**: Exports `connect` from `cloudflare:sockets` and binds to `globalThis.cfConnect` for worker isolates.
- **Request Bridge**: Translates Web Standard `Request` and `Response` objects into Node-style `(req, res)` mock objects to execute CommonJS API handlers without rewriting existing business logic.
- **Handler Delegation Sequence**:
  1. Backend API: `/api/generate`, `/api/status`, `/api/upload`, `/api/voices`, `/api/languages`, `/api/jobs`
  2. Sitemaps: `/sitemap.xml`, `/sitemap-main.xml`, `/sitemap-programmatic.xml`, `/sitemap-legal.xml`
  3. Content Handlers: `/faq`, `/guides/*`
  4. SEO & Legal Handlers: `/text-to-speech/*`, `/blog/*`, `/keyword/*`, `/language/*`, `/compare/*`, `/about`, `/privacy`, `/terms`, etc.
  5. 404 Fallback: Unmatched paths return custom `get404Page()`.

### 2.2 TTS Provider Engine (`src/providers/` & `src/services/loadBalancer.js`)
- **LoadBalancer Architecture**:
  - `LoadBalancer` manages a prioritized array of TTS providers: `[EdgeProvider, KokoroProvider, CosyVoiceProvider, AzureProvider]`.
  - Primary Provider: `EdgeProvider` using `cloudflare:sockets` TLS TCP socket transport connecting directly to Microsoft Speech API (`speech.platform.bing.com`).
  - Failover Strategy: Attempts primary provider with fast backoff. If unavailable or throwing errors, transitions seamlessly to fallback providers.
- **Provider Specifications**:
  - **EdgeProvider**: Microsoft Edge Neural TTS wrapper using `cloudflare:sockets` on Cloudflare Workers and `ws`/`msedge-tts` on Node.js local environments.
  - **KokoroProvider**: Low-latency neural voice synthesis.
  - **CosyVoiceProvider**: High-expressiveness neural voice model.
  - **AzureProvider**: Azure Speech REST API commercial fallback.

### 2.3 Cloud Storage & Job Manager (`src/services/queueService.js`)
- **KV & R2 Storage Integration**:
  - `TTS_JOBS_KV` (KV Namespace ID `d63d268287be400a9e8f45858647619c`): Persists job metadata (`queued`, `processing`, `completed`, `failed`).
  - `TTS_AUDIO_R2` (R2 Bucket `tts-audio-store`): Persists binary MP3 audio buffers.
  - Status & Download: Frontend polls `/api/status?jobId=...` and streams binary MP3 via `/api/status?jobId=...&download=true`.

### 2.4 Security & Defense Surface (`src/services/securityService.js` & Edge Headers)
- **Sliding Window Rate Limiter**: Restricts IP request rates in-memory to prevent automated API scraping.
- **Input Bounds Sanitization**: Enforces maximum character lengths (10,000 words max per request) and strips script tags.
- **Edge Security Headers**: Injected via `public/_headers` (HSTS `max-age=63072000`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`).

---

## 3. Testing & Verification Architecture

- **Verification Suite**: `scripts/` diagnostic runners used to verify endpoints, socket framing, KV/R2 persistence, and live domain health.
- **Rollback Safety Net**: Vercel project `texttospeechh` retained as zero-downtime backup infrastructure.
