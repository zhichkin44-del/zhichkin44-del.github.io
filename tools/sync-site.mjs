// Перенос собранного сайта (studio-site, npm run build → dist/) в этот репозиторий GitHub Pages.
// Удаляет прежние файлы сборки и кладёт новые; /work/, /en/work/, demos/, media/, docs/, tools/ не трогает.
// Цифры для /work/ — копия src/data/facts.json в tools/work/facts.json.
// Запуск: node tools/sync-site.mjs <путь к studio-site>
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.resolve(process.argv[2] ?? '../studio-site');
const dist = path.join(site, 'dist');
if (!existsSync(path.join(dist, 'index.html'))) throw new Error(`нет ${dist}/index.html: сначала npm run build`);

const KEEP = new Set(['.git', '.nojekyll', 'work', 'demos', 'media', 'docs', 'tools', 'README.md', '.gitignore']);
for (const name of readdirSync(ROOT)) {
  if (KEEP.has(name)) continue;
  if (name === 'en') {
    for (const sub of readdirSync(path.join(ROOT, 'en'))) {
      if (sub !== 'work') rmSync(path.join(ROOT, 'en', sub), { recursive: true, force: true });
    }
    continue;
  }
  rmSync(path.join(ROOT, name), { recursive: true, force: true });
}
cpSync(dist, ROOT, { recursive: true });
cpSync(path.join(site, 'src', 'data', 'facts.json'), path.join(ROOT, 'tools', 'work', 'facts.json'));
console.log('сайт перенесён из', dist);

// Прежние страницы проектов, ставшие кейсами: переадресация, чтобы старые ссылки работали.
import { mkdirSync, writeFileSync } from 'node:fs';
const MOVED = {
  'studio-console': '/cases/pulse-ai/',
  zokul: '/cases/messenger/',
  'video-studio': '/cases/video-pipeline/',
  secretary: '/cases/job-bot/',
  'studio-news': '/projects/',
  'audio-studio': '/projects/',
};
for (const [lang, prefix] of [['ru', ''], ['en', '/en']]) {
  for (const [id, to] of Object.entries(MOVED)) {
    const dir = path.join(ROOT, prefix.slice(1), 'projects', id);
    if (existsSync(path.join(dir, 'index.html'))) continue;
    mkdirSync(dir, { recursive: true });
    const href = prefix + to;
    writeFileSync(
      path.join(dir, 'index.html'),
      `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${lang === 'ru' ? 'Кейсы' : 'Case studies'}</title><meta name="robots" content="noindex"><link rel="canonical" href="https://zhichkin44-del.github.io${href}"><meta http-equiv="refresh" content="0; url=${href}"></head><body><p><a href="${href}">${href}</a></p></body></html>`,
    );
  }
}
