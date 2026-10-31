const { getTranscript } = require('../services/transcriptService');

/**
 * GET /api/transcript?url=<youtube link>&lang=<optional>
 * Returns the video's captions as timestamped segments + plain text.
 * No storage, no API key, no cost: captions are fetched live from
 * YouTube's public player endpoints by transcriptService.
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const parsed = new URL(req.url, 'https://www.texttospeechh.com');
    const input = parsed.searchParams.get('url') || parsed.searchParams.get('v') || '';
    const lang = parsed.searchParams.get('lang') || '';

    const result = await getTranscript(input, lang || undefined);
    res.status(200).json({
      success: true,
      videoId: result.videoId,
      title: result.title,
      language: result.language,
      kind: result.kind,
      segmentCount: result.segments.length,
      segments: result.segments,
      text: result.text
    });
  } catch (err) {
    const code = err.code || 'UPSTREAM';
    const status = code === 'INVALID_URL' ? 400 : code === 'NOT_PLAYABLE' ? 404 : code === 'NO_CAPTIONS' ? 422 : 502;
    const parsed = new URL(req.url, 'https://www.texttospeechh.com');
    const body = {
      success: false,
      code,
      error: err.message || 'Something went wrong while fetching the transcript.'
    };
    if (parsed.searchParams.get('debug') === '1' && Array.isArray(err.attempts)) body.attempts = err.attempts;
    res.status(status).json(body);
  }
};
