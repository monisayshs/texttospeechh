const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const path = require('path');

/**
 * File Parser Service for extracting raw text from TXT, DOCX, and PDF documents.
 */
class FileParser {
  /**
   * Parse uploaded file buffer into plain text string
   * @param {Buffer} fileBuffer 
   * @param {string} filename 
   * @returns {Promise<string>}
   */
  async parseDocument(fileBuffer, filename) {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new Error("Invalid or empty file buffer.");
    }

    const ext = path.extname(filename || '').toLowerCase();

    if (ext === '.txt') {
      return fileBuffer.toString('utf8');
    }

    if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value || '';
      } catch (err) {
        throw new Error(`Failed to parse DOCX document: ${err.message}`);
      }
    }

    if (ext === '.pdf') {
      try {
        const data = await pdfParse(fileBuffer);
        return data.text || '';
      } catch (err) {
        throw new Error(`Failed to parse PDF document: ${err.message}`);
      }
    }

    throw new Error(`Unsupported file type '${ext}'. Please upload .txt, .docx, or .pdf files.`);
  }
}

module.exports = new FileParser();
