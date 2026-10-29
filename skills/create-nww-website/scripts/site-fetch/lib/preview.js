'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8'
};

function startPreviewServer(serveDir, port = 3000, shouldOpen = true) {
  const resolvedDir = path.resolve(serveDir);
  if (!fs.existsSync(resolvedDir)) {
    console.error(`Error: Directory '${serveDir}' does not exist.`);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    if (!reqPath || reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(resolvedDir, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>The file <code>${reqPath}</code> was not found in <code>${serveDir}</code>.</p>`);
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n=================================================================`);
    console.log(`  OFFLINE MIRROR PREVIEW SERVER ACTIVE`);
    console.log(`  Serving:   ${resolvedDir}`);
    console.log(`  Local URL: ${url}`);
    console.log(`  Press Ctrl+C to stop.`);
    console.log(`=================================================================\n`);

    if (shouldOpen) {
      const cmd = process.platform === 'win32' ? `start "" "${url}"` : (process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
      exec(cmd, () => {});
    }
  });

  return server;
}

module.exports = { startPreviewServer };
