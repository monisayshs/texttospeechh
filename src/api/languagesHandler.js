module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const languages = [
    { code: 'en-US', name: 'English (United States)', defaultVoice: 'en-US-JennyNeural', voiceCount: 4 },
    { code: 'en-GB', name: 'English (United Kingdom)', defaultVoice: 'en-GB-SoniaNeural', voiceCount: 2 },
    { code: 'hi-IN', name: 'Hindi (India)', defaultVoice: 'hi-IN-SwaraNeural', voiceCount: 2 },
    { code: 'ur-PK', name: 'Urdu (Pakistan)', defaultVoice: 'ur-PK-UzmaNeural', voiceCount: 2 },
    { code: 'es-ES', name: 'Spanish (Spain)', defaultVoice: 'es-ES-ElviraNeural', voiceCount: 2 },
    { code: 'fr-FR', name: 'French (France)', defaultVoice: 'fr-FR-DeniseNeural', voiceCount: 2 },
    { code: 'de-DE', name: 'German (Germany)', defaultVoice: 'de-DE-KatjaNeural', voiceCount: 2 },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', defaultVoice: 'ar-SA-ZariyahNeural', voiceCount: 2 },
    { code: 'ja-JP', name: 'Japanese (Japan)', defaultVoice: 'ja-JP-NanamiNeural', voiceCount: 2 }
  ];

  res.status(200).json({
    success: true,
    totalLanguages: languages.length,
    languages: languages
  });
};
