# Deployment & Failure Recovery Guide — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Guide for Cloudflare Pages deployment, environment variable management, build scripts, and step-by-step failure recovery |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Cloudflare configuration modified, environment variable added, build pipeline changed |
| **Update Frequency** | Low — updated when deployment architecture changes |
| **Last Verified** | 2026-09-18 |
| **Verified Against** | `wrangler.toml`, `functions/[[path]].js`, `package.json`, `scripts/notify-indexnow.js` |
| **Related Documents** | [AGENTS.md](../AGENTS.md), [DECISIONS.md](../DECISIONS.md), [PROJECT_STATE.md](../PROJECT_STATE.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. Deployment Architecture Overview

TextToSpeechH AI deploys to **Cloudflare Pages + Workers** with authoritative Cloudflare DNS (`aurora.ns.cloudflare.com` & `bruce.ns.cloudflare.com`):

- **Platform Target**: Cloudflare Pages + Workers Edge Network (Project `texttospeechh`)
- **Authoritative Zone**: `texttospeechh.com` (Zone ID `517b6807c6949698a3bba05a0ca7bde0`)
- **Deployment Command**: `npx wrangler pages deploy public --project-name=texttospeechh`
- **Output Artifacts**: Static files served from `public/`, serverless functions loaded from `functions/[[path]].js`.
- **Backup Infrastructure**: Vercel production project (`prj_oZCbunEGLj8yH4ET81OB9bQHhbA3`) retained as zero-downtime rollback target.

---

## 2. Environment Variables & Bindings Inventory

| Binding / Variable Name | Type | Description |
|-------------------------|------|-------------|
| `TTS_JOBS_KV` | KV Namespace | Cloudflare KV binding (`d63d268287be400a9e8f45858647619c`) for job metadata tracking |
| `TTS_AUDIO_R2` | R2 Bucket | Cloudflare R2 binding (`tts-audio-store`) for binary MP3 audio persistence |
| `AI` | Workers AI | Cloudflare Workers AI binding |
| `AZURE_SPEECH_KEY` | Environment Secret | Optional Azure Speech API key for commercial failover |
| `AZURE_SPEECH_REGION` | Environment Secret | Optional Azure Speech region |
| `INDEXNOW_KEY` | Optional Secret | `b92a2552d2aec9f72edbb0f9b5671603` for Bing Webmaster API |

---

## 3. Cloudflare Pages Configuration (`wrangler.toml`)

```toml
name = "texttospeechh"
pages_build_output_dir = "public"
compatibility_date = "2026-08-19"
compatibility_flags = [ "nodejs_compat" ]

[[kv_namespaces]]
binding = "TTS_JOBS_KV"
id = "d63d268287be400a9e8f45858647619c"

[[r2_buckets]]
binding = "TTS_AUDIO_R2"
bucket_name = "tts-audio-store"

[ai]
binding = "AI"
```

---

## 4. Step-by-Step Deployment Failure Recovery Workflow

If a Cloudflare Pages deployment returns errors, follow this protocol:

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Check Wrangler Logs                                     │
│ Inspect CLI output during npx wrangler pages deploy             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Verify `nodejs_compat` Flag                             │
│ Ensure compatibility_flags = ["nodejs_compat"] is in wrangler.toml│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Verify KV & R2 Bindings                                 │
│ Confirm TTS_JOBS_KV and TTS_AUDIO_R2 exist in Cloudflare account│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Fallback to Vercel Infrastructure                       │
│ If Cloudflare experiences major regional outage, update Hostinger│
│ nameservers to point back to orbit.dns-parking.com / Vercel IP  │
└─────────────────────────────────────────────────────────────────┘
```
