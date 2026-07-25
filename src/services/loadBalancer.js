const KokoroProvider = require('../providers/kokoro/kokoroProvider');
const CosyVoiceProvider = require('../providers/cosyvoice/cosyvoiceProvider');
const EdgeProvider = require('../providers/edge/edgeProvider');

/**
 * High-Speed Multi-Provider Load Balancer for Vercel Serverless Functions
 */
class LoadBalancer {
  constructor() {
    this.providers = [
      new KokoroProvider(),
      new CosyVoiceProvider(),
      new EdgeProvider()
    ];
    this.backoffDelays = [200, 500]; // Ultra-fast backoff (< 1s total)
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async synthesizeWithFailover(text, options = {}, onLog = null) {
    let lastError = null;

    const activeProviders = [];
    for (const provider of this.providers) {
      if (provider.isCommercialAllowed && await provider.isAvailable()) {
        activeProviders.push(provider);
      }
    }

    const edgeFallback = this.providers.find(p => p instanceof EdgeProvider);
    if (!activeProviders.includes(edgeFallback)) {
      activeProviders.push(edgeFallback);
    }

    const log = (msg) => {
      console.log(`[LoadBalancer] ${msg}`);
      if (onLog) onLog(msg);
    };

    for (const provider of activeProviders) {
      log(`Attempting synthesis with provider: ${provider.name}`);

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const audioBuffer = await provider.synthesizeChunk(text, options);
          if (audioBuffer && audioBuffer.length > 0) {
            log(`Success with provider ${provider.name} on attempt ${attempt}`);
            return audioBuffer;
          }
        } catch (err) {
          lastError = err;
          log(`Warning: Provider ${provider.name} attempt ${attempt}/2 failed: ${err.message}`);

          if (attempt < 2) {
            const delayMs = this.backoffDelays[attempt - 1] || 300;
            await this.sleep(delayMs);
          }
        }
      }
      log(`Provider ${provider.name} exhausted. Switching to next provider in failover chain...`);
    }

    throw new Error(`All providers failed. Last error: ${lastError ? lastError.message : 'Unknown synthesis failure'}`);
  }
}

module.exports = new LoadBalancer();
