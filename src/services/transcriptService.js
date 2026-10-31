/**
 * YouTube Transcript Service — TextToSpeechH AI
 *
 * Fetches the captions/subtitles of a public YouTube video without any
 * paid API or API key, using the same public player endpoints the
 * YouTube website itself uses. Several client strategies are tried in
 * order because YouTube treats each client family differently:
 *   1. Innertube WEB_EMBEDDED_PLAYER (often open to servers)
 *   2. Innertube WEB
 *   3. Innertube IOS
 *   4. Innertube TVHTML5
 *   5. Watch-page HTML scrape (ytInitialPlayerResponse)
 *   6. timedtext track list (legacy fallback)
 *
 * Nothing is stored: the caption file is fetched, parsed and returned.
 * A transcript can only exist when the video actually has captions
 * (creator-uploaded or YouTube auto-generated) — that limit is honest
 * and is stated on the tool page.
 */

const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function extractVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

async function fetchText(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 12000);
  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: Object.assign({
        'User-Agent': UA_DESKTOP,
        'Accept-Language': 'en-US,en;q=0.9'
      }, options.headers || {}),
      body: options.body,
      signal: controller.signal,
      redirect: 'follow'
    });
    const text = await res.text();
    return { status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, options = {}) {
  const r = await fetchText(url, options);
  try { return { status: r.status, json: JSON.parse(r.text) }; }
  catch (e) { return { status: r.status, json: null }; }
}

const INNERTUBE_CLIENTS = [
  {
    name: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER',
    key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    client: { clientName: 'TVHTML5_SIMPLY_EMBEDDED_PLAYER', clientVersion: '2.0', hl: 'en', gl: 'US' },
    extra: { thirdParty: { embedUrl: 'https://www.texttospeechh.com/youtube-transcript-generator' } }
  },
  {
    name: 'ANDROID',
    key: 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
    client: { clientName: 'ANDROID', clientVersion: '20.10.38', deviceMake: 'Google', deviceModel: 'Pixel 8', androidSdkVersion: 34, osName: 'Android', osVersion: '14', hl: 'en', gl: 'US', platform: 'MOBILE' },
    extra: {},
    headers: { 'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14; en_US; Pixel 8) gzip', 'X-YouTube-Client-Name': '3', 'X-YouTube-Client-Version': '20.10.38' }
  },
  {
    name: 'WEB_EMBEDDED_PLAYER',
    key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    client: { clientName: 'WEB_EMBEDDED_PLAYER', clientVersion: '1.20240111.09.00', hl: 'en', gl: 'US' },
    extra: { thirdParty: { embedUrl: 'https://www.texttospeechh.com/youtube-transcript-generator' } }
  },
  {
    name: 'WEB',
    key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    client: { clientName: 'WEB', clientVersion: '2.20240111.09.00', hl: 'en', gl: 'US' },
    extra: {}
  },
  {
    name: 'IOS',
    key: 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc',
    client: { clientName: 'IOS', clientVersion: '19.09.3', hl: 'en', gl: 'US', deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '17.3.1.21D61', platform: 'MOBILE' },
    extra: {}
  },
  {
    name: 'TVHTML5',
    key: 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
    client: { clientName: 'TVHTML5', clientVersion: '7.20240111.09.00', hl: 'en', gl: 'US' },
    extra: {}
  }
];

async function playerViaInnertube(videoId, spec) {
  const body = {
    context: { client: spec.client, ...(spec.extra || {}) },
    videoId,
    playbackContext: { contentPlaybackContext: { vis: 0, splay: false, lactMilliseconds: '-1', signatureTimestamp: 20000 } },
    racyCheckOk: true,
    contentCheckOk: true
  };
  const { json } = await fetchJson(`https://www.youtube.com/youtubei/v1/player?key=${spec.key}&prettyPrint=false`, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, spec.headers || {}),
    body: JSON.stringify(body)
  });
  return json;
}

