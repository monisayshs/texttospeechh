const contactHandler = require('./api/contact');

async function runTest() {
  console.log("Testing POST /api/contact form submission handler...");

  const req = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '127.0.0.1'
    },
    body: {
      name: "Test User",
      email: "user@example.com",
      subject: "Test Inquiry regarding TextToSpeechH AI",
      message: "Hello team, this is a test contact submission to verify single inbox routing."
    }
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log(`\nHTTP Status: ${this.statusCode}`);
      console.log("Response Payload:", JSON.stringify(data, null, 2));
    }
  };

  await contactHandler(req, res);
}

runTest();
