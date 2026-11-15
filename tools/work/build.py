"""Build /work/ (RU) and /en/work/ (EN) in the site's own shell.

Shell = the built Carina project page (header, sky with the black hole, footer).
Data = tools/work/data/<slug>.<lang>.json. Images stay in /work/<slug>/.
Run from the repo root:  python -I -X utf8 tools/work/build.py
"""
import html
import json
import pathlib
import re
import struct

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = ROOT / 'tools' / 'work' / 'data'
SITE = 'https://zhichkin44-del.github.io'
TG = 'https://t.me/god66x'
ZOOM_JS = '/_astro/Shot.astro_astro_type_script_index_0_lang.CHCBB3_M.js'

CATS = ['Bots', 'Automation', 'Apps', 'Websites', 'Video & audio']
L = {
    'ru': {
        'shell': 'projects/carina/index.html', 'base': '/work/', 'other': '/en/work/',
        'author': 'Александр Жичкин', 'cats': {'Bots': 'Боты', 'Automation': 'Автоматизация',
        'Apps': 'Приложения', 'Websites': 'Сайты', 'Video & audio': 'Видео и звук'},
        'index_title': 'Работы на заказ',
        'index_lead': 'Боты, автоматизация, приложения, сайты и видео. У каждой работы: '
                      'экраны или прогон тестов, как устроено, что вы получите и цена.',
        'all': 'Все', 'filter': 'Раздел', 'filter_note': 'Одна работа может стоять в двух разделах.',
        'empty': 'В этом разделе пока нет работ.',
        'cta_h': 'Нужно похожее?', 'cta_p': 'Опишите задачу в Telegram: отвечу, что сделаю, в какой срок и за какую цену.',
        'cta_btn': 'Написать в Telegram', 'all_works': 'Все работы',
        'problem': 'Задача', 'price': 'Цена', 'built': 'Что сделано', 'steps': 'Как работает',
        'stack': 'Стек', 'offer': 'Что вы получите', 'not': 'Не входит',
        'next': 'Следующая работа', 'crumbs': 'Хлебные крошки', 'list': 'Список работ',
        'open': 'Открыть крупно', 'close': 'Закрыть', 'scheme': 'Схема',
        'skip_footer_work': 'Работы на заказ', 'price_line': 'Стоимость',
        'method_h': 'Как я работаю',
        'method_p': 'Я не пишу код руками. Я ставлю задачу, задаю правила и принимаю результат. '
                    'Код пишет ИИ, а проверяют его агенты-проверяющие, которых я настраиваю под каждую работу.',
        'method': ['Задача и правила — на мне: что должно получиться, как понять, что готово, и чего делать нельзя.',
                   'Основная модель пишет код. Исправляет её только отдельный проверяющий со своей ролью: '
                   'тестировщик, редактор или «заказчик», который придирается как вы.',
                   'Работа не уходит к вам, пока проверяющий не сказал «готово»: тесты, обход всех экранов, сверка с задачей.',
                   'Внимание — на задаче и качестве, а не на синтаксисе. Поэтому быстрее и с меньшим числом переделок.'],
        'method_proof': '542 изменения (PR) во всех моих репозиториях с 23 октября по 15 ноября 2026 года (поиск GitHub, 15 репозиториев).',
    },
    'en': {
        'shell': 'en/projects/carina/index.html', 'base': '/en/work/', 'other': '/work/',
        'author': 'Alexander Zhichkin', 'cats': {c: c for c in CATS},
        'index_title': 'Freelance work',
        'index_lead': 'Bots, automation, apps, websites and video. Each project shows its screens '
                      'or test run, how it works, what you get and the price.',
        'all': 'All', 'filter': 'Category', 'filter_note': 'One project can sit in two categories.',
        'empty': 'Nothing in this category yet.',
        'cta_h': 'Need something like this?', 'cta_p': 'Describe the task on Telegram: I will reply with what I will build, how long it takes and the price.',
        'cta_btn': 'Message me on Telegram', 'all_works': 'All work',
        'problem': 'The task', 'price': 'Price', 'built': 'What was built', 'steps': 'How it works',
        'stack': 'Stack', 'offer': 'What you get', 'not': 'Not included',
        'next': 'Next project', 'crumbs': 'Breadcrumbs', 'list': 'Project list',
        'open': 'Open larger', 'close': 'Close', 'scheme': 'Diagram',
        'skip_footer_work': 'Freelance work', 'price_line': 'Cost',
        'method_h': 'How I work',
        'method_p': 'I don\'t write code by hand. I set the task, define the rules and sign off on the result. '
                    'AI writes the code, and checker agents that I configure for each project review it.',
        'method': ['The task and the rules are mine: what the result must be, how we know it is done, and what is off limits.',
                   'The main model writes the code. Only a separate checker with its own role can correct it: '
                   'a tester, an editor, or a "client" who is as picky as you are.',
                   'Nothing reaches you until the checker says "done": tests, a pass through every screen, a check against the task.',
                   'My attention goes to the task and the quality, not the syntax. That makes it faster, with fewer rounds of fixes.'],
        'method_proof': '542 pull requests across all my repositories from 23 October to 15 November 2026 (GitHub search, 15 repositories).',
    },
}

