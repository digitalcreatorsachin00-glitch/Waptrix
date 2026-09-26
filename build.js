// Builds the public website from src/site.html.
//
// src/site.html holds every page as a <div class="page" id="page-NAME"> section.
// This script writes one real HTML file per section into public/ (index.html,
// about.html, seo.html, ...) so each page has its own URL, title, description
// and <h1> that Google can index. It also writes logo.png, sitemap.xml and
// robots.txt. Cloudflare runs it on every deploy (see wrangler.toml).
//
// Edit src/site.html, never the files in public/ — they are overwritten.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://waptrix.co.in';
const SRC = path.join(__dirname, 'src', 'site.html');
const OUT = path.join(__dirname, 'public');

const html = fs.readFileSync(SRC, 'utf8');

function between(str, start, end) {
  const i = str.indexOf(start);
  const j = str.indexOf(end, i + start.length);
  if (i === -1 || j === -1) throw new Error(`Could not find ${start} ... ${end} in src/site.html`);
  return [str.slice(0, i), str.slice(i + start.length, j), str.slice(j + end.length)];
}

function plainText(fragment) {
  return fragment
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—–-]+$/, '') + '…';
}

function attr(text) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ---- Split the source into shared chrome and per-page sections ----
const [beforeMain, mainInner, afterMain] = between(html, '<main>', '</main>');
const sections = [];
const sectionRe = /\n  <div class="page" id="page-([a-z0-9-]+)"( hidden)?>/g;
let m;
const starts = [];
while ((m = sectionRe.exec(mainInner))) starts.push({ id: m[1], at: m.index, bodyAt: m.index + m[0].length });
starts.forEach((s, k) => {
  const end = k + 1 < starts.length ? starts[k + 1].at : mainInner.length;
  sections.push({ id: s.id, body: mainInner.slice(s.bodyAt, end) });
});
if (sections.length === 0) throw new Error('No <div class="page"> sections found in src/site.html');

// Page titles come from the TITLES map in the site's own script.
const titles = {};
const titlesBlock = html.match(/var TITLES = \{([\s\S]*?)\};/);
if (!titlesBlock) throw new Error('Could not find TITLES in src/site.html');
for (const t of titlesBlock[1].matchAll(/'?([a-z0-9-]+)'?\s*:\s*'([^']*)'/g)) titles[t[1]] = t[2];

// ---- Move the embedded logo image into its own file ----
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let shared = beforeMain + '<main>\n%%PAGE%%\n</main>' + afterMain;
const logo = shared.match(/src="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
const useLogoFile = (str) => (logo ? str.split(`data:image/png;base64,${logo[1]}`).join('/logo.png') : str);
if (logo) fs.writeFileSync(path.join(OUT, 'logo.png'), Buffer.from(logo[1], 'base64'));
shared = useLogoFile(shared);

// ---- Hash links (#about) become real URLs (/about) ----
const ids = new Set(sections.map((s) => s.id));
function rewriteLinks(str) {
  return str.replace(/href="#([a-z0-9-]+)"/g, (all, id) =>
    ids.has(id) ? `href="${id === 'home' ? '/' : '/' + id}"` : all);
}
shared = rewriteLinks(shared);

// ---- Write one file per page ----
const urls = [];
const pageInfo = []; // for llms.txt
for (const { id, body } of sections) {
  const url = id === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${id}`;
  const title = titles[id] || 'Waptrix Studio';
  const firstPara = body.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const description = shorten(plainText(firstPara ? firstPara[1] : title), 160);

  let content = useLogoFile(rewriteLinks(body));
  // Every page gets exactly one <h1>: promote the first <h2> when the page has none.
  if (!/<h1[\s>]/.test(content)) {
    content = content.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/, '<h1$1>$2</h1>');
  }

  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${attr(description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Waptrix Studio">`,
    `<meta property="og:title" content="${attr(title)}">`,
    `<meta property="og:description" content="${attr(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${SITE_URL}/logo.png">`,
    `<link rel="icon" type="image/png" href="/logo.png">`,
  ].join('\n');

  const page = shared
    .replace(/<meta name="description" content="[^"]*">\n?/, '')
    .replace(/<title>[^<]*<\/title>/, head)
    .replace('<body>', `<body data-page="${id}">`)
    .replace('%%PAGE%%', `  <div class="page" id="page-${id}">${content}`);

  checkSchema(id, page);
  fs.writeFileSync(path.join(OUT, id === 'home' ? 'index.html' : `${id}.html`), page);
  urls.push(url);
  pageInfo.push({ id, url, title, description });
}

// ---- Schema check: every JSON-LD block must be valid JSON with @context and @type ----
function checkSchema(file, html) {
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try { data = JSON.parse(m[1]); } catch (e) { throw new Error(`Invalid JSON-LD in ${file}: ${e.message}`); }
    if (data['@context'] !== 'https://schema.org' || !data['@type']) throw new Error(`JSON-LD in ${file} needs "@context": "https://schema.org" and an "@type"`);
  }
}

// ---- sitemap.xml and robots.txt ----
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  '\n</urlset>\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// ---- llms.txt: a plain-language guide to the site for AI assistants (llmstxt.org) ----
const MAIN_PAGES = ['home', 'about', 'services', 'digital-marketing-agency-udaipur', 'industries', 'portfolio', 'contact'];
const link = (p) => `- [${p.title.replace(/ — Waptrix.*$/, '')}](${p.url}): ${p.description}`;
fs.writeFileSync(path.join(OUT, 'llms.txt'), [
  '# Waptrix',
  '',
  '> Waptrix is a digital marketing agency based in Udaipur, Rajasthan, India. It runs Meta (Facebook and Instagram) ads, WhatsApp Business API setup and automation, and social media marketing, plus SEO, AEO, GEO, performance marketing and website development, as one in-house team for businesses across India.',
  '',
  '- Location: Sector 14, Udaipur, Rajasthan, India (serves clients remotely across India)',
  '- Hours: Monday to Saturday, 10 AM to 7 PM IST',
  '- Phone / WhatsApp: +91 98206 44273',
  '- Email: info@waptrix.co.in',
  '- WhatsApp automation platform sign-up: https://automate.waptrix.co.in/signup',
  '',
  '## Main pages',
  ...pageInfo.filter((p) => MAIN_PAGES.includes(p.id)).map(link),
  '',
  '## Services',
  ...pageInfo.filter((p) => !MAIN_PAGES.includes(p.id)).map(link),
  '',
  '## Optional',
  '- [Instagram](https://www.instagram.com/waptrix_io/): @waptrix_io',
  '- [LinkedIn](https://www.linkedin.com/company/waptrix-io/home/): Waptrix company page',
  '',
].join('\n'));

console.log(`Built ${sections.length} pages into public/`);
