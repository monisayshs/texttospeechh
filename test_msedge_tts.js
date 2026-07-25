const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

async function testTTS() {
  console.log("Testing MsEdgeTTS with correct { audioStream } destructuring...");

  const voices = [
    { name: 'hi-IN-SwaraNeural', text: 'नमस्ते, यह एक वॉइस जनरेशन टेस्ट है।' },
    { name: 'ur-PK-UzmaNeural', text: 'السلام علیکم، یہ ایک آواز کا ٹیسٹ ہے۔' },
    { name: 'en-US-JennyNeural', text: 'Hello, this is a voice generation test.' }
  ];

  for (const item of voices) {
    try {
      console.log(`\nTesting voice: ${item.name}...`);
      const tts = new MsEdgeTTS();
      await tts.setMetadata(item.name, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const { audioStream } = await tts.toStream(item.text, { rate: '+0%', pitch: '+0%' });

      const chunks = [];
      const streamPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Stream timeout 5s')), 5000);
        audioStream.on('data', (c) => chunks.push(c));
        audioStream.on('end', () => {
          clearTimeout(timeout);
          resolve(Buffer.concat(chunks));
        });
        audioStream.on('error', (e) => {
          clearTimeout(timeout);
          reject(e);
        });
      });

      const audioBuffer = await streamPromise;
      console.log(`   [SUCCESS] ${item.name} produced ${audioBuffer.length} bytes of MP3 audio!`);
      tts.close();
    } catch (err) {
      console.error(`   [FAIL] ${item.name} failed:`, err.message);
    }
  }
}

testTTS();
