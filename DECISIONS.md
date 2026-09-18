# Architectural Decisions & Lessons Learned — TextToSpeechH AI

This document serves as the institutional memory of the repository. It records major Architectural Decision Records (ADRs) and Lessons Learned from past bugs, production incidents, and design evaluations so that future AI agents and developers avoid repeating past mistakes.

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Permanent log of architectural decisions (ADRs) and production lessons learned |
| **Owner** | Repository Maintainers |
| **Update Trigger** | New architectural decision made, production incident resolved, or critical bug root cause analyzed |
| **Update Frequency** | Low-Medium — updated whenever a structural decision or post-mortem occurs |
| **Last Verified** | 2026-09-18 |
| **Verified Against** | `functions/[[path]].js`, `wrangler.toml`, `src/providers/edge/edgeProvider.js`, `src/services/*` |
| **Related Documents** | [AGENTS.md](AGENTS.md), [docs/architecture.md](docs/architecture.md), [docs/deployment.md](docs/deployment.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. Architectural Decision Records (ADRs)

### ADR-001: Raw Node.js HTTP Server Over Express Framework
- **Date**: 2026-07-15
- **Status**: Accepted
- **Context**: Vercel Serverless Functions have strict execution memory budgets and cold-start speed limits. Express or Fastify frameworks add package overhead and cold-start delay per function invocation.
- **Decision**: Use native Node.js HTTP handlers (`http.createServer` in `dev-server.js` and standard `(req, res) => {}` function exports in `api/*.js`).
- **Consequences**: Slightly more manual request path parsing (`getRequestPathname`), but cold starts are minimized and zero extra npm dependencies are required for routing.

---

### ADR-002: Multi-Provider TTS Failover Chain with Edge Fallback
- **Date**: 2026-07-20
- **Status**: Accepted
- **Context**: Relying on a single third-party TTS provider creates single-point-of-failure vulnerabilities. Commercial AI voice providers frequently rate-limit or experience brief regional outages.
- **Decision**: Implement a LoadBalancer (`src/services/loadBalancer.js`) that sequences Edge TTS → Kokoro → CosyVoice → Azure TTS. Edge TTS (`msedge-tts` / `cloudflare:sockets`) is treated as the primary high-speed engine.
- **Consequences**: Voice synthesis availability is increased. If primary synthesis fails, requests transition to fallback engines without throwing errors to users.

---

### ADR-003: Disk & Cloud-Backed Queue Management via KV & R2
- **Date**: 2026-07-25 (Updated 2026-09-18)
- **Status**: Accepted
- **Context**: Long-text TTS requests exceed default serverless execution timeouts. Storing job state in memory fails because serverless function instances are stateless and transient.
- **Decision**: Store long-form synthesis jobs in Cloudflare KV (`TTS_JOBS_KV`) for metadata and Cloudflare R2 (`TTS_AUDIO_R2`) for binary MP3 audio persistence. Fallback to `/tmp/tts_jobs` in local development.
- **Consequences**: Long-text generation and streaming audio downloads work seamlessly across globally distributed serverless isolates.

---

### ADR-004: Universal Vendor-Neutral Markdown Intelligence System
- **Date**: 2026-08-07
- **Status**: Accepted
- **Context**: Vendor-specific AI configurations (e.g. `.cursorrules`, `.claude/`) lock repository intelligence to specific tools and fragment rules across multiple proprietary files.
- **Decision**: Standardize all AI intelligence on root Markdown documents anchored by `AGENTS.md` and a single `docs/` knowledge folder.
- **Consequences**: AI coding assistants (ChatGPT, Claude, Gemini, DeepSeek, Cursor, Windsurf, Aider) read and adhere to the project system without custom plugins.

---

### ADR-005: Platform Migration to Cloudflare Pages + Workers with `cloudflare:sockets`
- **Date**: 2026-09-18
- **Status**: Accepted
- **Context**: Moving from Vercel to Cloudflare Edge required socket transport for Bing Speech API WebSocket connections, as standard WebSocket constructors are restricted in serverless worker isolates.
- **Decision**: Implement `cloudflare:sockets` TLS TCP socket transport in `EdgeProvider` (`src/providers/edge/edgeProvider.js`) bridged via `functions/[[path]].js` (`globalThis.cfConnect`). Point authoritative DNS nameservers to Cloudflare (`aurora.ns.cloudflare.com` & `bruce.ns.cloudflare.com`).
- **Consequences**: Global edge performance, native WebSocket streaming, zero third-party proxy dependencies, and retaining Vercel production as a backup rollback target.

---

## 2. Lessons Learned & Incident Database

### LESSON-001: IndexNow Must Never Block Deployment Pipelines
- **Date**: 2026-08-02
- **Category**: Deployment / Postbuild
- **Incident Summary**: A DNS failure on Bing's IndexNow API endpoint during postbuild execution caused `scripts/notify-indexnow.js` to throw an unhandled exception. Node.js exited with code `1`, causing Vercel to fail the production build deployment.
- **Root Cause**: The postbuild script made synchronous HTTP requests without wrapping execution in a top-level try/catch handler.
- **Permanent Rule**: Post-deployment notification scripts (IndexNow, pinging webmasters) are **best-effort secondary tasks**. They must always catch exceptions, log warnings, and exit with code `0`.
- **Fix Implemented**: Added top-level try/catch in `scripts/notify-indexnow.js` and introduced optional `INDEXNOW_STRICT=true` environment flag for local testing.

---

### LESSON-002: Vercel & Cloudflare Edge Route Order Priority
- **Date**: 2026-08-05 (Updated 2026-09-18)
- **Category**: SEO / Routing
- **Incident Summary**: Adding a broad `/blog/(.*)` rewrite entry before static file definitions caused static assets to be intercepted by dynamic API handlers.
- **Root Cause**: Route rules evaluate sequentially. Broad regex patterns catch requests before lower static file patterns are evaluated.
- **Permanent Rule**: Route tables (`vercel.json`, `public/_redirects`, `functions/[[path]].js`) must evaluate static file extensions and specific API routes before dynamic catch-all SSR routes.
- **Fix Implemented**: Reordered routes tables and added `STATIC_EXTENSIONS` set check in `functions/[[path]].js`.

---

### LESSON-003: 301 Redirect Equity Preservation
- **Date**: 2026-07-28
- **Category**: SEO
- **Incident Summary**: Renaming `/keyword/free-text-to-speech` to `/text-to-speech/free-text-to-speech` without a redirect rule caused Google Search Console to register 404 crawl errors.
- **Root Cause**: URL structure refactoring without mapping legacy routes to new canonical targets.
- **Permanent Rule**: Never remove or change a public URL path without adding a 301 permanent redirect mapping in `AUTO_REDIRECT_MAP` (`src/api/seoHandler.js`) and `public/_redirects`.
- **Fix Implemented**: Added 301 automatic redirect mapping layer for all legacy `/blog/*` and `/keyword/*` paths.
