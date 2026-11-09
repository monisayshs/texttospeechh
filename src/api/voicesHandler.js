module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const voices = [
    { id: 'en-US-JennyNeural', name: 'Jenny (US Female - Natural)', locale: 'en-US', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'en-US-GuyNeural', name: 'Guy (US Male - Professional)', locale: 'en-US', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'en-US-AriaNeural', name: 'Aria (US Female - Expressive)', locale: 'en-US', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female - Elegance)', locale: 'en-GB', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'en-GB-RyanNeural', name: 'Ryan (UK Male - Authoritative)', locale: 'en-GB', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'hi-IN-SwaraNeural', name: 'Swara (Hindi Female - Sweet)', locale: 'hi-IN', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'hi-IN-MadhurNeural', name: 'Madhur (Hindi Male - Clear)', locale: 'hi-IN', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'ur-PK-UzmaNeural', name: 'Uzma (Urdu Female - Soft)', locale: 'ur-PK', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'ur-PK-AsadNeural', name: 'Asad (Urdu Male - Deep)', locale: 'ur-PK', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'es-ES-ElviraNeural', name: 'Elvira (Spanish Female)', locale: 'es-ES', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'fr-FR-DeniseNeural', name: 'Denise (French Female)', locale: 'fr-FR', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'de-DE-KatjaNeural', name: 'Katja (German Female)', locale: 'de-DE', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'ar-SA-ZariyahNeural', name: 'Zariyah (Arabic Female)', locale: 'ar-SA', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'ja-JP-NanamiNeural', name: 'Nanami (Japanese Female)', locale: 'ja-JP', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'fa-IR-DilaraNeural', name: 'Dilara (Persian Female)', locale: 'fa-IR', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'fa-IR-FaridNeural', name: 'Farid (Persian Male)', locale: 'fa-IR', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'ko-KR-SunHiNeural', name: 'SunHi (Korean Female)', locale: 'ko-KR', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'ko-KR-InJoonNeural', name: 'InJoon (Korean Male)', locale: 'ko-KR', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'nl-NL-ColetteNeural', name: 'Colette (Dutch Female)', locale: 'nl-NL', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'nl-NL-MaartenNeural', name: 'Maarten (Dutch Male)', locale: 'nl-NL', gender: 'Male', quality: 'Neural High Bitrate' },
    { id: 'zh-TW-HsiaoChenNeural', name: 'HsiaoChen (Chinese Female)', locale: 'zh-TW', gender: 'Female', quality: 'Neural High Bitrate' },
    { id: 'zh-TW-YunJheNeural', name: 'YunJhe (Chinese Male)', locale: 'zh-TW', gender: 'Male', quality: 'Neural High Bitrate' }
  ];

  res.status(200).json({
    success: true,
    totalVoices: voices.length,
    voices: voices
  });
};
