/**
 * Base Abstract Class for all Voice Synthesis Providers
 * Follows SOLID Open/Closed Principle
 */
class BaseProvider {
  /**
   * @param {string} name - Unique Provider Identifier
   * @param {boolean} isCommercialAllowed - Verified Commercial SaaS License Flag
   */
  constructor(name, isCommercialAllowed = true) {
    if (new.target === BaseProvider) {
      throw new TypeError("Cannot construct BaseProvider instances directly.");
    }
    this.name = name;
    this.isCommercialAllowed = isCommercialAllowed;
  }

  /**
   * Check engine health & endpoint availability
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return true;
  }

  /**
   * Synthesize text chunk to audio Buffer
   * @param {string} text 
   * @param {Object} options 
   * @returns {Promise<Buffer>}
   */
  async synthesizeChunk(text, options = {}) {
    throw new Error(`Method synthesizeChunk() must be implemented by provider: ${this.name}`);
  }
}

module.exports = BaseProvider;
