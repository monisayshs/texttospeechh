const https = require('https');

async function testVercelLive() {
  console.log("=================================================");
  console.log("TESTING LIVE VERCEL POST /api/generate REQUEST...");
  console.log("=================================================");

  const payload = JSON.stringify({
    text: "Hello, this is a live user voice test on TextToSpeechH AI.",
    voice: "hi-IN-SwaraNeural",
    rate: "+0%",
    pitch: "+0%",
    style: "neutral"
  });

  const options = {
    hostname: 'texttospeechh-ai.vercel.app',
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`\nHTTP Status Code: ${res.statusCode} ${res.statusMessage}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);

    let data = '';
    res.on('data', chunk => data += chunk.toString());
    res.on('end', () => {
      console.log(`\nResponse Length: ${data.length} characters`);
      try {
        const json = JSON.parse(data);
        console.log("Response JSON Keys:", Object.keys(json));
        console.log("Job ID:", json.jobId);
        console.log("Audio Data URI Present?:", !!json.audioDataUri);
        if (json.audioDataUri) {
          console.log("Audio Data URI Length:", json.audioDataUri.length);
          console.log("Audio Data URI Header:", json.audioDataUri.substring(0, 50));
        } else {
          console.log("Full JSON Response Body:", JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log("Raw Response Body Snippet:", data.substring(0, 300));
      }
    });
  });

  req.on('error', (e) => {
    console.error("HTTP Request Error:", e.message);
  });

  req.write(payload);
  req.end();
}

testVercelLive();
