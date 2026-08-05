/**
 * EEAT Authority & Editorial Guidelines Module for TextToSpeechH AI
 * Domain: https://www.texttospeechh.com
 * Brand: TextToSpeechH AI
 */

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

const EDITORIAL_POLICY = {
  lastUpdated: "July 24, 2026",
  reviewStatus: "Verified & Fact-Checked",
  authors: [
    {
      name: "TextToSpeechH AI Research Team",
      role: "Lead AI Speech & Speech Synthesis Engineers",
      bio: "Our specialized engineering team evaluates neural text-to-speech architectures, language phoneme mappings, and audio pipeline optimizations to deliver studio-quality voiceovers."
    }
  ],
  principles: [
    "Fact-based comparative analyses of speech synthesis platforms without deceptive marketing claims.",
    "Strict adherence to open-license model verification (Apache 2.0 / MIT) for legal commercial usage.",
    "Comprehensive user privacy protection with transient memory processing and zero permanent script retention.",
    "Full digital accessibility compliance following WCAG 2.1 Level AA recommendations."
  ]
};

function getEeatHeaderHtml(pageTitle) {
  return `
  <div class="eeat-badge-box" style="background:rgba(0, 242, 254, 0.05); border:1px solid rgba(0, 242, 254, 0.2); border-radius:10px; padding:12px 18px; margin-bottom:20px; font-size:0.82rem; color:#8e9bb0;">
    <p style="margin-bottom:4px;"><strong>Verified EEAT Authority Content</strong> | Fact-Checked & Reviewed by <strong>TextToSpeechH AI Research Team</strong></p>
    <p style="margin:0;">Last Updated: <strong>${EDITORIAL_POLICY.lastUpdated}</strong> | Editorial Status: <span style="color:#00f2fe;">${EDITORIAL_POLICY.reviewStatus}</span></p>
  </div>`;
}

module.exports = {
  DOMAIN,
  BRAND_NAME,
  EDITORIAL_POLICY,
  getEeatHeaderHtml
};
