const BaseProvider = require('../baseProvider');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const WebSocket = require('ws');
const crypto = require('crypto');
const xmlEscape = require('xml-escape');

function getSecMsGecToken() {
  const unixEpochTicks = 116444736000000000n;
  const ticks = (BigInt(Date.now()) * 10000n) + unixEpochTicks;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const str = roundedTicks.toString() + "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
  return crypto.createHash('sha256').update(str, 'ascii').digest('hex').toUpperCase();
}

/**
 * High-Speed Microsoft Edge Neural TTS Provider
 * Optimized for Vercel Serverless Functions (< 5s execution limit)
 */
class EdgeProvider extends BaseProvider {
  constructor() {
    super('MS Edge Neural TTS (Fallback)', true);
  }

  async isAvailable() {
    return true;
  }

  async synthesizeChunk(text, options = {}) {
    const voiceName = options.voice || 'hi-IN-SwaraNeural';
    const rateStr = options.rate || '+0%';
    const pitchStr = options.pitch || '+0%';

    // Attempt 1: Fast msedge-tts package
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      
      const { audioStream } = await tts.toStream(text, {
        rate: rateStr,
        pitch: pitchStr
      });

      const audioChunks = [];
      const streamPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          try { tts.close(); } catch (e) {}
          reject(new Error('msedge-tts stream timeout'));
        }, 5000);

        audioStream.on('data', (data) => audioChunks.push(data));
        audioStream.on('end', () => {
          clearTimeout(timeout);
          try { tts.close(); } catch (e) {}
          if (audioChunks.length === 0) reject(new Error('Empty stream'));
          else resolve(Buffer.concat(audioChunks));
        });
        audioStream.on('error', (err) => {
          clearTimeout(timeout);
          try { tts.close(); } catch (e) {}
          reject(err);
        });
      });

      const result = await streamPromise;
      if (result && result.length > 0) return result;
    } catch (e) {
      console.warn('[EdgeProvider] msedge-tts package warning, trying WebSocket fallback:', e.message);
    }

    // Attempt 2: Direct WebSocket Bing API (6s Timeout)
    return new Promise((resolve, reject) => {
      const escapedText = xmlEscape(text.trim());
      const langCode = voiceName.substring(0, 5);
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${langCode}">
  <voice name="${voiceName}">
    <prosody rate="${rateStr}" pitch="${pitchStr}">
      ${escapedText}
    </prosody>
  </voice>
</speak>`;

      const connectionId = crypto.randomBytes(16).toString('hex').toUpperCase();
      const token = getSecMsGecToken();
      const wssUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&Sec-MS-GEC=${token}&Sec-MS-GEC-Version=1-140.0.3485.14&ConnectionId=${connectionId}`;

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.3485.14',
        'Origin': 'chrome-extension://jdiccjafjnimhhokcjgbgiahbaidmhai'
      };

      let ws = null;
      let timeoutTimer = null;

      const cleanup = () => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (ws) {
          ws.removeAllListeners();
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            try { ws.close(); } catch (e) {}
          }
        }
      };

      timeoutTimer = setTimeout(() => {
        cleanup();
        reject(new Error('MS Edge Neural TTS timeout (6s serverless limit)'));
      }, 6000);

      try {
        ws = new WebSocket(wssUrl, { headers });
      } catch (err) {
        cleanup();
        return reject(err);
      }

      const audioChunks = [];

      ws.on('open', () => {
        const configMsg = (
          "Content-Type:application/json; charset=utf-8\r\n" +
          "Path:speech.config\r\n\r\n" +
          '{"context":{"system":{"name":"SpeechSDK","version":"1.30.0","build":"JavaScript","lang":"en-US"},"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}'
        );
        ws.send(configMsg, (err) => {
          if (err) {
            cleanup();
            return reject(err);
          }
          const ssmlMsg = `X-RequestId:${connectionId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
          ws.send(ssmlMsg, (err2) => {
            if (err2) {
              cleanup();
              return reject(err2);
            }
          });
        });
      });

      ws.on('message', (data) => {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const str = buf.toString('utf8');

        if (str.includes('Path:turn.end')) {
          cleanup();
          if (audioChunks.length === 0) {
            return reject(new Error('MS Edge Neural TTS returned no audio data.'));
          }
          resolve(Buffer.concat(audioChunks));
          return;
        }

        if (buf.length >= 2) {
          const headerLen = buf.readUInt16BE(0);
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
      });

      ws.on('error', (err) => {
        cleanup();
        reject(err);
      });
    });
  }
}

module.exports = EdgeProvider;
