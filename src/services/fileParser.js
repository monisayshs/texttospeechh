const path = require('path');

/**
 * File Parser Service for extracting raw text from TXT, DOCX, and PDF documents.
 * Lazy loads heavy dependencies (mammoth, pdf-parse) to avoid Vercel Serverless init crashes.
 */
class FileParser {
  /**
   * Extract actual file payload from raw multipart HTTP buffer if present
   */
  extractPayloadFromMultipart(buffer) {
    const str = buffer.toString('binary');
    if (!str.startsWith('--')) {
      return { buffer, filename: null };
    }

    const firstLineEnd = str.indexOf('\r\n');
    if (firstLineEnd === -1) return { buffer, filename: null };
    
    const boundary = str.substring(0, firstLineEnd);
    const headerEnd = str.indexOf('\r\n\r\n');
    if (headerEnd === -1) return { buffer, filename: null };

    const headers = str.substring(0, headerEnd);
    let filename = null;
    const match = headers.match(/filename="([^"]+)"/i);
    if (match) {
      filename = match[1];
    }

    const bodyStart = headerEnd + 4;
    const bodyEnd = str.lastIndexOf('\r\n' + boundary);
    
    if (bodyEnd > bodyStart) {
      const cleanBinary = str.substring(bodyStart, bodyEnd);
      return {
        buffer: Buffer.from(cleanBinary, 'binary'),
        filename: filename
      };
    }

    return { buffer, filename };
  }

  /**
   * Parse uploaded file buffer into plain text string
   * @param {Buffer} rawBuffer 
   * @param {string} filename 
   * @returns {Promise<string>}
   */
  async parseDocument(rawBuffer, filename) {
    if (!rawBuffer || !Buffer.isBuffer(rawBuffer) || rawBuffer.length === 0) {
      throw new Error("Invalid or empty file buffer.");
    }

    const { buffer, filename: extractedName } = this.extractPayloadFromMultipart(rawBuffer);
    const targetFilename = filename || extractedName || 'document.txt';
    const ext = path.extname(targetFilename).toLowerCase();

    if (ext === '.docx') {
      return this.parseDocx(buffer);
    } else if (ext === '.pdf') {
      return this.parsePdf(buffer);
    } else {
      // Default plain text / markdown
      return buffer.toString('utf-8');
    }
  }

  async parseDocx(buffer) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value ? result.value.trim() : '';
    } catch (err) {
      console.error('[FileParser] DOCX Parsing error:', err);
      throw new Error(`Failed to parse DOCX document: ${err.message}`);
    }
  }

  async parsePdf(buffer) {
    try {
      let pdfParse;
      try {
        pdfParse = require('pdf-parse/lib/pdf-parse.js');
      } catch (e) {
        pdfParse = require('pdf-parse');
      }
      const data = await pdfParse(buffer);
      return data.text ? data.text.trim() : '';
    } catch (err) {
      console.error('[FileParser] PDF Parsing error:', err);
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }
}

module.exports = new FileParser();
