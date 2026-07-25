const securityService = require('../src/services/securityService');

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return resolve(JSON.parse(req.body));
      } catch (e) {
        return resolve({});
      }
    }
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

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
    req.body = await parseBody(req);
    const { filename: bodyFilename, text: bodyText, fileData } = { ...(req.body || {}) };
    const filename = securityService.sanitizeFilename(bodyFilename || req.headers['x-file-name'] || 'document.txt');

    let extractedText = '';

    if (bodyText && typeof bodyText === 'string') {
      extractedText = bodyText;
    } else if (fileData && typeof fileData === 'string') {
      const fileBuffer = Buffer.from(fileData, 'base64');
      securityService.validateFileSize(fileBuffer.length);
      
      const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
      if (ext === '.docx') {
        try {
          const mammoth = require('mammoth');
          const resDoc = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = resDoc.value || '';
        } catch (e) {
          extractedText = fileBuffer.toString('utf-8');
        }
      } else if (ext === '.pdf') {
        try {
          const pdfParse = require('pdf-parse/lib/pdf-parse.js');
          const resPdf = await pdfParse(fileBuffer);
          extractedText = resPdf.text || '';
        } catch (e) {
          extractedText = fileBuffer.toString('utf-8');
        }
      } else {
        extractedText = fileBuffer.toString('utf-8');
      }
    } else if (Buffer.isBuffer(req.body)) {
      securityService.validateFileSize(req.body.length);
      extractedText = req.body.toString('utf-8');
    } else {
      res.status(400).json({ error: 'No file text or valid fileData payload provided.' });
      return;
    }

    const sanitizedText = securityService.sanitizeText(extractedText);

    res.status(200).json({
      success: true,
      filename: filename,
      text: sanitizedText,
      wordCount: sanitizedText.trim() ? sanitizedText.trim().split(/\s+/).length : 0,
      charCount: sanitizedText.length
    });

  } catch (err) {
    console.error('[api/upload] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process document upload.' });
  }
};