RUB = {'80': '7 000', '65': '5 500', '79': '7 000', '60': '5 500', '45': '4 000', '100': '8 500', '180': '15 500'}


def price(d, lang):
    p = d['price_en']
    if lang == 'en':
        return p.replace('Starting at pilot $180 for a pilot', 'Pilot from $180')
    if 'on request' in p.lower():
        return 'По брифу'
    m = re.search(r'\$(\d+)', p)
    if 'pilot' in p:
        return f'Пилот от {RUB[m.group(1)]} ₽'
    return f'От {RUB[m.group(1)]} ₽'


def e(s):
    return html.escape(str(s), quote=True)


def webp_size(path):
    b = path.read_bytes()[:40]
    kind = b[12:16]
    if kind == b'VP8X':
        w = 1 + int.from_bytes(b[24:27], 'little')
        h = 1 + int.from_bytes(b[27:30], 'little')
        return w, h
    if kind == b'VP8 ':
        w, h = struct.unpack('<HH', b[26:30])
        return w & 0x3fff, h & 0x3fff
    if kind == b'VP8L':
        bits = int.from_bytes(b[21:25], 'little')
        return (bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1
    raise ValueError(path)


def shell(lang, title, desc, path, other_path):
    t = (ROOT / L[lang]['shell']).read_text(encoding='utf-8')
    head = t[:t.find('<section class="p-hero')]
    tail = t[t.find('</main>'):]
    full = f'{title} · {L[lang]["author"]}'
    ru_url = SITE + (path if lang == 'ru' else other_path)
    en_url = SITE + (path if lang == 'en' else other_path)
    url = SITE + path
    head = re.sub(r'<title>[^<]*</title>', f'<title>{e(full)}</title>', head)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(desc)}">', head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', head)
    head = re.sub(r'hreflang="ru" href="[^"]*"', f'hreflang="ru" href="{ru_url}"', head)
    head = re.sub(r'hreflang="en" href="[^"]*"', f'hreflang="en" href="{en_url}"', head)
    head = re.sub(r'hreflang="x-default" href="[^"]*"', f'hreflang="x-default" href="{ru_url}"', head)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(full)}">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(desc)}">', head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', head)
    head = re.sub(r'(<a class="tool" href=")[^"]*(" hreflang=)', r'\g<1>' + other_path + r'\g<2>', head)
    head = head.replace('</head>', '<link rel="stylesheet" href="/work/work.css"></head>', 1)
    head = head.replace('data-mode="corner"', 'data-mode="hero"')
    # one menu: the work link of each language points to its own language
    head = head.replace('<li><a href="/work/">Freelance work</a></li>', '<li><a href="/en/work/">Freelance work</a></li>')
    for a in ('href="/work/"', 'href="/en/work/"'):
        head = head.replace(f'<li><a {a}>', f'<li><a {a} aria-current="page">' if False else f'<li><a {a}>')
    tail = re.sub(r' · (Версия|Version) [0-9.]+', '', tail)
    proj = '/projects/' if lang == 'ru' else '/en/projects/'
    pl = 'Проекты' if lang == 'ru' else 'Projects'
    if f'href="{L[lang]["base"]}"' not in tail:
        tail = tail.replace(f'<li><a href="{proj}">{pl}</a></li>',
                            f'<li><a href="{proj}">{pl}</a></li><li><a href="{L[lang]["base"]}">{L[lang]["skip_footer_work"]}</a></li>', 1)
    return head, tail


