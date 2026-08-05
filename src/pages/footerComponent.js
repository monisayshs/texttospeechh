/**
 * Production SaaS Multi-Column Footer Component for TextToSpeechH AI
 * Domain: https://www.texttospeechh.com
 * Official Social: Instagram @webxpert.ai (https://www.instagram.com/webxpert.ai/)
 * Single Official Contact: hello@texttospeechh.com
 */

const DOMAIN = "https://www.texttospeechh.com";
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
          <li><a href="/text-to-speech/blog">Blog Hub</a></li>
          <li><a href="/text-to-speech">Text to Speech Guide</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
        </ul>
      </div>

      <!-- AI Tools Section -->
      <div class="footer-col">
        <h3 class="footer-col-title">AI Tools</h3>
        <ul class="footer-links-list">
          <li><a href="/">Free AI Voice Generator</a></li>
          <li><a href="/text-to-speech">Text to Speech</a></li>
          <li><a href="/text-to-speech/free-text-to-speech">Free Text to Speech</a></li>
          <li><a href="/text-to-speech/online-text-to-speech">Online Text to Speech</a></li>
          <li><a href="/text-to-speech/text-to-voice">Text to Voice</a></li>
          <li><a href="/text-to-speech/voice-generator">Voice Generator</a></li>
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
        <a href="${OFFICIAL_INSTAGRAM}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue); text-decoration:none; font-weight:500; display:inline-flex; align-items:center; gap:6px;" aria-label="Official Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          Instagram: @webxpert.ai
        </a>
      </div>
    </div>
  </footer>`;
}

module.exports = { getSaaSFooterHtml };
