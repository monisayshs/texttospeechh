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
    this.backoffDelays = [400, 1000]; // Backoff between attempts 1→2 and 2→3
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async synthesizeWithFailover(text, options = {}, onLog = null, env = null) {
    let lastError = null;

    // Chain order follows docs/architecture.md: Edge is the PRIMARY provider;
    // every other configured provider is a fallback, tried in constructor
    // order. Until 2026-11-13 the chain was built in constructor order
    // (Azure first) and availability was checked without the request env —
    // Azure's check read only process.env, which never holds Cloudflare
    // Pages secrets, so in production the chain silently collapsed to Edge
    // alone and any Edge failure failed the whole job (11 Nov 2026: 100 of
    // 200 jobs failed; 12 Nov: 30 of 50). Passing `env` through restores the
    // documented failover: Edge first, Azure (when its key is configured)
    // as the real backup.
    const edgeProvider = this.providers.find(p => p instanceof EdgeProvider);
    const activeProviders = [];
    if (edgeProvider) {
      activeProviders.push(edgeProvider);
    }
    for (const provider of this.providers) {
      if (provider === edgeProvider) continue;
      if (provider.isCommercialAllowed && await provider.isAvailable(env)) {
        activeProviders.push(provider);
      }
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

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const audioBuffer = await provider.synthesizeChunk(text, options, env);
          if (audioBuffer && audioBuffer.length > 0) {
            log(`Success with provider ${provider.name} on attempt ${attempt}`);
            console.log('[DIAG loadBalancer] SUCCESS with provider:', provider.name, '| audioBuffer.length:', audioBuffer.length, '| voice was:', options.voice);
            if (typeof audioBuffer === 'object' && audioBuffer.buffer && audioBuffer.providerUsed) {
              return audioBuffer;
            }
            const result = Buffer.from(audioBuffer);
            result.providerUsed = provider.constructor.name;
            result.providerDisplayName = provider.name;
            // Read-Along: Buffer.from() drops custom props — carry word timings through
            if (audioBuffer.wordTimings && audioBuffer.wordTimings.length > 0) {
              result.wordTimings = audioBuffer.wordTimings;
            }
            console.log('[DIAG loadBalancer] Returning buffer with providerUsed:', provider.constructor.name);
            return result;
          }
        } catch (err) {
          lastError = err;
          log(`Warning: Provider ${provider.name} attempt ${attempt}/3 failed: ${err.message}`);
          console.log('[DIAG loadBalancer] Provider', provider.name, 'attempt', attempt, 'FAILED:', err.message);

          if (attempt < 3) {
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
