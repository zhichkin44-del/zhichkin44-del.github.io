"""One-off: turn the hand-built English /work/ pages into data/<slug>.en.json."""
import html, json, pathlib, re, sys

root = pathlib.Path(sys.argv[1])
out = root / 'tools/work/data'

def txt(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def lis(s):
    return [txt(x) for x in re.findall(r'<li>(.*?)</li>', s, re.S)]

def section(t, head):
    m = re.search(r'<h2[^>]*>' + re.escape(head) + r'</h2>(.*?)</section>', t, re.S)
    return m.group(1) if m else ''

def figs(s):
    res = []
    for m in re.finditer(r'<figure class="shot([^"]*)">(.*?)</figure>', s, re.S):
        cls, body = m.group(1), m.group(2)
        cap = re.search(r'<figcaption>(.*?)</figcaption>', body, re.S)
        f = {'tall': 'tall' in cls, 'caption': txt(cap.group(1)) if cap else ''}
        img = re.search(r'<img src="([^"]+)" width="(\d+)" height="(\d+)" alt="([^"]*)"', body)
        if img:
            f.update(src=img.group(1), w=int(img.group(2)), h=int(img.group(3)), alt=html.unescape(img.group(4)))
        pre = re.search(r'<pre[^>]*>(.*?)</pre>', body, re.S)
        if pre:
            f['pre'] = html.unescape(pre.group(1))
        res.append(f)
    return res

idx = (root / 'work/index.html').read_text(encoding='utf-8')
cards = {}
for m in re.finditer(r'<article class="card" data-cats="([^"]+)">\s*<a href="/work/([^/]+)/" class="cl"><div class="thumb"([^>]*)>(.*?)</div>', idx, re.S):
    cats, slug, attrs, inner = m.groups()
    th = re.search(r'<img src="([^"]+)"[^>]*alt="([^"]*)"', inner)
    cards[slug] = {'cats': html.unescape(cats).split('|'), 'order': len(cards),
                   'thumb': {'src': th.group(1), 'alt': html.unescape(th.group(2))} if th else {'text': txt(inner)}}

for p in sorted((root / 'work').glob('*/index.html')):
    slug = p.parent.name
    t = p.read_text(encoding='utf-8')
    d = {'slug': slug, **cards[slug]}
    d['title'] = txt(re.search(r'<h1>(.*?)</h1>', t, re.S).group(1))
    d['lead'] = txt(re.search(r'<p class="lead">(.*?)</p>', t, re.S).group(1))
    d['category'] = txt(re.search(r'<p class="crumb">.*?</a>\s*/\s*(.*?)</p>', t, re.S).group(1))
    hero = re.search(r'<section class="scr hero2">(.*?)</section>', t, re.S).group(1)
    hf = figs(hero)
    d['hero'] = hf[0] if hf else None
    d['problem'] = txt(re.search(r'<h2>Problem</h2>\s*<p>(.*?)</p>', t, re.S).group(1))
    d['built'] = lis(section(t, 'What I built'))
    sh = re.search(r'<h2 class="narrow-h">(.*?)</h2>(.*?)</section>', t, re.S)
    d['shots_title'] = sh.group(1)
    d['shots'] = figs(sh.group(2))
    hw = section(t, 'How it works')
    d['steps'] = [txt(x) for x in re.findall(r'<li><span>\d+</span><p>(.*?)</p></li>', hw, re.S)]
    st = re.search(r'<ul class="tags big stackrow">(.*?)</ul>', hw, re.S)
    d['stack'] = lis(st.group(1)) if st else []
    yg = section(t, 'What you get')
    d['offer'] = lis(yg.split('</ul>')[0])
    ni = re.search(r'<p class="muted">Not included: (.*?)</p>', yg, re.S)
    d['not_included'] = txt(ni.group(1)) if ni else ''
    pr = re.search(r'<p class="bigprice">(.*?)</p>', yg, re.S)
    d['price_en'] = txt(pr.group(1)) if pr else ''
    (out / f'{slug}.en.json').write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')
    print(slug, len(d['built']), len(d['shots']), len(d['steps']), d['price_en'], 'hero' if d['hero'] else '-')
