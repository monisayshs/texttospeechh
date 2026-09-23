/**
 * Word Timing Service — "Read-Along" word-by-word highlighting support.
 *
 * Dependency-free helpers:
 *  1. Parse Edge ReadAloud `Path:audio.metadata` word-boundary messages into
 *     compact timings: { s: startMs, e: endMs, w: word } (integer milliseconds).
 *     Edge reports Offset/Duration in 100-nanosecond ticks → divide by 10,000.
 *  2. Measure MP3 chunk durations with a frame-header walk (accurate offsets
 *     for multi-chunk merging, compensating inter-chunk silence/drift).
 *  3. Merge per-chunk timings with cumulative duration offsets.
 *
 * Timings are OPTIONAL metadata: every function fails closed (returns [] / null)
 * so audio synthesis never breaks when boundaries are unavailable
 * (e.g. failover providers that don't emit word timings).
 */
'use strict';

const TICKS_PER_MS = 10000;

/**
 * Parse one `Path:audio.metadata` JSON body string into word timings.
 * Expected shape: {"Metadata":[{"Type":"WordBoundary","Data":{"Offset":n,"Duration":n,"text":{"Text":"word"}}}]}
 * @param {string} bodyStr raw JSON body (after the \r\n\r\n header delimiter)
 * @returns {Array<{s:number,e:number,w:string}>}
 */
function parseWordBoundaryBody(bodyStr) {
  const out = [];
  if (!bodyStr || typeof bodyStr !== 'string') return out;
  let parsed;
  try {
    parsed = JSON.parse(bodyStr);
  } catch (e) {
    return out;
  }
  const items = (parsed && parsed.Metadata) || [];
  if (!Array.isArray(items)) return out;
  for (const item of items) {
    try {
      if (!item || item.Type !== 'WordBoundary' || !item.Data) continue;
      const offset = Number(item.Data.Offset);
      const duration = Number(item.Data.Duration);
      const word = item.Data.text && typeof item.Data.text.Text === 'string' ? item.Data.text.Text : '';
      if (!isFinite(offset) || !isFinite(duration) || duration <= 0 || !word) continue;
      const s = Math.round(offset / TICKS_PER_MS);
      const e = Math.round((offset + duration) / TICKS_PER_MS);
      if (e <= s) continue;
      out.push({ s, e, w: word });
    } catch (e) { /* skip malformed entry */ }
  }
  return out;
}

/**
 * Parse a full text WebSocket frame ("Path:audio.metadata\r\n\r\n{...}") into word timings.
 * @param {string} frameText
 * @returns {Array<{s:number,e:number,w:string}>}
 */
function extractFromFrameText(frameText) {
  if (!frameText || typeof frameText !== 'string') return [];
  const delim = '\r\n\r\n';
  const idx = frameText.indexOf(delim);
  if (idx === -1) return [];
  return parseWordBoundaryBody(frameText.slice(idx + delim.length).trim());
}

/**
 * Parse an array of raw metadata JSON bodies (msedge-tts metadataStream chunks).
 * @param {Array<string>} bodies
 * @returns {Array<{s:number,e:number,w:string}>}
 */
function parseWordBoundaryBodies(bodies) {
  const out = [];
  if (!Array.isArray(bodies)) return out;
  for (const b of bodies) {
    const parsed = parseWordBoundaryBody(typeof b === 'string' ? b : String(b));
    for (const t of parsed) out.push(t);
  }
  return out;
}

// --- MP3 duration via frame-header walk -------------------------------------

const MPEG1_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]; // kbps, Layer III
const MPEG2_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];      // kbps, Layer II/III
const SAMPLE_RATES = {
  3: [44100, 48000, 32000], // MPEG-1
  2: [22050, 24000, 16000], // MPEG-2
  0: [11025, 12000, 8000]   // MPEG-2.5
};

/**
 * Estimate MP3 duration in milliseconds by walking frame headers.
 * Falls back to a CBR estimate (96 kbps, the Edge output format) when too few
 * valid frames are found. Never throws.
 * @param {Buffer} buf
 * @returns {number} duration in ms (>= 0)
 */
