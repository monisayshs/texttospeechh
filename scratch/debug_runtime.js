const seoHandler = require('../src/api/seoHandler');
const handler = require('../api/index.js');

async function debug() {
  console.log("--- DEBUGGING /text-to-speech ---");
  const req1 = { url: '/text-to-speech', headers: { host: 'texttospeechh.com' } };
  const res1 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(data) { console.log("RES1 SUCCESS, length:", data ? data.length : 0); }
  };
  await handler(req1, res1);

  console.log("--- DEBUGGING /keyword/free-text-to-speech ---");
  const req2 = { url: '/keyword/free-text-to-speech', headers: { host: 'texttospeechh.com' } };
  const res2 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(data) { console.log("RES2 SUCCESS, statusCode:", res2.statusCode, "Location:", res2.headers['Location']); }
  };
  await handler(req2, res2);

  console.log("--- DEBUGGING / ---");
  const req3 = { url: '/', headers: { host: 'texttospeechh.com' } };
  const res3 = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(data) { console.log("RES3 SUCCESS"); }
  };
  await handler(req3, res3);
}

debug().catch(err => {
  console.error("DEBUG EXCEPTION CAUGHT:", err);
  process.exit(1);
});