function extractCaptionTracks(playerResponse) {
  if (!playerResponse) return null;
  const renderer = (((playerResponse.captions || {}).playerCaptionsTracklistRenderer) || {});
  const tracks = renderer.captionTracks;
  if (!Array.isArray(tracks) || tracks.length === 0) return null;
  return tracks;
}

function pickTrack(tracks, preferredLang) {
  const norm = (t) => String(t.languageCode || '').toLowerCase();
  const want = (preferredLang || '').toLowerCase();
  const byLang = (code, kind) => tracks.find(t => norm(t) === code && (!kind || t.kind === kind));
  const startsWith = (prefix, kind) => tracks.find(t => norm(t).startsWith(prefix) && (!kind || t.kind === kind));
  return (
    (want && (byLang(want) || startsWith(want.split('-')[0]))) ||
    byLang('en') || startsWith('en') ||
    byLang('en', 'asr') || startsWith('en', 'asr') ||
    tracks.find(t => t.kind !== 'asr') ||
    tracks[0]
  );
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\n/g, ' ')
    .trim();
}

function parseJson3(text) {
  const data = JSON.parse(text);
  const events = Array.isArray(data.events) ? data.events : [];
  const segments = [];
  for (const ev of events) {
    if (!ev.segs) continue;
    const line = ev.segs.map(s => s.utf8 || '').join('').replace(/\n/g, ' ').trim();
    if (!line) continue;
    segments.push({ start: Math.round((ev.tStartMs || 0) / 10) / 100, text: line });
  }
  return segments;
}

function parseXmlTranscript(text) {
  const segments = [];
  const re = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const line = decodeEntities(m[3].replace(/<[^>]+>/g, ''));
    if (!line) continue;
    segments.push({ start: Math.round(parseFloat(m[1]) * 100) / 100, text: line });
  }
  return segments;
}

async function fetchTrackSegments(baseUrl) {
  // Prefer the structured json3 format; fall back to the default XML.
  const sep = baseUrl.includes('?') ? '&' : '?';
  try {
    const { status, text } = await fetchText(`${baseUrl}${sep}fmt=json3`);
    if (status === 200 && text && text.trim().startsWith('{')) {
      const segs = parseJson3(text);
      if (segs.length) return segs;
    }
  } catch (e) { /* fall through to XML */ }
  const { status, text } = await fetchText(baseUrl);
  if (status === 200 && text) {
    const segs = parseXmlTranscript(text);
    if (segs.length) return segs;
  }
  return [];
}

async function playerViaWatchPage(videoId) {
  const { text } = await fetchText(`https://www.youtube.com/watch?v=${videoId}&hl=en&bpctr=9999999999`, {
    headers: { 'Cookie': 'CONSENT=YES+cb.20230531-04-p0.en+FX+410' }
  });
  const marker = 'ytInitialPlayerResponse = ';
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  let i = idx + marker.length;
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end === -1) return null;
  try { return JSON.parse(text.slice(i, end + 1)); } catch (e) { return null; }
}

