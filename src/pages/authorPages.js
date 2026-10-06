/**
 * TextToSpeechH AI — Author Profile Pages (E-E-A-T)
 * Brand: TextToSpeechH AI
 * Domain: https://www.texttospeechh.com
 *
 * Human author bylines for articles and guides. Person JSON-LD is emitted
 * for these pages by renderSeoPage() when pageData.isAuthorPage is true.
 */

const DOMAIN = "https://www.texttospeechh.com";
const BRAND_NAME = "TextToSpeechH AI";

const AUTHOR_PAGES = {
  'author/mauhnish': {
    title: `Mauhnish — Founder & Editor | ${BRAND_NAME}`,
    h1: `Mauhnish`,
    metaDesc: `Meet Mauhnish, founder of ${BRAND_NAME}. He writes hands-on guides about AI voice tools, text-to-speech, and audiobook creation — every comparison on this site is tested by him.`,
    isAuthorPage: true,
    content: `
      <div class="legal-hero-card glass-panel">
        <h2>Founder & Editor, ${BRAND_NAME}</h2>
        <p>
          Hi, I'm <strong>Mauhnish</strong>. I built ${BRAND_NAME} because I was tired of the same
          story everywhere: text-to-speech tools that lock the good voices behind a paywall, trials
          that expire mid-project, and "free" plans with watermarks. I wanted one tool that just
          works — paste text, pick a voice, download the MP3. No signup, no credits, no catch.
        </p>
        <p>
          I write every guide and comparison on this site myself, hands-on. When a comparison says
          one tool beats another, that's because I ran the same script through both and listened to
          the results — not because I read someone else's review. If a tool has an annoying limit
          or a voice sounds robotic, I'll say so plainly.
        </p>
      </div>

      <h2>What I cover</h2>
      <div class="features-grid">
        <div class="feature-card glass-panel">
          <h3>AI voice tools, tested</h3>
          <p>Real comparisons of text-to-speech tools — free tiers, voice quality, and limits, checked by actually using them.</p>
        </div>
        <div class="feature-card glass-panel">
          <h3>Creator workflows</h3>
          <p>Practical guides for YouTube voiceovers, audiobooks, podcast narration, and e-learning — the stuff I use the tool for myself.</p>
        </div>
        <div class="feature-card glass-panel">
          <h3>Honest caveats</h3>
          <p>AI voices are impressive but not magic. I write about where they shine and where a human voice still wins.</p>
        </div>
      </div>

      <h2>How I test</h2>
      <p>
        The short version: the same test script goes into every tool, I listen to the full output,
        and I check the free plan the way a real user would — hitting the limits and noting exactly
        where the paywall appears. The full routine is documented on the
        <a href="/about" style="color:var(--color-primary);">About page</a>.
      </p>
      <p>
        Questions about a guide, or a tool you want me to test? Reach me at
        <a href="mailto:hello@texttospeechh.com" style="color:var(--color-primary);">hello@texttospeechh.com</a> —
        I read everything.
      </p>
    `
  }
};

module.exports = { AUTHOR_PAGES };