def thumb(d, lang):
    t = d['thumb']
    if 'src' in t:
        w, h = webp_size(ROOT / t['src'].lstrip('/'))
        return (f'<span class="wk-card__thumb"><img src="{e(t["src"])}" alt="" width="{w}" height="{h}" '
                f'loading="lazy" decoding="async"></span>')
    return f'<span class="wk-card__thumb wk-card__thumb--text" aria-hidden="true"><span>{e(t["text"])}</span></span>'


def cat_label(d, lang):
    return ' · '.join(L[lang]['cats'][c] for c in d['cats'])


def cta(lang, as_section_id=None):
    c = L[lang]
    sid = f' id="{as_section_id}"' if as_section_id else ''
    return (f'<section{sid} class="wrap block" aria-label="{e(c["cta_h"])}"><div class="cta2 cta2--one"><div class="glass">'
            f'<h3>{e(c["cta_h"])}</h3><p>{e(c["cta_p"])}</p>'
            f'<a class="btn" href="{TG}" rel="noopener">{e(c["cta_btn"])}</a></div></div></section>')


def index_page(lang, works):
    c = L[lang]
    counts = {k: sum(1 for d in works if k in d['cats']) for k in CATS}
    chips = [f'<button class="chip on" type="button" data-f="all" aria-pressed="true">{e(c["all"])} <span>{len(works)}</span></button>']
    for k in CATS:
        chips.append(f'<button class="chip" type="button" data-f="{e(k)}" aria-pressed="false">{e(c["cats"][k])} <span>{counts[k]}</span></button>')
    cards = []
    for d in works:
        cards.append(
            f'<li class="card" data-cats="{e("|".join(d["cats"]))}"><a class="wk-card glass" href="{c["base"]}{d["slug"]}/">'
            f'{thumb(d, lang)}<span class="wk-card__body"><span class="catalog__badge">{e(cat_label(d, lang))}</span>'
            f'<h2>{e(d["title"])}</h2><p>{e(d["lead"])}</p><span class="wk-card__price">{e(price(d, lang))}</span></span></a></li>')
    body = (
        f'<section class="wrap page-head" data-hole-anchor aria-labelledby="work-title"><h1 id="work-title">{e(c["index_title"])}</h1>'
        f'<p class="lead">{e(c["index_lead"])}</p><p class="wk-actions"><a class="btn" href="{TG}" rel="noopener">{e(c["cta_btn"])}</a></p></section>'
        f'<section class="wrap block" aria-labelledby="method-title"><div class="cta2 cta2--one"><div class="glass wk-method">'
        f'<h2 id="method-title">{e(c["method_h"])}</h2><p class="wk-method__lead">{e(c["method_p"])}</p>'
        f'<ul class="wk-points">{"".join(f"<li>{e(x)}</li>" for x in c["method"])}</ul>'
        f'<p class="wk-method__proof">{e(c["method_proof"])}</p></div></div></section>'
        f'<section class="wrap block wk-list" aria-label="{e(c["list"])}">'
        f'<div class="chips" role="group" aria-label="{e(c["filter"])}">{"".join(chips)}</div>'
        f'<p class="wk-note">{e(c["filter_note"])}</p>'
        f'<ul class="wk-grid" id="grid">{"".join(cards)}</ul>'
        f'<p class="wk-empty" id="empty" hidden>{e(c["empty"])}</p></section>'
        + cta(lang, 'contact') +
        '<script src="/work/work.js" defer></script>')
    head, tail = shell(lang, c['index_title'], c['index_lead'], c['base'], L['en' if lang == 'ru' else 'ru']['base'])
    return head + body + tail


