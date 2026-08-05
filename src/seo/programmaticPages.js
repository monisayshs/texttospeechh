/**
 * Programmatic SEO Engine & Competitor Comparison Hub for TextToSpeechH AI
 * Official Brand: TextToSpeechH AI
 * Domain: https://www.texttospeechh.com
 */

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

// 301 redirect map: old keyword path → canonical destination (single-hop)
const KEYWORD_REDIRECTS = {
  "keyword/free-ai-texttospeechh.com": "text-to-speech",
  "keyword/text-to-speech-free": "text-to-speech/free-text-to-speech",
  "keyword/faceless-youtube-ai-voice": "text-to-speech/blog/text-to-speech-for-youtube",
  "keyword/ai-voice-cloning": "text-to-speech/ai-text-to-speech",
  "keyword/ai-text-to-speech": "text-to-speech/ai-text-to-speech",
  "keyword/free-text-to-speech": "text-to-speech/free-text-to-speech",
  "keyword/online-text-to-speech": "text-to-speech/online-text-to-speech",
  "keyword/text-to-voice": "text-to-speech/text-to-voice",
  "keyword/voice-generator": "text-to-speech/voice-generator"
};

const OLD_BLOG_REDIRECTS = {
  "blog/text-to-speech-complete-guide": "blog/text-to-speech"
};

