/** Normalize product.sizes (array or JSON string) into usable size entries. */
export function getProductSizes(product) {
  let sizes = product?.sizes;
  if (typeof sizes === 'string') {
    try {
      sizes = JSON.parse(sizes);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(sizes)) return [];
  return sizes
    .map((s) => {
      if (typeof s === 'string') {
        const label = s.trim();
        return label ? { size: label, quantity: null } : null;
      }
      const label = String(s?.size || '').trim();
      if (!label) return null;
      const qty = s?.quantity != null ? Number(s.quantity) : null;
      return { size: label, quantity: Number.isFinite(qty) ? qty : null };
    })
    .filter(Boolean);
}

/** True when product requires a size selection before add-to-cart. */
export function productRequiresSize(product) {
  return getProductSizes(product).length > 0;
}

/**
 * Add from a product card.
 * Sized products MUST open a size modal via onNeedSize — never redirect.
 */
export function addProductFromCard(product, { addToCart, toast, onNeedSize }) {
  if (productRequiresSize(product)) {
    if (typeof onNeedSize === 'function') {
      onNeedSize(product);
      return false;
    }
    toast?.error?.('Please choose a size');
    return false;
  }
  addToCart(
    {
      ...product,
      price: product.discount_price || product.price,
    },
    1
  );
  toast?.success?.(`${product.name} added to cart!`);
  return true;
}

export function addProductWithSize(product, sizeLabel, { addToCart, toast }) {
  const label = String(sizeLabel || '').trim();
  if (!label) {
    toast?.error?.('Please select a size');
    return false;
  }
  addToCart(
    {
      ...product,
      selectedSize: label,
      selected_size: label,
      price: product.discount_price || product.price,
    },
    1
  );
  toast?.success?.(`${product.name} (${label}) added to cart!`);
  return true;
}
