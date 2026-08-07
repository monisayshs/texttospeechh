# System Architecture — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Technical design, subsystem breakdown, request execution flows, and architectural constraints |
| **Owner** | Repository Maintainers |
| **Update Trigger** | New core service added, TTS provider added/modified, routing architecture changed, security surface modified |
| **Update Frequency** | Low — updated when system architecture evolves |
| **Last Verified** | 2026-08-07 |
| **Verified Against** | `api/index.js`, `dev-server.js`, `src/services/*`, `src/providers/*`, `src/api/*` |
| **Related Documents** | [AGENTS.md](../AGENTS.md), [DECISIONS.md](../DECISIONS.md), [docs/api-reference.md](api-reference.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. High-Level Architecture & Runtime Sequence

TextToSpeechH AI operates as a zero-framework, serverless-optimized modular monolith on Vercel. In local development, `dev-server.js` provides parity with Vercel's edge routing.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                    public/index.html + app.js                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTING LAYER                                │
│  Local: dev-server.js (Node.js HTTP)                            │
│  Prod:  api/index.js (Vercel Serverless) + vercel.json routes   │
├─────────┬──────────┬──────────┬──────────┬─────────────────────┤
│ /api/*  │ /sitemap │ /faq,    │ /text-to │ /*  (static)        │
│         │          │ /guide/* │ -speech, │                     │
│         │          │          │ /blog,   │                     │
│         │          │          │ /about.. │                     │
├─────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ API     │ Sitemap  │ Content  │ SEO      │ Static File         │
│ Handlers│ Handler  │ Handler  │ Handler  │ Server (public/)    │
└────┬────┴──────────┴──────────┴──────────┴─────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────┐               │
│  │ Queue      │ │ Script       │ │ File        │               │
│  │ Service    │ │ Engine       │ │ Parser      │               │
│  │ (jobs,     │ │ (chunk text  │ │ (PDF, DOCX, │               │
│  │  /tmp disk)│ │  at sentence │ │  TXT)       │               │
│  │            │ │  boundaries) │ │             │               │
│  └─────┬──────┘ └──────────────┘ └─────────────┘               │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────────────────────────────────────┐               │
│  │           LOAD BALANCER (Failover)           │               │
│  │  Kokoro → CosyVoice → Edge (always fallback) │               │
│  └─────┬────────────┬────────────┬──────────────┘               │
│        ▼            ▼            ▼                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │ Kokoro   │ │ CosyVoice│ │ Edge     │                        │
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

### 2.1 Router Layer (`api/index.js` & `dev-server.js`)
- **Vercel Bridge**: Vercel routes non-static requests to `api/index.js`.
- **Path Parsing**: Uses `getRequestPathname(req)` checking `x-matched-path` and `x-forwarded-uri` headers to extract the target path under serverless proxies.
- **Diagnostic Error Routes**: Serves static HTML diagnostic templates (`get500Page()`, `get403Page()`, `get429Page()`, `get503Page()`) on exact pathname matches (`/500`, `/403`, etc.).
- **Handler Delegation Sequence**:
  1. Backend API: `/api/generate`, `/api/status`, `/api/upload`
  2. Sitemaps: `/sitemap.xml`, `/sitemap-main.xml`, `/sitemap-programmatic.xml`, `/sitemap-legal.xml`
  3. Content Handlers: `/faq`, `/guides/*`
  4. SEO & Legal Handlers: `/text-to-speech/*`, `/blog/*`, `/keyword/*`, `/language/*`, `/compare/*`, `/about`, `/privacy`, `/terms`, etc.
  5. 404 Fallback: Unmatched paths return `get404Page()`.

### 2.2 TTS Provider Engine (`src/providers/` & `src/services/loadBalancer.js`)
- **LoadBalancer Architecture**:
  - `LoadBalancer` manages a prioritized array of TTS providers: `[KokoroProvider, CosyVoiceProvider, EdgeProvider]`.
  - Failover Strategy: Attempts primary provider with 2 attempts and fast backoff (200ms, 500ms). If unavailable or throwing errors, transitions to next active provider.
  - Fallback: `EdgeProvider` (`msedge-tts`) is included as the final fallback.
- **Provider Specifications**:
  - **KokoroProvider**: Low-latency neural voice synthesis.
  - **CosyVoiceProvider**: High-expressiveness neural voice model.
  - **EdgeProvider**: Microsoft Edge Neural TTS API wrapper. Extremely fast, supports voices and regional accents.

### 2.3 Async Queue & Job Manager (`src/services/queueService.js`)
- **Long-Text Handling**: Vercel functions terminate after execution limits. Synthesizing long text in one synchronous HTTP request risks serverless timeouts.
- **Queue Solution**:
  1. Requests over threshold word limits are assigned a unique `jobId`.
  2. Text is passed to `scriptEngine.js` for sentence-boundary chunking.
  3. Job status and audio chunks are persisted in `/tmp/tts_jobs/<jobId>.json`.
  4. Frontend polls `/api/status?jobId=...` until processing reaches 100%.
  5. Audio buffers are merged via `audioPipeline.js` and returned as an MP3 stream.

### 2.4 File Parsing Engine (`src/services/fileParser.js`)
- **Lazy Dependency Loading**: Heavy file parsing libraries (`mammoth` for DOCX, `pdf-parse` for PDF) are required dynamically inside parsing functions rather than at module root. This avoids paying cold-start memory penalties on requests that do not involve file uploads.
- **Supported Formats**: `.txt` (plain text), `.docx` (Microsoft Word via mammoth HTML/text extraction), `.pdf` (PDF document via pdf-parse text extraction).

### 2.5 Security & Defense Surface (`src/services/securityService.js`)
- **Sliding Window Rate Limiter**: Restricts IP request rates in-memory to prevent automated API scraping and denial-of-service load spikes.
- **Input Bounds Sanitization**: Enforces maximum character lengths (10,000 words max per request) and strips script tags.
- **HTTP Security Headers**: Vercel injects HSTS (`max-age=63072000`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, and `Referrer-Policy` across routes via `vercel.json`.

---

## 3. Testing & Verification Architecture

- **Current Verification Model**: Manual dev-server testing via `node dev-server.js` (port 3000).
- **Automated Verification Target**: Zero-dependency route verification runner (planned in `TASKS.md` via `node:test`) to programmatically request API endpoints and verify status codes (200, 301, 404).
