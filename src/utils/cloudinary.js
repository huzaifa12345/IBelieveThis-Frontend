/**
 * Optimize Cloudinary delivery URLs (f_auto, q_auto, width).
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

  const { width, height, crop = 'fill' } = opts;
  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (width || height) transforms.push(`c_${crop}`);

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const before = url.slice(0, idx + marker.length);
  let after = url.slice(idx + marker.length);

  // Strip an existing transform segment (version folder starts with v digits, or raw path)
  if (/^(?:[^/]+,)+[^/]+\//.test(after) || /^[a-z]_/.test(after.split('/')[0] || '')) {
    const parts = after.split('/');
    // If first segment looks like transforms (contains _), drop it
    if (parts[0] && /_/.test(parts[0]) && !/^v\d+$/.test(parts[0])) {
      after = parts.slice(1).join('/');
    }
  }

  return `${before}${transforms.join(',')}/${after}`;
}

/** Card thumbnail (~400w) */
export function cardImage(url) {
  return cloudinaryUrl(url, { width: 400, height: 400, crop: 'fill' });
}

/** Product gallery main (~800–1200w) */
export function galleryImage(url, width = 800) {
  return cloudinaryUrl(url, { width, crop: 'limit' });
}

/**
 * srcSet for responsive product/card images
 * @param {string} url
 * @param {number[]} widths
 */
export function cloudinarySrcSet(url, widths = [400, 800, 1200]) {
  if (!isCloudinaryUrl(url)) return undefined;
  return widths
    .map((w) => `${cloudinaryUrl(url, { width: w, crop: 'limit' })} ${w}w`)
    .join(', ');
}
