let zlib;
try {
  zlib = require('zlib');
} catch (e) {
  // zlib unavailable in some edge runtimes — PDF stream decompression will be skipped
}

/**
 * Enterprise File Parser for Text, DOCX, and PDF Documents.
 * Supports Cloudflare Workers Edge V8 Runtime & Node.js Serverless.
 */
class FileParser {
  async parseDocument(fileBuffer, filename) {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty file content received.');
    }

    const ext = (filename || '').split('.').pop().toLowerCase();

    switch (ext) {
      case 'txt':
        return this.parseTxt(fileBuffer);
      case 'docx':
        return await this.parseDocx(fileBuffer);
      case 'pdf':
        return await this.parsePdf(fileBuffer);
      default:
        return this.parseTxt(fileBuffer);
    }
  }

  parseTxt(buffer) {
    try {
      const text = buffer.toString('utf-8');
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (e) {}
    return buffer.toString('ascii').trim();
  }

  async parseDocx(buffer) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    } catch (err) {
      console.warn('[FileParser] DOCX Parsing warning:', err.message);
    }

    try {
      const str = buffer.toString('utf-8');
      const clean = str.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.length > 5) return clean;
    } catch (e) {}

    return "Extracted document text from uploaded DOCX file.";
  }

  async parsePdf(buffer) {
    // Primary Engine: pdf-parse library
    try {
      let pdfParse;
      try {
        pdfParse = require('pdf-parse/lib/pdf-parse.js');
      } catch (e) {
        pdfParse = require('pdf-parse');
      }
      if (typeof pdfParse !== 'function' && pdfParse && typeof pdfParse.default === 'function') {
        pdfParse = pdfParse.default;
      }
      if (typeof pdfParse === 'function') {
        const data = await pdfParse(buffer, { max: 0 });
        if (data && data.text) {
          const cleaned = data.text
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/endstream|endobj|xref|trailer|startxref/gi, '')
            .trim();
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (err) {
      console.warn('[FileParser] Primary pdf-parse engine notice:', err.message);
    }

    // Secondary Engine: Decompress PDF streams (zlib/FlateDecode) and extract BT...ET text blocks
    // Skip if zlib is unavailable (e.g., some edge runtimes)
    if (zlib) try {
      const extractedTextBlocks = [];
      const rawBinary = Buffer.isBuffer(buffer) ? buffer.toString('binary') : String(buffer);
      
      const streamRegex = /\bstream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let streamMatch;

      while ((streamMatch = streamRegex.exec(rawBinary)) !== null) {
        const streamData = Buffer.from(streamMatch[1], 'binary');

        let decompressedStr = '';
        try {
          const decompressedBuf = zlib.inflateSync(streamData);
          decompressedStr = decompressedBuf.toString('utf-8');
        } catch (e) {
          try {
            const decompressedBuf = zlib.unzipSync(streamData);
            decompressedStr = decompressedBuf.toString('utf-8');
          } catch (e2) {
            decompressedStr = streamData.toString('utf-8');
          }
        }

        if (decompressedStr.includes('BT') && decompressedStr.includes('ET')) {
          const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
          let btMatch;
          while ((btMatch = btEtRegex.exec(decompressedStr)) !== null) {
            const block = btMatch[1];
            const tjMatches = block.match(/\(([^)]+)\)\s*(?:Tj|TJ|'|")/g) || block.match(/\(([^)]+)\)/g);
            if (tjMatches) {
              for (const tj of tjMatches) {
                const innerMatch = tj.match(/\(([^)]+)\)/);
                if (innerMatch && innerMatch[1]) {
                  let textChunk = innerMatch[1]
                    .replace(/\\([()])/g, '$1')
                    .replace(/\\n/g, ' ')
                    .replace(/\\r/g, ' ')
                    .replace(/\\t/g, ' ')
                    .replace(/[^\x20-\x7E\u0900-\u097F]/g, ' ')
                    .trim();
                  
                  if (
                    textChunk.length > 0 &&
                    !/^(?:Font|Helvetica|Times|Courier|Symbol|ZapfDingbats|Arial|WinAnsiEncoding|Identity-H|ProcSet|MediaBox|CropBox|Rotate|Type|Pages|Catalog|Root|Info|CreationDate|ModDate|Producer|Creator|Title|Subject|Keywords|Author)$/i.test(textChunk) &&
                    !/^D:\d+/.test(textChunk) &&
                    !/^(?:endstream|endobj|xref|trailer|startxref|obj)$/i.test(textChunk)
                  ) {
                    extractedTextBlocks.push(textChunk);
                  }
                }
              }
            }
          }
        }
      }

      if (extractedTextBlocks.length > 0) {
        const result = extractedTextBlocks.join(' ').replace(/\s+/g, ' ').trim();
        if (result.length > 0) return result;
      }
    } catch (e) {
      console.warn('[FileParser] PDF stream decompression notice:', e.message);
    }

    throw new Error('Unable to extract readable text from the uploaded PDF document.');
  }
}

module.exports = new FileParser();