def shot_html(s, lang, eager=False):
    c = L[lang]
    tall = ' shot--tall' if s.get('tall') else ''
    cap = f'<figcaption>{e(s["caption"])}</figcaption>' if s.get('caption') else ''
    if 'pre' in s:
        return f'<figure class="shot glass wk-pre"><pre><code>{e(s["pre"])}</code></pre>{cap}</figure>'
    load = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<figure class="shot glass{tall}"><a class="shot__zoom" href="{e(s["src"])}" data-zoom data-close="{c["close"]}" '
            f'title="{c["open"]}"><img src="{e(s["src"])}" alt="{e(s.get("alt") or s.get("caption", ""))}" width="{s["w"]}" '
            f'height="{s["h"]}" {load} decoding="async"></a>{cap}</figure>')


NI_DEFAULT = {"ru": "Хостинг, домен и оплата сторонних сервисов.", "en": "Hosting, domain and third-party service fees."}

def detail_page(lang, d, nxt):
    c = L[lang]
    base = c['base']
    other = L['en' if lang == 'ru' else 'ru']['base'] + d['slug'] + '/'
    path = base + d['slug'] + '/'
    p = []
    p.append(
        f'<section class="p-hero wrap p-hero--solo" data-hole-anchor aria-labelledby="p-title"><div class="p-hero__text">'
        f'<nav class="crumbs" aria-label="{c["crumbs"]}"><a href="{base}">{e(c["index_title"])}</a><span aria-hidden="true"> / </span>'
        f'<span aria-current="page">{e(d["title"])}</span></nav><h1 id="p-title">{e(d["title"])}</h1>'
        f'<p class="p-hero__line">{e(d["lead"])}</p><p class="p-hero__badge"><span class="dot" aria-hidden="true"></span>{e(cat_label(d, lang))}</p>'
        f'<div class="actions"><a class="btn" href="{TG}" rel="noopener">{e(c["cta_btn"])}</a>'
        f'<a class="btn ghost" href="{base}">{e(c["all_works"])}</a></div></div></section>')
    shots = list(d['shots'])
    if d.get('hero'):
        p.append(f'<div class="wrap lead-shot">{shot_html(d["hero"], lang, eager=True)}</div>')
        shots = [s for s in shots if s.get('src') != d['hero']['src']]
    p.append(f'<div class="wrap"><div class="statebar glass"><div><small>{c["problem"]}</small>{e(d["problem"])}</div>'
             f'<div><small>{c["price"]}</small><b class="wk-price">{e(price(d, lang))}</b></div></div></div>')
    p.append(f'<section class="wrap block" aria-labelledby="built-title"><h2 id="built-title">{c["built"]}</h2>'
             f'<ul class="wk-points">{"".join(f"<li>{e(x)}</li>" for x in d["built"])}</ul></section>')
    if shots:
        p.append(f'<section class="wrap block" aria-labelledby="shots-title"><h2 id="shots-title">{e(d["shots_title"])}</h2>'
                 f'<div class="gallery">{"".join(shot_html(s, lang) for s in shots)}</div></section>')
    if d.get('steps'):
        p.append(f'<section id="how" class="wrap block" aria-labelledby="how-title"><h2 id="how-title">{c["steps"]}</h2>'
                 f'<ol class="wk-steps glass" aria-label="{c["scheme"]}">{"".join(f"<li>{e(x)}</li>" for x in d["steps"])}</ol>'
                 + (f'<ul class="wk-tags" aria-label="{c["stack"]}">{"".join(f"<li>{e(x)}</li>" for x in d["stack"])}</ul>' if d.get('stack') else '')
                 + '</section>')
    p.append(f'<section class="wrap block" aria-labelledby="offer-title"><h2 id="offer-title">{c["offer"]}</h2><div class="cta2">'
             f'<div class="glass"><ul class="wk-points">{"".join(f"<li>{e(x)}</li>" for x in d["offer"])}</ul>'
             f'<p class="wk-price-line">{c["price_line"]}: <b>{e((lambda s: s[:1].lower() + s[1:] if lang == "ru" else s)(price(d, lang)))}</b></p></div>'
             f'<div class="glass"><h3>{c["not"]}</h3><p>{e(d.get("not_included", "").strip() or NI_DEFAULT[lang])}</p>'
             f'<a class="btn" href="{TG}" rel="noopener">{e(c["cta_btn"])}</a></div></div></section>')
    p.append(f'<nav class="wrap next-project" aria-label="{c["next"]}"><a href="{base}{nxt["slug"]}/"><small>{c["next"]}</small>'
             f'<b>{e(nxt["title"])}</b><span>{e(nxt["lead"])}</span></a></nav>')
    p.append(f'<script type="module" src="{ZOOM_JS}"></script>')
    head, tail = shell(lang, d['title'], d['lead'], path, other)
    return head + ''.join(p) + tail


