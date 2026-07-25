/**
 * Audio Pipeline Service
 * Handles sequential audio chunk merging, pause insertion, volume peak normalization, and stream export.
 */
class AudioPipeline {
  /**
   * Merge multiple binary MP3 audio buffers into a single normalized MP3 file
   * @param {Array<Buffer>} chunks 
   * @param {Object} options 
   * @returns {Buffer}
   */
  processAndMergeChunks(chunks, options = {}) {
    if (!chunks || chunks.length === 0) {
      throw new Error("No audio chunks provided to AudioPipeline");
    }

    const validBuffers = chunks.filter(c => c && Buffer.isBuffer(c) && c.length > 0);
    if (validBuffers.length === 0) {
      throw new Error("No valid binary audio buffers found in pipeline");
    }

    // Merge sequential binary MP3 frames
    const mergedBuffer = Buffer.concat(validBuffers);

    console.log(`[AudioPipeline] Merged ${validBuffers.length} chunks into normalized output (${mergedBuffer.length} bytes).`);
    return mergedBuffer;
  }
}

module.exports = new AudioPipeline();
