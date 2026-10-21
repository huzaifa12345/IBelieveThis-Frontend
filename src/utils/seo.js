export const SITE_URL = 'https://www.ibelievethis.us';
export const SITE_NAME = 'IBelieveThis';
export const SITE_TAGLINE =
  'US biker gear — motorcycle guardian bells, biker boots, jackets, riding gloves, cowboy hats & patches';
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * SEO-friendly slug from a product/category name.
 * "Boogie Men Bell" → "boogie-men-bell"
 */
export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 120) || 'product';
}

export function productPathSlug(product) {
  if (!product) return 'product';
  if (product.slug) return product.slug;
  const base = slugify(product.name || `product-${product.id || ''}`);
  return product.id ? `${base}-${product.id}` : base;
}

/** Canonical product URL path, e.g. /product/boogie-men-bell */
export function productPath(product) {
  return `/product/${productPathSlug(product)}`;
}

export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export function categoryPath(category) {
  if (!category) return '/all-products';
  if (category.slug) return `/category/${category.slug}`;
  if (category.name) return `/category/${slugify(category.name)}`;
  if (category.id) return `/category/${category.id}`;
  return '/all-products';
}

/**
 * Update document head for SEO / AEO / social preview without extra deps.
 */
export function setPageSeo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
} = {}) {
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} | ${SITE_TAGLINE}`;
  const desc = description || SITE_TAGLINE;
  const url = absoluteUrl(path);
  const imageUrl = image
    ? (image.startsWith('http') ? image : absoluteUrl(image))
    : SITE_OG_IMAGE;

  document.title = fullTitle;

  const upsert = (selector, attrs) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(attrs.property || attrs.name ? 'meta' : 'link');
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key, value]) => {
      if (value != null) el.setAttribute(key, value);
    });
  };

  upsert('meta[name="description"]', { name: 'description', content: desc });
  upsert('meta[name="robots"]', {
    name: 'robots',
    content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  });
  upsert('link[rel="canonical"]', { rel: 'canonical', href: url });

  upsert('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
  upsert('meta[property="og:description"]', { property: 'og:description', content: desc });
  upsert('meta[property="og:url"]', { property: 'og:url', content: url });
  upsert('meta[property="og:type"]', { property: 'og:type', content: type });
  upsert('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
  upsert('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
  upsert('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
  upsert('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });

  upsert('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsert('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
  upsert('meta[name="twitter:description"]', { name: 'twitter:description', content: desc });
  upsert('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
}

export function injectJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}

export function priceValidUntil(yearsAhead = 1) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + yearsAhead);
  return d.toISOString().slice(0, 10);
}

const ETSY_DEFAULT = 'https://www.etsy.com/shop/IBelieveThis';

/**
 * Organization JSON-LD from store settings (social / contact).
 * @param {Record<string, string>} settings map from useStoreSettings / API
 */
export function buildOrganizationSchema(settings = {}) {
  const get = (k, fallback = '') => {
    const v = settings[k] ?? settings.get?.(k, fallback);
    return (typeof v === 'string' ? v : fallback || '').trim();
  };

  const sameAs = [
    get('social_etsy', ETSY_DEFAULT) || ETSY_DEFAULT,
    get('social_facebook'),
    get('social_instagram'),
    get('social_pinterest'),
  ].filter(Boolean);

  const email = get('contact_email');
  const phone = get('contact_phone');
  const serviceArea = get('service_area', 'United States') || 'United States';

  const contactPoint = {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: absoluteUrl('/contact'),
    areaServed: serviceArea,
    availableLanguage: 'English',
  };
  if (email) contactPoint.email = email;
  if (phone) contactPoint.telephone = phone;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/IBelieveThis.png`,
    description: SITE_TAGLINE,
    sameAs,
    contactPoint,
    areaServed: { '@type': 'Country', name: 'United States' },
  };
}

/** Product Offer JSON-LD extras required by merchant listings */
export function buildProductOfferExtras(returnDays = 7) {
  const days = Number(returnDays) || 7;
  return {
    priceValidUntil: priceValidUntil(1),
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'USD',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'US',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 2,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 3,
          maxValue: 7,
          unitCode: 'DAY',
        },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: days,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
      refundType: 'https://schema.org/FullRefund',
    },
  };
}
