/**
 * Hreflang & International Target Generator for TextToSpeechH AI
 * Domain: https://texttospeechh.com
 */

const DOMAIN = "https://texttospeechh.com";

const REGIONAL_TARGETS = [
  { lang: "en-US", url: `${DOMAIN}/`, region: "United States" },
  { lang: "en-GB", url: `${DOMAIN}/uk`, region: "United Kingdom" },
  { lang: "en-CA", url: `${DOMAIN}/ca`, region: "Canada" },
  { lang: "en-AU", url: `${DOMAIN}/au`, region: "Australia" },
  { lang: "hi-IN", url: `${DOMAIN}/hi`, region: "India" },
  { lang: "de-DE", url: `${DOMAIN}/de`, region: "Germany" },
  { lang: "fr-FR", url: `${DOMAIN}/fr`, region: "France" },
  { lang: "es-ES", url: `${DOMAIN}/es`, region: "Spain" },
  { lang: "ja-JP", url: `${DOMAIN}/ja`, region: "Japan" },
  { lang: "pt-BR", url: `${DOMAIN}/pt`, region: "Brazil" },
  { lang: "x-default", url: `${DOMAIN}/`, region: "Global Fallback" }
];

function getHreflangHtmlTags() {
  return REGIONAL_TARGETS.map(
    t => `<link rel="alternate" hreflang="${t.lang}" href="${t.url}" />`
  ).join("\n  ");
}

module.exports = {
  DOMAIN,
  REGIONAL_TARGETS,
  getHreflangHtmlTags
};
