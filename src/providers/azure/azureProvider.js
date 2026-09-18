const BaseProvider = require('../baseProvider');

function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const VOICE_STYLE_SUPPORT_MAP = {
  'en-US-GuyNeural': ['neutral', 'cheerful', 'angry', 'sad', 'friendly', 'excited', 'shouting', 'whispering', 'newscast'],
  // Standard Hindi Neural voices do not support mstts:express-as styles in Azure Speech
  'hi-IN-MadhurNeural': [],
  'hi-IN-SwaraNeural': []
};

class AzureProvider extends BaseProvider {
  constructor() {
    super('Azure Neural TTS', true);
  }

  getApiKey(options = {}) {
    return (options.env && options.env.AZURE_SPEECH_KEY) || process.env.AZURE_SPEECH_KEY || null;
  }

  getRegion(options = {}) {
    return (options.env && options.env.AZURE_SPEECH_REGION) || process.env.AZURE_SPEECH_REGION || 'eastus';
  }

  async isAvailable() {
    return !!(process.env.AZURE_SPEECH_KEY);
  }

  formatRate(rate) {
    if (!rate || rate === '1.0' || rate === '+0%' || rate === '0%') return '+0%';
    if (typeof rate === 'string' && (rate.endsWith('%') || rate.endsWith('x'))) {
      if (rate.endsWith('x')) {
        const mult = parseFloat(rate);
        const percent = Math.round((mult - 1.0) * 100);
        return percent >= 0 ? `+${percent}%` : `${percent}%`;
      }
      return rate;
    }
    const mult = parseFloat(rate);
    if (!isNaN(mult)) {
      const percent = Math.round((mult - 1.0) * 100);
      return percent >= 0 ? `+${percent}%` : `${percent}%`;
    }
    return '+0%';
  }

  formatPitch(pitch) {
    if (!pitch || pitch === '1.0' || pitch === '+0%' || pitch === '0%') return '+0%';
    if (typeof pitch === 'string' && pitch.endsWith('%')) return pitch;
    const mult = parseFloat(pitch);
    if (!isNaN(mult)) {
      const percent = Math.round((mult - 1.0) * 100);
      return percent >= 0 ? `+${percent}%` : `${percent}%`;
    }
    return '+0%';
  }

  async synthesizeChunk(text, options = {}) {
    const apiKey = this.getApiKey(options);
    const region = this.getRegion(options);

    if (!apiKey) {
      throw new Error('Azure Speech API key is missing (AZURE_SPEECH_KEY environment variable not configured).');
    }

    const voiceName = options.voice || 'hi-IN-SwaraNeural';
    const rateStr = this.formatRate(options.rate);
    const pitchStr = this.formatPitch(options.pitch);
    const styleName = (options.style || 'neutral').toLowerCase();
    const langCode = voiceName.substring(0, 5);

    const supportedStyles = VOICE_STYLE_SUPPORT_MAP[voiceName] || [];
    const isStyleSupported = styleName !== 'neutral' && supportedStyles.includes(styleName);

    let innerSsml = `<prosody rate="${rateStr}" pitch="${pitchStr}">${xmlEscape(text)}</prosody>`;
    if (isStyleSupported) {
      innerSsml = `<mstts:express-as style="${styleName}">${innerSsml}</mstts:express-as>`;
    } else if (styleName !== 'neutral') {
      console.warn(`[AzureProvider] Style '${styleName}' is UNSUPPORTED BY PROVIDER/VOICE for voice '${voiceName}'. Synthesizing with standard neural prosody.`);
    }

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${langCode}">
  <voice name="${voiceName}">
    ${innerSsml}
  </voice>
</speak>`;

    const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const headers = {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      'User-Agent': 'TextToSpeechH-AI/1.0.0'
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: ssml
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Azure Speech API HTTP ${res.status}: ${res.statusText} ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!buffer || buffer.length === 0) {
      throw new Error('Azure Speech API returned an empty audio response.');
    }

    return buffer;
  }
}

module.exports = AzureProvider;
