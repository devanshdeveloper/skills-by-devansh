import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function start(projectRoot = process.cwd(), port = 4173) {
  const root = path.resolve(projectRoot, 'project-docs/client-review');
  const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.json':'application/json', '.txt':'text/plain; charset=utf-8' };
  const server = http.createServer((req,res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname) + (url.pathname.endsWith('/') ? 'index.html' : ''));
      if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end('Not found'); return; }
      res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    } catch { res.writeHead(400).end('Invalid request'); }
  });
  return new Promise((resolve,reject) => {
    server.once('error',reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await start(process.argv[2] || process.cwd(), Number(process.argv[3] || 4173));
  console.log(`Review: http://127.0.0.1:${server.address().port}/gate-2-design-theory/`);
}
