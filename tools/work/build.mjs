// «Разработка на заказ»: /work/ (RU) и /en/work/ (EN) в оболочке сайта (SPEC-03, второй уровень).
// Оболочка — собранная страница проекта Carina (шапка, небо с чёрной дырой, подвал).
// Данные — tools/work/data/<slug>.<lang>.json, цифры с датой — tools/work/facts.json (копия
// src/data/facts.json из studio-site, кладёт tools/sync-site.mjs). Картинки — /work/<slug>/.
// Запуск из корня репозитория: node tools/work/build.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = path.join(ROOT, 'tools', 'work', 'data');
const SITE = 'https://zhichkin44-del.github.io';
const TG = 'https://t.me/god66x';
const facts = JSON.parse(readFileSync(path.join(ROOT, 'tools', 'work', 'facts.json'), 'utf8')).facts;

/** Не показываем: биты и сведение вокала — не про AI-роль (SPEC-03). */
const DROP = new Set(['custom-beat', 'vocal-mixing-mastering']);
/** Разделы: старые категории → новые. Сайты сворачиваются в одну карточку. */
const SECTIONS = ['bots', 'agents', 'apps', 'video'];
const MAP = { Bots: 'bots', Automation: 'agents', Apps: 'apps', 'Video & audio': 'video' };
const NOT_VIDEO = new Set(['windows-audio-player']);

const L = {
  ru: {
    shell: 'projects/carina/index.html',
    base: '/work/',
    author: 'Александр Жичкин',
    sections: { bots: 'Боты', agents: 'ИИ-агенты и автоматизация', apps: 'Приложения', video: 'Видео с ИИ' },
    title: 'Разработка на заказ',
    lead: 'Боты, ИИ-агенты и автоматизация, приложения и видео с ИИ — под ключ: от ТЗ и архитектуры до тестов, запуска и поддержки. Срок и цена — после брифа.',
    all: 'Все',
    filter: 'Раздел',
    empty: 'В этом разделе пока нет работ.',
    ctaH: 'Нужно похожее?',
    ctaP: 'Опишите задачу в Telegram: после короткого брифа отвечу, что сделаю, в какой срок и за какую цену.',
    ctaBtn: 'Написать в Telegram',
    allWorks: 'Все работы',
    problem: 'Задача',
    price: 'Цена',
    priceValue: 'После брифа',
    built: 'Что сделано',
    steps: 'Как работает',
    stack: 'Стек',
    offer: 'Что вы получите',
    not: 'Не входит',
    next: 'Следующая работа',
    crumbs: 'Хлебные крошки',
    list: 'Список работ',
    open: 'Открыть крупно',
    close: 'Закрыть',
    scheme: 'Схема',
    priceLine: 'Стоимость',
    notDefault: 'Хостинг, домен и оплата сторонних сервисов.',
    methodH: 'Как я работаю',
    methodP:
      'Пишу вместе с Claude Code: архитектура, постановка, ревью, тесты и ответственность за результат — мои.',
    method: [
      'Сначала бриф: что должно получиться, как понять, что готово, и чего делать нельзя. После брифа — срок и цена.',
      'Работу проверяют тесты и отдельный ревьюер; в основную ветку попадает только то, что прошло проверку.',
      'Сдаю с инструкцией, проверками и списком ограничений; после запуска — поддержка.',
    ],
    proof: (n, r, d) => `${n} слитых PR в ${r} репозиториях (GitHub, ${d}).`,
    sites: {
      slug: 'sites',
      title: 'Сайты и лендинги — как часть проекта',
      lead: 'Сайт, лендинг или страница записи, когда они нужны проекту: адаптив, RU и EN, формы, проверка скорости и доступности.',
      label: 'Сайты',
      h2: 'Сделанные сайты и страницы',
    },
    employer: 'Ищете AI-инженера в команду? Главная страница — для работодателя.',
    employerLink: 'На главную',
  },
  en: {
    shell: 'en/projects/carina/index.html',
    base: '/en/work/',
    author: 'Alexander Zhichkin',
    sections: { bots: 'Bots', agents: 'AI agents & automation', apps: 'Apps', video: 'AI video' },
    title: 'Custom development',
    lead: 'Bots, AI agents and automation, apps and AI video — end to end: from the spec and architecture to tests, launch and support. Timeline and price after a short brief.',
    all: 'All',
    filter: 'Category',
    empty: 'Nothing in this category yet.',
    ctaH: 'Need something like this?',
    ctaP: 'Describe the task on Telegram: after a short brief I will reply with what I will build, how long it takes and the price.',
    ctaBtn: 'Message me on Telegram',
    allWorks: 'All work',
    problem: 'The task',
    price: 'Price',
    priceValue: 'After a brief',
    built: 'What was built',
    steps: 'How it works',
    stack: 'Stack',
    offer: 'What you get',
    not: 'Not included',
    next: 'Next project',
    crumbs: 'Breadcrumbs',
    list: 'Project list',
    open: 'Open larger',
    close: 'Close',
    scheme: 'Diagram',
    priceLine: 'Cost',
    notDefault: 'Hosting, domain and third-party service fees.',
    methodH: 'How I work',
    methodP:
      'I write code together with Claude Code: the architecture, the task setting, the review, the tests and the responsibility for the result are mine.',
    method: [
      'A brief first: what the result must be, how we know it is done, and what is off limits. Timeline and price come after the brief.',
      'Tests and a separate reviewer check the work; only what passed the check reaches the main branch.',
      'I hand over with instructions, checks and a list of limitations; support after launch.',
    ],
    proof: (n, r, d) => `${n} merged PRs across ${r} repositories (GitHub, ${d}).`,
    sites: {
      slug: 'sites',
      title: 'Websites and landing pages — as part of a project',
      lead: 'A website, landing page or booking page when the project needs one: responsive, RU and EN, forms, speed and accessibility checks.',
      label: 'Websites',
      h2: 'Websites and pages built',
    },
    employer: 'Looking for an AI engineer for your team? The home page is for employers.',
    employerLink: 'Go to the home page',
  },
};

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

