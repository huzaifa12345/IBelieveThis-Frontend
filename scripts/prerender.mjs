/**
 * Build-time prerender (Approach A): full VISIBLE crawlable HTML inside #root.
 * React replaces #root on hydrate; bots without JS keep the full content.
 *
 * Env: PRERENDER_API_ORIGIN, SITE_URL
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SITE_FAQS, faqsForCategory, toFaqPageSchema } from '../src/content/faqs.js';
import { categoryIntro } from '../src/content/categoryIntros.js';
import { GUIDES } from '../src/content/guides.js';
import { SIZE_GUIDE } from '../src/content/sizeGuide.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const SITE = (process.env.SITE_URL || 'https://www.ibelievethis.us').replace(/\/$/, '');
const API_ORIGIN = (process.env.PRERENDER_API_ORIGIN || process.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');
const ETSY = 'https://www.etsy.com/shop/IBelieveThis';

const slugify = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 120) || 'item';

const productSlug = (p) => p.slug || `${slugify(p.name)}-${p.id}`;
const categorySlug = (c) => c.slug || slugify(c.name) || String(c.id);

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const stripText = (s, max = 5000) =>
  String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchAllProducts(apiBase) {
  const products = [];
  let page = 1;
  let pages = 1;
  do {
    const data = await fetchJson(`${apiBase}/api/products?page=${page}&limit=100`);
    products.push(...(data.products || []));
    pages = data.pagination?.pages || 1;
    page += 1;
  } while (page <= pages);
  return products;
}

function injectHead(html, { title, description, path: pagePath, image, jsonLd, type = 'website' }) {
  const url = `${SITE}${pagePath}`;
  const img = image || `${SITE}/og-image.jpg`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${url}" />`);
  out = out.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${url}" />`);
  out = out.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`);
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  out = out.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(img)}" />`);
  out = out.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${type}" />`);
  out = out.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`);
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  out = out.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(img)}" />`);

  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  if (blocks.length) {
    const ld = blocks
      .map(
        (b, i) =>
          `<script type="application/ld+json" id="prerender-jsonld-${i}">${JSON.stringify(b)}</script>`
      )
      .join('\n  ');
    out = out.replace('</head>', `  ${ld}\n  </head>`);
  }
  return out;
}

function writeRoute(relPath, html) {
  const clean = relPath.replace(/^\//, '').replace(/\/$/, '');
  const dir = clean ? path.join(distDir, clean) : distDir;
  fs.mkdirSync(dir, { recursive: true });
  const file = clean ? path.join(dir, 'index.html') : path.join(distDir, 'index.html');
  fs.writeFileSync(file, html, 'utf8');
  console.log('  ✓', clean ? `/${clean}/` : '/');
}

/** Visible crawlable HTML inside #root (not hidden). React replaces on hydrate. */
function withSeoBody(html, inner) {
  const block = `<div class="seo-ssg" id="seo-prerender">
<nav aria-label="Breadcrumb"><a href="${SITE}/">Home</a></nav>
${inner}
</div>`;
  return html.replace('<div id="root"></div>', `<div id="root">${block}</div>`);
}

function faqHtml(faqs) {
  return (faqs || [])
    .map(
      (f) =>
        `<section class="seo-faq"><h2>${escapeHtml(f.q)}</h2><p>${escapeHtml(f.a)}</p></section>`
    )
    .join('\n');
}

