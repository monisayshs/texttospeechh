const fileParser = require('../services/fileParser');
const securityService = require('../services/securityService');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { filename: bodyFilename, text: bodyText, fileData } = { ...(req.body || {}) };
    const filename = securityService.sanitizeFilename(bodyFilename || req.headers['x-file-name'] || 'document.txt');

    let extractedText = '';

    if (bodyText && typeof bodyText === 'string') {
      extractedText = bodyText;
    } else if (fileData && typeof fileData === 'string') {
      const fileBuffer = Buffer.from(fileData, 'base64');
      securityService.validateFileSize(fileBuffer.length);
      extractedText = await fileParser.parseDocument(fileBuffer, filename);
    } else if (Buffer.isBuffer(req.body)) {
      securityService.validateFileSize(req.body.length);
      extractedText = await fileParser.parseDocument(req.body, filename);
    } else {
      res.status(400).json({ error: 'No file text or valid fileData payload provided.' });
      return;
    }

    const sanitizedText = securityService.sanitizeText(extractedText);

    res.status(200).json({
      success: true,
      filename: filename,
      text: sanitizedText,
      wordCount: sanitizedText.trim().split(/\s+/).length,
      charCount: sanitizedText.length
    });

  } catch (err) {
    console.error('[uploadHandler] Processing error:', err);
    res.status(400).json({ error: err.message || 'Failed to extract text from uploaded document.' });
  }
};
