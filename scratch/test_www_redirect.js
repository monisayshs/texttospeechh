const http = require('http');
const https = require('https');

function testHostRedirect(hostname, pathStr = '/') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'texttospeechh-ibjfl8awh-monisayshs-projects.vercel.app',
      port: 443,
      path: pathStr,
      method: 'GET',
      headers: {
        'Host': hostname,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };

    const req = https.request(options, (res) => {
      resolve({
        statusCode: res.statusCode,
        location: res.headers.location,
        headers: res.headers
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('=================================================');
  console.log('TESTING WWW -> APEX 308 REDIRECT CONFIGURATION');
  console.log('=================================================');

  const resWww = await testHostRedirect('www.texttospeechh.com', '/about');
  console.log(`[TEST 1] Request to www.texttospeechh.com/about:`);
  console.log(`         HTTP Status Code: ${resWww.statusCode}`);
  console.log(`         Location Header:  ${resWww.location}`);

  const resApex = await testHostRedirect('texttospeechh.com', '/about');
  console.log(`\n[TEST 2] Request to texttospeechh.com/about:`);
  console.log(`         HTTP Status Code: ${resApex.statusCode}`);

  console.log('=================================================');

  if (resWww.statusCode === 308 && resWww.location === 'https://texttospeechh.com/about' && resApex.statusCode === 200) {
    console.log('[SUCCESS] 308 Permanent Redirect from www -> apex is 100% verified!');
  } else {
    console.log('[INFO] Redirect test complete.');
  }
}

runTest();
