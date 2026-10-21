/**
 * Build-time prerender for Approach A (Vite SPA).
 * Fetches catalog from the API and writes HTML shells with unique
 * title / meta / canonical / JSON-LD + visible SEO content outside hydration risk.
 *
 * Env:
 *   PRERENDER_API_ORIGIN  e.g. https://ibelievethis-backend.onrender.com
 *   SITE_URL              default https://www.ibelievethis.us
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const SITE = (process.env.SITE_URL || 'https://www.ibelievethis.us').replace(/\/$/, '');
const API_ORIGIN = (process.env.PRERENDER_API_ORIGIN || process.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

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

function injectHead(html, { title, description, path, image, jsonLd, type = 'website' }) {
  const url = `${SITE}${path}`;
  const img = image || `${SITE}/og-image.jpg`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  out = out.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${url}" />`
  );
  out = out.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${url}" />`
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  out = out.replace(
    /<meta property="og:image" content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(img)}" />`
  );
  out = out.replace(
    /<meta property="og:type" content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${type}" />`
  );
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  out = out.replace(
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(img)}" />`
  );

  if (jsonLd) {
    const ld = `<script type="application/ld+json" id="prerender-jsonld">${JSON.stringify(jsonLd)}</script>`;
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

function withSeoBody(html, inner) {
  // Keep product/name text in HTML for crawlers/curl — never visible in the UI
  const block = `
  <div id="seo-prerender" hidden aria-hidden="true" style="display:none!important;position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0">
    ${inner}
  </div>`;
  return html.replace('<div id="root"></div>', `${block}\n    <div id="root"></div>`);
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error('dist/ missing — run vite build first');
    process.exit(1);
  }

  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  console.log(`Prerender → ${SITE}`);
  console.log(`API → ${API_ORIGIN || '(none — static pages only)'}`);

  // Shell routes (SPA hydrate)
  const shells = [
    { path: '/cart', title: `Cart | IBelieveThis`, desc: 'Your IBelieveThis shopping cart.' },
    { path: '/checkout', title: `Checkout | IBelieveThis`, desc: 'Secure checkout at IBelieveThis.' },
    { path: '/login', title: `Login | IBelieveThis`, desc: 'Sign in to IBelieveThis.' },
    { path: '/register', title: `Register | IBelieveThis`, desc: 'Create an IBelieveThis account.' },
    { path: '/admin', title: `Admin | IBelieveThis`, desc: 'Store admin.' },
    { path: '/change-password', title: `Change Password | IBelieveThis`, desc: 'Update your password.' },
  ];

  for (const s of shells) {
    writeRoute(
      s.path,
      injectHead(template, {
        title: s.title,
        description: s.desc,
        path: s.path,
        image: `${SITE}/og-image.jpg`,
      })
    );
  }

  // Static marketing pages
  const aboutHtml = withSeoBody(
    injectHead(template, {
      title: 'About IBelieveThis | Motorcycle Biker Gear',
      description:
        'IBelieveThis is a US biker gear shop for motorcycle guardian bells, boots, jackets, gloves, hats and patches.',
      path: '/about',
    }),
    `<h1>About IBelieveThis</h1><p>US motorcycle &amp; biker gear — guardian bells, boots, jackets, gloves and more.</p>`
  );
  writeRoute('/about', aboutHtml);

  writeRoute(
    '/return-policy',
    withSeoBody(
      injectHead(template, {
        title: 'Return & Exchange Policy | IBelieveThis',
        description: '7-day money-back guarantee and exchanges at IBelieveThis.',
        path: '/return-policy',
      }),
      `<h1>Return &amp; Exchange Policy</h1><p>7-day money-back guarantee and exchanges on eligible orders.</p>`
    )
  );

  writeRoute(
    '/contact',
    withSeoBody(
      injectHead(template, {
        title: 'Contact | IBelieveThis',
        description: 'Contact IBelieveThis for motorcycle gear orders and support.',
        path: '/contact',
      }),
      `<h1>Contact IBelieveThis</h1><p>Questions about gear, shipping, or returns? Reach out anytime.</p>`
    )
  );

  writeRoute(
    '/all-products',
    withSeoBody(
      injectHead(template, {
        title: 'Shop All Products | IBelieveThis',
        description:
          'Browse motorcycle guardian bells, biker boots, jackets, riding gloves, cowboy hats and patches.',
        path: '/all-products',
      }),
      `<h1>Shop All Products</h1><p>Motorcycle guardian bells, biker boots, jackets, gloves, hats and patches.</p>`
    )
  );

  // 404 page (also copied as 404.html for Vercel)
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
    `<h1>404 — Page not found</h1><p>This URL is not a product or page in our store.</p>`
  );
  writeRoute('/404', notFoundBody);
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundBody, 'utf8');

  // Home
  const homeLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'IBelieveThis',
      url: SITE,
      logo: `${SITE}/IBelieveThis.png`,
      description: 'US motorcycle biker gear and guardian bells.',
    },
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
  ];
  writeRoute(
    '/',
    withSeoBody(
      injectHead(template, {
        title: 'IBelieveThis | Motorcycle Guardian Bells, Biker Boots, Jackets & Riding Gear',
        description:
          'Shop US biker gear — motorcycle guardian bells, biker boots, leather jackets, riding gloves, cowboy hats and patches.',
        path: '/',
        jsonLd: homeLd,
      }),
      `<h1>IBelieveThis</h1><p>Motorcycle guardian bells, biker boots, jackets, riding gloves, cowboy hats and patches.</p>`
    )
  );

  if (!API_ORIGIN) {
    console.warn('Skipping product/category prerender — set PRERENDER_API_ORIGIN');
    return;
  }

  const apiBase = API_ORIGIN;
  const [products, categories] = await Promise.all([
    fetchAllProducts(apiBase),
    fetchJson(`${apiBase}/api/categories`),
  ]);

  console.log(`Products: ${products.length}, Categories: ${categories.length}`);

  for (const cat of categories) {
    const slug = categorySlug(cat);
    const pathName = `/category/${slug}`;
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: cat.name, item: `${SITE}${pathName}` },
      ],
    };
    writeRoute(
      pathName,
      withSeoBody(
        injectHead(template, {
          title: `${cat.name} | IBelieveThis`,
          description:
            cat.description ||
            `Shop ${cat.name} at IBelieveThis — motorcycle and biker gear.`,
          path: pathName,
          image: cat.image_url || `${SITE}/og-image.jpg`,
          jsonLd: breadcrumb,
        }),
        `<h1>${escapeHtml(cat.name)}</h1><p>${escapeHtml(cat.description || `Shop ${cat.name} motorcycle gear.`)}</p>`
      )
    );
  }

  for (const p of products) {
    const slug = productSlug(p);
    const pathName = `/product/${slug}`;
    const price = String(p.discount_price || p.price);
    const img = (Array.isArray(p.images) && p.images[0]) || p.image_url || `${SITE}/og-image.jpg`;
    const inStock = Number(p.stock_quantity) > 0;
    const desc = String(p.description || `${p.name} from IBelieveThis.`)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    const productLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: p.name,
      image: Array.isArray(p.images) && p.images.length ? p.images : [img],
      description: desc,
      sku: p.sku || `SKU-${p.id}`,
      brand: { '@type': 'Brand', name: 'IBelieveThis' },
      offers: {
        '@type': 'Offer',
        url: `${SITE}${pathName}`,
        priceCurrency: 'USD',
        price,
        availability: inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'US',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
        },
      },
    };

    writeRoute(
      pathName,
      withSeoBody(
        injectHead(template, {
          title: `${p.name} | IBelieveThis`,
          description: desc,
          path: pathName,
          image: img,
          type: 'product',
          jsonLd: productLd,
        }),
        `<article><h1>${escapeHtml(p.name)}</h1><p class="price">$${escapeHtml(price)} USD</p><p>${escapeHtml(desc)}</p><img src="${escapeHtml(img)}" alt="${escapeHtml(p.name)}" width="800" height="800" /></article>`
      )
    );
  }

  console.log('Prerender complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
