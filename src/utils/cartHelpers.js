/** True when product requires a size selection before add-to-cart. */
export function productRequiresSize(product) {
  const sizes = product?.sizes;
  if (!Array.isArray(sizes) || sizes.length === 0) return false;
  return sizes.some((s) => {
    const label = typeof s === 'string' ? s : s?.size;
    return Boolean(label && String(label).trim());
  });
}

export function addProductFromCard(product, { addToCart, navigate, toast, productPath }) {
  if (productRequiresSize(product)) {
    toast?.('Choose a size on the product page');
    navigate(productPath(product));
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
