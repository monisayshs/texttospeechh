const BaseProvider = require('../baseProvider');
const crypto = require('crypto');
const wordTimingService = require('../../services/wordTimingService');

function xmlEscape(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

let MsEdgeTTS, OUTPUT_FORMAT;
try {
  const edgeModule = require('msedge-tts');
  MsEdgeTTS = edgeModule.MsEdgeTTS;
  OUTPUT_FORMAT = edgeModule.OUTPUT_FORMAT;
} catch (e) {}

let WebSocketModule;
try {
  WebSocketModule = require('ws');
} catch (e) {}

function getSecMsGecToken() {
  const unixEpochTicks = 116444736000000000n;
  const ticks = (BigInt(Date.now()) * 10000n) + unixEpochTicks;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const str = roundedTicks.toString() + "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
  return crypto.createHash('sha256').update(str, 'ascii').digest('hex').toUpperCase();
}

const EMOJI_SPOKEN_MAP = {
  '😀': ' grinning face ',
  '😃': ' happy face ',
  '😄': ' smiling face ',
  '😁': ' beaming face ',
  '😆': ' laughing face ',
  '😅': ' relieved face ',
  '😂': ' laughing tears face ',
  '🤣': ' rolling laughing face ',
  '😊': ' smiling face ',
  '😇': ' innocent face ',
  '🙂': ' slightly smiling face ',
  '😉': ' winking face ',
  '😍': ' heart eyes ',
  '🥰': ' smiling face with hearts ',
  '😘': ' blowing a kiss ',
  '😋': ' savouring food face ',
  '😛': ' tongue out face ',
  '😜': ' winking tongue out face ',
  '🤪': ' zany face ',
  '😎': ' cool sunglasses face ',
  '🥳': ' partying face ',
  '😭': ' loudly crying face ',
  '😱': ' screaming face ',
  '😡': ' angry face ',
  '❤️': ' red heart ',
  '💖': ' sparkling heart ',
  '💔': ' broken heart ',
  '🔥': ' fire ',
  '💯': ' hundred points ',
  '🎉': ' party popper ',
  '✨': ' sparkles ',
  '⭐': ' star ',
  '👍': ' thumbs up ',
  '👎': ' thumbs down ',
  '👏': ' clapping hands ',
  '🙏': ' folded hands '
};

const TONE_STYLE_MAP = {
  'neutral': 'neutral',
  'cheerful': 'cheerful',
  'excited': 'excited',
  'sad': 'sad',
  'serious': 'angry',
  'professional': 'newscast'
};

const VOICE_STYLE_SUPPORT_MAP = {
  'en-US-JennyNeural': ['cheerful', 'excited', 'sad', 'angry'],
  'en-US-GuyNeural': ['cheerful', 'excited', 'sad', 'angry', 'newscast'],
  'en-US-AriaNeural': ['cheerful', 'excited', 'sad', 'angry']
};

function cleanTextForSynthesis(text) {
  if (!text) return '';
  let result = text;
  for (const [emoji, spoken] of Object.entries(EMOJI_SPOKEN_MAP)) {
    if (result.includes(emoji)) {
      result = result.split(emoji).join(spoken);
    }
  }
  return result
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function synthesizeWebSocket(text, voiceName, rateStr, pitchStr, styleName) {
  const cleanText = cleanTextForSynthesis(text) || text;
  const escapedText = xmlEscape(cleanText);
  const langCode = voiceName.substring(0, 5);

  // Note: Edge ReadAloud WebSocket endpoint handles prosody (rate, pitch) natively.
  // mstts:express-as is an Azure Speech API enterprise feature not supported on Edge socket transport.
  const ssmlInner = `<prosody rate="${rateStr}" pitch="${pitchStr}">${escapedText}</prosody>`;

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${langCode}">
  <voice name="${voiceName}">
    ${ssmlInner}
  </voice>
</speak>`;

  const connectionId = crypto.randomBytes(16).toString('hex').toUpperCase();
  const token = getSecMsGecToken();
  const path = `/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&Sec-MS-GEC=${token}&Sec-MS-GEC-Version=1-140.0.3485.14&ConnectionId=${connectionId}`;
  const wssUrl = `wss://speech.platform.bing.com${path}`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.3485.14',
    'Origin': 'chrome-extension://jdiccjafjnimhhokcjgbgiahbaidmhai'
  };

  const diagErrors = [];

  // === Approach 1: Cloudflare Sockets (cloudflare:sockets) for Cloudflare Workers Edge ===
  let cfConnectFn = (typeof globalThis !== 'undefined' && typeof globalThis.cfConnect === 'function') ? globalThis.cfConnect : null;
  if (!cfConnectFn) {
    try {
      const cfSockets = require('cloudflare:sockets');
      if (cfSockets && typeof cfSockets.connect === 'function') {
        cfConnectFn = cfSockets.connect;
      }
    } catch (e) {}
  }

  if (cfConnectFn) {
    try {
      console.log('[EdgeProvider] Attempting Cloudflare TLS Socket connection to Bing Speech API...');
      const secKey = crypto.randomBytes(16).toString('base64');
      const handshakeReq =
        `GET ${path} HTTP/1.1\r\n` +
        `Host: speech.platform.bing.com\r\n` +
        `Upgrade: websocket\r\n` +
        `Connection: Upgrade\r\n` +
        `Sec-WebSocket-Key: ${secKey}\r\n` +
        `Sec-WebSocket-Version: 13\r\n` +
        `User-Agent: ${headers['User-Agent']}\r\n` +
        `Origin: ${headers['Origin']}\r\n\r\n`;

      const encodeClientTextFrame = (txt) => {
        const payload = Buffer.from(txt, 'utf8');
        const len = payload.length;
        let header;
        const mask = crypto.randomBytes(4);
        if (len <= 125) {
          header = Buffer.alloc(6);
          header[0] = 0x81;
          header[1] = 0x80 | len;
          mask.copy(header, 2);
        } else if (len <= 65535) {
          header = Buffer.alloc(8);
          header[0] = 0x81;
          header[1] = 0x80 | 126;
          header.writeUInt16BE(len, 2);
          mask.copy(header, 4);
        } else {
          header = Buffer.alloc(14);
          header[0] = 0x81;
          header[1] = 0x80 | 127;
          header.writeBigUInt64BE(BigInt(len), 2);
          mask.copy(header, 10);
        }
        const maskedPayload = Buffer.alloc(len);
        for (let i = 0; i < len; i++) {
          maskedPayload[i] = payload[i] ^ mask[i % 4];
        }
        return Buffer.concat([header, maskedPayload]);
      };

      const tConnStart = Date.now();
      const socket = cfConnectFn({ hostname: 'speech.platform.bing.com', port: 443 }, { secureTransport: 'on' });
      await socket.opened;
      const tConnDone = Date.now();

      const writer = socket.writable.getWriter();
      const reader = socket.readable.getReader();

      await writer.write(new TextEncoder().encode(handshakeReq));

      let readBuf = Buffer.alloc(0);
      let isHandshakeDone = false;
      const audioChunks = [];
      const wordTimings = []; // Read-Along: per-word {s,e,w} timings (ms), null when unavailable
      let tFirstByte = 0;

      const readTimeout = setTimeout(() => {
        try { writer.close(); } catch (e) {}
      }, 15000);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          readBuf = Buffer.concat([readBuf, Buffer.from(value)]);
        }

        if (!isHandshakeDone) {
          const headerEnd = readBuf.indexOf('\r\n\r\n');
          if (headerEnd !== -1) {
            const respHeaders = readBuf.slice(0, headerEnd).toString('utf8');
            if (respHeaders.includes('101 Switching Protocols')) {
              isHandshakeDone = true;
              readBuf = readBuf.slice(headerEnd + 4);

              const timestamp = new Date().toISOString();
              const configMsg =
                `X-Timestamp:${timestamp}\r\n` +
                "Content-Type:application/json; charset=utf-8\r\n" +
                "Path:speech.config\r\n\r\n" +
                '{\n    "context": {\n        "synthesis": {\n            "audio": {\n                "metadataoptions": {\n                    "sentenceBoundaryEnabled": "false",\n                    "wordBoundaryEnabled": "true"\n                },\n                "outputFormat": "audio-24khz-96kbitrate-mono-mp3"\n            }\n        }\n    }\n}';

              const ssmlMsg = `X-RequestId:${connectionId}\r\nX-Timestamp:${timestamp}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;

              await writer.write(encodeClientTextFrame(configMsg));
              await writer.write(encodeClientTextFrame(ssmlMsg));
            } else {
              diagErrors.push('Handshake rejected: ' + respHeaders.split('\r\n')[0]);
              break;
            }
          }
        }

        if (isHandshakeDone) {
          let hasMoreFrames = true;
          while (hasMoreFrames && readBuf.length >= 2) {
            const opcode = readBuf[0] & 0x0f;
            const hasMask = (readBuf[1] & 0x80) !== 0;
            let payloadLen = readBuf[1] & 0x7f;
            let offset = 2;

            if (payloadLen === 126) {
              if (readBuf.length < 4) { hasMoreFrames = false; break; }
              payloadLen = readBuf.readUInt16BE(2);
              offset = 4;
            } else if (payloadLen === 127) {
              if (readBuf.length < 10) { hasMoreFrames = false; break; }
              payloadLen = Number(readBuf.readBigUInt64BE(2));
              offset = 10;
            }

            let maskKey = null;
            if (hasMask) {
              if (readBuf.length < offset + 4) { hasMoreFrames = false; break; }
              maskKey = readBuf.slice(offset, offset + 4);
              offset += 4;
            }

            if (readBuf.length < offset + payloadLen) {
              hasMoreFrames = false;
              break;
            }

            let payload = readBuf.slice(offset, offset + payloadLen);
            if (hasMask && maskKey) {
              const unmasked = Buffer.alloc(payloadLen);
              for (let i = 0; i < payloadLen; i++) {
                unmasked[i] = payload[i] ^ maskKey[i % 4];
              }
              payload = unmasked;
            }

            readBuf = readBuf.slice(offset + payloadLen);

            const strHead = payload.slice(0, Math.min(payload.length, 200)).toString('utf8');
            if (strHead.includes('Path:turn.end')) {
              const tFinalByte = Date.now();
              clearTimeout(readTimeout);
              try { writer.close(); } catch (e) {}
              try { reader.cancel(); } catch (e) {}
              try { socket.close(); } catch (e) {}
              const finalAudio = Buffer.concat(audioChunks);
              finalAudio.timings = {
                connectMs: tConnDone - tConnStart,
                firstByteMs: tFirstByte ? (tFirstByte - tConnStart) : 0,
                synthesisMs: tFinalByte - (tFirstByte || tConnDone),
                totalSocketMs: tFinalByte - tConnStart
              };
              // Read-Along: attach collected word timings (null when unavailable)
              if (wordTimings.length > 0) finalAudio.wordTimings = wordTimings;
              console.log(`[EdgeProvider] Cloudflare Socket Synthesis SUCCESS! Generated ${finalAudio.length} audio bytes. Socket timings:`, JSON.stringify(finalAudio.timings), '| wordTimings:', wordTimings.length);
              return finalAudio;
            }

            if (opcode === 0x1) {
              // Text frame — never audio. Check for word-boundary metadata (Path:audio.metadata).
              if (strHead.includes('Path:audio.metadata')) {
                try {
                  const bounds = wordTimingService.extractFromFrameText(payload.toString('utf8'));
                  for (const b of bounds) wordTimings.push(b);
                } catch (e) { /* metadata is optional; never break audio */ }
              }
              continue;
            }

            if (payload.length >= 2) {
              const headerLen = (payload[0] << 8) | payload[1];
              if (payload.length >= 2 + headerLen) {
                const headerStr = payload.slice(2, 2 + headerLen).toString('utf8');
                if (headerStr.includes('Path:audio')) {
                  if (!tFirstByte) tFirstByte = Date.now();
                  const audioData = payload.slice(2 + headerLen);
                  if (audioData.length > 0) {
                    audioChunks.push(audioData);
                  }
                }
              }
            }
          }
        }
      }

      clearTimeout(readTimeout);
      const finalAudio = Buffer.concat(audioChunks);
      if (finalAudio.length > 0) {
        if (wordTimings.length > 0) finalAudio.wordTimings = wordTimings;
        console.log(`[EdgeProvider] Cloudflare Socket Synthesis SUCCESS! Generated ${finalAudio.length} audio bytes for voice '${voiceName}'. wordTimings: ${wordTimings.length}`);
        return finalAudio;
      }
      diagErrors.push('Cloudflare Sockets returned 0 audio bytes');
    } catch (e) {
      console.warn('[EdgeProvider] Cloudflare Sockets attempt failed:', e.message);
      diagErrors.push(`Cloudflare Sockets: ${e.message}`);
    }
  }

  // === Approach 2: Node.js 'ws' module (for Node runtime / Vercel / Dev Server) ===
  let ws = null;
  if (WebSocketModule) {
    try {
      ws = new WebSocketModule(wssUrl, [], { headers });
    } catch (e) {
      diagErrors.push(`Node ws: ${e.message}`);
    }
  }

  if (!ws) {
    throw new Error(`EdgeProvider WebSocket transport unavailable. Diag: ${diagErrors.join('; ')}`);
  }

  return new Promise((resolve, reject) => {
    let timeoutTimer = setTimeout(() => {
      try { ws.close(); } catch (e) {}
      reject(new Error(`MS Edge Neural TTS WebSocket timeout. Diag: ${diagErrors.join('; ')}`));
    }, 10000);

    const audioChunks = [];
    const wordTimings = []; // Read-Along: per-word {s,e,w} timings (ms), null when unavailable

    const sendConfigAndSsml = () => {
      const timestamp = new Date().toISOString();
      const configMsg = (
        `X-Timestamp:${timestamp}\r\n` +
        "Content-Type:application/json; charset=utf-8\r\n" +
        "Path:speech.config\r\n\r\n" +
        '{"context":{"system":{"name":"SpeechSDK","version":"1.30.0","build":"JavaScript","lang":"en-US"},"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}'
      );
      const ssmlMsg = `X-RequestId:${connectionId}\r\nX-Timestamp:${timestamp}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;

      if (typeof ws.send === 'function') {
        ws.send(configMsg);
        ws.send(ssmlMsg);
      }
    };

    const handleData = (buf) => {
      const str = buf.toString('utf8');
      if (str.includes('Path:turn.end')) {
        clearTimeout(timeoutTimer);
        try { ws.close(); } catch (e) {}
        if (audioChunks.length === 0) return reject(new Error('MS Edge TTS returned empty audio'));
        const out = Buffer.concat(audioChunks);
        // Read-Along: attach collected word timings (null when unavailable)
        if (wordTimings.length > 0) out.wordTimings = wordTimings;
        console.log(`[EdgeProvider] Node ws Synthesis SUCCESS! ${out.length} audio bytes, wordTimings: ${wordTimings.length}`);
        return resolve(out);
      }

      if (str.includes('Path:audio.metadata')) {
        // Text frame carrying word-boundary metadata — parse, never treat as audio
        try {
          const bounds = wordTimingService.extractFromFrameText(str);
          for (const b of bounds) wordTimings.push(b);
        } catch (e) { /* metadata is optional; never break audio */ }
        return;
      }

      if (buf.length >= 2) {
        const headerLen = (buf[0] << 8) | buf[1];
        if (buf.length >= 2 + headerLen) {
          const headerStr = buf.slice(2, 2 + headerLen).toString('utf8');
          if (headerStr.includes('Path:audio')) {
            const audioPayload = buf.slice(2 + headerLen);
            if (audioPayload.length > 0) {
              audioChunks.push(audioPayload);
            }
          }
        }
      }
    };

    if (typeof ws.on === 'function') {
      ws.on('open', sendConfigAndSsml);
      ws.on('message', (data) => {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        handleData(buf);
      });
      ws.on('error', (err) => {
        clearTimeout(timeoutTimer);
        reject(err);
      });
    } else if (typeof ws.addEventListener === 'function') {
      ws.addEventListener('open', sendConfigAndSsml);
      ws.addEventListener('message', (evt) => {
        const data = evt.data;
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data instanceof ArrayBuffer ? data : String(data));
        handleData(buf);
      });
      ws.addEventListener('error', (errEvt) => {
        clearTimeout(timeoutTimer);
        const errMsg = errEvt && errEvt.message ? errEvt.message : 'WebSocket error';
        reject(new Error(errMsg));
      });

      if (ws.readyState === 1) {
        sendConfigAndSsml();
      }
    }
  });
}

function formatPercentageRate(rate) {
  if (!rate || rate === '1.0' || rate === '+0%' || rate === '0%') return '+0%';
  if (typeof rate === 'string' && (rate.endsWith('%') || rate.endsWith('x'))) {
    if (rate.endsWith('x')) {
      const mult = parseFloat(rate);
      const percent = Math.round((mult - 1.0) * 100);
      return percent >= 0 ? `+${percent}%` : `${percent}%`;
    }
    return rate;
  }
  const mult = parseFloat(rate);
  if (!isNaN(mult)) {
    const percent = Math.round((mult - 1.0) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  }
  return '+0%';
}

function formatPercentagePitch(pitch) {
  if (!pitch || pitch === '1.0' || pitch === '+0%' || pitch === '0%') return '+0%';
  if (typeof pitch === 'string' && pitch.endsWith('%')) return pitch;
  const mult = parseFloat(pitch);
  if (!isNaN(mult)) {
    const percent = Math.round((mult - 1.0) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
  }
  return '+0%';
}

class EdgeProvider extends BaseProvider {
  constructor() {
    super('MS Edge Neural TTS', true);
  }

  async isAvailable() {
    return true;
  }

  async synthesizeChunk(text, options = {}) {
    const voiceName = options.voice || 'hi-IN-SwaraNeural';
    const rateStr = formatPercentageRate(options.rate);
    const pitchStr = formatPercentagePitch(options.pitch);
    const styleName = options.style || 'neutral';

    const isCloudflareEdge = (typeof globalThis !== 'undefined' && typeof globalThis.cfConnect === 'function') || (typeof process !== 'undefined' && process.env && process.env.CF_PAGES);

    console.log('[DIAG edgeProvider.synthesizeChunk] voiceName:', voiceName, '| rateStr:', rateStr, '| pitchStr:', pitchStr, '| styleName:', styleName, '| isCloudflareEdge:', isCloudflareEdge, '| MsEdgeTTS loaded:', !!MsEdgeTTS, '| OUTPUT_FORMAT loaded:', !!OUTPUT_FORMAT, '| WebSocket loaded:', !!WebSocketModule);

    // Attempt 1: msedge-tts package (for local Node.js dev-server only; skipped on Cloudflare Edge)
    if (!isCloudflareEdge && MsEdgeTTS && OUTPUT_FORMAT) {
      try {
        console.log('[DIAG edgeProvider] Attempt 1: msedge-tts with voice:', voiceName, '| rate:', rateStr, '| pitch:', pitchStr, '| style:', styleName);
        const tts = new MsEdgeTTS({ enableLogger: true });
        const setMetaResult = await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
        console.log('[DIAG edgeProvider] msedge-tts setMetadata resolved. _voice:', tts._voice, '| _outputFormat:', tts._outputFormat, '| voiceLocale:', tts._metadataOptions.voiceLocale);
        const { audioStream, metadataStream } = await tts.toStream(cleanTextForSynthesis(text), {
          rate: rateStr,
          pitch: pitchStr,
          style: styleName
        });

        console.log('[DIAG edgeProvider] msedge-tts toStream returned. audioStream type:', typeof audioStream, '| has on:', typeof audioStream.on, '| metadataStream:', !!metadataStream);
        const chunks = [];
        // Read-Along: collect word-boundary metadata (best-effort; never breaks audio)
        const metaParts = [];
        let metaDone = false;
        if (metadataStream && typeof metadataStream.on === 'function') {
          metadataStream.on('data', (c) => { try { metaParts.push(c.toString('utf8')); } catch (e) {} });
          metadataStream.on('end', () => { metaDone = true; });
          metadataStream.on('close', () => { metaDone = true; });
          metadataStream.on('error', () => { metaDone = true; });
        } else {
          metaDone = true;
        }
        await new Promise((resolve, reject) => {
          audioStream.on('data', (c) => { console.log('[DIAG edgeProvider] msedge-tts audioStream data chunk:', c.length, 'bytes'); chunks.push(c); });
          audioStream.on('end', resolve);
          audioStream.on('error', reject);
        });
        if (chunks.length > 0) {
          const audioBuf = Buffer.concat(chunks);
          // Allow trailing metadata frames a brief window to flush, then parse what we have
          try {
            if (!metaDone) {
              await new Promise((r) => {
                const t = setTimeout(() => r(), 800);
                if (metadataStream && typeof metadataStream.once === 'function') {
                  metadataStream.once('end', () => { clearTimeout(t); r(); });
                  metadataStream.once('close', () => { clearTimeout(t); r(); });
                }
              });
            }
            const wt = wordTimingService.parseWordBoundaryBodies(metaParts);
            if (wt.length > 0) audioBuf.wordTimings = wt;
            console.log('[DIAG edgeProvider] msedge-tts SUCCESS! chunks:', chunks.length, '| total bytes:', audioBuf.length, '| wordTimings:', wt.length);
          } catch (e) {
            console.log('[DIAG edgeProvider] msedge-tts SUCCESS! chunks:', chunks.length, '| total bytes:', audioBuf.length, '| wordTimings: n/a');
          }
          try { tts.close(); } catch (e) {}
          return audioBuf;
        }
        console.warn('[DIAG edgeProvider] msedge-tts returned 0 chunks');
       } catch (e) {
        console.warn('[DIAG edgeProvider] msedge-tts attempt failed:', e.message, '| stack:', e.stack?.split('\n')[1]?.trim());
      }
    } else if (isCloudflareEdge) {
      console.log('[DIAG edgeProvider] Running on Cloudflare Edge — skipping msedge-tts and using direct cloudflare:sockets transport.');
    } else {
      console.warn('[DIAG edgeProvider] msedge-tts NOT available (MsEdgeTTS or OUTPUT_FORMAT undefined)');
    }

    // Attempt 2: Direct WebSocket Bing API (6s Timeout)
    console.log('[DIAG edgeProvider] Attempt 2: raw WebSocket with voice:', voiceName);
    try {
      return await synthesizeWebSocket(text, voiceName, rateStr, pitchStr, styleName);
    } catch (err) {
      console.warn('[DIAG edgeProvider] WebSocket attempt 1 failed:', err.message);
      console.log('[DIAG edgeProvider] Attempt 3: WebSocket with neutral style, voice:', voiceName);
      try {
        return await synthesizeWebSocket(text, voiceName, rateStr, pitchStr, 'neutral');
      } catch (err2) {
        console.warn('[DIAG edgeProvider] WebSocket attempt 2 (neutral) failed:', err2.message);
      }
    }

    throw new Error(`Neural synthesis failed for voice '${voiceName}'`);
  }
}

module.exports = EdgeProvider;
