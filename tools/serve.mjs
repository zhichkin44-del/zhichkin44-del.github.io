// Локальный стенд собранного сайта (как на GitHub Pages): node tools/serve.mjs [порт]
// Отдаёт файлы репозитория; /путь/ → /путь/index.html. Только для просмотра, наружу не открывать.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] ?? 4397);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain',
};

createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || /[\\/]\.git[\\/]/.test(file)) file = '';
  if (file && existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file || !existsSync(file)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    createReadStream(path.join(ROOT, '404.html')).pipe(res);
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`стенд: http://127.0.0.1:${port}/`));
