# Schema & Structured Data Findings

## Overview
- **Score: 92/100** — strongest category.
- All 36 live pages include valid JSON-LD.
- Primary page (/text-to-speech) has 6 valid blocks: Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, Article.

## Validated Blocks (home page /text-to-speech)
1. **Organization** — name, url, logo, email, contactPoint (support + general), sameAs
2. **WebSite** — with SearchAction (target /search?q=)
3. **SoftwareApplication** — MultimediaApplication, price 0.00 USD, offers
4. **FAQPage** — 3 Q&A pairs, all content visible on page ✓
5. **BreadcrumbList** — Home → Text to Speech
6. **Article** — headline, description, datePublished/Modified 2026-07-29, author/publisher Organization, image og-image.png

## Findings

### Medium
- **Article author is Organization only.** Add Person schema with name, jobTitle, url, sameAs for E-E-A-T and article rich results.
- **SoftwareApplication lacks aggregateRating/reviews.** Add only when real user reviews exist.

### Low
- **Organization sameAs lists only Instagram.** Add more legitimate profiles + address when available.
- SearchAction points to `/search?q=` — verify the search page exists and is indexable.

## Validation
All 6 JSON-LD blocks parsed successfully (block_count 6, processed 6, valid 6, 3,137 bytes). No JSON parse errors detected.
