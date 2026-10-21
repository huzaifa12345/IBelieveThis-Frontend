import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useCart } from './CartContext';
import { addProductFromCard, addProductWithSize, productRequiresSize } from '../utils/cartHelpers';
import SizeSelectModal from '../components/SizeSelectModal';

const CardAddToCartContext = createContext(null);

export function CardAddToCartProvider({ children }) {
  const { addToCart } = useCart();
  const [sizeProduct, setSizeProduct] = useState(null);

  const handleAddToCart = useCallback(
    (product, event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();

      addProductFromCard(product, {
        addToCart,
        toast,
        onNeedSize: (p) => setSizeProduct(p),
      });
    },
    [addToCart]
  );

  const value = useMemo(
    () => ({
      handleAddToCart,
      productRequiresSize,
      openSizeModal: setSizeProduct,
    }),
    [handleAddToCart]
  );

  const modal =
    sizeProduct && typeof document !== 'undefined'
      ? createPortal(
          <SizeSelectModal
            product={sizeProduct}
            onClose={() => setSizeProduct(null)}
            onConfirm={(size) => {
              addProductWithSize(sizeProduct, size, { addToCart, toast });
              setSizeProduct(null);
            }}
          />,
          document.body
        )
      : null;

  return (
    <CardAddToCartContext.Provider value={value}>
      {children}
      {modal}
    </CardAddToCartContext.Provider>
  );
}

export function useCardAddToCart() {
  const ctx = useContext(CardAddToCartContext);
  if (!ctx) {
    throw new Error('useCardAddToCart must be used within CardAddToCartProvider');
  }
  return ctx;
}
