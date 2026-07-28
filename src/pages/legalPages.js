/**
 * TextToSpeechH AI — Production Legal & Trust Governance Pages
 * Brand: TextToSpeechH AI
 * Domain: https://texttospeechh.com
 * Single Official Email Inbox: hello@texttospeechh.com
 */

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";
const SINGLE_OFFICIAL_EMAIL = "hello@texttospeechh.com";

const LEGAL_PAGES = {
  about: {
    title: `About Us | ${BRAND_NAME} — Free Neural Text-to-Speech Engine`,
    h1: `About ${BRAND_NAME}`,
    metaDesc: `Discover ${BRAND_NAME}, the world's leading free neural text-to-speech platform. Learn about our story, multi-provider AI architecture, mission, and single support hub at ${SINGLE_OFFICIAL_EMAIL}.`,
    content: `
      <div class="legal-hero-card glass-panel">
        <h2>Our Story & Mission</h2>
        <p>
          Founded with a passion for democratizing voice technology, <strong>${BRAND_NAME}</strong> was built to solve a critical challenge faced by digital creators: expensive API paywalls, restrictive character limits, and artificial, robotic-sounding audio.
        </p>
        <p>
          We engineered a revolutionary multi-engine neural synthesis pipeline that combines cutting-edge deep learning models—including Microsoft Edge Neural TTS, Kokoro-82M, and CosyVoice—into a single, ultra-fast web interface accessible to anyone, anywhere in the world.
        </p>
      </div>

      <div class="features-grid">
        <div class="feature-card glass-panel">
          <div class="feature-icon">🎯</div>
          <h3>Our Mission</h3>
          <p>To empower creators, educators, podcasters, and businesses with human-quality, natural neural speech synthesis at zero cost.</p>
        </div>
        <div class="feature-card glass-panel">
          <div class="feature-icon">🌟</div>
          <h3>Our Vision</h3>
          <p>A world where written literature, educational content, and digital media are instantly accessible in audible format across 100+ global languages.</p>
        </div>
        <div class="feature-card glass-panel">
          <div class="feature-icon">⚡</div>
          <h3>High-Speed Architecture</h3>
          <p>Serverless infrastructure optimized to generate multi-minute speech audio streams in less than 1.8 seconds.</p>
        </div>
      </div>

      <h2>Why Creators Choose ${BRAND_NAME}</h2>
      <div class="features-grid" style="margin-bottom: 2rem;">
        <div class="feature-card glass-panel">
          <h3>100% Free & Unlimited Access</h3>
          <p>No mandatory credit card requirements, no hidden API charges, and no artificial daily tokens.</p>
        </div>
        <div class="feature-card glass-panel">
          <h3>10,000 Word Long-Script Queue</h3>
          <p>Paragraph chunking and quote-preservation engines process full YouTube scripts, audiobooks, and documents without mid-sentence truncation.</p>
        </div>
        <div class="feature-card glass-panel">
          <h3>PDF, DOCX & TXT File Extractor</h3>
          <p>Drag and drop PDF books, Word documents, or text scripts directly into the editor for automatic instant text extraction.</p>
        </div>
        <div class="feature-card glass-panel">
          <h3>Full Commercial Rights Included</h3>
          <p>All synthesized audio MP3 files generated on ${BRAND_NAME} are 100% permitted for commercial monetization across YouTube, podcasts, ads, and SaaS apps.</p>
        </div>
      </div>

      <h2>Single Unified Contact Point</h2>
      <p>
        For all technical queries, enterprise feedback, or partnership proposals, our team operates out of a single centralized inbox: 
        <strong><a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a></strong>.
      </p>

      <div class="glass-panel" style="padding: 2rem; border-radius: 16px; text-align: center; margin-top: 2rem;">
        <h3 style="font-size: 1.4rem; margin-bottom: 0.8rem;">Ready to Transform Your Text Into Real Speech?</h3>
        <p style="margin-bottom: 1.5rem;">Experience human-level AI voices with speed and pitch control in seconds.</p>
        <a href="/" class="primary-btn" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 12px 28px; font-weight: 600; border-radius: 30px;">
          ⚡ Launch ${BRAND_NAME} Voice Generator
        </a>
      </div>
    `
  },

  contact: {
    title: `Contact Us | ${BRAND_NAME} Official Support & Contact Hub`,
    h1: `Contact ${BRAND_NAME}`,
    metaDesc: `Get in touch with ${BRAND_NAME}. Every contact submission is routed directly to our official single inbox at ${SINGLE_OFFICIAL_EMAIL}.`,
    content: `
      <p style="font-size: 1.1rem; margin-bottom: 2rem;">
        Have questions, feedback, or need technical help with ${BRAND_NAME}? Email our single unified inbox directly at <strong><a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a></strong> or click the floating feedback button.
      </p>

      <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; margin-bottom: 2.5rem;">
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <div style="font-size: 2.2rem;">✉️</div>
          <div>
            <h3 style="font-size: 1.2rem; margin-bottom: 0.2rem;">Single Official Support Inbox</h3>
            <p style="font-size: 0.95rem;">All messages, technical questions, and legal inquiries are received exclusively at: <strong><a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a></strong></p>
          </div>
        </div>
      </div>
    `
  },

  privacy: {
    title: `Privacy Policy | ${BRAND_NAME} Data Protection & Trust Governance`,
    h1: `Privacy Policy`,
    metaDesc: `Read the official Privacy Policy for ${BRAND_NAME} to learn how we protect your personal data, audio files, and script privacy. Official contact: ${SINGLE_OFFICIAL_EMAIL}.`,
    content: `
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">Effective Date: July 26, 2026</p>

      <p style="font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.8rem;">
        At <strong>${BRAND_NAME}</strong> (accessible from <a href="${DOMAIN}">${DOMAIN}</a>), protecting visitor data privacy is one of our foundational priorities. This Privacy Policy outlines the types of information collected and how it is protected.
      </p>

      <h2>1. Text Script & Audio File Storage</h2>
      <p>
        ${BRAND_NAME} operates on a zero-persistence architecture for text inputs. Text scripts submitted into the generator are processed transiently in memory to synthesize audio streams. We do not store, index, sell, or claim ownership over any user text or generated audio files.
      </p>

      <h2>2. Log Files & Analytics</h2>
      <p>
        Like most web platforms, ${BRAND_NAME} uses standard log files and privacy-focused analytics tools (such as Google Analytics and Microsoft Clarity) to analyze aggregate usage trends, manage site performance, and prevent automated bot abuse.
      </p>

      <h2>3. Contact Information</h2>
      <p>
        For privacy-related inquiries or data deletion requests, contact our legal team:<br>
        <strong>Email:</strong> <a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a>
      </p>
    `
  },

  terms: {
    title: `Terms of Service | ${BRAND_NAME} Usage License & Commercial Rights`,
    h1: `Terms of Service`,
    metaDesc: `Review the Terms of Service for ${BRAND_NAME}. Learn about commercial usage rights, acceptable audio generation policies, and legal guidelines. Support: ${SINGLE_OFFICIAL_EMAIL}.`,
    content: `
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">Effective Date: July 26, 2026</p>

      <p style="font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.8rem;">
        Welcome to <strong>${BRAND_NAME}</strong>. By accessing or using our website located at <a href="${DOMAIN}">${DOMAIN}</a>, you agree to comply with and be bound by these Terms of Service.
      </p>

      <h2>1. Commercial Usage Rights</h2>
      <p>
        Audio MP3 files generated using ${BRAND_NAME} are provided with full commercial rights. You are free to monetize synthesized speech across YouTube, podcasts, audiobooks, radio ads, video games, and commercial applications.
      </p>

      <h2>2. Acceptable Use Policy</h2>
      <p>
        You agree not to use ${BRAND_NAME} to generate harmful, illegal, defamatory, or fraudulent audio content, deepfakes designed to deceive, or un-consented impersonation of individuals.
      </p>

      <h2>3. Official Support</h2>
      <p>
        Questions regarding terms or commercial licensing? Contact:<br>
        <strong>Email:</strong> <a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a>
      </p>
    `
  },

  disclaimer: {
    title: `Disclaimer | ${BRAND_NAME} Independent Legal & Trademark Disclosure`,
    h1: `Disclaimer`,
    metaDesc: `Read the official legal disclaimer for ${BRAND_NAME}. Independent evaluation policies and trademark disclosures. Official email: ${SINGLE_OFFICIAL_EMAIL}.`,
    content: `
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">Effective Date: July 26, 2026</p>

      <p style="font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.8rem;">
        The information provided on <strong>${BRAND_NAME}</strong> (<a href="${DOMAIN}">${DOMAIN}</a>) is for general educational and content creation purposes only.
      </p>

      <h2>1. Trademark & Brand Notice</h2>
      <p>
        All product names, logos, trademarks, and registered brands mentioned on ${BRAND_NAME} (such as ElevenLabs, Speechify, Murf AI, PlayHT) belong to their respective owners. Mention of third-party product names does not imply affiliation or endorsement.
      </p>

      <h2>2. Contact Information</h2>
      <p>
        For formal legal notices or disclaimer inquiries, contact:<br>
        <strong>Email:</strong> <a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a>
      </p>
    `
  },

  cookie: {
    title: `Cookie Policy | ${BRAND_NAME} Browser Storage & Preferences`,
    h1: `Cookie Policy`,
    metaDesc: `Read the official Cookie Policy for ${BRAND_NAME} to learn how local browser storage and advertising cookies are used on our platform. Official contact: ${SINGLE_OFFICIAL_EMAIL}.`,
    content: `
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">Effective Date: July 26, 2026</p>

      <p style="font-size: 1.05rem; line-height: 1.75; margin-bottom: 1.8rem;">
        This Cookie Policy explains how <strong>${BRAND_NAME}</strong> uses cookies and similar local storage technologies to enhance user experience when visiting <a href="${DOMAIN}">${DOMAIN}</a>.
      </p>

      <h2>1. How We Use Cookies</h2>
      <p>
        We use essential local browser storage to save your UI settings (such as chosen voice character, speech rate, and pitch slider levels) so your custom preferences persist across sessions.
      </p>

      <h2>2. Contact Us</h2>
      <p>
        Questions about our Cookie Policy? Contact:<br>
        <strong>Email:</strong> <a href="mailto:${SINGLE_OFFICIAL_EMAIL}">${SINGLE_OFFICIAL_EMAIL}</a>
      </p>
    `
  }
};

module.exports = { LEGAL_PAGES };
