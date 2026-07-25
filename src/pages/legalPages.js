/**
 * 10 Mandated AdSense Trust & Legal Pages for TextToSpeechH AI
 * Official Brand: TextToSpeechH AI
 * Domain: https://texttospeechh.com
 * Primary Contact: hello@texttospeechh.com
 * Support: support@texttospeechh.com
 */

const DOMAIN = "https://texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";
const CONTACT_EMAIL = "hello@texttospeechh.com";
const SUPPORT_EMAIL = "support@texttospeechh.com";

const LEGAL_PAGES = {
  about: {
    title: `About Us | ${BRAND_NAME}`,
    h1: `About ${BRAND_NAME}`,
    metaDesc: `Learn about ${BRAND_NAME}, our mission to provide ultra-realistic free AI voice synthesis and text-to-speech technology for global creators and businesses.`,
    content: `
      <h2>Welcome to ${BRAND_NAME}</h2>
      <p>${BRAND_NAME} (available at <a href="${DOMAIN}">${DOMAIN}</a>) is a state-of-the-art AI Text to Speech platform engineered to transform written scripts into natural, human-like voiceovers in seconds.</p>
      <p>Our core mission is to democratize high-quality speech synthesis for content creators, marketers, educators, podcasters, and businesses across the United States and worldwide. By leveraging cutting-edge neural TTS models, ${BRAND_NAME} enables seamless long-script conversion (up to 10,000 words) without requiring expensive API subscriptions.</p>
      <h3>Why Choose ${BRAND_NAME}?</h3>
      <ul>
        <li><strong>Free & Unlimited Access:</strong> Generate neural voiceovers without hidden charges.</li>
        <li><strong>Multi-Lingual Excellence:</strong> Support for English, Hindi, Urdu, Spanish, French, German, Arabic, Japanese, and more.</li>
        <li><strong>Document Parsing:</strong> Instant extraction from PDF, DOCX, and TXT files.</li>
        <li><strong>Commercial Readiness:</strong> High bitrate MP3 exports ready for video productions, YouTube, podcasts, and commercial presentations.</li>
      </ul>
      <p>For inquiries, contact us at: <strong><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></strong>. For technical help, reach out to <strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></strong>.</p>
    `
  },
  contact: {
    title: `Contact Us | ${BRAND_NAME}`,
    h1: `Contact ${BRAND_NAME} Team`,
    metaDesc: `Get in touch with ${BRAND_NAME} support for technical assistance, partnership opportunities, or feedback.`,
    content: `
      <h2>We Are Here to Help</h2>
      <p>Have questions, feedback, or technical queries about ${BRAND_NAME}? Our dedicated support team is ready to assist you.</p>
      <div class="contact-card" style="background:rgba(255,255,255,0.03); padding:20px; border-radius:8px; margin:20px 0;">
        <p style="margin-bottom:10px;"><strong>General Inquiries & Partnerships:</strong> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
        <p style="margin-bottom:10px;"><strong>Customer Support & Assistance:</strong> <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p style="margin-bottom:10px;"><strong>Official Website:</strong> <a href="${DOMAIN}">${DOMAIN}</a></p>
        <p style="margin-bottom:0;"><strong>Primary Target Market:</strong> United States & Worldwide</p>
      </div>
      <h3>Support Response Time</h3>
      <p>Our customer support team processes inquiries within 24 business hours.</p>
    `
  },
  privacy: {
    title: `Privacy Policy | ${BRAND_NAME}`,
    h1: `Privacy Policy`,
    metaDesc: `Read the official Privacy Policy for ${BRAND_NAME} to understand how we handle data, user privacy, and cookie security.`,
    content: `
      <h2>Privacy Policy for ${BRAND_NAME}</h2>
      <p>Effective Date: July 24, 2026</p>
      <p>At ${BRAND_NAME} (accessible from <a href="${DOMAIN}">${DOMAIN}</a>), user privacy is one of our main priorities. This Privacy Policy document outlines the types of information collected and how it is used.</p>
      <h3>Information We Collect</h3>
      <p>We do not require users to create an account or provide personal identification to generate text-to-speech audio. Uploaded document texts (PDF, DOCX, TXT) and entered scripts are processed transiently in memory solely to produce audio output and are automatically purged.</p>
      <h3>Google AdSense & Cookies</h3>
      <p>${BRAND_NAME} uses third-party vendor cookies, including Google AdSense, to serve ads based on users' visits to our website. Users may opt out of personalized advertising by visiting Google Ad Settings.</p>
      <h3>Contact Information</h3>
      <p>If you have additional questions regarding our Privacy Policy, reach out to our privacy compliance officer at <strong><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></strong>.</p>
    `
  },
  terms: {
    title: `Terms of Service | ${BRAND_NAME}`,
    h1: `Terms of Service`,
    metaDesc: `Terms of Service and legal usage agreement for accessing and using ${BRAND_NAME}.`,
    content: `
      <h2>Terms and Conditions</h2>
      <p>By accessing ${BRAND_NAME} at <a href="${DOMAIN}">${DOMAIN}</a>, you agree to comply with these terms of service.</p>
      <h3>Permitted Use</h3>
      <p>You may use ${BRAND_NAME} to generate speech audio for personal, educational, and commercial purposes provided your content complies with applicable state and federal laws in the United States and your local jurisdiction.</p>
      <h3>Prohibited Conduct</h3>
      <p>You agree not to use ${BRAND_NAME} to produce fraudulent impersonations, malicious deepfakes, hate speech, or defamatory materials.</p>
      <p>For legal inquiries, contact <strong><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></strong>.</p>
    `
  },
  disclaimer: {
    title: `Disclaimer | ${BRAND_NAME}`,
    h1: `Legal Disclaimer`,
    metaDesc: `Official legal disclaimer regarding AI speech outputs and service availability for ${BRAND_NAME}.`,
    content: `
      <h2>Legal Disclaimer</h2>
      <p>All speech synthesis services provided on ${BRAND_NAME} (<a href="${DOMAIN}">${DOMAIN}</a>) are provided on an "as is" and "as available" basis without warranties of any kind.</p>
      <p>Users maintain full legal responsibility for the script content submitted for audio generation. ${BRAND_NAME} disclaims liability for misuse of generated voice audio.</p>
      <p>Inquiries: <strong><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></strong></p>
    `
  },
  cookie: {
    title: `Cookie Policy | ${BRAND_NAME}`,
    h1: `Cookie Policy`,
    metaDesc: `Understand how cookies and local storage are utilized on ${BRAND_NAME}.`,
    content: `
      <h2>Cookie Policy for ${BRAND_NAME}</h2>
      <p>${BRAND_NAME} uses essential cookies and local browser storage to save your UI preferences (such as speed rate, pitch, and voice character choices).</p>
      <p>Third-party advertising partners like Google AdSense may place cookies on your browser to measure ad performance. You can manage cookie settings in your browser configuration.</p>
      <p>Questions? Contact <strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></strong>.</p>
    `
  },
  dmca: {
    title: `DMCA & Copyright Policy | ${BRAND_NAME}`,
    h1: `DMCA Copyright Policy`,
    metaDesc: `Digital Millennium Copyright Act (DMCA) notice procedures and copyright policy for ${BRAND_NAME}.`,
    content: `
      <h2>DMCA Notice Procedure</h2>
      <p>${BRAND_NAME} respects intellectual property rights. If you believe your copyrighted text or materials have been processed on <a href="${DOMAIN}">${DOMAIN}</a> without authorization, please submit a written notice to our designated copyright agent:</p>
      <div class="contact-card" style="background:rgba(255,255,255,0.03); padding:15px; border-radius:8px; margin:15px 0;">
        <p><strong>Copyright Agent Email:</strong> <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
      </div>
      <p>Your DMCA notice must include a description of the copyrighted work, the specific URL, and your contact details.</p>
    `
  },
  accessibility: {
    title: `Accessibility Statement | ${BRAND_NAME}`,
    h1: `Accessibility Statement`,
    metaDesc: `${BRAND_NAME} is committed to web accessibility and WCAG 2.1 compliance.`,
    content: `
      <h2>Web Accessibility Commitment</h2>
      <p>${BRAND_NAME} is dedicated to ensuring digital accessibility for people with disabilities. We continuously improve user experience by implementing WCAG 2.1 Level AA accessibility standards.</p>
      <p>Features include screen-reader compatible keyboard navigation, high contrast UI, and keyboard shortcuts (<kbd>Ctrl+Enter</kbd>, <kbd>Space</kbd>).</p>
      <p>Report accessibility barriers to: <strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></strong></p>
    `
  },
  refund: {
    title: `Refund & Billing Policy | ${BRAND_NAME}`,
    h1: `Refund & Billing Policy`,
    metaDesc: `Billing and refund terms for ${BRAND_NAME} free and premium services.`,
    content: `
      <h2>Refund Policy</h2>
      <p>${BRAND_NAME} is currently provided as a <strong>100% Free AI Voice Generator</strong>. Users are not charged any subscription or upfront fees to convert text into speech.</p>
      <p>Should premium plans be introduced in the future, detailed billing terms and refund windows will be published on <a href="${DOMAIN}">${DOMAIN}</a>.</p>
      <p>Contact: <strong><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></strong></p>
    `
  },
  community: {
    title: `Community Guidelines | ${BRAND_NAME}`,
    h1: `Community Guidelines`,
    metaDesc: `Standards of conduct and usage guidelines for ${BRAND_NAME} voice generation platform.`,
    content: `
      <h2>Community Guidelines</h2>
      <p>To keep ${BRAND_NAME} safe and accessible for creators globally, all users must follow these community guidelines:</p>
      <ul>
        <li>Respect copyright and intellectual property.</li>
        <li>Do not create voice impersonation deepfakes intended to deceive or defraud.</li>
        <li>Maintain ethical AI speech generation practices.</li>
      </ul>
      <p>Inquiries: <strong><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></strong></p>
    `
  }
};

module.exports = {
  DOMAIN,
  BRAND_NAME,
  CONTACT_EMAIL,
  SUPPORT_EMAIL,
  LEGAL_PAGES
};