function getMp3DurationMs(buf) {
  try {
    if (!buf || !buf.length || buf.length < 100) return 0;
    let pos = 0;
    const len = buf.length;

    // Skip ID3v2 tag if present ("ID3" + 2 version bytes + flags + 4 synchsafe size bytes)
    if (len > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
      const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
      pos = 10 + size;
    }

    let totalSamples = 0;
    let sampleRate = 0;
    let validFrames = 0;
    const maxFrames = 200000; // safety cap (~80 min of audio); loop always terminates (pos advances)

    while (pos + 4 <= len && validFrames < maxFrames) {
      if (buf[pos] !== 0xff || (buf[pos + 1] & 0xe0) !== 0xe0) { pos++; continue; }
      const b1 = buf[pos + 1], b2 = buf[pos + 2], b3 = buf[pos + 3];
      const versionBits = (b1 >> 3) & 0x03;
      const layerBits = (b1 >> 1) & 0x03;
      const bitrateIdx = (b2 >> 4) & 0x0f;
      const srIdx = (b2 >> 2) & 0x03;
      const padding = (b2 >> 1) & 0x01;
      // Validate: version not reserved, layer III, bitrate/sr indices valid
      if (versionBits === 1 || layerBits !== 1 || bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) { pos++; continue; }

      const bitrate = (versionBits === 3 ? MPEG1_BITRATES : MPEG2_BITRATES)[bitrateIdx] * 1000;
      const sr = SAMPLE_RATES[versionBits][srIdx];
      if (!bitrate || !sr) { pos++; continue; }

      const coeff = versionBits === 3 ? 144 : 72;
      const frameLen = Math.floor((coeff * bitrate) / sr) + padding;
      if (frameLen < 24 || pos + frameLen > len + 1) { pos++; continue; }

      const samplesPerFrame = versionBits === 3 ? 1152 : 576;
      totalSamples += samplesPerFrame;
      sampleRate = sr;
      validFrames++;
      pos += frameLen;
    }

    if (validFrames >= 3 && sampleRate > 0) {
      return Math.round((totalSamples / sampleRate) * 1000);
    }
    // CBR fallback: Edge emits 96 kbps mono MP3
    return Math.round((buf.length * 8 / 96000) * 1000);
  } catch (e) {
    return 0;
  }
}

/**
 * Merge per-chunk word timings into one timeline.
 * Each chunk's timings are offset by the cumulative *audio* duration of all
 * previous chunks (measured, not estimated) so highlighting stays in sync
 * across chunk boundaries despite leading/trailing silence.
 *
 * @param {Array<{buffer:Buffer, timings:Array|null}>} chunks
 * @returns {{timings:Array|null, totalDurationMs:number}}
 */
function mergeChunkTimings(chunks) {
  const merged = [];
  let offsetMs = 0;
  let anyTimings = false;
  try {
    if (!Array.isArray(chunks)) return { timings: null, totalDurationMs: 0 };
    for (const c of chunks) {
      if (!c) continue;
      const timings = c.timings;
      if (Array.isArray(timings) && timings.length > 0) {
        anyTimings = true;
        for (const t of timings) {
          if (!t || typeof t.s !== 'number' || typeof t.e !== 'number' || !t.w) continue;
          merged.push({ s: t.s + offsetMs, e: t.e + offsetMs, w: String(t.w) });
        }
      }
      if (c.buffer && c.buffer.length) {
        offsetMs += getMp3DurationMs(c.buffer);
      }
    }
  } catch (e) {
    return { timings: null, totalDurationMs: offsetMs };
  }
  return { timings: anyTimings ? merged : null, totalDurationMs: offsetMs };
}

module.exports = {
  parseWordBoundaryBody,
  parseWordBoundaryBodies,
  extractFromFrameText,
  getMp3DurationMs,
  mergeChunkTimings
};
