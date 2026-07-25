const BaseProvider = require('../baseProvider');
const http = require('http');
const https = require('https');

/**
 * CosyVoice 2 Provider
 * License: Apache 2.0 (Verified Base Checkpoint Commercial SaaS Permitted)
 * Speed: Multi-Lingual Expressive Voice Generation
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
      text: text,
      voice: options.voice || 'Hindi-Swara',
      speed: options.rate || '1.0'
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
        timeout: 20000
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`CosyVoice 2 provider status ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });

      req.on('error', err => reject(new Error(`CosyVoice 2 error: ${err.message}`)));
      req.write(payload);
      req.end();
    });
  }
}

module.exports = CosyVoiceProvider;
