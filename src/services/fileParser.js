let zlib;
try {
  zlib = require('zlib');
} catch (e) {
  // zlib unavailable in some edge runtimes — PDF stream decompression will be skipped
}

// ---------------------------------------------------------------------------
// Dependency-free PDF text extraction with ToUnicode CMap support.
//
// pdf-parse v2 cannot run in the Cloudflare Workers/Pages runtime (its web
// build requires DOM APIs such as DOMMatrix), so the deployed production path
// relies on this engine. It resolves each page's font resources, parses the
// fonts' ToUnicode CMaps (bfchar/bfrange) and decodes Tj/TJ text-showing
// operators accordingly — including Identity-H subset fonts produced by
// Chrome's "Print -> Save as PDF" (Skia/PDF).
// ---------------------------------------------------------------------------

/** Parse a ToUnicode CMap stream into { map: Map<code, string>, codeBytes }. */
function parseToUnicodeCMap(cmapStr) {
  const map = new Map();
  let codeBytes = 1;
  const hexToStr = (hex) => {
    const buf = Buffer.from(hex, 'hex');
    let out = '';
    for (let i = 0; i + 1 < buf.length; i += 2) out += String.fromCharCode(buf.readUInt16BE(i));
    if (buf.length % 2 === 1) out += String.fromCharCode(buf[buf.length - 1]);
    return out;
  };
  for (const sec of cmapStr.matchAll(/begincodespacerange([\s\S]*?)endcodespacerange/gi)) {
    for (const m of sec[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const len = Math.max(m[1].length, m[2].length) / 2;
      if (len > codeBytes) codeBytes = len;
    }
  }
  for (const sec of cmapStr.matchAll(/beginbfchar([\s\S]*?)endbfchar/gi)) {
    for (const m of sec[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(parseInt(m[1], 16), hexToStr(m[2]));
    }
  }
  for (const sec of cmapStr.matchAll(/beginbfrange([\s\S]*?)endbfrange/gi)) {
    const body = sec[1];
    // Array form: <srcBegin> <srcEnd> [<dst1> <dst2> ...]
    for (const m of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g)) {
      const start = parseInt(m[1], 16);
      const dsts = [...m[3].matchAll(/<([0-9A-Fa-f]+)>/g)].map((d) => hexToStr(d[1]));
      dsts.forEach((dst, i) => map.set(start + i, dst));
    }
    // Range form: <srcBegin> <srcEnd> <dstBegin>
    for (const m of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const s = parseInt(m[1], 16), e = parseInt(m[2], 16), d = parseInt(m[3], 16);
      if (e - s < 0 || e - s > 20000) continue; // sanity guard
      const width = m[3].length;
      for (let k = s; k <= e; k++) {
        map.set(k, hexToStr((d + (k - s)).toString(16).padStart(width, '0')));
      }
    }
  }
  return { map, codeBytes };
}

/** Index all indirect PDF objects: "num gen" -> body. */
function indexPdfObjects(pdfStr) {
  const objs = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b([\s\S]*?)\bendobj\b/g;
  let m;
  let guard = 0;
  while ((m = re.exec(pdfStr)) !== null && guard++ < 500000) {
    objs.set(m[1] + ' ' + m[2], m[3]);
  }
  return objs;
}

function resolvePdfRef(objs, ref) {
  const m = /(\d+)\s+(\d+)\s+R/.exec(ref);
  return m ? (objs.get(m[1] + ' ' + m[2]) || null) : null;
}

/** Extract (and FlateDecode-decompress) a stream object's content. */
function inflateStreamBody(objBody) {
  const sm = /stream\r?\n([\s\S]*?)endstream/.exec(objBody);
  if (!sm) return '';
  let raw = sm[1].replace(/\r?\n$/, '');
  if (zlib && /\/FlateDecode/.test(objBody)) {
    try { return zlib.inflateSync(Buffer.from(raw, 'latin1')).toString('latin1'); } catch (e) {}
    try { return zlib.unzipSync(Buffer.from(raw, 'latin1')).toString('latin1'); } catch (e) {}
  }
  return raw;
}

/** Decode info for one font object: its ToUnicode map, or null. */
function getFontDecodeInfo(objs, fontBody) {
  try {
    const tm = /\/ToUnicode\s+(\d+)\s+(\d+)\s+R/.exec(fontBody);
    if (!tm) return null;
    const cmapBody = objs.get(tm[1] + ' ' + tm[2]);
    if (!cmapBody) return null;
    const cmapStr = inflateStreamBody(cmapBody);
    if (!cmapStr || cmapStr.indexOf('beginbfchar') < 0 && cmapStr.indexOf('beginbfrange') < 0) return null;
    return parseToUnicodeCMap(cmapStr);
  } catch (e) {
    return null;
  }
}

/** Build resource-name -> decode-info map for one page. */
function getPageFontMap(objs, pageBody, fontCache) {
  const map = new Map();
  try {
    const fm = /\/Font\s*(<<[\s\S]{0,6000}?>>|\d+\s+\d+\s+R)/.exec(pageBody);
    if (!fm) return map;
    let dictStr = fm[1];
    if (/^\d/.test(dictStr)) {
      const resolved = resolvePdfRef(objs, dictStr);
      if (!resolved) return map;
      dictStr = resolved;
    }
    for (const e of dictStr.matchAll(/\/([A-Za-z0-9_\-+]+)\s+(\d+)\s+(\d+)\s+R/g)) {
      const objKey = e[2] + ' ' + e[3];
      if (!fontCache.has(objKey)) {
        const fontBody = objs.get(objKey);
        fontCache.set(objKey, fontBody ? getFontDecodeInfo(objs, fontBody) : null);
      }
      map.set(e[1], fontCache.get(objKey));
    }
  } catch (e) {}
  return map;
}

/** Decompressed content streams for one page. */
function getPageContentStreams(objs, pageBody) {
  const out = [];
  try {
    const cm = /\/Contents\s*(\[[\s\S]{0,2000}?\]|\d+\s+\d+\s+R)/.exec(pageBody);
    if (!cm) return out;
    const keys = [];
    if (cm[1].trim().charAt(0) === '[') {
      for (const r of cm[1].matchAll(/(\d+)\s+(\d+)\s+R/g)) keys.push(r[1] + ' ' + r[2]);
    } else {
      const r = /(\d+)\s+(\d+)\s+R/.exec(cm[1]);
      if (r) keys.push(r[1] + ' ' + r[2]);
    }
    for (const key of keys) {
      const body = objs.get(key);
      if (body) {
        const s = inflateStreamBody(body);
        if (s) out.push(s);
      }
    }
  } catch (e) {}
  return out;
}

function pdfIsSpace(c) {
  return c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f' || c === '\0';
}

/** Parse a PDF literal string starting at data[pos] === '('. Returns { bytes, next }. */
function parsePdfLiteral(data, pos) {
  const n = data.length;
  const bytes = [];
  let depth = 0;
  let p = pos + 1;
  while (p < n) {
    const c = data[p];
    if (c === '\\') {
      const nx = data[p + 1] || '';
      if (nx === 'n') { bytes.push(10); p += 2; }
      else if (nx === 'r') { bytes.push(13); p += 2; }
      else if (nx === 't') { bytes.push(9); p += 2; }
      else if (nx === 'b') { bytes.push(8); p += 2; }
      else if (nx === 'f') { bytes.push(12); p += 2; }
      else if (nx === '(' || nx === ')' || nx === '\\') { bytes.push(nx.charCodeAt(0)); p += 2; }
      else if (nx >= '0' && nx <= '7') {
        let oct = '', q = p + 1, cnt = 0;
        while (cnt < 3 && q < n && data[q] >= '0' && data[q] <= '7') { oct += data[q]; q++; cnt++; }
        bytes.push(parseInt(oct, 8) & 0xff); p = q;
      } else if (nx === '\r' || nx === '\n') { p += (nx === '\r' && data[p + 2] === '\n') ? 3 : 2; }
      else if (nx) { bytes.push(nx.charCodeAt(0) & 0xff); p += 2; }
      else { p++; }
    } else if (c === '(') { depth++; bytes.push(40); p++; }
    else if (c === ')') {
      if (depth === 0) { p++; break; }
      depth--; bytes.push(41); p++;
    } else { bytes.push(c.charCodeAt(0) & 0xff); p++; }
  }
  return { bytes, next: p };
}

/** Parse a PDF hex string starting at data[pos] === '<' (not '<<'). */
function parsePdfHex(data, pos) {
  const n = data.length;
  const bytes = [];
  let p = pos + 1, hi = -1;
  while (p < n && data[p] !== '>') {
    const v = parseInt(data[p], 16);
    if (!isNaN(v)) {
      if (hi < 0) hi = v; else { bytes.push((hi << 4) | v); hi = -1; }
    }
    p++;
  }
  if (hi >= 0) bytes.push(hi << 4);
  return { bytes, next: p + 1 };
}

/** Decode raw text bytes with a font's ToUnicode map (or WinAnsi fallback). */
function decodePdfBytes(bytes, info) {
  if (info && info.map && info.map.size > 0) {
    const twoByte = info.codeBytes >= 2;
    let out = '';
    for (let k = 0; k < bytes.length;) {
      let code;
      if (twoByte && k + 1 < bytes.length) { code = (bytes[k] << 8) | bytes[k + 1]; k += 2; }
      else { code = bytes[k]; k += 1; }
      const u = info.map.get(code);
      if (u !== undefined) out += u;
    }
    return out;
  }
  return bytes.map((b) => (b >= 32 || b === 9 || b === 10 || b === 13) ? String.fromCharCode(b) : ' ').join('');
}

/**
 * Decode one decompressed page content stream.
 * fontMap: resource name -> { map, codeBytes } | null.
 */
function decodeContentStream(data, fontMap) {
  let text = '';
  let curFont = null;
  let pending = null; // { kind: 'str', bytes } | { kind: 'arr', items }
  let inText = false;
  const n = data.length;
  let i = 0;

  const isOpBoundary = (p) => {
    const c = data[p] || '';
    return !/[A-Za-z0-9]/.test(c);
  };

  while (i < n) {
    const c = data[i];
    if (pdfIsSpace(c)) { i++; continue; }

    // Skip inline images (BI ... ID <binary> EI) — binary would confuse the scanner.
    if (c === 'B' && data.startsWith('BI', i) && isOpBoundary(i + 2)) {
      const idPos = data.indexOf('ID', i + 2);
      let end = data.indexOf('EI', idPos + 2);
      while (end > 0 && !pdfIsSpace(data[end - 1]) && !pdfIsSpace(data[end + 2] || '')) {
        end = data.indexOf('EI', end + 2);
      }
      i = end > 0 ? end + 2 : n;
      pending = null;
      continue;
    }

    if (c === '(') {
      const r = parsePdfLiteral(data, i); i = r.next;
      pending = { kind: 'str', bytes: r.bytes };
      continue;
    }
    if (c === '<' && data[i + 1] !== '<') {
      const r = parsePdfHex(data, i); i = r.next;
      pending = { kind: 'str', bytes: r.bytes };
      continue;
    }
    if (c === '[') {
      const items = [];
      i++;
      while (i < n && data[i] !== ']') {
        const d = data[i];
        if (pdfIsSpace(d)) { i++; continue; }
        if (d === '(') { const r = parsePdfLiteral(data, i); i = r.next; items.push({ t: 's', bytes: r.bytes }); }
        else if (d === '<' && data[i + 1] !== '<') { const r = parsePdfHex(data, i); i = r.next; items.push({ t: 's', bytes: r.bytes }); }
        else {
          const nm = /^-?\d+(\.\d+)?/.exec(data.slice(i, i + 24));
          if (nm) { items.push({ t: 'n', v: parseFloat(nm[0]) }); i += nm[0].length; }
          else i++;
        }
      }
      if (data[i] === ']') i++;
      pending = { kind: 'arr', items };
      continue;
    }
    if (c === '/') {
      const m = /^\/([A-Za-z0-9_\-+.]+)/.exec(data.slice(i, i + 80));
      if (m) {
        const after = data.slice(i + m[0].length, i + m[0].length + 40);
        const tfm = /^\s+[\d.]+\s+Tf\b/.exec(after);
        if (tfm) {
          curFont = (fontMap && fontMap.get(m[1])) || null;
          i += m[0].length + tfm[0].length;
        } else {
          i += m[0].length;
        }
        pending = null;
        continue;
      }
      i++; continue;
    }

    // Text-showing operators (only meaningful inside BT..ET).
    if (inText && (data.startsWith('Tj', i) || data.startsWith('TJ', i)) && isOpBoundary(i + 2)) {
      const isTJ = data[i + 1] === 'J';
      if (pending) {
        if (pending.kind === 'str') {
          text += decodePdfBytes(pending.bytes, curFont);
        } else {
          for (const it of pending.items) {
            if (it.t === 's') text += decodePdfBytes(it.bytes, curFont);
            else if (it.v < -150) text += ' '; // large kerning gap ~ word space
          }
        }
        pending = null;
      }
      i += 2;
      continue;
    }
    if (inText && (c === "'" || c === '"')) {
      if (pending && pending.kind === 'str') text += decodePdfBytes(pending.bytes, curFont) + '\n';
      pending = null;
      i++;
      continue;
    }

    // Text block / positioning operators.
    if (data.startsWith('BT', i) && isOpBoundary(i + 2)) { inText = true; pending = null; i += 2; continue; }
    if (data.startsWith('ET', i) && isOpBoundary(i + 2)) { inText = false; pending = null; text += '\n'; i += 2; continue; }
    if (inText && data.startsWith('T*', i)) { text += '\n'; pending = null; i += 2; continue; }

    // Numbers (keep pending alive for the " aw ac string operator).
    const numM = /^-?\d+(\.\d+)?/.exec(data.slice(i, i + 24));
    if (numM) { i += numM[0].length; continue; }

    // Any other operator token — skip it and invalidate a dangling operand.
    const opM = /^[A-Za-z][A-Za-z0-9]*/.exec(data.slice(i, i + 24));
    if (opM) { pending = null; i += opM[0].length; continue; }

    i++;
  }
  return text;
}

/** Full-document extraction using ToUnicode-aware decoding. Returns '' on failure. */
function extractPdfTextSmart(buffer) {
  try {
    const pdfStr = Buffer.isBuffer(buffer) ? buffer.toString('latin1') : String(buffer);
    const objs = indexPdfObjects(pdfStr);
    const fontCache = new Map();
    const chunks = [];
    for (const [, body] of objs) {
      if (!/\/Type\s*\/Page\b/.test(body) || /\/Type\s*\/Pages\b/.test(body)) continue;
      const fontMap = getPageFontMap(objs, body, fontCache);
      const streams = getPageContentStreams(objs, body);
      for (const s of streams) {
        if (s && s.indexOf('BT') >= 0) chunks.push(decodeContentStream(s, fontMap));
      }
    }
    return chunks.join('\n').replace(/[ \t\f\v]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  } catch (e) {
    return '';
  }
}

/** Legacy last-resort scan: raw strings near Tj/TJ ops, no font awareness. */
function extractPdfTextLegacy(buffer) {
  const extractedTextBlocks = [];
  try {
    const rawBinary = Buffer.isBuffer(buffer) ? buffer.toString('binary') : String(buffer);
    const streamRegex = /\bstream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(rawBinary)) !== null) {
      const streamData = Buffer.from(streamMatch[1], 'binary');
      let decompressedStr = '';
      try {
        decompressedStr = zlib.inflateSync(streamData).toString('utf-8');
      } catch (e) {
        try {
          decompressedStr = zlib.unzipSync(streamData).toString('utf-8');
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
                const textChunk = innerMatch[1]
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
  } catch (e) {}
  return '';
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

    // Secondary Engine: ToUnicode-aware extraction. This is the engine that
    // actually runs in the Cloudflare Workers/Pages production runtime, where
    // pdf-parse v2 cannot load (its web build requires DOM APIs like DOMMatrix).
    if (!mainText) {
      try {
        const smart = extractPdfTextSmart(buffer);
        if (smart && smart.length > 0) mainText = smart;
      } catch (e) {
        console.warn('[FileParser] PDF smart extraction notice:', e.message);
      }
    }

    // Tertiary Engine: legacy raw stream scan (no font awareness, last resort).
    if (!mainText && zlib) {
      try {
        const legacy = extractPdfTextLegacy(buffer);
        if (legacy && legacy.length > 0) mainText = legacy;
      } catch (e) {
        console.warn('[FileParser] PDF legacy extraction notice:', e.message);
      }
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
