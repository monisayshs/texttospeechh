/**
 * Topical Authority & Search Intent Silo Architecture for TextToSpeechH AI
 * Domain: https://texttospeechh.com
 * Brand: TextToSpeechH AI
 */

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

const INTENT_SILOS = {
  transactional: [
    { title: "Free AI Voice Generator", url: `${DOMAIN}/`, targetKw: "free ai voice generator" },
    { title: "Text to Speech Free", url: `${DOMAIN}/keyword/text-to-speech-free`, targetKw: "text to speech free" },
    { title: "Convert Text to MP3", url: `${DOMAIN}/keyword/free-ai-texttospeechh.com`, targetKw: "text to mp3 online" },
    { title: "Long Text to Speech", url: `${DOMAIN}/blog/text-to-speech-audiobook-creation`, targetKw: "long text to speech" }
  ],
  commercial: [
    { title: "Professional AI Voiceover for YouTube", url: `${DOMAIN}/blog/ai-voiceover-for-youtube-shorts`, targetKw: "ai voice for youtube" },
    { title: "AI Voice Generator for Audiobooks", url: `${DOMAIN}/blog/text-to-speech-audiobook-creation`, targetKw: "ai audiobook generator" },
    { title: "TextToSpeechH AI vs ElevenLabs", url: `${DOMAIN}/compare/texttospeechh-vs-elevenlabs`, targetKw: "elevenlabs free alternative" },
    { title: "TextToSpeechH AI vs Speechify", url: `${DOMAIN}/compare/texttospeechh-vs-speechify`, targetKw: "speechify free alternative" },
    { title: "TextToSpeechH AI vs Murf AI", url: `${DOMAIN}/compare/texttospeechh-vs-murf-ai`, targetKw: "murf ai alternative" }
  ],
  informational: [
    { title: "The Ultimate Guide to Free AI Voice Generation in 2026", url: `${DOMAIN}/blog/ultimate-ai-texttospeechh.com-guide`, targetKw: "what is ai text to speech" },
    { title: "Understanding AI Voice Cloning Technology", url: `${DOMAIN}/guide/understanding-ai-voice-cloning`, targetKw: "how voice cloning works" },
    { title: "Real-time vs Neural TTS Pitch Shifts", url: `${DOMAIN}/guide/how-voice-changers-work`, targetKw: "how voice changers work" },
    { title: "Master FAQ Directory", url: `${DOMAIN}/faq`, targetKw: "text to speech faq" }
  ],
  navigational: [
    { title: "About TextToSpeechH AI", url: `${DOMAIN}/about`, targetKw: "about texttospeechh ai" },
    { title: "Contact Customer Support", url: `${DOMAIN}/contact`, targetKw: "texttospeechh support" },
    { title: "Privacy Policy", url: `${DOMAIN}/privacy-policy`, targetKw: "texttospeechh privacy policy" }
  ]
};

module.exports = {
  DOMAIN,
  BRAND_NAME,
  INTENT_SILOS
};