function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IBelieveThis',
    url: SITE,
    logo: `${SITE}/IBelieveThis.png`,
    description: 'US motorcycle biker gear — guardian bells, boots, jackets, gloves, hats and patches.',
    sameAs: [ETSY],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE}/contact`,
      areaServed: 'US',
      availableLanguage: 'English',
    },
  };
}

function priceValidUntil() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error('dist/ missing — run vite build first');
    process.exit(1);
  }

  let template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  // Strip legacy hidden SEO stubs (older builds) so crawlable HTML is never cloaked
  template = template
    .replace(/<script>document\.addEventListener\('DOMContentLoaded',function\(\)\{var el=document\.getElementById\('seo-prerender'\);[^<]*<\/script>\s*/gi, '')
    .replace(/<div id="seo-prerender"[^>]*>[\s\S]*?<\/div>\s*/gi, '')
    .replace(/<script type="application\/ld\+json" id="prerender-jsonld"[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  // Ensure a clean empty #root for injection
  if (!/<div id="root"><\/div>/.test(template)) {
    template = template.replace(/<div id="root">[\s\S]*?<\/div>/i, '<div id="root"></div>');
  }
  console.log(`Prerender → ${SITE}`);
  console.log(`API → ${API_ORIGIN || '(none — static pages only)'}`);

  const shells = [
    { path: '/cart', title: `Cart | IBelieveThis`, desc: 'Your IBelieveThis shopping cart.' },
    { path: '/checkout', title: `Checkout | IBelieveThis`, desc: 'Secure checkout at IBelieveThis.' },
    { path: '/login', title: `Login | IBelieveThis`, desc: 'Sign in to IBelieveThis.' },
    { path: '/register', title: `Register | IBelieveThis`, desc: 'Create an IBelieveThis account.' },
    { path: '/admin', title: `Admin | IBelieveThis`, desc: 'Store admin.' },
    { path: '/change-password', title: `Change Password | IBelieveThis`, desc: 'Update your password.' },
  ];
  for (const s of shells) {
    writeRoute(s.path, injectHead(template, { title: s.title, description: s.desc, path: s.path }));
  }

  writeRoute(
    '/about',
    withSeoBody(
      injectHead(template, {
        title: 'About IBelieveThis | Motorcycle Biker Gear',
        description:
          'IBelieveThis is a US biker gear shop for motorcycle guardian bells, boots, jackets, gloves, hats and patches. Also on Etsy.',
        path: '/about',
        jsonLd: orgSchema(),
      }),
      `<h1>About IBelieveThis</h1>
<p>IBelieveThis is a motorcycle lifestyle shop for US riders — guardian bells, boots, jackets, gloves, hats and patches. We also sell on <a href="${ETSY}">Etsy</a>. Ships from the USA. Support details are on our <a href="${SITE}/contact">Contact</a> page.</p>
<p><a href="${SITE}/faq">FAQ</a> · <a href="${SITE}/guides">Guides</a> · <a href="${SITE}/shipping-policy">Shipping Policy</a> · <a href="${SITE}/return-policy">Returns</a></p>`
    )
  );

  writeRoute(
    '/contact',
    withSeoBody(
      injectHead(template, {
        title: 'Contact | IBelieveThis',
        description: 'Contact IBelieveThis for motorcycle gear orders, sizing help, and support.',
        path: '/contact',
      }),
      `<h1>Contact IBelieveThis</h1>
<p>Questions about sizing, shipping, returns, or an order? Use the contact form on this page or email the support address shown in store settings. We serve customers in the United States. Typical reply time is listed on the live Contact page.</p>
<p><a href="${SITE}/shipping-policy">Shipping Policy</a> · <a href="${SITE}/return-policy">Return Policy</a> · <a href="${SITE}/faq">FAQ</a> · <a href="${ETSY}">Etsy shop</a></p>`
    )
  );

  for (const [p, title, desc, h1, body] of [
    [
      '/return-policy',
      'Return & Exchange Policy | IBelieveThis',
      'Return and exchange rules for IBelieveThis motorcycle gear orders.',
      'Return & Exchange Policy',
      'Eligible returns and exchanges follow the rules on this page. Start a request via <a href="' +
        SITE +
        '/contact">Contact</a>.',
    ],
    [
      '/privacy-policy',
      'Privacy Policy | IBelieveThis',
      'How IBelieveThis handles customer data, cookies, and Stripe payments.',
      'Privacy Policy',
      'We do not sell personal data. Payments are processed by Stripe. Contact us for privacy requests.',
    ],
    [
      '/terms-of-service',
      'Terms of Service | IBelieveThis',
      'Terms of Service for shopping at IBelieveThis.',
      'Terms of Service',
      'By using this site you agree to these terms. Questions? <a href="' + SITE + '/contact">Contact</a>.',
    ],
    [
      '/shipping-policy',
      'Shipping Policy | IBelieveThis',
      'Shipping, processing times, carriers and tracking for IBelieveThis.',
      'Shipping Policy',
      'Orders ship from the USA. Processing windows, carriers, and tracking are described on this page. Rates appear at checkout.',
    ],
  ]) {
    writeRoute(
      p,
      withSeoBody(
        injectHead(template, { title, description: desc, path: p }),
        `<h1>${h1}</h1><p>${body}</p>`
      )
    );
  }

  // FAQ
  writeRoute(
    '/faq',
    withSeoBody(
      injectHead(template, {
        title: 'FAQ | IBelieveThis Motorcycle Gear',
        description:
          'Answers about guardian bells, sizing, shipping, returns, care, and contacting IBelieveThis.',
        path: '/faq',
        jsonLd: [orgSchema(), toFaqPageSchema(SITE_FAQS)],
      }),
      `<h1>Frequently Asked Questions</h1>
