/**
 * Production SaaS Multi-Column Footer Component for TextToSpeechH AI
 * Domain: https://texttospeechh.com
 * Official Social: Instagram @webxpert.ai (https://www.instagram.com/webxpert.ai/)
 * Single Official Contact: hello@texttospeechh.com
 */

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";
const OFFICIAL_INSTAGRAM = "https://www.instagram.com/webxpert.ai/";
const SINGLE_OFFICIAL_EMAIL = "hello@texttospeechh.com";

function getSaaSFooterHtml() {
  return `
  <footer class="saas-footer" aria-label="Site Footer">
    <div class="footer-top-grid">
      <!-- Brand Column -->
      <div class="footer-brand-col">
        <div class="footer-brand-row">
          <img src="/logo-icon.svg" alt="TextToSpeechH AI Emblem" class="footer-brand-icon">
          <h2>TextToSpeechH <span class="accent-text">AI</span></h2>
        </div>
        <p class="footer-brand-desc">Convert text into ultra-realistic human voices instantly using ${BRAND_NAME}. Engineered for content creators, long script narrations, and global businesses.</p>
        <div class="footer-contact-info">
          <p>Official Contact: <a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a></p>
        </div>
      </div>

      <!-- Company Section -->
      <div class="footer-col">
        <h3 class="footer-col-title">Company</h3>
        <ul class="footer-links-list">
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact Support</a></li>
          <li><a href="/blog/ultimate-ai-texttospeechh.com-guide">Blog & Guides</a></li>
          <li><a href="/accessibility">Accessibility</a></li>
          <li><a href="/community-guidelines">Community</a></li>
        </ul>
      </div>

      <!-- AI Tools Section -->
      <div class="footer-col">
        <h3 class="footer-col-title">AI Tools</h3>
        <ul class="footer-links-list">
          <li><a href="/">Free AI Voice Generator</a></li>
          <li><a href="/keyword/text-to-speech-free">Text to Speech</a></li>
          <li><a href="/keyword/free-ai-texttospeechh.com">Text to MP3 Converter</a></li>
          <li><a href="/blog/text-to-speech-audiobook-creation">Long Text to Speech</a></li>
          <li><a href="/language/hindi">Hindi Text to Speech</a></li>
          <li><a href="/language/english">English Text to Speech</a></li>
        </ul>
      </div>

      <!-- Languages Section -->
      <div class="footer-col">
        <h3 class="footer-col-title">Languages</h3>
        <ul class="footer-links-list">
          <li><a href="/language/english">English TTS</a></li>
          <li><a href="/language/hindi">Hindi TTS</a></li>
          <li><a href="/language/urdu">Urdu TTS</a></li>
          <li><a href="/language/spanish">Spanish TTS</a></li>
          <li><a href="/language/french">French TTS</a></li>
          <li><a href="/language/german">German TTS</a></li>
        </ul>
      </div>

      <!-- Legal & Governance Section -->
      <div class="footer-col">
        <h3 class="footer-col-title">Legal & Trust</h3>
        <ul class="footer-links-list">
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/disclaimer">Disclaimer</a></li>
          <li><a href="/cookie-policy">Cookie Policy</a></li>
          <li><a href="/dmca">DMCA Policy</a></li>
        </ul>
      </div>
    </div>

    <!-- Independent Trademark Disclaimer Box -->
    <div class="footer-disclaimer-box">
      <p><strong>Trademark Disclaimer:</strong> Comparison pages published on TextToSpeechH AI represent independent software evaluations created for informational purposes. All product names, trademarks, logos, and registered brands are property of their respective owners. Mention of third-party product names does not imply affiliation, endorsement, or sponsorship by their respective holders.</p>
    </div>

    <!-- Bottom Social & Copyright Bar -->
    <div class="footer-bottom-bar">
      <p>© 2026 ${BRAND_NAME}. All Rights Reserved.</p>
      <div class="social-links" style="display:flex; align-items:center; gap:12px;">
        <a href="${OFFICIAL_INSTAGRAM}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-cyan); text-decoration:none; font-weight:500;" aria-label="Official Instagram">
          📸 Instagram: @webxpert.ai
        </a>
      </div>
    </div>
  </footer>`;
}

module.exports = { getSaaSFooterHtml };