async function tracksViaTimedTextList(videoId) {
  const { text } = await fetchText(`https://www.youtube.com/api/timedtext?v=${videoId}&type=list`);
  if (!text || !text.includes('<track')) return null;
  const tracks = [];
  const re = /<track[^>]*lang_code="([^"]+)"[^>]*>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const tag = m[0];
    const kind = /kind="([^"]+)"/.exec(tag);
    const name = /name="([^"]*)"/.exec(tag);
    tracks.push({
      languageCode: m[1],
      kind: kind ? kind[1] : undefined,
      baseUrl: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${encodeURIComponent(m[1])}${kind ? `&kind=${encodeURIComponent(kind[1])}` : ''}${name && name[1] ? `&name=${encodeURIComponent(name[1])}` : ''}`
    });
  }
  return tracks.length ? tracks : null;
}

async function fetchTitleFallback(videoId) {
  try {
    const { json } = await fetchJson(`https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}&format=json`);
    return json && json.title ? json.title : '';
  } catch (e) { return ''; }
}

/**
 * Main entry: returns { videoId, title, language, kind, segments, text }
 * or throws an Error with a `code` property:
 *   INVALID_URL | NOT_PLAYABLE | NO_CAPTIONS | UPSTREAM
 */
async function getTranscript(input, preferredLang) {
  const videoId = extractVideoId(input);
  if (!videoId) {
    const err = new Error('That does not look like a valid YouTube link. Paste a full video link, for example https://www.youtube.com/watch?v=...');
    err.code = 'INVALID_URL';
    throw err;
  }

  let sawOk = false;
  let sawErrorStatus = false;
  let sawBlocked = false;
  const attempts = [];

  const tryPlayer = async (playerResponse, strategy) => {
    if (!playerResponse) { attempts.push({ strategy, result: 'no-response' }); return null; }
    const status = ((playerResponse.playabilityStatus || {}).status) || '';
    if (status && status !== 'OK') {
      if (status === 'ERROR') sawErrorStatus = true; else sawBlocked = true;
      attempts.push({ strategy, result: 'playability:' + status });
      return null;
    }
    sawOk = true;
    const tracks = extractCaptionTracks(playerResponse);
    if (!tracks) { attempts.push({ strategy, result: 'ok-no-tracks' }); return null; }
    attempts.push({ strategy, result: 'ok-tracks:' + tracks.length });
    const track = pickTrack(tracks, preferredLang);
    const segments = await fetchTrackSegments(track.baseUrl);
    if (!segments.length) return null;
    const details = playerResponse.videoDetails || {};
    return {
      videoId,
      title: details.title || '',
      language: track.languageCode || '',
      kind: track.kind === 'asr' ? 'auto-generated' : 'creator subtitles',
      segments
    };
  };

  for (const spec of INNERTUBE_CLIENTS) {
    try {
      const result = await tryPlayer(await playerViaInnertube(videoId, spec), spec.name);
      if (result) { result.text = result.segments.map(s => s.text).join(' '); return result; }
    } catch (e) { attempts.push({ strategy: spec.name, result: 'error:' + (e.name || 'fetch') }); }
  }

  try {
    const result = await tryPlayer(await playerViaWatchPage(videoId), 'WATCH_PAGE');
    if (result) { result.text = result.segments.map(s => s.text).join(' '); return result; }
  } catch (e) { attempts.push({ strategy: 'WATCH_PAGE', result: 'error:' + (e.name || 'fetch') }); }

  try {
    const tracks = await tracksViaTimedTextList(videoId);
    if (tracks) {
      sawOk = true;
      const track = pickTrack(tracks, preferredLang);
      const segments = await fetchTrackSegments(track.baseUrl);
      if (segments.length) {
        return {
          videoId,
          title: await fetchTitleFallback(videoId),
          language: track.languageCode || '',
          kind: track.kind === 'asr' ? 'auto-generated' : 'creator subtitles',
          segments,
          text: segments.map(s => s.text).join(' ')
        };
      }
    }
  } catch (e) { /* fall through to error below */ }

  if (sawOk) {
    const err = new Error('This video has no subtitles or captions, so there is no transcript to fetch. Try a video that shows a CC button on YouTube.');
    err.code = 'NO_CAPTIONS';
    err.attempts = attempts;
    throw err;
  }
  if (sawErrorStatus && !sawBlocked) {
    const err = new Error('This video cannot be played publicly (it may be private, age-restricted or removed), so its transcript is not available.');
    err.code = 'NOT_PLAYABLE';
    err.attempts = attempts;
    throw err;
  }
  const err = new Error('YouTube did not answer properly just now. This is usually temporary - wait a minute and try again.');
  err.code = 'UPSTREAM';
  err.attempts = attempts;
  throw err;
}

module.exports = { getTranscript, extractVideoId };
