/**
 * Production Footer Component for TextToSpeechH AI
 * Domain: https://texttospeechh.com
 * Single Official Contact: hello@texttospeechh.com
 */

const BRAND_NAME = "TextToSpeechH AI";
const SINGLE_OFFICIAL_EMAIL = "hello@texttospeechh.com";

function getSaaSFooterHtml() {
  return `
  <footer class="saas-footer" aria-label="Site Footer" style="text-align: center; padding: 35px 20px;">
    <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px;">
      <img src="/logo-icon.svg" alt="TextToSpeechH AI Emblem" style="width:36px; height:36px;">
      <h2 style="font-size:1.5rem; font-weight:700; color:var(--text-main);">${BRAND_NAME}</h2>
    </div>
    <p style="font-size:0.95rem; color:var(--text-muted); margin-bottom:18px;">Convert text into realistic AI voices in seconds.</p>
    <div style="background:var(--card-sub-bg); border:1px solid var(--panel-border); border-radius:12px; padding:16px 20px; max-width:640px; margin:0 auto 24px auto;">
      <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.6; margin-bottom:6px;">
        Support, business, partnerships, legal and general inquiries:
      </p>
      <a href="mailto:${SINGLE_OFFICIAL_EMAIL}" style="font-size:1.05rem; font-weight:600; color:var(--accent-cyan); text-decoration:none;">${SINGLE_OFFICIAL_EMAIL}</a>
    </div>
    <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap; margin-bottom:20px; font-size:0.88rem;">
      <a href="/about" style="color:var(--text-muted); text-decoration:none;">About Us</a>
      <a href="/contact" style="color:var(--text-muted); text-decoration:none;">Contact</a>
      <a href="/privacy-policy" style="color:var(--text-muted); text-decoration:none;">Privacy Policy</a>
      <a href="/terms" style="color:var(--text-muted); text-decoration:none;">Terms of Service</a>
      <a href="/disclaimer" style="color:var(--text-muted); text-decoration:none;">Disclaimer</a>
    </div>
    <p style="font-size:0.82rem; color:var(--text-muted);">© 2026 ${BRAND_NAME}. All Rights Reserved.</p>
  </footer>`;
}

module.exports = { getSaaSFooterHtml };

