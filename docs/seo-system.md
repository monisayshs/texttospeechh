# SEO Architecture & Indexation System — TextToSpeechH AI

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Guide to the Hub-and-Spoke SEO engine, programmatic landing page generation, sitemaps, JSON-LD schemas, IndexNow automation, and analytics |
| **Owner** | Repository Maintainers |
| **Update Trigger** | New page category added, sitemap modified, JSON-LD schema updated, redirect added, IndexNow config changed |
| **Update Frequency** | Medium — updated whenever SEO features or routes change |
| **Last Verified** | 2026-08-18 |
| **Verified Against** | `src/seo/*`, `src/api/seoHandler.js`, `src/api/sitemapHandler.js`, `scripts/notify-indexnow.js`, `public/index.html` |
| **Related Documents** | [AGENTS.md](../AGENTS.md), [DECISIONS.md](../DECISIONS.md), [docs/architecture.md](architecture.md) |

---

## Source of Truth

If this document conflicts with the implementation, **the source code is authoritative**. Documentation exists to accelerate understanding, not replace inspection of the code.

---

## 1. SEO Architecture Overview

TextToSpeechH AI employs a **Hub-and-Spoke** SEO content structure designed to build topical authority across Text-to-Speech, AI Voice Generation, and content creator workflows:

```
                          ┌───────────────────────────┐
                          │   PILLAR (Core Hub)       │
                          │   /text-to-speech         │
                          └─────────────┬─────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌──────────────┐                ┌──────────────┐                ┌──────────────┐
│  TOOL SPOKES │                │  SEO SPOKES  │                │  BLOG HUB    │
│  /free-...   │                │  /language/* │                │  /blog       │
│  /online-... │                │  /compare/*  │                │  /blog/*     │
└──────────────┘                └──────────────┘                └──────────────┘
```

---

## 2. Hub-and-Spoke Page Breakdown

### 2.1 The Core Pillar (`src/pages/textToSpeechPillar.js`)
- **URL**: `https://www.texttospeechh.com/text-to-speech`
- **Purpose**: Parent resource for all Text-to-Speech topics. Targeted at broad keywords ("text to speech", "text to voice", "ai voice generator").
- **Features**: Embedded interactive voice generator widget, feature grid, multi-language preview list, integrated FAQ accordion, full JSON-LD schema suite.

### 2.2 Tool Spoke Pages (`src/pages/textToSpeechSubpages.js`)
- **Key Routes**:
  - `/text-to-speech/free-text-to-speech`: Targeted at zero-cost search intent.
  - `/text-to-speech/ai-text-to-speech`: Targeted at neural & AI voice search intent.
  - `/text-to-speech/online-text-to-speech`: Targeted at web-based browser synthesis intent.
  - `/text-to-speech/voice-generator`: Targeted at voice generation tool intent.
  - `/text-to-speech/text-to-voice`: Targeted at voice conversion intent.
  - `/text-to-speech/read-aloud`: Targeted at reading assistant & accessibility intent.
  - `/text-to-speech/pdf-to-speech`: Targeted at PDF document audio conversion.
  - `/text-to-speech/word-to-speech`: Targeted at Word/DOCX document conversion.

### 2.3 Programmatic Spoke Pages (`src/seo/programmaticPages.js`)
- **Language Spokes**: `/language/hindi`, `/language/spanish`, `/language/french`, `/language/german`, `/language/japanese`, etc.
- **Comparison Spokes**: `/compare/elevenlabs-alternative`, `/compare/naturalreader-alternative`, `/compare/speechify-alternative`.
- **Keyword Spokes**: Long-tail keyword landing pages generated programmatically with canonicals and meta descriptions.

---

## 3. 301 Redirect Architecture & Equity Preservation

To prevent 404 crawl errors and consolidate link equity, `AUTO_REDIRECT_MAP` in `src/api/seoHandler.js` automatically maps legacy URL patterns to canonical targets:

