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
    metaDesc: `Meet Mauhnish, founder of TextToSpeechH AI. He writes hands-on guides on AI voice tools and text to speech — every comparison here is tested by him.`,
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
    

      <h2>What I do here</h2>
      <p>
        TextToSpeechH AI is a one-person project, and I'm that person. I built the site, I keep the
        converter running day to day, and I write and update every guide you read here. There is no
        team behind the curtain and no big company funding it — just me, working from India, building
        the tool I wanted to use myself. My background is a few years of online work — content, SEO,
        and small web projects — and this site is where all of that comes together. When something
        here improves, it's usually because a reader wrote in, or because I ran into the same
        frustration myself.
      </p>

      <h2>How the guides on this site are made</h2>
      <p>
        Every guide starts the same way: I open the tool and use it the way a reader would. I paste
        in real text, try the voices, and push against the free plan until I find where it actually
        stops — not just where the pricing page says it stops. Before anything goes up, I check the
        details that go stale fastest — prices, free-tier limits, and dates — against the tool's own
        pages. Tools change quietly all the time, so I revisit older guides and update them when a
        plan, a voice, or a limit changes. And when I get something wrong, I fix the guide. I'd
        rather correct a line than leave a reader misled.
      </p>

      <h2>Beyond TextToSpeechH</h2>
      <p>
        Outside this site, I'm also an independent publisher. Under the pen name
        <strong>Monis Barkati</strong>, I publish large-print puzzle books on Amazon — word searches
        and puzzle collections, mostly made with older readers in mind. It's a very different kind of
        work from building a web tool, but it comes from the same place: making useful things on my
        own, and learning the craft as I go. No agency, no staff — just independent projects, one at
        a time. Both sides of the work keep me close to the people who actually use what I make,
        and their feedback shapes what I build and publish next.
      </p>

      <h2>Get in touch</h2>
      <p>
        The easiest way to reach me is the
        <a href="/contact" style="color:var(--color-primary);">contact page</a>, or by email at
        <a href="mailto:hello@texttospeechh.com" style="color:var(--color-primary);">hello@texttospeechh.com</a>.
        Feedback is genuinely welcome — a feature you'd like, a tool you want tested, or a question
        about a guide. And one special request: if you spot a mistake anywhere on this site — an
        outdated price, a wrong limit, a step that no longer works — please tell me. Readers catching
        errors is one of the best quality checks this site has, and every report gets read.
      </p>
    
`
  }
};

module.exports = { AUTHOR_PAGES };