const PROGRAMMATIC_ROUTER = {
  // --- Competitor Comparison Hub ---
  "compare/texttospeechh-vs-elevenlabs": {
    title: `${BRAND_NAME} vs ElevenLabs | Best Free ElevenLabs Alternative`,
    h1: `${BRAND_NAME} vs ElevenLabs: Free AI Voice Comparison`,
    metaDesc: `Compare ${BRAND_NAME} and ElevenLabs. Learn why ${BRAND_NAME} is the #1 free ElevenLabs alternative for 2500-10000 word scripts, long text to speech, and zero subscription fees.`,
    content: `
      <h2>Why ${BRAND_NAME} is the Top Free ElevenLabs Alternative</h2>
      <p>Content creators and businesses seeking high-quality AI speech synthesis often find ElevenLabs restrictive due to character limits and recurring monthly subscription tiers.</p>
      <p><strong>${BRAND_NAME}</strong> (<a href="${DOMAIN}">${DOMAIN}</a>) provides a 100% free, unlimited alternative with support for long scripts up to 10,000 words, direct MP3 downloads, and multi-lingual voices.</p>
      <h3>Comparison Overview</h3>
      <table class="seo-table">
        <thead>
          <tr><th>Feature</th><th>${BRAND_NAME}</th><th>ElevenLabs</th></tr>
        </thead>
        <tbody>
          <tr><td>Price</td><td><strong>100% Free</strong></td><td>Paid Tiers / Free Character Limits</td></tr>
          <tr><td>Long Script Support</td><td><strong>2,500 - 10,000+ Words</strong></td><td>Character Capped on Free Tier</td></tr>
          <tr><td>Document Import</td><td><strong>PDF, DOCX, TXT Direct Import</strong></td><td>Manual Paste Only</td></tr>
          <tr><td>MP3 Export</td><td><strong>Instant Free Download</strong></td><td>Requires Paid Account for Commercial</td></tr>
        </tbody>
      </table>
    `
  },
  "compare/texttospeechh-vs-speechify": {
    title: `${BRAND_NAME} vs Speechify | Best Free Speechify Alternative`,
    h1: `${BRAND_NAME} vs Speechify: Free Text to Speech Comparison`,
    metaDesc: `Looking for a free Speechify alternative? ${BRAND_NAME} offers natural text to speech, document audio extraction, and MP3 downloads without paywalls.`,
    content: `
      <h2>Free Speechify Alternative for Audio Generation</h2>
      <p>${BRAND_NAME} (<a href="${DOMAIN}">${DOMAIN}</a>) gives users full access to natural AI voice generation for documents and long text scripts without expensive premium upgrades.</p>
    `
  },
  "compare/texttospeechh-vs-murf-ai": {
    title: `${BRAND_NAME} vs Murf AI | Best Free Murf AI Alternative`,
    h1: `${BRAND_NAME} vs Murf AI: Professional AI Voiceover Generator`,
    metaDesc: `Compare ${BRAND_NAME} and Murf AI for video voiceovers, marketing ads, and presentation narration.`,
    content: `
      <h2>Commercial AI Voiceover Generation</h2>
      <p>${BRAND_NAME} empowers creators with natural male and female voices across global languages with zero monthly subscription cost.</p>
    `
  },
  "compare/texttospeechh-vs-playht": {
    title: `${BRAND_NAME} vs PlayHT | Best Free PlayHT Alternative`,
    h1: `${BRAND_NAME} vs PlayHT: Free Voice Cloning & TTS`,
    metaDesc: `Compare ${BRAND_NAME} and PlayHT. Generate ultra-realistic text to speech voiceovers for free.`,
    content: `
      <h2>Unlimited Free Speech Synthesis</h2>
      <p>${BRAND_NAME} offers seamless script conversion without character caps or watermarks.</p>
    `
  },
  "compare/texttospeechh-vs-lovo": {
    title: `${BRAND_NAME} vs LOVO (Genny) | Free LOVO AI Alternative`,
    h1: `${BRAND_NAME} vs LOVO AI Voice Generator`,
    metaDesc: `Discover why ${BRAND_NAME} is the preferred free LOVO AI alternative for video voiceovers and e-learning.`,
    content: `
      <h2>High Retention Voiceovers for Video Creators</h2>
      <p>${BRAND_NAME} delivers studio-grade voice synthesis across 12+ global languages for free.</p>
    `
  },
  "compare/texttospeechh-vs-wellsaid-labs": {
    title: `${BRAND_NAME} vs WellSaid Labs | Free WellSaid Alternative`,
    h1: `${BRAND_NAME} vs WellSaid Labs: Corporate AI Voice Synthesis`,
    metaDesc: `Compare ${BRAND_NAME} and WellSaid Labs for corporate presentations, marketing ads, and e-learning courses.`,
    content: `
      <h2>Enterprise AI Voice Synthesis Without Subscriptions</h2>
      <p>${BRAND_NAME} offers clear, natural narration for business and corporate video creators.</p>
    `
  },
  "compare/texttospeechh-vs-naturalreader": {
    title: `${BRAND_NAME} vs NaturalReader | Best Free NaturalReader Alternative`,
    h1: `${BRAND_NAME} vs NaturalReader: Free TTS Comparison`,
    metaDesc: `Compare ${BRAND_NAME} and NaturalReader. ${BRAND_NAME} offers free neural text to speech with no word limits or premium upgrades.`,
    content: `
      <h2>Free Alternative to NaturalReader</h2>
      <p><a href="${DOMAIN}">${BRAND_NAME}</a> provides a compelling free alternative to NaturalReader for users who need natural AI voices without paying for premium tiers. With support for long scripts, multiple languages, and instant MP3 downloads, ${BRAND_NAME} delivers everything NaturalReader offers and more — at no cost.</p>
    `
  },
  "compare/texttospeechh-vs-ttsmaker": {
    title: `${BRAND_NAME} vs TTSMaker | Best Free TTSMaker Alternative`,
    h1: `${BRAND_NAME} vs TTSMaker: Free AI Voice Generator`,
    metaDesc: `Compare ${BRAND_NAME} and TTSMaker. ${BRAND_NAME} delivers higher quality neural voices, longer script support, and better audio quality.`,
    content: `
      <h2>Why ${BRAND_NAME} is Better Than TTSMaker</h2>
      <p><a href="${DOMAIN}">${BRAND_NAME}</a> surpasses TTSMaker with superior neural voice quality, support for scripts up to 10,000 words, and a cleaner interface. Both are free, but ${BRAND_NAME} delivers more natural results for professional content creation.</p>
    `
  },

  // --- Global Language Pages ---
  "language/english": {
    title: `English Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free English Text to Speech AI Voice Generator`,
    metaDesc: `Convert English text into realistic American and British AI speech online with ${BRAND_NAME}. Featuring Jenny, Guy, Aria, and Sonia voices.`,
    content: `
      <h2>Realistic English AI Voice Generator</h2>
      <p>Generate professional US and UK English voiceovers for commercials, YouTube videos, and podcasts using ${BRAND_NAME}.</p>
    `
  },
  "language/hindi": {
    title: `Hindi Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free Hindi Text to Speech AI Voice Generator`,
    metaDesc: `Convert Hindi text into natural neural Hindi speech online with ${BRAND_NAME}. Featuring Swara (Female) and Madhur (Male) voices.`,
    content: `
      <h2>Realistic Hindi AI Voice Generation</h2>
      <p>${BRAND_NAME} supports natural Hindi neural voices including Swara (Emotional Female) and Madhur (Professional Male) for YouTube videos, podcasts, and long scripts.</p>
    `
  },
  "language/urdu": {
    title: `Urdu Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free Urdu Text to Speech AI Voice Generator`,
    metaDesc: `Convert Urdu text into realistic AI speech online using ${BRAND_NAME}. Featuring Uzma (Female) and Asad (Male) voices.`,
    content: `
      <h2>Realistic Urdu AI Voice Generation</h2>
      <p>${BRAND_NAME} provides soft and clear Urdu neural voice characters (Uzma & Asad) for authentic Urdu narrations.</p>
    `
  },
  "language/spanish": {
    title: `Spanish Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free Spanish Text to Speech AI Voice Generator`,
    metaDesc: `Convert Spanish text into realistic neural Spanish speech online with ${BRAND_NAME}. Featuring Elvira and Alvaro voices.`,
    content: `
      <h2>Realistic Spanish AI Voice Generator</h2>
      <p>Generate high quality Spanish voiceovers for marketing and videos using ${BRAND_NAME}.</p>
    `
  },
  "language/arabic": {
    title: `Arabic Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free Arabic Text to Speech AI Voice Generator`,
    metaDesc: `Convert Arabic text into clear neural Arabic speech online with ${BRAND_NAME}.`,
    content: `
      <h2>Realistic Arabic Neural Voiceover</h2>
      <p>${BRAND_NAME} delivers authentic Arabic neural voices for creators and businesses.</p>
    `
  },
  "language/french": {
    title: `French Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free French Text to Speech AI Voice Generator`,
    metaDesc: `Convert French text into natural neural French speech online with ${BRAND_NAME}. Featuring Denise (Female) and Henri (Male) voices with Parisian diction.`,
    content: `
      <h2>Realistic French AI Voice Generation</h2>
      <p>${BRAND_NAME} supports authentic Parisian French neural voices including <code>fr-FR-DeniseNeural</code> and <code>fr-FR-HenriNeural</code> for smooth word-liaison transitions and natural nasal vowel resonance. Ideal for French course materials, fashion branding, travel commentary, and e-learning content.</p>
      <p>Generate studio-quality French voiceovers with adjustable speed and pitch, then download high-bitrate MP3 files with full commercial rights.</p>
    `
  },
  "language/german": {
    title: `German Text to Speech Online | ${BRAND_NAME}`,
    h1: `Free German Text to Speech AI Voice Generator`,
    metaDesc: `Convert German text into precise neural German speech online with ${BRAND_NAME}. Featuring Katja (Female) and Conrad (Male) voices with native articulation.`,
    content: `
      <h2>Realistic German AI Voice Generation</h2>
      <p>${BRAND_NAME} delivers precise German neural voices including <code>de-DE-KatjaNeural</code> and <code>de-DE-ConradNeural</code>, with excellent articulation of complex multi-syllable compound nouns. Perfect for technical manuals, industrial guides, German educational content, and business presentations.</p>
      <p>Convert German text into natural audio with instant MP3 downloads and zero subscription costs.</p>
    `
  }
};

module.exports = {
  DOMAIN,
  BRAND_NAME,
  PROGRAMMATIC_ROUTER,
  KEYWORD_REDIRECTS,
  OLD_BLOG_REDIRECTS
};