<p>Short answers for US riders shopping guardian bells, boots, jackets, gloves, and more. Shipping and return amounts are not listed here — see the linked policy pages.</p>
${faqHtml(SITE_FAQS)}
<p><a href="${SITE}/shipping-policy">Shipping Policy</a> · <a href="${SITE}/return-policy">Returns</a> · <a href="${SITE}/contact">Contact</a> · <a href="${SITE}/size-guide">Size Guide</a></p>`
    )
  );

  // Size guide
  writeRoute(
    '/size-guide',
    withSeoBody(
      injectHead(template, {
        title: 'Size Guide | Boots, Jackets, Gloves & Hats | IBelieveThis',
        description: SIZE_GUIDE.description,
        path: '/size-guide',
      }),
      `<h1>${escapeHtml(SIZE_GUIDE.title)}</h1>
<p>${escapeHtml(SIZE_GUIDE.description)}</p>
${SIZE_GUIDE.sections
  .map((s) => `<h2>${escapeHtml(s.h2)}</h2><p>${escapeHtml(s.body)}</p>`)
  .join('\n')}
<p><a href="${SITE}/faq">FAQ</a> · <a href="${SITE}/contact">Contact</a></p>`
    )
  );

  // Guides index + articles
  writeRoute(
    '/guides',
    withSeoBody(
      injectHead(template, {
        title: 'Motorcycle Gear Guides | IBelieveThis',
        description: 'Guides on guardian bells, hanging tips, and choosing biker boots from IBelieveThis.',
        path: '/guides',
      }),
      `<h1>Motorcycle Gear Guides</h1>
<p>Practical articles for US riders — guardian bell tradition, hanging tips, and boot fit basics.</p>
<ul>
${GUIDES.map((g) => `<li><a href="${SITE}/guides/${g.slug}">${escapeHtml(g.title)}</a> — ${escapeHtml(g.description)}</li>`).join('\n')}
</ul>`
    )
  );

  for (const g of GUIDES) {
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      datePublished: g.datePublished,
      dateModified: g.dateModified,
      author: { '@type': 'Organization', name: 'IBelieveThis' },
      publisher: {
        '@type': 'Organization',
        name: 'IBelieveThis',
        logo: { '@type': 'ImageObject', url: `${SITE}/IBelieveThis.png` },
      },
      mainEntityOfPage: `${SITE}/guides/${g.slug}`,
    };
    writeRoute(
      `/guides/${g.slug}`,
      withSeoBody(
        injectHead(template, {
          title: `${g.title} | IBelieveThis`,
          description: g.description,
          path: `/guides/${g.slug}`,
          type: 'article',
          jsonLd: [articleLd, orgSchema()],
        }),
        `<article>