const fmtDate = (iso, lang) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (lang === 'ru') {
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

function webpSize(file) {
  const b = readFileSync(file).subarray(0, 40);
  const kind = b.subarray(12, 16).toString('latin1');
  if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  throw new Error(`webp size: ${file}`);
}

const other = (lang) => (lang === 'ru' ? 'en' : 'ru');

function shell(lang, title, desc, pathname, otherPath) {
  const t = readFileSync(path.join(ROOT, L[lang].shell), 'utf8');
  let head = t.slice(0, t.indexOf('<section class="p-hero'));
  const tail = t.slice(t.indexOf('</main>'));
  const full = `${title} · ${L[lang].author}`;
  const ruUrl = SITE + (lang === 'ru' ? pathname : otherPath);
  const enUrl = SITE + (lang === 'en' ? pathname : otherPath);
  const url = SITE + pathname;
  const rep = (re, s) => {
    head = head.replace(re, s);
  };
  rep(/<title>[^<]*<\/title>/, `<title>${esc(full)}</title>`);
  rep(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  rep(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  rep(/hreflang="ru" href="[^"]*"/, `hreflang="ru" href="${ruUrl}"`);
  rep(/hreflang="en" href="[^"]*"/, `hreflang="en" href="${enUrl}"`);
  rep(/hreflang="x-default" href="[^"]*"/, `hreflang="x-default" href="${ruUrl}"`);
  rep(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(full)}">`);
  rep(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`);
  rep(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
  rep(/(<a class="tool" href=")[^"]*(" hreflang=)/, `$1${otherPath}$2`);
  head = head.replace('</head>', '<link rel="stylesheet" href="/work/work.css"></head>');
  return [head, tail];
}

/** Скрипт увеличения снимков из собранного сайта (имя с хэшем меняется от сборки к сборке). */
function zoomScript() {
  const dir = path.join(ROOT, '_astro');
  const f = readdirSync(dir).find((n) => /^Shot\.astro_astro_type_script.*\.js$/.test(n));
  return f ? `<script type="module" src="/_astro/${f}"></script>` : '';
}

function load(lang) {
  return readdirSync(DATA)
    .filter((f) => f.endsWith(`.${lang}.json`))
    .map((f) => JSON.parse(readFileSync(path.join(DATA, f), 'utf8')))
    .filter((d) => !DROP.has(d.slug))
    .sort((a, b) => a.order - b.order);
}

const isSite = (d) => d.cats.includes('Websites');
const sectionsOf = (d) =>
  [...new Set(d.cats.map((c) => MAP[c]).filter(Boolean))].filter(
    (s) => !(s === 'video' && NOT_VIDEO.has(d.slug)),
  );

function thumb(d) {
  const t = d.thumb;
  if (t.src) {
    const [w, h] = webpSize(path.join(ROOT, t.src.replace(/^\//, '')));
    const wide = w > 2 * h ? ' wk-card__thumb--wide' : '';
    return `<span class="wk-card__thumb${wide}"><img src="${esc(t.src)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"></span>`;
  }
  return `<span class="wk-card__thumb wk-card__thumb--text" aria-hidden="true"><span>${esc(t.text)}</span></span>`;
}

function cta(lang, id) {
  const c = L[lang];
  return (
    `<section${id ? ` id="${id}"` : ''} class="wrap block" aria-label="${esc(c.ctaH)}"><div class="cta2 cta2--one"><div class="glass">` +
    `<h3>${esc(c.ctaH)}</h3><p>${esc(c.ctaP)}</p><a class="btn" href="${TG}" rel="noopener">${esc(c.ctaBtn)}</a></div></div></section>`
  );
}

function proofLine(lang) {
  const p = facts.prsTotal;
  const r = facts.reposTotal;
  const n = `<b data-fact="prsTotal">${p.value}</b>`;
  const rr = `<span data-fact="reposTotal">${r.value}</span>`;
  const d = `<time datetime="${p.date}" data-fact-date="prsTotal reposTotal">${fmtDate(p.date, lang)}</time>`;
  return L[lang].proof(n, rr, d);
}

function card(d, lang, href, label, cats) {
  return (
    `<li class="card" data-cats="${esc(cats.join('|'))}"><a class="wk-card glass" href="${href}">` +
    `${thumb(d)}<span class="wk-card__body"><span class="catalog__badge">${esc(label)}</span>` +
    `<h2>${esc(d.title)}</h2><p>${esc(d.lead)}</p><span class="wk-card__price">${esc(L[lang].priceValue)}</span></span></a></li>`
  );
}

function indexPage(lang, works, sites) {
  const c = L[lang];
  const counts = Object.fromEntries(SECTIONS.map((s) => [s, works.filter((d) => sectionsOf(d).includes(s)).length]));
  const total = works.length + 1;
  const chips = [
    `<button class="chip on" type="button" data-f="all" aria-pressed="true">${esc(c.all)} <span>${total}</span></button>`,
    ...SECTIONS.map(
      (s) =>
        `<button class="chip" type="button" data-f="${s}" aria-pressed="false">${esc(c.sections[s])} <span>${counts[s]}</span></button>`,
    ),
  ];
  const cards = works.map((d) =>
    card(d, lang, `${c.base}${d.slug}/`, sectionsOf(d).map((s) => c.sections[s]).join(' · '), sectionsOf(d)),
  );
  const s0 = sites[0];
  cards.push(
    card(
      { ...s0, title: c.sites.title, lead: c.sites.lead },
      lang,
      `${c.base}${c.sites.slug}/`,
      c.sites.label,
      [],
    ),
  );
  const body =
    `<section class="wrap page-head" data-hole-anchor aria-labelledby="work-title"><h1 id="work-title">${esc(c.title)}</h1>` +
    `<p class="lead">${esc(c.lead)}</p><p class="wk-actions"><a class="btn" href="${TG}" rel="noopener">${esc(c.ctaBtn)}</a></p></section>` +
    `<section class="wrap block" aria-labelledby="method-title"><div class="cta2 cta2--one"><div class="glass wk-method">` +
    `<h2 id="method-title">${esc(c.methodH)}</h2><p class="wk-method__lead">${esc(c.methodP)}</p>` +
    `<ul class="wk-points">${c.method.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` +
    `<p class="wk-method__proof">${proofLine(lang)}</p></div></div></section>` +
    `<section class="wrap block wk-list" aria-label="${esc(c.list)}">` +
    `<div class="chips" role="group" aria-label="${esc(c.filter)}">${chips.join('')}</div>` +
    `<ul class="wk-grid" id="grid">${cards.join('')}</ul>` +
    `<p class="wk-empty" id="empty" hidden>${esc(c.empty)}</p></section>` +
    cta(lang, 'contact') +
    `<p class="wrap wk-employer">${esc(c.employer)} <a href="${lang === 'en' ? '/en/' : '/'}">${esc(c.employerLink)}</a></p>` +
    '<script src="/work/work.js" defer></script>';
  const [head, tail] = shell(lang, c.title, c.lead, c.base, L[other(lang)].base);
  return head + body + tail;
}

function shotHtml(s, lang, eager = false) {
  const c = L[lang];
  const tall = s.tall ? ' shot--tall' : '';
  const cap = s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : '';
  if (s.pre) return `<figure class="shot glass wk-pre"><pre><code>${esc(s.pre)}</code></pre>${cap}</figure>`;
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return (
    `<figure class="shot glass${tall}"><a class="shot__zoom" href="${esc(s.src)}" data-zoom data-close="${c.close}" title="${c.open}">` +
    `<img src="${esc(s.src)}" alt="${esc(s.alt || s.caption || '')}" width="${s.w}" height="${s.h}" ${load} decoding="async"></a>${cap}</figure>`
  );
}

function hero(lang, title, lead, badge) {
  const c = L[lang];
  return (
    `<section class="p-hero wrap p-hero--solo" data-hole-anchor aria-labelledby="p-title"><div class="p-hero__text">` +
    `<nav class="crumbs" aria-label="${c.crumbs}"><a href="${c.base}">${esc(c.title)}</a><span aria-hidden="true"> / </span>` +
    `<span aria-current="page">${esc(title)}</span></nav><h1 id="p-title">${esc(title)}</h1>` +
    `<p class="p-hero__line">${esc(lead)}</p><p class="p-hero__badge"><span class="dot" aria-hidden="true"></span>${esc(badge)}</p>` +
    `<div class="actions"><a class="btn" href="${TG}" rel="noopener">${esc(c.ctaBtn)}</a>` +
    `<a class="btn ghost" href="${c.base}">${esc(c.allWorks)}</a></div></div></section>`
  );
}

function detailPage(lang, d, next, zoom) {
  const c = L[lang];
  const pathname = `${c.base}${d.slug}/`;
  const p = [hero(lang, d.title, d.lead, sectionsOf(d).map((s) => c.sections[s]).join(' · '))];
  let shots = [...d.shots];
  if (d.hero) {
    p.push(`<div class="wrap lead-shot">${shotHtml(d.hero, lang, true)}</div>`);
    shots = shots.filter((s) => s.src !== d.hero.src);
  }
  p.push(
    `<div class="wrap"><div class="statebar glass"><div><small>${c.problem}</small>${esc(d.problem)}</div>` +
      `<div><small>${c.price}</small><b class="wk-price">${esc(c.priceValue)}</b></div></div></div>`,
  );
  p.push(
    `<section class="wrap block" aria-labelledby="built-title"><h2 id="built-title">${c.built}</h2>` +
      `<ul class="wk-points">${d.built.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`,
  );
  if (shots.length)
    p.push(
      `<section class="wrap block" aria-labelledby="shots-title"><h2 id="shots-title">${esc(d.shots_title)}</h2>` +
        `<div class="gallery">${shots.map((s) => shotHtml(s, lang)).join('')}</div></section>`,
    );
  if (d.steps?.length)
    p.push(
      `<section id="how" class="wrap block" aria-labelledby="how-title"><h2 id="how-title">${c.steps}</h2>` +
        `<ol class="wk-steps glass" aria-label="${c.scheme}">${d.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` +
        (d.stack?.length
          ? `<ul class="wk-tags" aria-label="${c.stack}">${d.stack.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
          : '') +
        '</section>',
    );
  p.push(
    `<section class="wrap block" aria-labelledby="offer-title"><h2 id="offer-title">${c.offer}</h2><div class="cta2">` +
      `<div class="glass"><ul class="wk-points">${d.offer.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` +
      `<p class="wk-price-line">${c.priceLine}: <b>${esc(lang === 'ru' ? c.priceValue.toLowerCase() : c.priceValue.toLowerCase())}</b></p></div>` +
      `<div class="glass"><h3>${c.not}</h3><p>${esc((d.not_included || '').trim() || c.notDefault)}</p>` +
      `<a class="btn" href="${TG}" rel="noopener">${esc(c.ctaBtn)}</a></div></div></section>`,
  );
  p.push(
    `<nav class="wrap next-project" aria-label="${c.next}"><a href="${c.base}${next.slug}/"><small>${c.next}</small>` +
      `<b>${esc(next.title)}</b><span>${esc(next.lead)}</span></a></nav>`,
  );
  p.push(zoom);
  const [head, tail] = shell(lang, d.title, d.lead, pathname, `${L[other(lang)].base}${d.slug}/`);
  return head + p.join('') + tail;
}

function sitesPage(lang, sites, zoom) {
  const c = L[lang];
  const s = c.sites;
  const items = sites
    .map(
      (d) =>
        `<li class="card"><div class="wk-card glass">${thumb(d)}<span class="wk-card__body"><h3 class="wk-site__h">${esc(d.title)}</h3><p>${esc(d.lead)}</p>` +
        (d.stack?.length ? `<ul class="wk-tags">${d.stack.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '') +
        '</span></div></li>',
    )
    .join('');
  const body =
    hero(lang, s.title, s.lead, s.label) +
    `<section class="wrap block" aria-labelledby="sites-title"><h2 id="sites-title">${esc(s.h2)}</h2><ul class="wk-grid">${items}</ul></section>` +
    cta(lang) +
    zoom;
  const [head, tail] = shell(lang, s.title, s.lead, `${c.base}${s.slug}/`, `${L[other(lang)].base}${s.slug}/`);
  return head + body + tail;
}

/** Убранная страница: переадресация, чтобы старые ссылки не вели в пустоту. */
function redirect(lang, to) {
  const url = SITE + to;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(L[lang].title)}</title><meta name="robots" content="noindex"><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p><a href="${to}">${esc(L[lang].title)}</a></p></body></html>`;
}

function main() {
  for (const lang of ['ru', 'en']) {
    const c = L[lang];
    const all = load(lang);
    const works = all.filter((d) => !isSite(d));
    const sites = all.filter(isSite);
    const out = path.join(ROOT, c.base.replace(/^\/|\/$/g, ''));
    mkdirSync(out, { recursive: true });
    const zoom = zoomScript();
    writeFileSync(path.join(out, 'index.html'), indexPage(lang, works, sites));
    works.forEach((d, i) => {
      const dir = path.join(out, d.slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, 'index.html'), detailPage(lang, d, works[(i + 1) % works.length], zoom));
    });
    mkdirSync(path.join(out, c.sites.slug), { recursive: true });
    writeFileSync(path.join(out, c.sites.slug, 'index.html'), sitesPage(lang, sites, zoom));
    for (const d of sites) {
      mkdirSync(path.join(out, d.slug), { recursive: true });
      writeFileSync(path.join(out, d.slug, 'index.html'), redirect(lang, `${c.base}${c.sites.slug}/`));
    }
    for (const slug of DROP) {
      const dir = path.join(out, slug);
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
        mkdirSync(dir);
        writeFileSync(path.join(dir, 'index.html'), redirect(lang, c.base));
      }
    }
    console.log(lang, works.length, 'работ +', sites.length, 'сайтов на одной странице ->', c.base);
  }
}

main();
