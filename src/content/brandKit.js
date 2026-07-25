/**
 * Official Brand Kit & Asset Directory for TextToSpeechH AI
 * Website: https://texttospeechh.com
 */

const BRAND_KIT = {
  brandName: "TextToSpeechH AI",
  website: "https://texttospeechh.com",
  assets: {
    primaryLogo: "/logo.svg",
    logoDark: "/logo-dark.svg",
    logoLight: "/logo-light.svg",
    iconOnly: "/logo-icon.svg",
    favicons: {
      svg: "/favicon.svg",
      ico: "/favicon.ico",
      png16: "/favicon-16x16.png",
      png32: "/favicon-32x32.png"
    },
    mobilePwa: {
      appleTouchIcon: "/apple-touch-icon.png",
      android192: "/android-chrome-192x192.png",
      android512: "/android-chrome-512x512.png",
      webmanifest: "/site.webmanifest"
    }
  },
  palette: {
    primaryBlue: "#3B82F6",
    accentCyan: "#06B6D4",
    darkBackground: "#0B0D17",
    lightBackground: "#FFFFFF",
    panelBackground: "rgba(22, 27, 46, 0.7)",
    textMain: "#F0F4F8",
    textMuted: "#8E9BB0"
  },
  typography: {
    primaryFontFamily: "Outfit, Inter, sans-serif",
    headings: "Outfit (700 Bold / 800 ExtraBold)",
    bodyText: "Outfit (400 Regular / 500 Medium)"
  },
  spacingRules: "Always maintain minimum clear space equal to 50% of the emblem width.",
  themeVariants: {
    darkTheme: "Use /logo-dark.svg or /logo.svg on dark (#0B0D17) backgrounds.",
    lightTheme: "Use /logo-light.svg on light (#FFFFFF) backgrounds."
  }
};

module.exports = BRAND_KIT;
