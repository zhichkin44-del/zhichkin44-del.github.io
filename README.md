# Portfolio: alexander zhichkin (GitHub Pages build)

Published at https://zhichkin44-del.github.io/ . This repo holds only the **built static site**.
The source is the `studio-site` project (branch `hire-site`). Files here are copied from its `dist/`
by `tools/sync-site.mjs`. Do not edit the HTML here by hand.

## Current state

- English is the only published language. All pages, the nav (Cases · How I work · Contacts),
  titles, meta tags, `og:locale` (`en_US`) and `html lang="en"` are English.
- Russian content is still in the source (`src/data/copy/ru.json`, `ru` fields in modules),
  but it is **not built and not linked**.
- Old `/en/...` addresses redirect to the same pages without `/en/`.
- Old `/projects/*` and `/work/*` addresses redirect to `/cases/`.

## How to rebuild and publish

In the source project (`studio-site`, branch `hire-site`):

```
npm ci            # once
npm run build     # English only (default SITE_LANGS=en)
```

Then, in this repo:

```
node tools/sync-site.mjs <path to studio-site>
```

The script replaces the built files and keeps `.git`, `docs/`, `tools/` and this README.

## How to bring Russian back

One setting in the source build, the `SITE_LANGS` environment variable:

- `SITE_LANGS=ru,en npm run build`: Russian is the main language (root `/`), English moves to `/en/`.
  This is the site as it was before the switch to English-only (117 HTML files, 39 content pages).
- `SITE_LANGS=en,ru npm run build`: English stays at the root, Russian is at `/ru/`.

After a build with Russian enabled, run `sync-site.mjs` again. The language switch in the header
appears by itself when two languages are published. The config lives in
`src/site.config.ts`, and the `/en/` redirects are switched off automatically in that mode.
