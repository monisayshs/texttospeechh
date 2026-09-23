# Ephemeral AI Session State — SESSION.md

> **Notice:** This document contains temporary working memory for the active AI session. It is intentionally overwritten or reset per session and must NOT be treated as permanent project memory (use `PROJECT_STATE.md` for permanent project state).

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Ephemeral working memory, active task tracking, and session handoff for the current AI agent session |
| **Owner** | Active AI Session |
| **Update Trigger** | Every step completion, task transition, or session handoff |
| **Update Frequency** | Very High — updated continuously during an active work session |
| **Last Verified** | 2026-09-22 |
| **Verified Against** | Live Production Deployment on Cloudflare Pages (`c568eac`) |
| **Related Documents** | [PROJECT_STATE.md](PROJECT_STATE.md), [TASKS.md](TASKS.md), [AGENTS.md](AGENTS.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. Active Session Summary

- **Session Timestamp**: 2026-09-23 (night)
- **Current Objective**: COMPLETED — H2 fold-ins for Read-Along highlighting deployed to 2 articles: `speechify-alternative-free` gained "6. Speechify Alternatives With Word-by-Word Highlighting" (verified keyword variants woven in: free alternative to speechify / speechify free / speechify free alternative) + "Word highlighting" comparison-table column; `free-text-to-speech-pdf-to-audio` gained "5. Read Along While You Listen: PDF Readers With Word Highlighting". TOC entries added, subsequent sections renumbered. Published on user's explicit "publish kardo". Feature claim honest: Read-Along toggle verified live by user click-test before including the texttospeechh bullet.


- **Active Branch**: `main`
- **Latest Commit**: (pending — v1.5.0 content-cluster commit)
- **Active AI Model**: Antigravity

---

## 2. Session Execution Progress

- [x] **2 New SEO Articles Published**: `best-free-text-to-speech-tools` (utility angle, 8 tools ranked by free-tier generosity) and `best-ai-voice-generators-free` (creator angle, 10 tools, realism scores, cloning safety, monetization rules).
- [x] **ElevenLabs Article Refreshed**: Re-ranked by free limits, creator filter, Privacy Score section, "Why People Leave ElevenLabs", 10 PAA-aligned FAQs; title → "7 Best Free ElevenLabs Alternatives (2026)".
- [x] **Fact-Checking**: TTSMaker 20k chars/week, NaturalReader free tier, ElevenLabs 10k chars/month verified 2026-09-23; dates `datePublished`/`dateModified` set; sitemap auto-includes new slugs.
- [x] **Live Deployment**: Pushed v1.5.0 commit to `main` and deployed to Cloudflare Pages (verification pending below).

---

## 3. Current Step & Next Handoff

- **Last Completed Step**: First SEO content cluster (2 new articles + ElevenLabs refresh) published as v1.5.0 and deployed.
- **Next Immediate Step**: Verify the 3 article URLs live on production; then weekly ranking/site-health monitoring.
- **Current Blockers**: None.
---

## 4. PDF Extraction Bug Fix — 2026-09-23 (v1.6.1)
- **Bug**: PDF upload filled the TTS textarea with garbage characters (e.g. `D+,1 / e G0 O K9< ...`) — reported by user from live site.
- **Root cause**: `"pdf-parse": "*"` installed v2.4.5 in production, but `fileParser.js` targeted the v1 function API. v2 exports a `PDFParse` class, so the primary engine silently skipped and every PDF went through the naive raw-stream fallback (no font decoding → symbol soup on custom-encoded fonts).
- **Fix**: primary engine rewritten for v2 API (`new PDFParse({data})` → `getText()`); `pdf-parse` pinned to `^2.4.5`; added `looksLikeGarbage()` heuristic → clean user-facing error instead of garbage output.
- **Verified**: normal PDFs extract correctly via v2 engine; garbage sample flagged; English/Hindi/invoice samples pass; empty file → clean error.
- **Pending**: commit + push to main (Cloudflare Pages auto-deploy); user to re-test PDF upload on live site.

## 5. PDF Extraction v1.6.2 — 2026-09-23 (ToUnicode-aware engine)
- **Bug**: v1.6.1 did NOT fix production — user's `Application_Print_Preview.pdf` still failed with "Unable to extract readable text".
- **Root cause**: pdf-parse v2 **cannot run in Cloudflare Workers at all** — its bundled web build requires DOM APIs (`DOMMatrix is not defined` in workerd, verified via `wrangler dev`). Primary engine throws on every PDF in production; the font-unaware fallback then produced garbage (caught by the v1.6.1 guard → clean error, but no text).
- **Fix** (`src/services/fileParser.js`, no new dependencies): new secondary engine `extractPdfTextSmart()` — resolves each page's font resources, parses ToUnicode CMaps (`bfchar`/`bfrange`, 1-/2-byte codes), decodes `Tj`/`TJ`/`'`/`"` operators per active font (`Tf`); handles Identity-H subset fonts (Chrome Skia/PDF), hex strings, TJ kerning, inline-image skipping. Legacy raw scan kept as tertiary last resort.
- **Verified**: in real workerd runtime, user's PDF extracts 6,557 clean chars (100% word recall vs pdf-parse v2 reference); simple WinAnsi PDFs fine; garbage input still → clean error.
- **Deployed**: commit `f157e88` pushed to `main` via GitHub API; Cloudflare Pages auto-deploy triggered. User to re-upload the PDF on the live site to confirm.

## 6. Read-Along Word-by-Word Highlighting — 2026-09-23 (v1.7.0, user-approved, tested, unpushed)
- **Feature**: opt-in word-by-word text highlighting synced to the spoken audio, per user's exact UX requirement — a **"Read-Along: OFF"** toggle near the player; highlight box hidden by default; highlighting starts ONLY on user click; toggle OFF hides the box and stops the loop; normal listen/download flow untouched.
- **Implementation**:
  - `src/services/wordTimingService.js` (new): parses Edge `Path:audio.metadata` WordBoundary frames → compact `{s,e,w}` timings in integer ms; MP3 frame-header walk for true chunk durations; merges multi-chunk timings with cumulative offsets; fail-closed (null/empty when unavailable).
  - `src/providers/edge/edgeProvider.js`: `wordBoundaryEnabled` on all 3 paths (CF raw socket, Node ws, msedge-tts); attaches `wordTimings` to audio buffers.
  - `src/services/loadBalancer.js`, `src/services/queueService.js`: preserve/capture/merge timings per chunk; persist in KV/disk; expose `wordTimings` + `readAlongAvailable` in job status.
  - `src/api/generateHandler.js`: returns both fields in instant and poll responses.
  - `public/index.html` / `app.js` / `style.css`: hidden toggle + highlight box; toggle-gated controller (binary search + rAF, safe text spans, auto-scroll, pause/resume/seek/stop/end/regeneration, mobile, dark mode); no-timing/failover → button stays hidden.
- **Verified**:
  - Real end-to-end synthesis through the production Cloudflare-socket code path (live Bing, 3 chunks): 240/240 words timed, monotonic, last word end 82,531ms ≤ measured 83,400ms, English + Hindi, handler returns 200 with timings.
  - Module runs correctly in real workerd (`wrangler dev`); all changed files pass `node --check`; frontend binary-search logic unit-tested; fixed a real bug found during testing (MP3 duration walk was capped at 200,000 byte-position → under-measured chunk durations and broke merge offsets; now frame-count capped).
  - Known environment limits: `wrangler pages dev` full run blocked by missing CLOUDFLARE_API_TOKEN (remote AI binding) — unrelated to this feature; live UX click-through still to be confirmed after deploy.
- **Pending**: commit v1.7.0 + push via GitHub Git Data API (plain `git push` has no auth), then verify production deploy and live read-along behavior. SEO fold-ins (highlighting H2s) scheduled as follow-up AFTER live verification.

## 7. Homepage SEO Fixes — 2026-09-23 (v1.7.1)
- **Trigger**: user asked for a homepage SEO audit; ran the newly installed claude-seo skill (`seo-page`) against https://www.texttospeechh.com/ → overall 90/100 (On-Page 88, Content 80, Technical 95, Schema 90, Images 95). User then said "fix all issues found".
- **Fixes** (`public/index.html` only, minimal diff):
  1. Meta description rewritten (brand-name repetition removed, CTA added): 155 chars, in 150–160 range; applied to `description`, `og:description`, `twitter:description`. Verified with skill's `metadata_template.py` → templated=false, no flags.
  2. Vague H2s: search modal "Search TextToSpeechH AI" → "Search"; footer brand H2 → "TextToSpeechH AI — Free Text to Speech Platform".
  3. Freshness: footer copyright bar now shows "Last updated: September 2026".
  4. E-E-A-T: footer brand column now shows "Built by the TextToSpeechH AI team." linking to `/about`.
- **Verified**: tag balance OK (div 95/95, h2 3/3), new H2 list confirmed, description length 155.
- **Pending**: commit v1.7.1 + push via GitHub Git Data API, then verify live HTML reflects the changes.
