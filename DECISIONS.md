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
| **Last Verified** | 2026-08-07 |
| **Verified Against** | `api/index.js`, `dev-server.js`, `vercel.json`, `scripts/notify-indexnow.js`, `src/api/seoHandler.js` |
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
- **Decision**: Implement a LoadBalancer (`src/services/loadBalancer.js`) that sequences Kokoro → CosyVoice → Edge TTS. Edge TTS (`msedge-tts`) is treated as the immutable fallback.
- **Consequences**: Voice synthesis availability is increased. If Kokoro or CosyVoice fail, requests transition to Edge TTS without throwing errors to users.

---

### ADR-003: Disk-Backed Queue Management via `/tmp/tts_jobs`
- **Date**: 2026-07-25
- **Status**: Accepted
- **Context**: Long-text TTS requests exceed default serverless execution timeouts. Storing job state in memory fails because Vercel function instances are stateless and transient.
- **Decision**: Store long-form synthesis jobs in the local serverless `/tmp` directory (`/tmp/tts_jobs`). `queueService.js` chunks text, writes audio buffers to `/tmp`, and provides status updates via `/api/status`.
- **Consequences**: Long-text generation works within serverless constraints without requiring an external Redis cluster.

---

### ADR-004: Universal Vendor-Neutral Markdown Intelligence System
- **Date**: 2026-08-07
- **Status**: Accepted
- **Context**: Vendor-specific AI configurations (e.g. `.cursorrules`, `.claude/`) lock repository intelligence to specific tools and fragment rules across multiple proprietary files.
- **Decision**: Standardize all AI intelligence on root Markdown documents anchored by `AGENTS.md` and a single `docs/` knowledge folder.
- **Consequences**: AI coding assistants (ChatGPT, Claude, Gemini, DeepSeek, Cursor, Windsurf, Aider) read and adhere to the project system without custom plugins.

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

### LESSON-002: Vercel Route Order Priority (Wildcard Catch-All Interception)
- **Date**: 2026-08-05
- **Category**: SEO / Routing
- **Incident Summary**: Adding a broad `/blog/(.*)` rewrite entry before static file definitions in `vercel.json` caused static assets like `favicon.ico` and `style.css` to be intercepted by `api/index.js`, returning 404 HTML error pages for CSS files.
- **Root Cause**: `vercel.json` routes evaluate sequentially from top to bottom. Broad regex patterns catch requests before lower static file patterns are evaluated.
- **Permanent Rule**: In `vercel.json`, route order must strictly be:
  1. Specific API endpoints (`/api/generate`, `/api/status`)
  2. Static file overrides (`/robots.txt`, `/llms.txt`, `/ads.txt`)
  3. Dynamic content routes (`/text-to-speech/(.*)`, `/blog/(.*)`)
  4. Catch-all static asset fallback (`/(.*)` -> `/public/$1`)
- **Fix Implemented**: Reordered `vercel.json` routes table and verified asset delivery in dev-server.

---

### LESSON-003: 301 Redirect Equity Preservation
- **Date**: 2026-07-28
- **Category**: SEO
- **Incident Summary**: Renaming `/keyword/free-text-to-speech` to `/text-to-speech/free-text-to-speech` without a redirect rule caused Google Search Console to register 404 crawl errors.
- **Root Cause**: URL structure refactoring without mapping legacy routes to new canonical targets.
- **Permanent Rule**: Never remove or change a public URL path without adding a 301 permanent redirect mapping in `AUTO_REDIRECT_MAP` (`src/api/seoHandler.js`).
- **Fix Implemented**: Added 301 automatic redirect mapping layer for all legacy `/blog/*` and `/keyword/*` paths.
