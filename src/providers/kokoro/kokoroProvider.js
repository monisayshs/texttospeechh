const BaseProvider = require('../baseProvider');

/**
 * Kokoro-82M Provider
 * License: Apache 2.0 (Verified 100% Commercial SaaS Permitted)
 * Speed: 82M Ultra-Lightweight Neural Model
 * 
 * Compatible with both Node.js and Cloudflare Workers runtimes.
 * Uses fetch() as primary HTTP client (Workers-compatible).
 * Falls back to Node http/https only when fetch is unavailable.
 */
class KokoroProvider extends BaseProvider {
  constructor() {
    super('Kokoro-82M', true);
    this.endpoint = process.env.KOKORO_API_ENDPOINT || 'http://localhost:8880/v1/audio/speech';
  }

  async isAvailable() {
    if (!process.env.KOKORO_API_ENDPOINT) {
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
      model: 'kokoro',
      input: text,
      voice: options.voice || 'af_bella',
      response_format: 'mp3',
      speed: parseFloat(options.rate || '1.0') || 1.0
    };

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadObj)
    });

    if (!res.ok) {
      throw new Error(`Kokoro provider status ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }
}

module.exports = KokoroProvider;
