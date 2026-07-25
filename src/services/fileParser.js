const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const path = require('path');

/**
 * File Parser Service for extracting raw text from TXT, DOCX, and PDF documents.
 * Handles both raw binary buffers and multipart/form-data payloads cleanly.
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

    if (ext === '.txt' || ext === '.md' || ext === '.json' || ext === '') {
      return buffer.toString('utf8').trim();
    }

    if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ buffer: buffer });
        return (result.value || '').trim();
      } catch (err) {
        throw new Error(`Failed to parse DOCX document: ${err.message}`);
      }
    }

    if (ext === '.pdf') {
      try {
        const data = await pdfParse(buffer);
        return (data.text || '').trim();
      } catch (err) {
        throw new Error(`Failed to parse PDF document: ${err.message}`);
      }
    }

    throw new Error(`Unsupported file type '${ext}'. Please upload .txt, .docx, or .pdf files.`);
  }
}

module.exports = new FileParser();
