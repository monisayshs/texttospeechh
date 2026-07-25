const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Path to Google Cloud Service Account credentials JSON file
const KEY_FILE = path.join(__dirname, '..', 'service-account.json');
const TARGET_URL = 'https://texttospeechh.com/';

if (!fs.existsSync(KEY_FILE)) {
  console.error('\n❌ ERROR: service-account.json file not found in project root!');
  console.log('\nTo set up Google Indexing API (10-day ranking):');
  console.log('1. Go to Google Cloud Console (https://console.cloud.google.com/)');
  console.log('2. Enable the "Web Search Indexing API"');
  console.log('3. Create a Service Account and download the JSON private key');
  console.log('4. Save the JSON key file as "service-account.json" in the root directory of this project');
  console.log('5. Delegate owner authority to the service account email in Google Search Console');
  console.log('6. Run "node api/index-now.js" to instantly index the site!\n');
  process.exit(1);
}

const jwtClient = new google.auth.JWT(
  null,
  KEY_FILE,
  null,
  ['https://www.googleapis.com/auth/indexing'],
  null
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.error('❌ Authentication failed:', err);
    return;
  }

  const options = {
    url: 'https://indexing.googleapis.com/v1/urlNotifications:publish',
    method: 'POST',
    auth: jwtClient,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: TARGET_URL,
      type: 'URL_UPDATED'
    })
  };

  // Execute request using Google Auth request utility
  jwtClient.request(options, function (err, resp) {
    if (err) {
      console.error(`❌ Indexing Request Failed for URL ${TARGET_URL}:`, err.message);
      return;
    }
    console.log(`\n✅ SUCCESS! Google Indexing API response:`);
    console.log(resp.data);
    console.log(`Googlebot has been notified to instantly crawl: ${TARGET_URL}\n`);
  });
});
