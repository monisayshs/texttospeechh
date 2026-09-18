const AzureProvider = require('../providers/azure/azureProvider');
const KokoroProvider = require('../providers/kokoro/kokoroProvider');
const CosyVoiceProvider = require('../providers/cosyvoice/cosyvoiceProvider');
const EdgeProvider = require('../providers/edge/edgeProvider');

/**
 * High-Speed Multi-Provider Load Balancer for Cloudflare Workers & Serverless Functions
 */
class LoadBalancer {
  constructor() {
    this.providers = [
      new AzureProvider(),
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

    console.log('[DIAG loadBalancer] options.voice:', options.voice, '| rate:', options.rate, '| pitch:', options.pitch, '| style:', options.style);
    console.log('[DIAG loadBalancer] activeProviders:', activeProviders.map(p => `${p.name}(${p.isCommercialAllowed})`), '| total chunks from text length:', text.length);

    const log = (msg) => {
      console.log(`[LoadBalancer] ${msg}`);
      if (onLog) onLog(msg);
    };

    for (const provider of activeProviders) {
      log(`Attempting synthesis with provider: ${provider.name}`);
      console.log('[DIAG loadBalancer] Passing to provider:', provider.name, '| voice:', options.voice, '| rate:', options.rate, '| pitch:', options.pitch, '| style:', options.style);

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const audioBuffer = await provider.synthesizeChunk(text, options);
          if (audioBuffer && audioBuffer.length > 0) {
            log(`Success with provider ${provider.name} on attempt ${attempt}`);
            console.log('[DIAG loadBalancer] SUCCESS with provider:', provider.name, '| audioBuffer.length:', audioBuffer.length, '| voice was:', options.voice);
            if (typeof audioBuffer === 'object' && audioBuffer.buffer && audioBuffer.providerUsed) {
              return audioBuffer;
            }
            const result = Buffer.from(audioBuffer);
            result.providerUsed = provider.constructor.name;
            result.providerDisplayName = provider.name;
            console.log('[DIAG loadBalancer] Returning buffer with providerUsed:', provider.constructor.name);
            return result;
          }
        } catch (err) {
          lastError = err;
          log(`Warning: Provider ${provider.name} attempt ${attempt}/2 failed: ${err.message}`);
          console.log('[DIAG loadBalancer] Provider', provider.name, 'attempt', attempt, 'FAILED:', err.message);

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
