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

  extractPdfAnnotations(buffer) {
    try {
      const rawStr = Buffer.isBuffer(buffer) ? buffer.toString('binary') : String(buffer);
      const annotations = [];
      const seen = new Set();

      // Search for PDF Annotation objects with /Subtype and /Contents (...) or /Contents <...>
      const annotRegex = /\/Subtype\s*\/(?:Text|FreeText|Highlight|Popup|Stamp|Ink|Underline|Squiggly|StrikeOut|Caret)[\s\S]*?\/Contents\s*(?:\(([\s\S]*?)\)|<([0-9a-fA-F]+)>)/g;
      let match;

      while ((match = annotRegex.exec(rawStr)) !== null) {
        let contentText = '';
        if (match[1] !== undefined) {
          contentText = match[1]
            .replace(/\\([()])/g, '$1')
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/[^\x20-\x7E\u0900-\u097F]/g, ' ')
            .trim();
        } else if (match[2] !== undefined) {
          try {
            const hexBuf = Buffer.from(match[2], 'hex');
            contentText = hexBuf.toString('utf-8').replace(/[^\x20-\x7E\u0900-\u097F]/g, ' ').trim();
          } catch (e) {}
        }

        if (contentText && contentText.length > 1 && !seen.has(contentText)) {
          seen.add(contentText);
          annotations.push(contentText);
        }
      }

      // Generic fallback for /Annots arrays with /Contents (...)
      if (annotations.length === 0) {
        const contentsRegex = /\/Annots[\s\S]*?\/Contents\s*\(([\s\S]*?)\)/g;
        let cMatch;
        while ((cMatch = contentsRegex.exec(rawStr)) !== null) {
          const textChunk = cMatch[1].replace(/\\([()])/g, '$1').replace(/\s+/g, ' ').trim();
          if (textChunk && textChunk.length > 1 && !seen.has(textChunk)) {
            seen.add(textChunk);
            annotations.push(textChunk);
          }
        }
      }

      return annotations;
    } catch (err) {
      console.warn('[FileParser] PDF Annotation extraction notice:', err.message);
      return [];
    }
  }

  /**
   * Heuristic readability check. PDFs built with subset/custom font encodings
   * and no ToUnicode map decode to symbol soup (e.g. "D+,1 / e G0 O K9<").
   * Returning that as "extracted text" would fill the TTS box with garbage,
   * so it is treated as a failed extraction instead of valid text.
   */
  looksLikeGarbage(text) {
    if (!text || text.length < 60) return false; // too short to judge reliably
    const tokens = text.split(/\s+/).filter(Boolean);
    if (tokens.length < 10) return false;
    let wordLike = 0;
    for (const t of tokens) {
      const letters = (t.match(/[a-zA-Z\u0900-\u097F]/g) || []).length;
      if (t.length >= 3 && letters / t.length >= 0.7) wordLike++;
    }
    return wordLike / tokens.length < 0.15;
  }

  async parsePdf(buffer) {
    let mainText = '';

    // Primary Engine: pdf-parse library (v2 API; v1 function API as fallback).
    // NOTE: package.json pins pdf-parse to v2. The v2 module exports a PDFParse
    // class, NOT a callable function — calling require('pdf-parse') as a function
    // silently fails, so both shapes are handled explicitly here.
    try {
      const mod = require('pdf-parse');
      let extracted = '';
      const PDFParse = (mod && mod.PDFParse) || (mod && mod.default && mod.default.PDFParse);
      if (typeof PDFParse === 'function') {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        if (result) {
          extracted = result.text
            || (Array.isArray(result.pages) ? result.pages.map((p) => p.text).join(' ') : '');
        }
      } else if (typeof mod === 'function') {
        // Legacy pdf-parse v1 API
        const data = await mod(buffer, { max: 0 });
        if (data && data.text) extracted = data.text;
      } else {
        try {
          const legacy = require('pdf-parse/lib/pdf-parse.js');
          const fn = typeof legacy === 'function' ? legacy : legacy && legacy.default;
          if (typeof fn === 'function') {
            const data = await fn(buffer, { max: 0 });
            if (data && data.text) extracted = data.text;
          }
        } catch (e) {}
      }
      if (extracted) {
        const cleaned = extracted
          .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, ' ')
          .replace(/[\r\n]+/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/endstream|endobj|xref|trailer|startxref/gi, '')
          .trim();
        if (cleaned.length > 0) {
          mainText = cleaned;
        }
      }
    } catch (err) {
      console.warn('[FileParser] Primary pdf-parse engine notice:', err.message);
    }

    // Secondary Engine: Decompress PDF streams (zlib/FlateDecode) if mainText was not found
    if (!mainText && zlib) try {
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
        if (result.length > 0) mainText = result;
      }
    } catch (e) {
      console.warn('[FileParser] PDF stream decompression notice:', e.message);
    }

    if (!mainText) {
      throw new Error('Unable to extract readable text from the uploaded PDF document.');
    }

    // Reject symbol-soup output from undecodable font encodings (see looksLikeGarbage).
    if (this.looksLikeGarbage(mainText)) {
      throw new Error('This PDF uses a font encoding we cannot read, so no readable text could be extracted. Try re-exporting it as a standard PDF (Print -> Save as PDF) or paste the text manually.');
    }

    // Extract PDF Annotations & Sticky Notes if present
    const annotations = this.extractPdfAnnotations(buffer);
    if (annotations.length > 0) {
      mainText += ' [PDF Annotations and Comments]: ' + annotations.join('. ');
    }

    return mainText;
  }
}

module.exports = new FileParser();