def patch_site():
    """One menu and footer on every other page; EN pages link to EN work pages. Idempotent."""
    n = 0
    for f in ROOT.rglob('*.html'):
        rel = f.relative_to(ROOT).as_posix()
        if rel.startswith(('work/', 'en/work/', 'tools/', 'docs/', 'demos/', 'media/')):
            continue
        t0 = t = f.read_text(encoding='utf-8')
        lang = 'en' if rel.startswith('en/') else 'ru'
        if lang == 'en':
            t = re.sub(r'href="/work/((?:[a-z0-9-]+/)?(?:#[a-z-]+)?)"', r'href="/en/work/\1"', t)
        t = re.sub(r' · (Версия|Version) [0-9.]+', '', t)
        proj = '/projects/' if lang == 'ru' else '/en/projects/'
        pl = 'Проекты' if lang == 'ru' else 'Projects'
        wl = f'<li><a href="{L[lang]["base"]}">{L[lang]["skip_footer_work"]}</a></li>'
        foot = t.find('<footer')
        if foot > -1 and f'href="{L[lang]["base"]}"' not in t[foot:]:
            t = t[:foot] + t[foot:].replace(f'<li><a href="{proj}">{pl}</a></li>', f'<li><a href="{proj}">{pl}</a></li>' + wl, 1)
        if t != t0:
            f.write_text(t, encoding='utf-8', newline='')
            n += 1
    print('patched', n, 'other pages')


def main():
    patch_site()
    for lang in ('ru', 'en'):
        works = sorted((json.loads(f.read_text(encoding='utf-8')) for f in DATA.glob(f'*.{lang}.json')), key=lambda d: d['order'])
        out = ROOT / L[lang]['base'].strip('/')
        (out / 'index.html').parent.mkdir(parents=True, exist_ok=True)
        (out / 'index.html').write_text(index_page(lang, works), encoding='utf-8', newline='')
        for i, d in enumerate(works):
            f = out / d['slug'] / 'index.html'
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(detail_page(lang, d, works[(i + 1) % len(works)]), encoding='utf-8', newline='')
        print(lang, len(works), 'pages ->', out.relative_to(ROOT))


if __name__ == '__main__':
    main()