```javascript
const AUTO_REDIRECT_MAP = {
  "blog": "text-to-speech/blog",
  "blog/text-to-speech": "text-to-speech",
  "blog/free-text-to-speech": "text-to-speech/free-text-to-speech",
  "keyword/text-to-speech-free": "text-to-speech/free-text-to-speech",
  "keyword/ai-voice-cloning": "text-to-speech/ai-text-to-speech",
  // ... complete route map in src/api/seoHandler.js
};
```

**Rule**: Do not remove entries from `AUTO_REDIRECT_MAP`. If a route is refactored, add a 301 redirect entry.

---

## 4. Sitemap Index System (`src/seo/sitemapGenerator.js`)

The project uses a structured **Sitemap Index** located at `/sitemap.xml`:

```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://www.texttospeechh.com/sitemap-main.xml</loc></sitemap>
  <sitemap><loc>https://www.texttospeechh.com/sitemap-programmatic.xml</loc></sitemap>
  <sitemap><loc>https://www.texttospeechh.com/sitemap-legal.xml</loc></sitemap>
</sitemapindex>
```

1. **`sitemap-main.xml`**: Root homepage, pillar page, sub-tool spokes, blog hub, and individual blog articles.
2. **`sitemap-programmatic.xml`**: Programmatic language pages, keyword spokes, and comparison pages.
3. **`sitemap-legal.xml`**: Legal pages (`/privacy-policy`, `/terms`, `/disclaimer`, `/about`, `/contact`).

---

## 5. JSON-LD Structured Data (`src/seo/schemaGenerator.js`)

Every server-rendered HTML page injects structured data in standard `<script type="application/ld+json">` blocks:

- **Organization Schema**: Defines `TextToSpeechH AI` brand, logo, domain, and social profiles.
- **WebSite Schema**: Injects Google Sitelinks Searchbox capabilities. The homepage (`public/index.html`) also includes a static `WebSite` JSON-LD block with `name`, `alternateName`, and `url` fields (no `potentialAction`).
- **SoftwareApplication Schema**: Describes the web app, operating system compatibility, free pricing tier (`Price: $0.00`), and aggregate rating.
- **FAQPage Schema**: Formats relevant FAQ questions and answers into JSON-LD arrays for Google Rich Search Results.
- **BreadcrumbList Schema**: Provides structured navigational breadcrumbs (`Home` > `Text to Speech` > `[Current Page]`).
- **Article Schema**: Formats blog posts with `author`, `datePublished`, `dateModified`, and `publisher` attributes.

---

## 6. IndexNow Post-Deployment Automation (`scripts/notify-indexnow.js`)

IndexNow enables notification to Bing, Yandex, and Seznam whenever pages are published or updated:

- **Key Verification File**: Served publicly at `/b92a2552d2aec9f72edbb0f9b5671603.txt`.
- **API Endpoint Bridge**: `/api/index-now` and `/indexnow`.
- **Automated Execution**: Triggered automatically via `npm run postbuild` during Vercel deployment.
- **Fail-Safe Design**: Executes inside a non-blocking try/catch block. If Bing's IndexNow API endpoint times out or returns HTTP errors, the script logs a warning and exits with code `0`. It does not block a production Vercel deployment (refer to `DECISIONS.md` LESSON-001).

---

## 7. Crawl & Discovery Policies (`public/robots.txt` & `public/llms.txt`)

- **`robots.txt`**: Grants crawling access to standard web search crawlers (`Googlebot`, `Bingbot`) and explicitly allows generative AI bots (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Applebot-Extended`). Directs crawlers to `/sitemap.xml`.
- **`llms.txt`**: Markdown specification for Large Language Models (LLMs) summarizing TextToSpeechH AI features, available voices, supported document formats, and core web URLs.

---

## 8. Analytics & Telemetry Strategy (`src/seo/gaSnippet.js`)

To ensure compliance with Google Core Web Vitals (CWV) and reduce Interaction to Next Paint (INP) delays:
- **Google Analytics 4 (`G-VXH6Y61FQ0`)**: Loaded using deferred script injection (`async` tag with delayed window load event trigger).
- **Microsoft Clarity (`xt0hsu1r65`)**: Telemetry script initialized only after primary DOM content rendering completes.
