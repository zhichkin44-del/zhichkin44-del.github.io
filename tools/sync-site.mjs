// Перенос собранного сайта (studio-site, npm run build → dist/) в этот репозиторий GitHub Pages.
// Удаляет прежние файлы сборки и кладёт новые. Раздела /work/ больше нет (решение владельца 18.11):
// старые адреса /work/* и /projects/* — страницы-переадресации из сборки studio-site.
// tools/work/data — архив текстов бывшего /work/ (из них собраны короткие кейсы в studio-site).
// Запуск: node tools/sync-site.mjs <путь к studio-site>
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.resolve(process.argv[2] ?? '../studio-site');
const dist = path.join(site, 'dist');
if (!existsSync(path.join(dist, 'index.html'))) throw new Error(`нет ${dist}/index.html: сначала npm run build`);

const KEEP = new Set(['.git', '.nojekyll', 'docs', 'tools', 'README.md', '.gitignore']);
for (const name of readdirSync(ROOT)) {
  if (!KEEP.has(name)) rmSync(path.join(ROOT, name), { recursive: true, force: true });
}
cpSync(dist, ROOT, { recursive: true });
console.log('сайт перенесён из', dist);
