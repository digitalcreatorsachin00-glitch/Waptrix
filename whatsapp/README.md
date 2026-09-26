# Waptrix WhatsApp product site

Planned address: https://whatsapp.waptrix.co.in (Cloudflare Worker `waptrix-whatsapp`).

- Pages: `src/pages/*.html` — each starts with a `<!-- {"title", "description", "nav"} -->` comment.
- Shared header, footer and links: `build.js`. Sign-up / login / demo links are defined at the top.
- Styles: `src/styles.css` (base copied from the main site's `src/site.html`, product styles at the bottom).
- `node build.js` writes the site to `public/` (not committed). Preview with `npx wrangler dev`.

## Going live (one-time, in Cloudflare)
Workers & Pages → Create → Import a repository → this repo, with **root directory `whatsapp`**,
then Settings → Domains & Routes → add custom domain `whatsapp.waptrix.co.in`.
