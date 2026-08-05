const INDEXNOW_KEY = 'b92a2552d2aec9f72edbb0f9b5671603';
const HOST = 'www.texttospeechh.com';
const BASE_URL = `https://${HOST}`;
const KEY_FILE_URL = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const KEY_LOCATION = KEY_FILE_URL;
const UNIVERSAL_ENDPOINT = 'https://api.indexnow.org/indexnow';
const BING_ENDPOINT = 'https://www.bing.com/indexnow';
const SEARCH_ENGINE_ENDPOINTS = [UNIVERSAL_ENDPOINT, BING_ENDPOINT];

const KEY_REGEX = /^[a-zA-Z0-9-]{8,128}$/;

function isValidKey(key) {
  return typeof key === 'string' && KEY_REGEX.test(key);
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch (e) {
    return false;
  }
}

function urlBelongsToHost(url, host) {
  try {
    const u = new URL(url);
    return u.hostname === host || u.hostname.endsWith(`.${host}`);
  } catch (e) {
    return false;
  }
}

module.exports = {
  INDEXNOW_KEY,
  HOST,
  BASE_URL,
  KEY_FILE_URL,
  KEY_LOCATION,
  UNIVERSAL_ENDPOINT,
  BING_ENDPOINT,
  SEARCH_ENGINE_ENDPOINTS,
  isValidKey,
  isValidUrl,
  urlBelongsToHost
};
