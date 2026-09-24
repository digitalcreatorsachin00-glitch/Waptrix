# Waptrix website

Live at https://waptrix.co.in (Cloudflare Worker `waptrix`).

## Editing the site

All content lives in one file: **`src/site.html`**. Each page is a
`<div class="page" id="page-NAME">` section inside it.

On every push to `main`, Cloudflare runs `node build.js`, which turns that file
into one real page per section in `public/` — `/`, `/about`, `/services`,
`/seo`, and so on — each with its own title, description and heading so Google
can list them separately. It also creates `logo.png`, `sitemap.xml` and
`robots.txt`.

Never edit `public/`; it is regenerated on every deploy and not committed.

## Adding a page

1. Add a `<div class="page" id="page-NEWNAME" hidden>` section to `src/site.html`.
2. Add `NEWNAME` to `PAGES` and a title to `TITLES` in the script at the bottom.
3. Link to it with `href="#NEWNAME" data-page="NEWNAME"` — the build turns that into `/NEWNAME`.

## Preview locally

```
node build.js
npx wrangler dev
```
