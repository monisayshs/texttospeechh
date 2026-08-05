/**
 * Educational Guides for Unimplemented Features (TextToSpeechH AI)
 * Domain: https://www.texttospeechh.com
 * Policy: High-Value Educational Content Instead of Fake Tool Pages
 */

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

const EDUCATIONAL_GUIDES = {
  "guide/understanding-ai-voice-cloning": {
    title: `Understanding AI Voice Cloning Technology: Complete Guide | ${BRAND_NAME}`,
    h1: `Understanding AI Voice Cloning Technology`,
    metaDesc: `Learn how AI voice cloning works, neural audio embedding, speaker encoders, and ethical voice synthesis standards in 2026.`,
    content: `
      <h2>How AI Voice Cloning Works</h2>
      <p>Voice cloning technology relies on deep neural networks trained on audio speaker samples to extract unique vocal characteristics, timbre, pitch contour, and speaking rhythm.</p>
      
      <h3>Key Architectural Components</h3>
      <ul>
        <li><strong>Speaker Encoder:</strong> Extracts a fixed-dimensional speaker embedding vector from sample audio.</li>
        <li><strong>Synthesizer:</strong> Combines text phonemes with the speaker embedding to generate mel-spectrograms.</li>
        <li><strong>Neural Vocoder:</strong> Converts mel-spectrograms into high-fidelity audible waveform files.</li>
      </ul>

      <div class="guide-cta-box" style="background:rgba(79, 172, 254, 0.08); border:1px solid rgba(79, 172, 254, 0.2); padding:20px; border-radius:12px; margin-top:25px;">
        <h3>Looking for Instant Speech Generation?</h3>
        <p>While voice cloning requires custom model training, you can instantly convert text scripts into natural, pre-tuned neural voices on <a href="${DOMAIN}">${BRAND_NAME}</a> for free!</p>
        <p style="margin-top:10px;"><a href="/" class="primary-btn" style="display:inline-flex; text-decoration:none;">Try ${BRAND_NAME} Voice Generator</a></p>
      </div>
    `
  },
  "guide/how-voice-changers-work": {
    title: `How AI Voice Changers & Pitch Shift Synthesizers Work | ${BRAND_NAME}`,
    h1: `How AI Voice Changers & Pitch Shift Synthesizers Work`,
    metaDesc: `Explore the technical differences between real-time pitch shifting voice changers and neural text-to-speech generators.`,
    content: `
      <h2>Real-Time Voice Changers vs Neural Text-to-Speech</h2>
      <p>Voice changers alter existing microphone audio input using digital signal processing (DSP) or Retrieval-based Voice Conversion (RVC). Neural Text-to-Speech (<a href="${DOMAIN}">${BRAND_NAME}</a>), by contrast, generates brand new speech directly from written text scripts.</p>

      <h3>Comparing Speech Technologies</h3>
      <table class="seo-table">
        <thead>
          <tr><th>Technology</th><th>Input Required</th><th>Primary Use Case</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Real-Time Voice Changer</strong></td><td>Live Voice / Microphone</td><td>Gaming & Live Streaming</td></tr>
          <tr><td><strong>Neural TTS (${BRAND_NAME})</strong></td><td>Written Text / PDF / DOCX</td><td>YouTube Narrations, Podcasts, Audiobooks</td></tr>
        </tbody>
      </table>
    `
  }
};

module.exports = {
  DOMAIN,
  BRAND_NAME,
  EDUCATIONAL_GUIDES
};
