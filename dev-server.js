const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const generateHandler = require('./src/api/generateHandler');
const statusHandler = require('./src/api/statusHandler');
const uploadHandler = require('./src/api/uploadHandler');
const seoHandler = require('./src/api/seoHandler');
const contentHandler = require('./src/api/contentHandler');
const sitemapHandler = require('./src/api/sitemapHandler');

const PORT = 3000;

function setSecurityAndCacheHeaders(res, filePath, contentType) {
  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache-Control Strategy
  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (['.css', '.js', '.png', '.jpg', '.svg', '.ico', '.woff2'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ext === '.html' || contentType.includes('text/html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    }
  }
}

function compressAndSend(req, res, content, contentType, statusCode = 200) {
  setSecurityAndCacheHeaders(res, null, contentType);
  res.setHeader('Content-Type', contentType);

  const acceptEncoding = req.headers['accept-encoding'] || '';

  if (typeof content === 'string') {
    content = Buffer.from(content, 'utf-8');
  }

  if (acceptEncoding.includes('gzip') && content.length > 512) {
    res.setHeader('Content-Encoding', 'gzip');
    res.writeHead(statusCode);
    zlib.gzip(content, (err, compressed) => {
      if (err) return res.end(content);
      res.end(compressed);
    });
  } else {
    res.writeHead(statusCode);
    res.end(content);
  }
}

const server = http.createServer(async (req, res) => {
  const reqUrl = req.url;

  // Handle Dynamic Sitemaps (/sitemap.xml, /sitemap-main.xml, etc.)
  if (reqUrl.startsWith('/sitemap')) {
    const handled = await sitemapHandler(req, res);
    if (handled) return;
  }

  // Handle API Routes
  const handleApi = (handler) => {
    const parsedUrl = new URL(reqUrl, `http://${req.headers.host || 'localhost'}`);
    req.query = Object.fromEntries(parsedUrl.searchParams);

    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-File-Name'
      });
      res.end();
      return;
    }

    const runHandler = () => {
      handler(req, {
        status(code) {
          res.statusCode = code;
          return this;
        },
        json(data) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        setHeader(name, value) {
          res.setHeader(name, value);
        },
        write(chunk) {
          res.write(chunk);
        },
        end(chunk) {
          res.end(chunk);
        },
        get headersSent() {
          return res.headersSent;
        }
      });
    };

    if (req.method === 'POST') {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/octet-stream') || reqUrl.startsWith('/api/upload')) {
        runHandler();
      } else {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch (e) {
            req.body = {};
          }
          runHandler();
        });
      }
    } else {
      req.body = {};
      runHandler();
    }
  };

  if (reqUrl.startsWith('/api/generate')) {
    handleApi(generateHandler);
    return;
  }

  if (reqUrl.startsWith('/api/status')) {
    handleApi(statusHandler);
    return;
  }

  if (reqUrl.startsWith('/api/upload')) {
    handleApi(uploadHandler);
    return;
  }

  // Handle Content Hub & FAQ Directory Routes
  const isContentHandled = await contentHandler(req, res);
  if (isContentHandled) return;

  // Handle SSR SEO Routes (Programmatic SEO & Legal Pages)
  const isSeoHandled = await seoHandler(req, res);
  if (isSeoHandled) return;

  // Serve static assets from public/
  let requestedPath = reqUrl.split('?')[0];
  let filePath = path.join(__dirname, 'public', requestedPath === '/' ? 'index.html' : requestedPath);
  const extname = String(path.extname(filePath)).toLowerCase();

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found - TextToSpeechH AI</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      setSecurityAndCacheHeaders(res, filePath, contentType);
      compressAndSend(req, res, content, contentType, 200);
    }
  });
});

server.listen(PORT, () => {
  console.log(`TextToSpeechH AI Server running at http://localhost:${PORT}`);
});
