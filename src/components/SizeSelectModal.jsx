import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FaShoppingCart } from 'react-icons/fa';
import { getProductSizes } from '../utils/cartHelpers';
import { cardImage } from '../utils/cloudinary';
import './SizeSelectModal.css';

const SizeSelectModal = ({ product, onClose, onConfirm }) => {
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    setSelectedSize('');
  }, [product?.id]);

  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product) return null;

  const sizes = getProductSizes(product);
  const img = product.images?.[0] || product.image_url;
  const price = product.discount_price || product.price;
  const hasSale =
    product.discount_price &&
    Number(product.discount_price) > 0 &&
    Number(product.discount_price) < Number(product.price);

  const selectedMeta = sizes.find((s) => s.size === selectedSize);
  const selectedOut =
    selectedMeta && Number.isFinite(selectedMeta.quantity) && selectedMeta.quantity <= 0;

  const handleConfirm = () => {
    if (!selectedSize || selectedOut) return;
    onConfirm?.(selectedSize);
  };

  return (
    <div className="ssm-overlay" onClick={onClose} role="presentation">
      <div
        className="ssm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ssm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ssm-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="ssm-body">
          <div className="ssm-media">
            <img
              src={cardImage(img) || img || '/placeholder.png'}
              alt={product.name}
              width={160}
              height={160}
            />
          </div>

          <div className="ssm-info">
            <p className="ssm-eyebrow">Select a size</p>
            <h3 id="ssm-title" className="ssm-title">
              {product.name}
            </h3>
            <div className="ssm-price">
              {hasSale ? (
                <>
                  <span className="ssm-price-old">${product.price}</span>
                  <span className="ssm-price-now">${price}</span>
                </>
              ) : (
                <span className="ssm-price-now">${price}</span>
              )}
            </div>

            <div className="ssm-sizes" role="listbox" aria-label="Available sizes">
              {sizes.map((s) => {
                const out = Number.isFinite(s.quantity) && s.quantity <= 0;
                const active = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={out}
                    className={`ssm-size-btn ${active ? 'active' : ''} ${out ? 'sold-out' : ''}`}
                    onClick={() => setSelectedSize(s.size)}
                  >
                    {s.size}
                    {out ? <span className="ssm-sold">Sold out</span> : null}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="ssm-add-btn"
              disabled={!selectedSize || selectedOut}
              onClick={handleConfirm}
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeSelectModal;
