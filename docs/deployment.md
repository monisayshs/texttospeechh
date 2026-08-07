# Deployment & Failure Recovery Guide — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Guide for Vercel deployment, environment variable management, build scripts, and step-by-step failure recovery |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Vercel configuration modified, environment variable added, build pipeline changed |
| **Update Frequency** | Low — updated when deployment architecture changes |
| **Last Verified** | 2026-08-07 |
| **Verified Against** | `vercel.json`, `package.json`, `scripts/notify-indexnow.js`, `.env.local` |
| **Related Documents** | [AGENTS.md](../AGENTS.md), [DECISIONS.md](../DECISIONS.md), [PROJECT_STATE.md](../PROJECT_STATE.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. Deployment Architecture Overview

TextToSpeechH AI deploys to **Vercel** via git push integration:

- **Platform Target**: Vercel Serverless Functions (v2) + Edge CDN
- **Build Trigger**: Git push to `main` branch
- **Build Command**: `npm run build` (`node -e "console.log('Build Complete')"`)
- **Postbuild Command**: `npm run postbuild` (`node scripts/notify-indexnow.js`)
- **Output Artifacts**: Static files served from `public/`, serverless functions loaded from `api/`.

---

## 2. Environment Variables Inventory

The system operates with minimal environment configuration:

| Variable Name | Required? | Default / Fallback | Description |
|---------------|-----------|--------------------|-------------|
| `VERCEL_OIDC_TOKEN` | System | (Vercel Managed) | OIDC authentication token injected by Vercel deployment runner |
| `INDEXNOW_KEY` | Optional | `b92a2552d2aec9f72edbb0f9b5671603` | IndexNow verification key for Bing Webmaster API |
| `INDEXNOW_STRICT` | Optional | `false` | If set to `true`, IndexNow network errors will fail local postbuild scripts |
| `NODE_ENV` | Optional | `production` | Node execution environment mode |

---

## 3. Vercel Configuration & Route Ordering (`vercel.json`)

> [!IMPORTANT]
> Route ordering in `vercel.json` is critical. Specific routes must precede wildcards.

```json
{
  "version": 2,
  "headers": [ /* HSTS, Security, and Asset Caching Headers */ ],
  "routes": [
    { "src": "/api/generate", "dest": "/api/generate.js" },
    { "src": "/api/status", "dest": "/api/status.js" },
    { "src": "/api/upload", "dest": "/api/upload.js" },
    { "src": "/sitemap.xml", "dest": "/api/index.js" },
    { "src": "/text-to-speech/(.*)", "dest": "/api/index.js" },
    { "src": "/blog/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

---

## 4. Step-by-Step Deployment Failure Recovery Workflow

If a Vercel deployment returns errors during build/runtime, follow this 6-step diagnostic protocol:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Check Vercel Build Logs                                 │
│ Inspect build console output in Vercel Dashboard / CLI          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Identify Failing Build Step                             │
│ Pinpoint whether failure occurred in: npm install, npm build,   │
│ postbuild (notify-indexnow.js), or function compilation         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Verify Environment Variables                            │
│ Check that VERCEL_OIDC_TOKEN and Node runtime flags are valid   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Verify Vercel Routes (`vercel.json`)                     │
│ Ensure no syntax errors exist in vercel.json and route order    │
│ follows API → Static overrides → Dynamic → Catch-all asset       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Verify Postbuild Scripts                                │
│ Check that scripts/notify-indexnow.js caught exceptions and did  │
│ not exit with non-zero status code (unless INDEXNOW_STRICT=true)│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Document Root Cause in DECISIONS.md                     │
│ If the incident reveals a new failure mode or lesson learned,   │
│ log a new entry in DECISIONS.md under Lessons Learned           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Local Pre-Deployment Verification Protocol

Before pushing changes to `main`, execute local validation:

1. **Start Dev Server**: Run `node dev-server.js` and verify app loads on `http://localhost:3000`.
2. **Test Core API**: Send a POST request to `http://localhost:3000/api/generate` with a sample prompt.
3. **Verify IndexNow Script**: Run `node scripts/notify-indexnow.js` locally and confirm it exits with code `0`.
4. **Verify Clean Git Status**: Ensure documentation files (`CHANGELOG.md`, `SESSION.md`, `PROJECT_STATE.md`) are updated.
