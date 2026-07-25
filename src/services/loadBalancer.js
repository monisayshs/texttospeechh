const KokoroProvider = require('../providers/kokoro/kokoroProvider');
const CosyVoiceProvider = require('../providers/cosyvoice/cosyvoiceProvider');
const EdgeProvider = require('../providers/edge/edgeProvider');

/**
 * Smart Multi-Provider Load Balancer with Automatic Failover
 */
class LoadBalancer {
  constructor() {
    this.providers = [
      new KokoroProvider(),
      new CosyVoiceProvider(),
      new EdgeProvider()
    ];
    this.backoffDelays = [2000, 5000, 10000];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute synthesis with retry backoff and automatic provider failover
   */
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

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const audioBuffer = await provider.synthesizeChunk(text, options);
          if (audioBuffer && audioBuffer.length > 0) {
            log(`Success with provider ${provider.name} on attempt ${attempt}`);
            return audioBuffer;
          }
        } catch (err) {
          lastError = err;
          log(`Warning: Provider ${provider.name} attempt ${attempt}/3 failed: ${err.message}`);

          if (attempt < 3) {
            const delayMs = this.backoffDelays[attempt - 1] || 5000;
            log(`Waiting ${delayMs / 1000}s exponential backoff...`);
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
