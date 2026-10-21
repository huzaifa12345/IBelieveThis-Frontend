/**
 * Optimize Cloudinary delivery URLs.
 * Inserts: /image/upload/f_auto,q_auto,w_XXX,c_limit/ (or c_fill for square cards).
 * Non-Cloudinary URLs are returned unchanged.
 */

const CLOUDINARY_HOST = 'res.cloudinary.com';

export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes(CLOUDINARY_HOST);
}

/**
 * @param {string} url
 * @param {{ width?: number, height?: number, crop?: string }} [opts]
 */
export function cloudinaryUrl(url, opts = {}) {
  if (!url || !isCloudinaryUrl(url)) return url || '';

  const { width, height, crop = 'limit' } = opts;
  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (width || height) transforms.push(`c_${crop}`);

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const before = url.slice(0, idx + marker.length);
  let after = url.slice(idx + marker.length);

  // Strip an existing transform segment
  if (/^(?:[^/]+,)+[^/]+\//.test(after) || /^[a-z]_/.test(after.split('/')[0] || '')) {
    const parts = after.split('/');
    if (parts[0] && /_/.test(parts[0]) && !/^v\d+$/.test(parts[0])) {
      after = parts.slice(1).join('/');
    }
  }

  return `${before}${transforms.join(',')}/${after}`;
}

/** Card thumbnail default (~300w square) */
export function cardImage(url) {
  return cloudinaryUrl(url, { width: 300, height: 300, crop: 'fill' });
}

/** Product gallery / hero (~800–1200w, c_limit) */
export function galleryImage(url, width = 800) {
  return cloudinaryUrl(url, { width, crop: 'limit' });
}

/**
 * srcSet for responsive images
 * @param {string} url
 * @param {number[]} widths
 * @param {{ crop?: string, height?: number }} [opts]
 */
export function cloudinarySrcSet(url, widths = [400, 800, 1200], opts = {}) {
  if (!isCloudinaryUrl(url)) return undefined;
  const { crop = 'limit', height } = opts;
  return widths
    .map((w) => {
      const transformed = cloudinaryUrl(url, {
        width: w,
        height: height ? Math.round((height / widths[widths.length - 1]) * w) : undefined,
        crop,
      });
      return `${transformed} ${w}w`;
    })
    .join(', ');
}

/** Hero LCP: 400 / 800 / 1200 */
export function heroSrcSet(url) {
  return cloudinarySrcSet(url, [400, 800, 1200], { crop: 'limit' });
}

export function heroImage(url, width = 800) {
  return cloudinaryUrl(url, { width, crop: 'limit' }) || url || '';
}

/** Product / category cards: 300 / 600 */
export function cardSrcSet(url) {
  if (!isCloudinaryUrl(url)) return undefined;
  return [300, 600]
    .map((w) => `${cloudinaryUrl(url, { width: w, height: w, crop: 'fill' })} ${w}w`)
    .join(', ');
}

/** Build preload attrs for first hero slide (prerender / head). Mobile-first href (400w). */
export function heroPreloadAttrs(url) {
  if (!url) return null;
  const href = heroImage(url, 400);
  const imagesrcset = heroSrcSet(url);
  return {
    href,
    imagesrcset: imagesrcset || undefined,
    imagesizes: '100vw',
  };
}
