# Action Plan — texttospeechh.com

Prioritized recommendations. **Critical** = blocks indexing/penalties; **High** = significant ranking impact; **Medium** = optimization; **Low** = backlog.

## Phase 1: Critical Fixes (Week 1)

### C1 — Fix all 9 broken internal links (404)
**Why:** Footer links on every page point to `/cookie-policy`, `/dmca`, `/language/french`, `/language/german` (all 404). Homepage links to `/accessibility`, `/community-guidelines`, `/blog/ultimate-ai-texttospeechh.com-guide`, `/blog/text-to-speech-audiobook-creation` (404). Blog post links to `/text-to-speech/txt-to-speech` (404). Broken links waste crawl budget and harm usability/trust.
**Fix:** Create the missing legal/locale pages, or 301-redirect each to the nearest live equivalent. Remove dead blog links from the homepage footer.

### C2 — Regenerate sitemap.xml
**Why:** 4 dead URLs + 9 redirecting URLs; real blog posts omitted.
**Fix:** List only live HTTP-200 `/text-to-speech/*` URLs, add all 5 blog posts + hub, drop `/blog/*` redirect entries and the 4 dead URLs, use the www hostname. Re-submit in Search Console.

### C3 — Remove/fix broken hreflang tags
**Why:** Every page declares hreflang alternates to 9 URLs that 404. Broken international targeting.
**Fix:** Either remove the block entirely until localized sites are live, or point hreflang to real `/language/*` pages with reciprocal + self-referencing tags and x-default.

### C4 — Fix canonical host inconsistency
**Why:** Inner-page canonicals point to non-www (which 308-redirects to www); homepage uses www.
**Fix:** Set every canonical + schema `url` to `https://www.texttospeechh.com/<path>`.

### C5 — Remove `/keyword/*` doorway URLs
**Why:** Keyword-stuffed URLs (`/keyword/free-ai-texttospeechh.com`) are a Google doorway-page pattern.
**Fix:** 301 them to the canonical tool pages and stop generating them.

## Phase 2: High-Impact Improvements (Weeks 2-3)

### H1 — Trim title tags to 50-60 chars (~30 pages)
Currently 66-88 chars; SERP truncation. Keep primary keyword first, shorten brand suffix.

### H2 — Rewrite meta descriptions over 160 chars
`/privacy-policy` (233), `/terms` (180), `/about` (198), `/text-to-speech` (161), and 3 more. Target 140-158 chars with a CTA.

### H3 — Improve Core Web Vitals (FCP/LCP ~2.7s → <2.5s)
- Defer GA4 + Clarity behind idle/load events.
- Preload the LCP element and self-host + preload the Inter font subset with `font-display: swap`.
- Add `preload`/`dns-prefetch` hints for app.js and style.css.

### H4 — Add security headers
In `vercel.json`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, plus a CSP.

### H5 — Expand 12 thin tool/language pages to 800+ words
Add unique usage guidance, FAQ, and examples to language and tool landing pages, or merge + 301 thin variants.

## Phase 3: Content & Authority (Month 2)

### M1 — Add named human authors + visible dates
Person schema, bylines, author bios, visible publish/modified dates on all articles.

### M2 — Add external citations and sources
Improves E-E-A-T and LLM citability.

### M3 — Publish llms.txt and llms-full.txt
Curated index of tool + key pages for AI crawlers.

### M4 — Add content imagery
Hero images, tool screenshots (WebP/AVIF), keyword-rich alt text; add `screenshot` to SoftwareApplication schema.

### M5 — Build authority footprint
Expand About page, add legitimate sameAs profiles, earn off-site mentions (Reddit, Product Hunt, tutorials, directories).

## Phase 4: Monitoring & Iteration (Ongoing)

### L1 — Connect Google tooling
Configure PageSpeed Insights API key; verify CrUX field data; connect Search Console and GA4.

### L2 — Monitor indexation
Track coverage after sitemap/canonical fixes; watch for doorway-page actions after `/keyword/*` removal.

### L3 — Re-audit
Re-run this audit in 4-6 weeks to measure improvement and catch regressions.
