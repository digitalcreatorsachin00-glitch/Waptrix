// Builds the Waptrix WhatsApp product site (whatsapp.waptrix.co.in) into public/.
//
// Each page lives in src/pages/NAME.html and starts with a settings comment:
//   <!-- {"title": "...", "description": "...", "nav": "pricing"} -->
// followed by the page's <section>s. This script wraps every page in the shared
// header, footer and scripts below, copies styles/logo/script, and writes
// sitemap.xml and robots.txt. Cloudflare runs it on every deploy (wrangler.toml).
//
// Edit src/, never public/ — it is regenerated.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://whatsapp.waptrix.co.in';
const MAIN_SITE = 'https://waptrix.co.in';
const SIGNUP = 'https://automate.waptrix.co.in/signup';
const LOGIN = 'https://automate.waptrix.co.in/login';
const DEMO_WA = 'https://wa.me/919820644273?text=' +
  encodeURIComponent("Hi Waptrix, I'd like a demo of the WhatsApp automation dashboard");

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'public');

const NAV = [
  ['features', '/features', 'Features'],
  ['industries', '/industries', 'Industries'],
  ['integrations', '/integrations', 'Integrations'],
  ['pricing', '/pricing', 'Pricing'],
];

function attr(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function layout({ title, description, url, nav, body }) {
  const navLinks = NAV.map(([id, href, label]) =>
    `<a href="${href}"${id === nav ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  const mobileLinks = NAV.map(([, href, label]) => `<a href="${href}">${label}</a>`).join('\n    ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Waptrix WhatsApp Automation">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/logo.png">
<link rel="icon" type="image/png" href="/logo.png">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Waptrix WhatsApp Automation",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "${SITE_URL}/",
  "publisher": {"@type": "Organization", "name": "Waptrix", "url": "${MAIN_SITE}/"}
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Source+Sans+3:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<header class="site">
  <div class="nav">
    <a class="brand" href="/" aria-label="Waptrix WhatsApp Automation home">
      <img class="brand-logo" src="/logo.png" alt="">
      <span class="brand-word">Waptrix</span>
      <span class="brand-sub">WhatsApp</span>
    </a>
    <nav class="links">
      ${navLinks}
    </nav>
    <div class="nav-right">
      <a class="nav-login" href="${LOGIN}" target="_blank" rel="noopener">Log in</a>
      <a class="btn btn-ghost" href="/demo">Book demo</a>
      <a class="btn btn-primary" href="${SIGNUP}" target="_blank" rel="noopener"><span class="t-long">Start free trial</span><span class="t-short">Free trial</span></a>
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark mode">◐</button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    ${mobileLinks}
    <a href="/demo">Book demo</a>
    <a href="${LOGIN}" target="_blank" rel="noopener">Log in</a>
  </div>
</header>

<main>
${body}
</main>

<footer>
  <div class="footer-main">
    <div class="wrap footer-grid">
      <div class="footer-col footer-brand">
        <a class="brand" href="/" aria-label="Waptrix WhatsApp Automation home">
          <img class="brand-logo" src="/logo.png" alt="">
          <span class="brand-word">Waptrix</span>
        </a>
        <p>WhatsApp marketing and automation on the official WhatsApp Business API — by Waptrix, Udaipur.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <a href="/features">Features</a>
        <a href="/industries">Industries</a>
        <a href="/integrations">Integrations</a>
        <a href="/pricing">Pricing</a>
        <a href="/demo">Book a demo</a>
      </div>
      <div class="footer-col">
        <h4>Account</h4>
        <a href="${SIGNUP}" target="_blank" rel="noopener">Start free trial</a>
        <a href="${LOGIN}" target="_blank" rel="noopener">Log in</a>
      </div>
      <div class="footer-col">
        <h4>Waptrix</h4>
        <a href="${MAIN_SITE}/">Agency website</a>
        <a href="${MAIN_SITE}/whatsapp-api">WhatsApp API setup service</a>
        <a href="mailto:info@waptrix.co.in">info@waptrix.co.in</a>
        <a href="tel:+919820644273">+91 98206 44273</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="wrap foot-row">
      <span class="tagline mono">© 2026 WAPTRIX — WHATSAPP AUTOMATION · UDAIPUR</span>
      <div class="foot-links">
        <a href="${MAIN_SITE}/contact">Contact</a>
      </div>
    </div>
  </div>
</footer>

<a class="wa-float" href="${DEMO_WA}" target="_blank" rel="noopener" aria-label="Chat with Waptrix on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z"/></svg></a>
<script src="/script.js"></script>
</body>
</html>
`;
}

// Placeholders pages can use for shared links.
function fill(html) {
  return html
    .split('{{SIGNUP}}').join(SIGNUP)
    .split('{{LOGIN}}').join(LOGIN)
    .split('{{DEMO_WA}}').join(DEMO_WA)
    .split('{{MAIN_SITE}}').join(MAIN_SITE);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const f of ['styles.css', 'script.js', 'logo.png']) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));

const urls = [];
for (const file of fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html')).sort()) {
  const raw = fs.readFileSync(path.join(SRC, 'pages', file), 'utf8');
  const m = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  if (!m) throw new Error(`${file} must start with a <!-- {"title": ..., "description": ...} --> comment`);
  const meta = JSON.parse(m[1]);
  const name = file.replace(/\.html$/, '');
  const url = name === 'index' ? `${SITE_URL}/` : `${SITE_URL}/${name}`;
  const html = layout({ title: meta.title, description: meta.description, url, nav: meta.nav, body: fill(raw.slice(m[0].length)) });
  fs.writeFileSync(path.join(OUT, file), html);
  urls.push(url);
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${urls.length} pages into public/`);
