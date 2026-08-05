# Full SEO Audit Report — texttospeechh.com

**URL audited:** https://texttospeechh.com/text-to-speech
**Canonical site:** https://www.texttospeechh.com
**Audit date:** 2026-08-05
**Pages crawled:** 47 (36 × 200, 11 × 404)

---

## Executive Summary

**SEO Health Score: 72 / 100**

**Business type detected:** AI SaaS tool — free online text-to-speech / AI voice generator with an informational blog.

**What's working well:**
- Excellent on-page hygiene: all 36 live pages have unique titles, meta descriptions, canonicals, a single H1, and valid JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, Article).
- Content quality on the primary guide page scores 96/100.
- Clean robots.txt, HTTPS + HSTS, Brotli compression, tiny 213 KB page weight, CLS 0.0.

**Top 5 Critical Issues:**
1. 9 broken internal links return 404 sitewide (footer legal/locale links, homepage community links, dead blog links).
2. Sitemap contains 4 dead URLs + 9 redirecting `/blog/*` URLs, and omits all real blog posts.
3. Hreflang tags on every page point to 9 locale URLs that all return 404 (and `/language/*` pages aren't referenced).
4. Canonical host inconsistent: inner pages canonicalize to non-www, which 308-redirects to www.
5. Lab FCP/LCP ~2.7s (likely "Poor" on mobile) due to render-blocking GA4 + Clarity scripts.

**Top 5 Quick Wins:**
1. Point inner-page canonicals to `https://www.texttospeechh.com/<path>`.
2. Create or 301-redirect the 9 broken internal links.
3. Regenerate sitemap.xml (remove dead/redirecting URLs, add blog posts).
4. Remove broken hreflang locale tags (or point them at real `/language/*` URLs).
5. Defer GA4 + Clarity and preload critical assets to cut FCP below 2.5s.

---

## Category Scores

| Category | Weight | Score |
|----------|--------|-------|
| Technical SEO | 22% | 68 |
| Content Quality | 23% | 70 |
| On-Page SEO | 20% | 78 |
| Schema / Structured Data | 10% | 92 |
| Performance (CWV) | 10% | 65 |
| AI Search Readiness | 10% | 55 |
| Images | 5% | 82 |

**Weighted total: 72/100**

---

## Technical SEO

### Crawlability
- robots.txt allows all crawlers (`Allow: /`), blocks `/api/`, error pages, `/scratch/`, `/tmp/`. ✓
- Non-www → www via 308 permanent redirect. ✓
- 404 pages return HTTP 404 with `noindex, follow`. ✓

### Indexability
- **Broken:** 9 footer/homepage links point to 404 pages (cookie-policy, dmca, language/french, language/german, accessibility, community-guidelines, 2 dead blog URLs, txt-to-speech).
- **Broken:** 4 dead sitemap URLs.
- **Inconsistent:** canonical host (non-www) vs. redirect target (www).

### Security
- HSTS present. Missing CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

### Core Web Vitals (lab)
- FCP/LCP ~2.7s (Poor), CLS 0.0 (Good), TTFB ~703ms.
- Field data (CrUX) unavailable — no API key configured.

---

## Content Quality

- Primary page: 96/100 quality score, 1,871 words, 5,941 tokens.
- **12+ thin pages** under 300 words (language pages 222-234, tool pages 231-279).
- Doorway-pattern `/keyword/*` URLs redirect to tool pages.
- Readability: Flesch-Kincaid grade 15.2, FRE 16.0 (post-graduate level).
- Weak E-E-A-T: no named author, no visible dates, 9-day-old domain, single sameAs profile.

---

## On-Page SEO

- All pages have unique title/meta/canonical/H1. ✓
- **~30 title tags exceed 60 chars** (66-88 chars).
- **7 meta descriptions exceed 160 chars** (up to 233).
- **Hreflang broken:** all 10 locale alternates 404; no self-reference; `/language/*` pages excluded.

---

## Schema & Structured Data

- 6 valid JSON-LD blocks on the primary page; all 36 pages have schema. ✓
- FAQ content visible on-page (matches schema). ✓
- Improve: Person author schema, aggregateRating (when real reviews exist), more sameAs profiles.

---

## Performance

- 213 KB total transfer, 11 resources. CLS 0.0.
- FCP/LCP ~2.7s driven by 169 KB GA4 script + Clarity + render-blocking Google Fonts.
- No lazy-loading, no preload hints.

---

## Images

- Only 2 logo images sitewide; both have alt text. ✓
- No content/hero/screenshot images — limits image SEO, rich snippets, and LCP options.

---

## AI Search Readiness

- AI crawlers allowed by default. ✓
- **No llms.txt / llms-full.txt.**
- No external citations, no named authors — low citability trust for LLM answer engines.

---

## Limitations
- Lab performance data only; no Google API credentials (PSI/CrUX/GSC) configured.
- No backlink API credentials (Moz/Bing); backlink analysis based on external-link crawl and domain age (9 days).
- Screenshots captured but not visually inspected (model limitation); visual findings from DOM/CSS.
- Crawl capped at 47 discovered pages (site has ~36 indexable pages).