<h1>${escapeHtml(g.title)}</h1>
<p>${escapeHtml(g.description)}</p>
<p>By IBelieveThis · Updated ${escapeHtml(g.dateModified)}</p>
${g.sections.map((s) => `<h2>${escapeHtml(s.h2)}</h2><p>${escapeHtml(s.body)}</p>`).join('\n')}
<ul>${g.relatedLinks.map((l) => `<li><a href="${SITE}${l.href}">${escapeHtml(l.label)}</a></li>`).join('')}</ul>
</article>`
      )
    );
  }

  writeRoute(
    '/all-products',
    withSeoBody(
      injectHead(template, {
        title: 'Shop All Products | IBelieveThis',
        description:
          'Browse motorcycle guardian bells, biker boots, jackets, riding gloves, cowboy hats and patches.',
        path: '/all-products',
      }),
      `<h1>Shop All Products</h1>
<p>Full IBelieveThis catalog — motorcycle guardian bells, biker boots, jackets, gloves, hats and patches. Ships from the USA.</p>`
    )
  );

  const notFound = injectHead(template, {
    title: 'Page Not Found | IBelieveThis',
    description: 'This page does not exist on IBelieveThis.',
    path: '/404',
  }).replace(
    /<meta name="robots" content="[^"]*"\s*\/?>/i,
    '<meta name="robots" content="noindex, nofollow" />'
  );
  const notFoundBody = withSeoBody(
    notFound,
    `<h1>404 — Page not found</h1><p><a href="${SITE}/">Return home</a></p>`
  );
  writeRoute('/404', notFoundBody);
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundBody, 'utf8');

  // Home (enriched after API if available)
  let products = [];
  let categories = [];
  if (API_ORIGIN) {
    try {
      [products, categories] = await Promise.all([
        fetchAllProducts(API_ORIGIN),
        fetchJson(`${API_ORIGIN}/api/categories`),
      ]);
      if (!Array.isArray(categories)) categories = categories?.categories || [];
      console.log(`Products: ${products.length}, Categories: ${categories.length}`);
    } catch (e) {
      console.warn('API fetch failed for catalog prerender:', e.message);
    }
  }

  const homeCatHtml = (categories || [])
    .map((cat) => {
      const slug = categorySlug(cat);
      const catProducts = products.filter((p) => p.category_id === cat.id).slice(0, 8);
      const links = catProducts
        .map(
          (p) =>
            `<li><a href="${SITE}/product/${productSlug(p)}">${escapeHtml(p.name)}</a></li>`
        )
        .join('');
      return `<section>
<h2><a href="${SITE}/category/${slug}">${escapeHtml(cat.name)}</a></h2>
<p>${escapeHtml(stripText(categoryIntro(cat), 280))}</p>
${links ? `<ul>${links}</ul>` : `<p><a href="${SITE}/category/${slug}">Shop ${escapeHtml(cat.name)}</a></p>`}
</section>`;
    })
    .join('\n');

  const featured = products.slice(0, 12);
  const featuredHtml = featured.length
    ? `<section><h2>Featured products</h2><ul>${featured
        .map(
          (p) =>
            `<li><a href="${SITE}/product/${productSlug(p)}">${escapeHtml(p.name)}</a> — $${escapeHtml(
              String(p.discount_price || p.price)
            )}</li>`
        )
        .join('')}</ul></section>`
    : '';

  writeRoute(
    '/',
    withSeoBody(
      injectHead(template, {
        title: 'Biker Gear & Motorcycle Guardian Bells | IBelieveThis',
        description:
          'Shop US biker gear — motorcycle guardian bells, biker boots, leather jackets, riding gloves, cowboy hats and patches. Ships from the USA.',
        path: '/',
        jsonLd: [
          orgSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'IBelieveThis',
            url: SITE,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE}/all-products?search={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }),
      `<h1>Biker Gear &amp; Motorcycle Guardian Bells | IBelieveThis</h1>
