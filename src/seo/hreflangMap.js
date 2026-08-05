/**
 * Hreflang Generator for TextToSpeechH AI
 * Canonical Domain: https://www.texttospeechh.com
 *
 * Only real, live locale pages are eligible for hreflang. The site ships
 * dedicated /language/* landing pages (English, Hindi, Urdu, Spanish,
 * Arabic, French, German). Every other page has no localized alternate, so
 * emitting an hreflang block there would point search engines at 404 URLs.
 * We therefore return an empty string (no hreflang) for non-language pages.
 */

const DOMAIN = "https://www.texttospeechh.com";

const LANGUAGE_HREFLANG = {
  "language/english": "en",
  "language/hindi": "hi",
  "language/urdu": "ur",
  "language/spanish": "es",
  "language/arabic": "ar",
  "language/french": "fr",
  "language/german": "de"
};

function getHreflangHtmlTags(pathSlug) {
  if (!pathSlug) return "";
  if (!LANGUAGE_HREFLANG[pathSlug]) return "";

  const tags = Object.entries(LANGUAGE_HREFLANG).map(
    ([slug, lang]) => `<link rel="alternate" hreflang="${lang}" href="${DOMAIN}/${slug}" />`
  );
  tags.push(`<link rel="alternate" hreflang="x-default" href="${DOMAIN}/" />`);
  return tags.join("\n  ");
}

module.exports = {
  DOMAIN,
  LANGUAGE_HREFLANG,
  getHreflangHtmlTags
};
