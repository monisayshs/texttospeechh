# AI Search Readiness Findings

## Overview
- **Score: 55/100**

## What Works
- robots.txt **allows all AI crawlers by default** (no GPTBot/ClaudeBot/PerplexityBot blocks, `Allow: /`).
- Long-form content with clear H2 structure is naturally citable.
- FAQPage + Article schema improve machine comprehension.

## Findings

### High
- **No llms.txt or llms-full.txt** — both return 404. LLMs have no curated index of the site's key pages.

### Medium
- **No external citations, sources, or named authors.** Articles cite nothing external and read as AI-generated. Combined with a 9-day-old domain and zero backlink footprint, LLM answer engines have little reason to cite the site.
- **No brand-mention/authority signals** — sameAs has one Instagram profile; no traceable off-site presence.

## Citability Assessment
- Passage structure: strong (numbered sections, defined H2s, FAQ).
- Authority signals: weak (new domain, no authors, no citations).
- Accessibility: good (semantic HTML, no SPA rendering issues).

## Recommendations
1. Publish `llms.txt` (tool + key pages with one-line summaries) and `llms-full.txt`.
2. Add named expert authors and real external references/sources to articles.
3. Earn off-site mentions (Reddit, Product Hunt, tutorials, review sites) that AI crawlers index.
4. Add `GPTBot`, `ClaudeBot`, `PerplexityBot` explicit rules once content is mature.