<p>IBelieveThis is a US motorcycle lifestyle shop for guardian bells, biker boots, jackets, riding gloves, cowboy hats and patches. Ships from the USA. Secure checkout by Stripe. Also on <a href="${ETSY}">Etsy</a>.</p>
<p><a href="${SITE}/all-products">Shop all products</a> · <a href="${SITE}/faq">FAQ</a> · <a href="${SITE}/guides">Guides</a> · <a href="${SITE}/size-guide">Size Guide</a> · <a href="${SITE}/contact">Contact</a></p>
${homeCatHtml || '<section><h2>Shop</h2><p><a href="' + SITE + '/all-products">Browse the full catalog</a></p></section>'}
${featuredHtml}`
    )
  );

  // Always write llms.txt (enrich with categories when known)
  {
    const catLines = (categories || [])
      .map((c) => `- ${c.name}: ${SITE}/category/${categorySlug(c)}`)
      .join('\n');
    const llms = `# IBelieveThis

> US motorcycle & biker gear shop — guardian bells, boots, jackets, gloves, hats, and patches. Ships from the USA. Secure checkout by Stripe.

Site: ${SITE}
Etsy: ${ETSY}

## Brand summary

IBelieveThis is an online motorcycle lifestyle store for riders in the United States. We sell motorcycle guardian bells, biker boots, jackets, riding gloves, cowboy hats, and patches. Product pages include descriptions, photos, pricing, availability, and sizes when applicable. Shipping, returns, and support details are published on dedicated policy pages (amounts and rates are calculated at checkout and are not listed here).

## Shop categories

- All products: ${SITE}/all-products
${catLines || `- Browse categories from the home page: ${SITE}/`}

## Key pages

- Home: ${SITE}/
- About: ${SITE}/about
- Contact: ${SITE}/contact
- FAQ: ${SITE}/faq
- Size Guide: ${SITE}/size-guide
- Guides: ${SITE}/guides
- Shipping Policy: ${SITE}/shipping-policy
- Return & Exchange Policy: ${SITE}/return-policy
- Privacy Policy: ${SITE}/privacy-policy
- Terms of Service: ${SITE}/terms-of-service

## Guides

- What Is a Motorcycle Guardian Bell?: ${SITE}/guides/what-is-a-motorcycle-guardian-bell
- How to Hang a Guardian Bell: ${SITE}/guides/how-to-hang-a-guardian-bell
- How to Choose Biker Boots: ${SITE}/guides/how-to-choose-biker-boots

## Optional

