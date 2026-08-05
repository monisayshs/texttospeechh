/**
 * Supporting Spokes for Text to Speech Architecture
 * Domain: https://www.texttospeechh.com
 */

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

const TEXT_TO_SPEECH_SUBPAGES = {
  "text-to-speech/ai-text-to-speech": {
    title: `AI Text to Speech: Neural Voice Synthesis Guide | ${BRAND_NAME}`,
    h1: `AI Text to Speech Technology & Neural Models`,
    metaDesc: `Discover how AI Text to Speech utilizes neural networks, deep learning, and acoustic transformers to generate hyper-realistic voices. Free online generator.`,
    category: "AI Technology",
    readingTime: "8 min read",
    content: `
      <div class="definition-box" style="background:rgba(0,200,150,0.08); border-left:4px solid #00c896; padding:20px; border-radius:8px; margin-bottom:30px;">
        <p style="font-size:1.05em; margin:0;"><strong>AI Text to Speech</strong> leverages artificial intelligence and deep neural networks to convert written text into natural human speech with emotion, inflection, and breathing pauses.</p>
      </div>
      <h2>How Artificial Intelligence Powers Modern Speech Synthesis</h2>
      <p>Traditional text-to-speech systems concatenated choppy audio clips. Modern <strong>AI Text to Speech</strong> engines process text through transformer-based acoustic networks and neural vocoders (like HiFi-GAN and Kokoro-82M), synthesizing realistic human speech in milliseconds.</p>
      
      <h3>Key Advantages of AI Text to Speech:</h3>
      <ul>
        <li><strong>Natural Human Intonation:</strong> Contextual comprehension ensures correct emphasis on questions, exclamations, and pauses.</li>
        <li><strong>Multi-Lingual Mastery:</strong> Generate speech across 15+ languages with localized regional accents.</li>
        <li><strong>Zero Mechanical Distortion:</strong> Smooth acoustic energy transition without robotic buzzing.</li>
      </ul>

      <div style="background:rgba(0,200,150,0.05); padding:20px; border-radius:10px; margin:30px 0; text-align:center;">
        <h3 style="margin-top:0;">Experience Neural AI Speech Synthesis</h3>
        <p>Try ${BRAND_NAME} free voice generator on our home page or read the main pillar guide.</p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px;">
          <a href="/" class="primary-btn" style="text-decoration:none;">Try AI Voice Generator →</a>
          <a href="${DOMAIN}/text-to-speech" style="color:#00c896; font-weight:600; padding:10px 20px; text-decoration:none;">Read Main Text to Speech Guide ◀</a>
        </div>
      </div>
    `
  },
  "text-to-speech/free-text-to-speech": {
    title: `Free Text to Speech: Best No-Cost AI Voice Generator | ${BRAND_NAME}`,
    h1: `Free Text to Speech Generator Online`,
    metaDesc: `Looking for 100% free text to speech without word caps or hidden fees? ${BRAND_NAME} offers natural neural voice synthesis and free MP3 downloads.`,
    category: "Free Tools",
    readingTime: "7 min read",
    content: `
      <div class="definition-box" style="background:rgba(0,200,150,0.08); border-left:4px solid #00c896; padding:20px; border-radius:8px; margin-bottom:30px;">
        <p style="font-size:1.05em; margin:0;"><strong>Free Text to Speech</strong> on ${BRAND_NAME} provides high-quality neural voice synthesis with no subscription costs, credit cards, or character paywalls.</p>
      </div>
      <h2>Truly Free AI Voice Generation Without Subscriptions</h2>
      <p>Many online speech tools advertise "free" tiers that cap generation at 250 words or lock audio MP3 exports behind mandatory paid subscriptions. <strong>${BRAND_NAME}</strong> provides a truly free solution for students, creators, and professionals.</p>

      <h3>What You Get For Free on ${BRAND_NAME}:</h3>
      <ul>
        <li>Up to 10,000 words per text session.</li>
        <li>15+ global neural voices and multi-accent options.</li>
        <li>Direct MP3 audio file downloads.</li>
        <li>PDF, DOCX, and TXT document upload support.</li>
      </ul>

      <div style="margin-top:30px;">
        <a href="${DOMAIN}/text-to-speech" style="color:#00c896; font-weight:600;">◀ Return to Text to Speech Main Guide</a>
      </div>
    `
  },
  "text-to-speech/online-text-to-speech": {
    title: `Online Text to Speech: Web Browser Voice Generator | ${BRAND_NAME}`,
    h1: `Online Text to Speech Generator`,
    metaDesc: `Convert text to voice directly in your web browser with ${BRAND_NAME}. Works on Chrome, Safari, Edge, Android, and iOS with instant audio preview.`,
    category: "Web Application",
    readingTime: "6 min read",
    content: `
      <h2>Browser-Based Speech Synthesis for Any Device</h2>
      <p><strong>Online Text to Speech</strong> enables users to generate studio audio directly inside any modern browser without installing heavy desktop software or mobile applications.</p>

      <h3>Cross-Platform Compatibility</h3>
      <p>Whether you are using Windows, macOS, Linux, Android, or iOS, ${BRAND_NAME} renders speech seamlessly with responsive mobile UI controls and instant audio downloads.</p>

      <div style="margin-top:30px;">
        <a href="/" class="primary-btn" style="text-decoration:none;">Open Online Text to Speech Tool →</a>
      </div>
    `
  },
  "text-to-speech/text-to-voice": {
    title: `Text to Voice Converter: Turn Written Words to Audio | ${BRAND_NAME}`,
    h1: `Text to Voice Converter`,
    metaDesc: `Turn written documents, articles, and scripts into natural vocal narration with ${BRAND_NAME} free text-to-voice technology.`,
    category: "Audio Conversion",
    readingTime: "6 min read",
    content: `
      <h2>Convert Text Scripts into High-Impact Vocal Narration</h2>
      <p>Transforming text into voice simplifies content creation for video producers, audio creators, and corporate trainers. ${BRAND_NAME} renders natural human vocal inflections across any genre of written material.</p>

      <div style="margin-top:30px;">
        <a href="${DOMAIN}/text-to-speech" style="color:#00c896; font-weight:600;">◀ Back to Text to Speech Pillar</a>
      </div>
    `
  },
  "text-to-speech/voice-generator": {
    title: `AI Voice Generator: Create Realistic Neural Voices | ${BRAND_NAME}`,
    h1: `AI Voice Generator`,
    metaDesc: `Create custom AI voiceovers with ${BRAND_NAME} voice generator. High-bitrate MP3 export, multiple accents, and natural emotional depth.`,
    category: "Voice Generation",
    readingTime: "7 min read",
    content: `
      <h2>Create Natural AI Voiceovers in Seconds</h2>
      <p>Our <strong>AI Voice Generator</strong> produces hyper-realistic vocal tracks for YouTube, video ads, e-learning courses, and commercial narration.</p>
    `
  },
  "text-to-speech/read-aloud": {
    title: `Read Aloud Tool: Screen Reader & Study Assistant | ${BRAND_NAME}`,
    h1: `Read Aloud Text Reader`,
    metaDesc: `Improve reading comprehension and accessibility with our free Read Aloud tool. Listen to articles, documents, and books with natural AI voices.`,
    category: "Accessibility",
    readingTime: "6 min read",
    content: `
      <h2>Auditory Assistive Reading for Students & Professionals</h2>
      <p>The <strong>Read Aloud</strong> feature turns static text into spoken dialogue, aiding visual focus, proofreading accuracy, and auditory learning comprehension.</p>
    `
  },
  "text-to-speech/pdf-to-speech": {
    title: `PDF to Speech: Convert PDF Documents to Audio MP3 | ${BRAND_NAME}`,
    h1: `PDF to Speech Converter`,
    metaDesc: `Upload PDF files and convert them into clear spoken audio. Perfect for listening to research papers, eBooks, and study guides on the go.`,
    category: "Document Processing",
    readingTime: "7 min read",
    content: `
      <h2>Convert PDF Files into Audiobooks & Spoken Audio</h2>
      <p>Listening to long PDF documents is simple with ${BRAND_NAME}. Upload any PDF file to extract text and convert it into natural vocal audio tracks.</p>
    `
  },
  "text-to-speech/word-to-speech": {
    title: `Word to Speech: Convert DOCX Documents to Voiceovers | ${BRAND_NAME}`,
    h1: `Word DOCX to Speech Converter`,
    metaDesc: `Convert Microsoft Word (.docx) documents into professional voiceovers and MP3 audio files for free with ${BRAND_NAME}.`,
    category: "Document Processing",
    readingTime: "6 min read",
    content: `
      <h2>Turn Microsoft Word Documents into Audio Recordings</h2>
      <p>Import your Word DOCX scripts directly to generate high-clarity spoken voiceovers without tedious copy-pasting.</p>
    `
  },
  "text-to-speech/txt-to-speech": {
    title: `TXT to Speech: Convert Plain Text Files to MP3 Audio | ${BRAND_NAME}`,
    h1: `TXT to Speech Converter`,
    metaDesc: `Convert plain text (.txt) files into natural spoken audio with ${BRAND_NAME}. Upload code notes, drafts, or raw exports and listen to them as MP3.`,
    category: "Document Processing",
    readingTime: "5 min read",
    content: `
      <h2>Convert Plain Text Files into Spoken Audio</h2>
      <p>The <strong>TXT to Speech</strong> converter parses plain text (<code>.txt</code>) files, code notes, and raw script exports and turns them into natural neural voice audio with instant MP3 download.</p>
      <p>Because plain text files carry no styling, ${BRAND_NAME} reads the raw characters verbatim, preserving exact wording, line breaks, and punctuation-driven pauses. It is the ideal pipeline for converting drafts, code readthroughs, and raw notes into listenable audio.</p>
    `
  }
};

module.exports = {
  TEXT_TO_SPEECH_SUBPAGES
};
