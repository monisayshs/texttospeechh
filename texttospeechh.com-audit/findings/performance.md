# Performance (Core Web Vitals) Findings

## Overview
- **Score: 65/100**
- Measurement: local Playwright lab run (desktop viewport 1920x1080) against /text-to-speech, 2026-08-04.
- Note: no PageSpeed Insights API key configured; **field (CrUX) data unavailable**. Scores are lab estimates.

## Lab Metrics
| Metric | Value | Rating |
|--------|-------|--------|
| FCP | ~2688 ms | Poor (>) |
| LCP | ~2688 ms | Poor (>) |
| CLS | 0.0 | Good |
| TTFB | ~703 ms | Good |
| DOMContentLoaded | 2588 ms | - |
| Load | 4302 ms | - |
| Transfer size | 213 KB | Excellent |

## What Works
- CLS 0.0 — no layout shift.
- Tiny payload: ~213 KB total, 11 main-document resources.
- Brotli compression (Content-Encoding: br), CDN caching.

## Findings

### High
- **FCP/LCP ~2.7s, above the 2.5s "good" threshold.** The 169 KB Google Analytics gtag script loads early and competes with hero rendering; Microsoft Clarity adds additional third-party JS.

### Medium
- **Render-blocking Google Fonts** (Inter woff2 47 KB) — no font preload, no font-display:swap on self-hosted path.

### Low
- No lazy-loading (0 images lazy), no preload hints for app.js/style.css.
- CSS 30 KB + JS 30 KB are already small and minified.

## Recommendations
1. Defer GA4 + Clarity behind `requestIdleCallback` / load event.
2. Preload the LCP element (likely the hero heading/text).
3. Self-host + preload the Inter font subset with `font-display: swap`.
4. Configure a PageSpeed Insights API key and re-verify with CrUX field data.

## Resource Breakdown
- googletagmanager.com gtag.js — 169 KB (script)
- fonts.gstatic.com Inter woff2 — 47 KB (font)
- clarity.ms tag — 748 B
- style.css?v=8.2.0 — 30 KB
- app.js?v=8.2.0 — 30 KB
- logo-icon.svg — 1.7 KB (x2)