- Sitemap: ${SITE}/sitemap.xml
`;
    fs.writeFileSync(path.join(distDir, 'llms.txt'), llms, 'utf8');
    console.log('  ✓ /llms.txt');
  }

  if (!API_ORIGIN || !products.length) {
    console.warn('Skipping product/category deep prerender — set PRERENDER_API_ORIGIN');
    console.log('Prerender complete (static + home shell).');
    return;
  }

  for (const cat of categories) {
    const slug = categorySlug(cat);
    const pathName = `/category/${slug}`;
    const intro = categoryIntro(cat);
    const catProducts = products.filter((p) => p.category_id === cat.id);
    const faqs = faqsForCategory(cat);
    const productLinks = catProducts
      .map(
        (p) =>
          `<li><a href="${SITE}/product/${productSlug(p)}">${escapeHtml(p.name)}</a>${
            p.discount_price || p.price
              ? ` — $${escapeHtml(String(p.discount_price || p.price))}`
              : ''
          }</li>`
      )
      .join('');

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/all-products` },
        { '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE}${pathName}` },
      ],
    };

    writeRoute(
      pathName,
      withSeoBody(
        injectHead(template, {
          title: `${cat.name} | IBelieveThis`,
          description: stripText(intro, 160),
          path: pathName,
          image: cat.image_url || `${SITE}/og-image.jpg`,
          jsonLd: [breadcrumb, toFaqPageSchema(faqs), orgSchema()],
        }),
        `<h1>${escapeHtml(cat.name)}</h1>
<p>${escapeHtml(intro)}</p>
<nav><a href="${SITE}/">Home</a> › <a href="${SITE}/all-products">Shop</a> › ${escapeHtml(cat.name)}</nav>
<h2>Products in ${escapeHtml(cat.name)}</h2>
<ul>${productLinks || '<li>No products listed yet.</li>'}</ul>
<h2>FAQ about ${escapeHtml(cat.name)}</h2>
${faqHtml(faqs)}
<p><a href="${SITE}/size-guide">Size Guide</a> · <a href="${SITE}/shipping-policy">Shipping</a> · <a href="${SITE}/contact">Contact</a></p>`
      )
    );
  }

  for (const p of products) {
    const slug = productSlug(p);
    const pathName = `/product/${slug}`;
    const price = String(p.discount_price || p.price);
    const images = [
      ...(Array.isArray(p.images) ? p.images.filter(Boolean) : []),
      p.image_url,
    ].filter(Boolean);
    const uniqueImgs = [...new Set(images)];
    const img = uniqueImgs[0] || `${SITE}/og-image.jpg`;
    const fullDesc = stripText(p.description || `${p.name} from IBelieveThis.`, 8000);
    const metaDesc = fullDesc.slice(0, 160);
    const inStock = Number(p.stock_quantity) > 0;
    const catName = p.category_relation?.name || p.category || 'Motorcycle Gear';
    const catSlug = p.category_relation
      ? categorySlug(p.category_relation)
      : p.category
        ? slugify(p.category)
        : null;
    const sizes = Array.isArray(p.sizes) ? p.sizes : [];
    const sizeLabels = sizes
      .map((s) => (typeof s === 'string' ? s : s?.size))
      .filter(Boolean);

    const imgHtml = uniqueImgs
      .map(
        (src, i) =>
          `<img src="${escapeHtml(src)}" alt="${escapeHtml(p.name)}${
            i ? ` — photo ${i + 1}` : ' product photo'
          }" width="800" height="800" loading="lazy" />`
      )
      .join('\n');

    const sizesHtml = sizeLabels.length
      ? `<h2>Available sizes</h2><ul>${sizeLabels
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join('')}</ul><p><a href="${SITE}/size-guide">Size Guide</a></p>`
      : '';

    const productLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: p.name,
      image: uniqueImgs.length ? uniqueImgs : [img],
      description: fullDesc.slice(0, 5000),
      sku: p.sku || `SKU-${p.id}`,
      brand: { '@type': 'Brand', name: 'IBelieveThis' },
      category: catName,
      offers: {
        '@type': 'Offer',
        url: `${SITE}${pathName}`,
        priceCurrency: 'USD',
        price,
        priceValidUntil: priceValidUntil(),
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'IBelieveThis' },
      },
    };

    if (p.averageRating && p.reviewCount > 0) {
      productLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(p.averageRating),
        reviewCount: String(p.reviewCount),
        bestRating: '5',
        worstRating: '1',
      };
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: catName,
          item: catSlug ? `${SITE}/category/${catSlug}` : `${SITE}/all-products`,
        },
        { '@type': 'ListItem', position: 3, name: p.name, item: `${SITE}${pathName}` },
      ],
    };

    writeRoute(
      pathName,
      withSeoBody(
        injectHead(template, {
          title: `${p.name} | IBelieveThis`,
          description: metaDesc,
          path: pathName,
          image: img,
          type: 'product',
          jsonLd: [productLd, breadcrumb, orgSchema()],
        }),
        `<article>
<nav><a href="${SITE}/">Home</a> › ${
          catSlug
            ? `<a href="${SITE}/category/${catSlug}">${escapeHtml(catName)}</a>`
            : escapeHtml(catName)
        } › ${escapeHtml(p.name)}</nav>
<h1>${escapeHtml(p.name)}</h1>
<p class="price"><strong>$${escapeHtml(price)} USD</strong> · ${
          inStock ? 'In stock' : 'Out of stock'
        }</p>
${p.sku ? `<p>SKU: ${escapeHtml(p.sku)}</p>` : ''}
<div class="description"><p>${escapeHtml(fullDesc).replace(/\n/g, '</p><p>')}</p></div>
${sizesHtml}
<figure>${imgHtml}</figure>
<p><a href="${SITE}/shipping-policy">Shipping &amp; Returns info</a> · <a href="${SITE}/contact">Contact</a> · <a href="${SITE}/faq">FAQ</a></p>
</article>`
      )
    );
  }

  console.log('Prerender complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
