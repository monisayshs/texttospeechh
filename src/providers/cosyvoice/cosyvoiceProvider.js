const BaseProvider = require('../baseProvider');

/**
 * CosyVoice 2 Provider
 * License: Apache 2.0 (Verified Base Checkpoint Commercial SaaS Permitted)
 * Speed: Multi-Lingual Expressive Voice Generation
 * 
 * Compatible with both Node.js and Cloudflare Workers runtimes.
 * Uses fetch() as primary HTTP client (Workers-compatible).
 */
class CosyVoiceProvider extends BaseProvider {
  constructor() {
    super('CosyVoice 2', true);
    this.endpoint = process.env.COSYVOICE_API_ENDPOINT || 'http://localhost:50000/api/tts';
  }

  async isAvailable() {
    if (!process.env.COSYVOICE_API_ENDPOINT) {
      return false; // Graceful failover to next provider if self-hosted endpoint is not connected
    }
    try {
      const res = await fetch(this.endpoint, { method: 'HEAD' });
      return res.status < 500;
    } catch (e) {
      return false;
    }
  }

  async synthesizeChunk(text, options = {}) {
    const payloadObj = {
      text: text,
      voice: options.voice || 'Hindi-Swara',
      speed: options.rate || '1.0'
    };

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadObj)
    });

    if (!res.ok) {
      throw new Error(`CosyVoice 2 provider status ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }
}

module.exports = CosyVoiceProvider;
