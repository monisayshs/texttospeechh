# Keyword → Primary Page Map — TextToSpeechH AI

**Owner:** Team 2 (Google SEO), parallel optimization project, 2026-11-05.
**Baseline evidence:** Comprehensive Search Visibility Audit, 2026-11-05 (GSC 28-day data pulled the same day; Planner volumes from house keyword research, Oct–Nov 2026).
**Purpose:** one primary page per money/head term, so Google gets an unambiguous signal and our own pages stop competing with each other. Supporting pages link *to* the primary with the term as anchor text wherever the link reads naturally.

## Rules

1. **One term, one primary.** No second page may target the same primary term in its title/H1. Supporting pages may mention the term, but they link to the primary for it.
2. **Anchor standard.** Links to a primary use the term itself (or its closest natural form) as anchor — e.g. every link to `/text-to-speech/free-text-to-speech` uses "Free Text to Speech".
3. **Measurement.** Monthly GSC query-by-page pull for the terms below (the same pull that confirmed the "free text to speech" split). A term is "resolved" when one page takes ≥90% of its impressions.
4. **Holds.** The elevenlabs-alternatives title/meta are frozen until the mid-November checkpoint. Homepage title/H1 are not touched by this map.

## The map

| # | Term (cluster) | Primary page | Supporting pages | Evidence (2026-11-05) | Status |
|---|---|---|---|---|---|
| 1 | free text to speech | `/text-to-speech/free-text-to-speech` | Homepage (tools section + footer), `/text-to-speech` pillar, `best-free-text-to-speech-tools`, `free-text-to-audio-converters` | **Split confirmed:** homepage 21 imp @ pos 84, primary 5 imp @ 51.6, online page 1 imp @ 78 | **FIX NOW** — anchor consistency + sibling links (Team 2 branch) |
| 2 | text to speech | `/` (homepage — the tool itself) | `/text-to-speech` pillar, `ai-text-to-speech` | Homepage 38 imp @ 71.8 for the exact query; 2,246 imp @ 49.9 overall (28d) | MONITOR — title/H1 held by rule |
| 3 | text to speech online | `/text-to-speech/online-text-to-speech` | Homepage tools section, `text-to-speech-online-guide` | Online page currently draws impressions on "free text to speech" (wrong term) instead | **FIX NOW** — de-conflict: online page links to the free-text-to-speech primary (Team 2 branch) |
| 4 | ai voice generator / free ai voice generator | `/` (homepage) | `best-ai-voice-generators-free`, `voice-generator` subpage, `free-ai-voice-over-generator` | GSC: "ai voice generator free download" @ 14.4 | MONITOR |
| 5 | google text to speech (+ google cloud text to speech) | `google-text-to-speech-guide` | `best-ai-voices`, `google-docs-text-to-speech-guide` | Planner: 12,100/mo LOW; cloud cluster 8,100/mo MEDIUM. Guide published 2026-11-05 | **FIX NOW** — internal links (Team 2 branch); indexing is the owner's GSC step |
| 6 | elevenlabs alternatives (+ eleven labs alternative free) | `elevenlabs-alternatives` | `elevenlabs-v4-free-guide`, `elevenlabs-realtime-voice-agent-guide`, `murf-ai-free-alternative`, `play-ht-alternatives` | Pos 15.0 (28d) / 12.8 (7d), 1,298 imp — closest page-1 candidate | **MONITOR — title/meta HELD until mid-Nov checkpoint (hard hold)**; internal links only |
| 7 | murf ai alternative | `murf-ai-free-alternative` | `elevenlabs-alternatives`, `speechify-alternative-free` | AI-test tables: Murf appears in YouTube/commercial answers on both engines | MONITOR |
| 8 | read pdf aloud / apps that read pdf aloud | `pdf-reader-out-loud-apps` | `read-pdf-aloud-guide`, `read-pdf-aloud`, `free-text-to-speech-pdf-to-audio` | Pos 14.6 (28d); exact query "apps that read pdf aloud for free" @ 9.2; Planner "read pdf aloud" 3,600 MEDIUM | **FIX NOW** — internal links (Team 2); FAQ/answer structure belongs to Team 4 |
| 9 | arabic text to speech | `best-arabic-text-to-speech-tools` | `/language/arabic` | Pos 13.2, 611 imp, 16 clicks — best-performing guide cluster | MONITOR — protect, no changes needed |
| 10 | hindi text to speech | `hindi-text-to-speech-tools` | `/language/hindi` | GSC: "best text to speech hindi" @ 48 (early signal) | MONITOR |
| 11 | spanish text to speech | `best-spanish-text-to-speech-tools` (tools/voices intent) | `/language/spanish` (tool intent; pos 22.1) | Two assets serve two intents — watch for split in the monthly pull | MONITOR |
| 12 | voice cloning software | `best-voice-cloning-software` | `ai-voice-cloning-guide`, `open-source-voice-cloning-audio8`, `heygen-voice-clone-free-alternatives` | Planner: 2,900/mo LOW | MONITOR |
| 13 | voice changer for discord | `best-voice-changers-for-discord` | `discord-text-to-speech-guide`, `best-ai-voice-changers` | Planner: 9,900/mo LOW | MONITOR |
| 14 | remove background from image | `/background-remover` (tool) | `/passport-photo-maker`, `/tools` hub | Planner: ~1,000,000/mo LOW (house research) | MONITOR — UX/CWV belong to Teams 1/5; map entry only |
| 15 | passport photo maker (cluster) | `/passport-photo-maker` (tool) | `/image-compressor`, `/tools` hub | Planner cluster ~19,000/mo MEDIUM | MONITOR |
| 16 | text to speech for youtube | `text-to-speech-for-youtube` | `ai-voiceover-for-commercials`, `capcut-text-to-speech-guide` | Long-standing guide; YouTube intent also appears in AI answers (won by ElevenLabs/Murf today) | MONITOR |

## What Team 2 changed against this map (2026-11-05, branch opt/team2-google-seo)

- Homepage footer anchor to the free-text-to-speech primary aligned to the standard "Free Text to Speech" (it previously read "Text to Speech"; the homepage tools section and the pillar already used the standard anchor).
- `/text-to-speech/online-text-to-speech` and `/text-to-speech/ai-text-to-speech` each gained one natural in-content link to the free-text-to-speech primary with the term as anchor — the two sibling pages that were drawing or neighbouring the term now point at its owner.
- Newest guides (`google-text-to-speech-guide`, `convoso-voice-ai-agent-guide`) each gained one natural link to `elevenlabs-alternatives`; the google guide already linked `pdf-reader-out-loud-apps`. `elevenlabs-realtime-voice-agent-guide` already links `elevenlabs-alternatives`; a pdf-reader link was judged not topically sensible there (voice agents vs PDF reading) and was **not** forced.

## Open items this map hands to others

- **NEEDS APPROVAL:** any future title/H1 change for rows 1–3 (none made here).
- **MONITOR (mid-Nov checkpoint):** elevenlabs-alternatives title test — decision belongs to the owner.
- **Team 4:** FAQ/answer structure on the two candidate pages (rows 6 and 8).
- **Monthly:** re-run the query-by-page pull; report movement on rows 1, 6, 8 first.
