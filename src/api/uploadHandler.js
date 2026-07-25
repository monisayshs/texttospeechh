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
    const filename = securityService.sanitizeFilename(req.headers['x-file-name'] || 'document.txt');
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const fileBuffer = Buffer.concat(chunks);
        securityService.validateFileSize(fileBuffer.length);

        const extractedText = await fileParser.parseDocument(fileBuffer, filename);
        const sanitizedText = securityService.sanitizeText(extractedText);

        res.status(200).json({
          success: true,
          filename: filename,
          text: sanitizedText,
          wordCount: sanitizedText.trim().split(/\s+/).length,
          charCount: sanitizedText.length
        });
      } catch (err) {
        console.error('[uploadHandler] Parsing error:', err);
        res.status(400).json({ error: err.message || 'Failed to extract text from uploaded document.' });
      }
    });

  } catch (err) {
    console.error('[uploadHandler] Request error:', err);
    res.status(500).json({ error: 'Internal server error while processing upload.' });
  }
};
