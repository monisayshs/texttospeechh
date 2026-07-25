const BaseProvider = require('../baseProvider');
const http = require('http');
const https = require('https');

/**
 * Kokoro-82M Provider
 * License: Apache 2.0 (Verified 100% Commercial SaaS Permitted)
 * Speed: 82M Ultra-Lightweight Neural Model
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
      const url = new URL(this.endpoint);
      const client = url.protocol === 'https:' ? https : http;
      return new Promise((resolve) => {
        const req = client.request(url, { method: 'HEAD', timeout: 1500 }, (res) => {
          resolve(res.statusCode < 500);
        });
        req.on('error', () => resolve(false));
        req.end();
      });
    } catch (e) {
      return false;
    }
  }

  async synthesizeChunk(text, options = {}) {
    const payload = JSON.stringify({
      model: 'kokoro',
      input: text,
      voice: options.voice || 'af_bella',
      response_format: 'mp3',
      speed: parseFloat(options.rate || '1.0') || 1.0
    });

    const url = new URL(this.endpoint);
    const client = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = client.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 15000
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Kokoro provider status ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });

      req.on('error', err => reject(new Error(`Kokoro error: ${err.message}`)));
      req.write(payload);
      req.end();
    });
  }
}

module.exports = KokoroProvider;
