// import { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { FaStar, FaTruck, FaShoppingCart, FaShieldAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
// import { ShoppingCart, Star, Truck, Shield } from 'lucide-react';
// import { themeApi } from '../services/themeApi';
// import toast from 'react-hot-toast';
// import SideDrawer from '../components/SideDrawer';
// import { useCart } from '../context/CartContext';
// import { useLogo } from '../context/LogoContext';
// import TopBar from '../components/TopBar';
// import ThemeFooter from '../components/ThemeFooter';
// import '../assets/css/ThemeProductDetail.css';

// const ThemeProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [selectedSize, setSelectedSize] = useState('');
//   const [sizes, setSizes] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [reviewsLoading, setReviewsLoading] = useState(true);
//   const [reviewForm, setReviewForm] = useState({ name: '', rating: '', comment: '', review_images: [] });
//   const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

//   const themeColor = "#001d3d"; // Navy Blue

//   useEffect(() => {
//     fetchProduct();
//     fetchSizes();
//   }, [id]);

//   const fetchSizes = async () => {
//     try {
//       const sizesData = await themeApi.getSizes();
//       setSizes(sizesData);
//     } catch (error) {
//       setSizes([
//         { id: 1, size: '500ml' }, { id: 2, size: '1L' }, { id: 3, size: '5L' },
//         { id: 4, size: '10L' }, { id: 5, size: '25L' }, { id: 6, size: '50L' }
//       ]);
//     }
//   };

//   useEffect(() => {
//     const fetchReviews = async () => {
//       setReviewsLoading(true);
//       try {
//         const reviewsData = await themeApi.getProductReviews(id);
//         setReviews(reviewsData?.reviews || []);
//       } catch (error) {
//         setReviews([]);
//       } finally {
//         setReviewsLoading(false);
//       }
//     };
//     if (id) fetchReviews();
//   }, [id]);

//   const fetchProduct = async () => {
//     try {
//       setLoading(true);
//       const productData = await themeApi.getProductById(id);
//       setProduct(productData);
      
//       // Set selected image to first image if available
//       if (productData.images && productData.images.length > 0) {
//         setSelectedImage(0);
//       }
//     } catch (error) {
//       toast.error('Failed to load product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddToCart = () => {
//     // if (!selectedSize) {
//     //   toast.error('Please select a size first');
//     //   return;
//     // }
//     addToCart({ 
//       ...product, 
//       selectedSize, 
//       price: product.discount_price || product.price 
//     }, quantity);
//     toast.success(`${product.name} added to cart!`);
//   };

//   const handleBuyNow = () => {
//     addToCart({ 
//       ...product, 
//       selectedSize, 
//       price: product.discount_price || product.price 
//     }, quantity);
//     navigate('/checkout');
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
    
//     // Debug: Log form data before processing
//     console.log('Review form submitted');
//     console.log('Form elements:', e.target);
    
//     // Get form data
//     const formData = new FormData(e.target);
//     const name = formData.get('name');
//     const rating = formData.get('rating');
//     const comment = formData.get('comment');
    
//     // Debug: Log extracted data
//     console.log('Extracted form data:', { name, rating, comment });
    
//     // Validation
//     if (!name || !rating || !comment) {
//       console.error('Validation failed - Missing fields:', { name: !!name, rating: !!rating, comment: !!comment });
//       toast.error('Please fill in all required fields');
//       return;
//     }
    
//     const ratingValue = parseInt(rating);
//     if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
//       console.error('Validation failed - Invalid rating:', ratingValue);
//       toast.error('Please select a valid rating between 1 and 5');
//       return;
//     }
    
//     try {
//       const reviewData = {
//         customer_name: name.trim(),
//         rating: ratingValue,
//         comment: comment.trim(),
//         product_id: id
//       };
      
//       console.log('Submitting review:', reviewData);
//       await themeApi.createReview(reviewData);
//       toast.success('Review submitted successfully!');
      
//       // Reset form
//       e.target.reset();
      
//       // Refresh reviews
//       const reviewsData = await themeApi.getProductReviews(id);
//       setReviews(reviewsData?.reviews || []);
      
//     } catch (error) {
//       console.error('Review submission error:', error);
//       toast.error('Failed to submit review: ' + (error.response?.data?.error || error.message));
//     }
//   };

//   if (loading) return (
//     <div className="loader-container d-flex justify-content-center align-items-center vh-100">
//       <div className="spinner-border text-primary" role="status"></div>
//     </div>
//   );

//   return (
//     <div className="detail-page-wrapper">
//       <header className="modern-header"><TopBar onMenuToggle={() => setSideDrawerOpen(true)} /></header>
//       <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

//       <div className="container py-5">
//         <div className="row g-5">
//           {/* Images Section */}
//           <div className="col-lg-6">
//             <div className="image-main-card">
//               <div className="main-view-img">
//                 <img 
//                   src={product.images?.[selectedImage] || product.image_url || '/placeholder.png'} 
//                   alt={product.name} className="img-fluid" 
//                 />
//               </div>
//               <div className="thumb-row mt-3 d-flex gap-2">
//                 {(product.images && product.images.length > 0 ? product.images : [product.image_url]).map((img, i) => (
//                   <img key={i} src={img} className={`thumb-img ${selectedImage === i ? 'active' : ''}`} 
//                   onClick={() => setSelectedImage(i)} />
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Details Section */}
//           <div className="col-lg-6">
//             <div className="product-content-box">
//               <span className="category-badge">Home Care & Cleaning Product</span>
//               <h1 className="product-main-title">{product.name}</h1>
              
//               <div className="d-flex align-items-center gap-2 mb-3">
//                 <div className="star-rating-box">
//                   {[...Array(5)].map((_, s) => (
//                     <FaStar 
//                       key={s} 
//                       className="me-1" 
//                       color={reviews.length > 0 ? (s < Math.round(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length)) ? "#ffc300" : "#e0e0e0" : "#e0e0e0"} 
//                     />
//                   ))}
//                   <span className="ms-2">{reviews.length > 0 ? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1) : "N/A"}</span>
//                 </div>
//                 <span className="text-muted">({reviews.length} Verified Reviews)</span>
//               </div>

//               <div className="price-display mb-4">
//                 {product.discount_price && product.discount_price < product.price ? (
//                   <>
//                     <span className="original-price-tag">${product.price}</span>
//                     <span className="price-tag">${product.discount_price}</span>
//                     <span className="discount-badge">
//                       {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
//                     </span>
//                   </>
//                 ) : (
//                   <span className="price-tag">${product.price}</span>
//                 )}
//               </div>

//               <div className="spec-card mb-4">
//                 <p><strong>SKU:</strong> {product.sku || 'IND-786'}</p>
//                 {product.barcode && (
//                   <p><strong>Barcode:</strong> <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>{product.barcode}</code></p>
//                 )}
//                 <p className="description-text">{product.description}</p>
//               </div>

//               {/* <div className="size-selector-wrap mb-4">
//                 <label className="fw-bold mb-2 d-block">SELECT PACKAGING SIZE</label>
//                 <div className="d-flex flex-wrap gap-2">
//                   {(product.sizes?.length > 0 ? product.sizes : sizes).map((s, i) => (
//                     <button 
//                       key={i} 
//                       className={`btn size-btn ${selectedSize === s.size ? 'active' : ''}`}
//                       onClick={() => setSelectedSize(s.size)}
//                     >
//                       {s.size}
//                     </button>
//                   ))}
//                 </div>
//               </div> */}

//               <div className="action-row mb-5">
//                 <div className="qty-input">
//                   <button onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
//                   <input type="number" value={quantity} readOnly />
//                   <button onClick={() => setQuantity(q => q+1)}>+</button>
//                 </div>
//                 <div className="action-buttons">
//                   <button className="btn btn-add-cart" onClick={handleAddToCart}>
//                     <ShoppingCart className="me-2" size={20} /> ADD TO CART
//                   </button>
//                   <button className="btn btn-buy-now" onClick={handleBuyNow}>
//                     Buy Now
//                   </button>
//                 </div>
//               </div>

//               <div className="trust-grid row g-3">
//                 <div className="col-6"><div className="trust-item"><FaTruck /> <span>Fast Delivery</span></div></div>
//                 <div className="col-6"><div className="trust-item"><FaShieldAlt /> <span>Quality Lab Tested</span></div></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Reviews Section */}
//         <div className="row mt-5">
//           <div className="col-12">
//             <div className="review-section-card">
//               <h3 className="section-heading mb-4 text-center">Customer Satisfaction</h3>
//               <div className="row g-4">
//                 <div className="col-md-4">
//                   <div className="write-review-card">
//                     <h5>Post a Review</h5>
//                     <form onSubmit={handleReviewSubmit}>
//                       <input type="text" name="name" className="form-control mb-2" placeholder="Your Name" required />
//                       <select name="rating" className="form-control mb-2" required>
//                         <option value="">Select Rating</option>
//                         <option value="5">5 Stars - Excellent</option>
//                         <option value="4">4 Stars - Good</option>
//                         <option value="3">3 Stars - Average</option>
//                         <option value="2">2 Stars - Poor</option>
//                         <option value="1">1 Star - Very Poor</option>
//                       </select>
//                       <textarea name="comment" className="form-control mb-3" placeholder="Share your experience..." rows="3" required></textarea>
//                       <button className="btn btn-submit-review w-100">Submit Review</button>
//                     </form>
//                   </div>
//                 </div>
//                 {/* --- Reviews Display Area --- */}
//                 <div className="col-md-8">
//                   {reviews.length === 0 ? (
//                     <div className="empty-reviews p-5 text-center">
//                       <p className="mb-0 text-muted">No reviews yet. Be the first to rate this product!</p>
//                     </div>
//                   ) : (
//                     <div className="reviews-scroll-area">
//                       {reviews.map((r, i) => (
//                         <div key={i} className="review-card-modern mb-3">
//                           <div className="d-flex justify-content-between align-items-start">
//                             <div className="d-flex align-items-center gap-3">
//                               <div className="user-avatar-circle">
//                                 {r.customer_name.charAt(0).toUpperCase()}
//                               </div>
//                               <div>
//                                 <h6 className="mb-0 fw-bold text-navy">
//                                   {r.customer_name} 
//                                   <span className="verified-badge-text">
//                                     <FaCheckCircle className="ms-1" /> Verified Buyer
//                                   </span>
//                                 </h6>
//                                 <small className="text-muted">Purchased recently</small>
//                               </div>
//                             </div>
//                             <div className="stars-wrapper">
//                               {[...Array(5)].map((_, s) => (
//                                 <FaStar 
//                                   key={s} 
//                                   size={14} 
//                                   color={s < r.rating ? "#ffc300" : "#e0e0e0"} 
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                           <div className="review-content-body mt-3">
//                             <p className="mb-0">{r.comment}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <ThemeFooter />
//     </div>
//   );
// };

// export default ThemeProductDetail;



import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaTruck, FaShoppingCart, FaShieldAlt, FaInfoCircle, FaCheckCircle, FaUndo, FaLock, FaSearch, FaArrowRight } from 'react-icons/fa';
import { ShoppingCart, Star, Truck, Shield } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import { useCart } from '../context/CartContext';
import { useLogo } from '../context/LogoContext';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import ProductDescription from '../components/ProductDescription';
import { useStoreSettings } from '../hooks/useStoreSettings';
import {
  productPath,
  productPathSlug,
  categoryPath,
  setPageSeo,
  injectJsonLd,
  removeJsonLd,
  absoluteUrl,
  SITE_NAME,
  buildProductOfferExtras,
} from '../utils/seo';
import { galleryImage, cloudinarySrcSet, cardImage } from '../utils/cloudinary';
import { addProductFromCard } from '../utils/cartHelpers';
import '../assets/css/ThemeProductDetail.css';
import '../assets/css/ThemeHome.css';

const ThemeProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizes, setSizes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: '', comment: '', review_images: [] });
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { get } = useStoreSettings();
  const returnDays = get('return_window_days', '7');

  const themeColor = "#001d3d"; // Navy Blue

  const reviewAvg =
    reviews.length > 0
      ? reviews.reduce((a, b) => a + Number(b.rating || 0), 0) / reviews.length
      : 0;

  useEffect(() => {
    fetchProduct();
    fetchSizes();
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const loadRelated = async () => {
      if (!product?.id) {
        setRelatedProducts([]);
        return;
      }
      const categoryKey = product.category_id || product.category_relation?.id || product.category;
      if (!categoryKey) {
        setRelatedProducts([]);
        return;
      }
      try {
        const data = await themeApi.getProductsByCategory(categoryKey, {
          page: 1,
          limit: 8,
          sort_by: 'created_at',
        });
        const list = (data.products || data || []).filter((p) => p.id !== product.id).slice(0, 4);
        if (!cancelled) setRelatedProducts(list);
      } catch {
        if (!cancelled) setRelatedProducts([]);
      }
    };
    loadRelated();
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.category_id, product?.category]);

  const fetchSizes = async () => {
    try {
      const sizesData = await themeApi.getSizes();
      setSizes(sizesData);
    } catch (error) {
      setSizes([]);
    }
  };

  // Reviews are loaded after product is fetched (so we have the numeric product id)

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await themeApi.getProductById(slug);
      if (!productData || productData.error) {
        navigate('/404', { replace: true });
        return;
      }
      setProduct(productData);

      // Canonicalize barcode/id URLs to the SEO name slug
      const canonicalSlug = productPathSlug(productData);
      if (canonicalSlug && slug !== canonicalSlug) {
        navigate(productPath(productData), { replace: true });
      }

      if (productData?.images && productData.images.length > 0) {
        setSelectedImage(0);
      }

      try {
        if (productData && productData.id) {
          setReviewsLoading(true);
          const reviewsData = await themeApi.getProductReviews(productData.id);
          setReviews(reviewsData?.reviews || []);
        }
      } catch (err) {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/404', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!product) return;

    const description = (product.description || `${product.name} from ${SITE_NAME}. Motorcycle & biker gear for US riders.`)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    const path = productPath(product);
    const image = (product.images && product.images[0]) || product.image_url;

    setPageSeo({
      title: product.name,
      description,
      path,
      image,
      type: 'product',
    });

    const stockQty = Number(product.stock_quantity);
    const inStock = Number.isFinite(stockQty) ? stockQty > 0 : true;
    const categoryName =
      product.category_relation?.name || product.category || 'Motorcycle Gear';
    const skuValue = product.sku || product.barcode || `SKU-${product.id}`;
    const offerExtras = buildProductOfferExtras();

    const productSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.images?.length ? product.images : [product.image_url].filter(Boolean),
      description,
      sku: skuValue,
      mpn: skuValue,
      ...(product.barcode && { gtin13: String(product.barcode) }),
      category: categoryName,
      brand: { '@type': 'Brand', name: SITE_NAME },
      url: absoluteUrl(path),
      offers: {
        '@type': 'Offer',
        url: absoluteUrl(path),
        priceCurrency: 'USD',
        price: String(product.discount_price || product.price),
        itemCondition: 'https://schema.org/NewCondition',
        availability: inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: SITE_NAME },
        ...offerExtras,
      },
    };

    // AEO: FAQ block helps answer engines summarize product intent
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What is ${product.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: description || `${product.name} is sold by ${SITE_NAME}.`,
          },
        },
        {
          '@type': 'Question',
          name: `How much does ${product.name} cost?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${product.name} is priced at $${Number(product.discount_price || product.price).toFixed(2)} USD at ${SITE_NAME}.`,
          },
        },
        {
          '@type': 'Question',
          name: `Where can I buy ${product.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `You can buy ${product.name} online at ${absoluteUrl(path)}.`,
          },
        },
      ],
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: absoluteUrl('/all-products') },
        { '@type': 'ListItem', position: 3, name: product.name, item: absoluteUrl(path) },
      ],
    };

    injectJsonLd('seo-product-jsonld', productSchema);
    injectJsonLd('seo-faq-jsonld', faqSchema);
    injectJsonLd('seo-breadcrumb-jsonld', breadcrumbSchema);

    return () => {
      removeJsonLd('seo-product-jsonld');
      removeJsonLd('seo-faq-jsonld');
      removeJsonLd('seo-breadcrumb-jsonld');
    };
  }, [product]);

  const productSizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const requiresSize = productSizes.length > 0;

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({ 
      ...product, 
      selectedSize,
      selected_size: selectedSize || null,
      price: product.discount_price || product.price 
    }, quantity);
    toast.success(`${product.name}${selectedSize ? ` (${selectedSize})` : ''} added to cart!`);
  };

  const handleBuyNow = () => {
    if (requiresSize && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({ 
      ...product, 
      selectedSize,
      selected_size: selectedSize || null,
      price: product.discount_price || product.price 
    }, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const comment = formData.get('comment');
    const ratingValue = formRating;

    if (!name || !comment) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      toast.error('Please select a star rating');
      return;
    }

    try {
      await themeApi.createReview({
        customer_name: name.trim(),
        rating: ratingValue,
        comment: comment.trim(),
        product_id: product?.id || null,
      });
      toast.success('Thank you — your review was submitted!');
      e.target.reset();
      setFormRating(0);
      setHoverRating(0);

      if (product?.id) {
        const reviewsData = await themeApi.getProductReviews(product.id);
        setReviews(reviewsData?.reviews || []);
      }
    } catch (error) {
      toast.error('Failed to submit review: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatReviewDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return (
    <div className="loader-container d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  if (!product) return null;

  const stockQty = Number(product.stock_quantity);
  const isAvailable = Number.isFinite(stockQty)
    ? stockQty > 0
    : (product.stock !== undefined ? Number(product.stock) > 0 : true);
  const categoryName =
    product.category_relation?.name || product.category || 'Motorcycle Gear';
  const skuValue = product.sku || product.barcode || `SKU-${product.id}`;

  return (
    <div className="detail-page-wrapper">
      <header className="modern-header"><TopBar onMenuToggle={() => setSideDrawerOpen(true)} /></header>
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <div className="container py-5">
        <div className="row g-5">
          {/* Images Section */}
          <div className="col-lg-6">
            <div className="image-main-card">
              <div className="main-view-img">
                <img
                  src={galleryImage(product.images?.[selectedImage] || product.image_url, 1000) || '/placeholder.png'}
                  srcSet={cloudinarySrcSet(product.images?.[selectedImage] || product.image_url, [600, 1000, 1400])}
                  sizes="(max-width: 992px) 100vw, 50vw"
                  width={1000}
                  height={1000}
                  alt={product.name}
                  className="img-fluid"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="thumb-row mt-3 d-flex gap-2">
                {(product.images && product.images.length > 0 ? product.images : [product.image_url]).map((img, i) => (
                  <img
                    key={i}
                    src={cardImage(img) || img}
                    width={75}
                    height={75}
                    alt={`${product.name} view ${i + 1}`}
                    className={`thumb-img ${selectedImage === i ? 'active' : ''}`}
                    loading="lazy"
                    decoding="async"
                    onClick={() => setSelectedImage(i)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="col-lg-6">
            <div className="product-content-box">
              <span className="category-badge">{categoryName}</span>
              <h1 className="product-main-title">{product.name}</h1>
              
              {reviews.length > 0 && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="star-rating-box">
                    {[...Array(5)].map((_, s) => {
                      const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
                      return (
                        <FaStar
                          key={s}
                          className="me-1"
                          color={s < Math.round(avg) ? '#ffc300' : '#e0e0e0'}
                        />
                      );
                    })}
                    <span className="ms-2">
                      {(reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-muted">
                    ({reviews.length} review{reviews.length === 1 ? '' : 's'})
                  </span>
                </div>
              )}

              <div className="price-display mb-3">
                {(() => {
                  const regular = Number(product.price);
                  const sale = Number(product.discount_price);
                  const hasSale = Number.isFinite(sale) && Number.isFinite(regular) && sale > 0 && sale < regular;
                  if (hasSale) {
                    const pct = Math.round(((regular - sale) / regular) * 100);
                    return (
                      <>
                        <span className="original-price-tag">${regular.toFixed(2)}</span>
                        <span className="price-tag">${sale.toFixed(2)}</span>
                        <span className="discount-badge">-{pct}%</span>
                      </>
                    );
                  }
                  return (
                    <span className="price-tag">
                      ${Number.isFinite(regular) ? regular.toFixed(2) : product.price}
                    </span>
                  );
                })()}
              </div>

              <p
                className={`fw-semibold mb-3 ${isAvailable ? 'text-success' : 'text-danger'}`}
                data-stock={isAvailable ? 'in-stock' : 'out-of-stock'}
                data-stock-quantity={Number.isFinite(stockQty) ? String(stockQty) : ''}
              >
                {isAvailable ? 'In Stock — Ready to Ship' : 'Currently Out of Stock'}
              </p>

              {/* GEO / AEO: structured specs table for crawlers + answer engines */}
              <section className="spec-card mb-4" aria-labelledby="product-specs-heading">
                <h2 id="product-specs-heading" className="h5 text-navy fw-bold">
                  Product Overview &amp; Specifications
                </h2>
                
                {product.description ? (
                  <ProductDescription text={product.description} className="description-text" />
                ) : null}
                <table className="table table-bordered text-start small mb-3 spec-table mt-3">
                  <tbody>
                    <tr>
                      <th scope="row" className="spec-label w-35">Brand</th>
                      <td className="spec-value">{SITE_NAME}</td>
                    </tr>
                    {/* <tr>
                      <th scope="row" className="spec-label">Barcode (GTIN)</th>
                      <td className="spec-value">
                        <code className="spec-gtin">{product.barcode || 'N/A'}</code>
                      </td>
                    </tr> */}
                    <tr>
                      <th scope="row" className="spec-label">SKU</th>
                      <td className="spec-value">{skuValue}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="spec-label">Category</th>
                      <td className="spec-value">{categoryName}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="spec-label">Availability</th>
                      <td className="spec-value">
                        {isAvailable
                          ? `In Stock (Ready to Ship)${Number.isFinite(stockQty) && stockQty > 0 ? ` — ${stockQty} units` : ''}`
                          : 'Out of Stock'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {requiresSize && (
                <div className="size-selector-wrap mb-4">
                  <label className="form-label fw-bold text-white mb-2 d-block">
                    Size <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select size-select-etsy"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {productSizes.map((s, i) => {
                      const label = typeof s === 'string' ? s : s.size;
                      const qty = typeof s === 'object' ? Number(s.quantity) : null;
                      const out = Number.isFinite(qty) && qty <= 0;
                      return (
                        <option key={`${label}-${i}`} value={label} disabled={out}>
                          {label}{out ? ' — Sold out' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="size-chip-row mt-2">
                    {productSizes.map((s, i) => {
                      const label = typeof s === 'string' ? s : s.size;
                      const qty = typeof s === 'object' ? Number(s.quantity) : null;
                      const out = Number.isFinite(qty) && qty <= 0;
                      return (
                        <button
                          key={`chip-${label}-${i}`}
                          type="button"
                          className={`btn size-btn ${selectedSize === label ? 'active' : ''}`}
                          disabled={out}
                          onClick={() => setSelectedSize(label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="action-row mb-3">
                <div className="qty-input">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q-1))}>-</button>
                  <input type="number" value={quantity} readOnly aria-label="Quantity" />
                  <button type="button" onClick={() => setQuantity(q => q+1)}>+</button>
                </div>
                <div className="action-buttons">
                  <button className="btn btn-add-cart" onClick={handleAddToCart}>
                    <ShoppingCart className="me-2" size={20} /> ADD TO CART
                  </button>
                  <button className="btn btn-buy-now" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="pdp-trust-row mb-4">
                <span><FaTruck /> Fast US Shipping</span>
                <span><FaUndo /> {returnDays}-Day Returns</span>
                <span><FaLock /> Secure Checkout</span>
              </div>

              <div className="pdp-accordion mb-5">
                <button
                  type="button"
                  className="pdp-accordion-toggle"
                  aria-expanded={shipOpen}
                  onClick={() => setShipOpen((v) => !v)}
                >
                  Shipping &amp; Returns
                </button>
                {shipOpen && (
                  <div className="pdp-accordion-body">
                    <p>
                      Processing and delivery details are in our{' '}
                      <Link to="/shipping-policy">Shipping Policy</Link>. Returns are accepted within{' '}
                      <strong>{returnDays} days</strong> of delivery — see the{' '}
                      <Link to="/return-policy">Return &amp; Exchange Policy</Link> or{' '}
                      <Link to="/contact">Contact</Link> us for help.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="row">
          <div className="col-12">
            <div className="review-section-card">
              <div className="review-section-header text-center mb-4">
                <h3 className="section-heading mb-3">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="review-summary-bar">
                    <div className="review-summary-score">
                      <span className="review-summary-number">{reviewAvg.toFixed(1)}</span>
                      <div className="stars-wrapper review-summary-stars">
                        {[...Array(5)].map((_, s) => (
                          <FaStar key={s} size={16} color={s < Math.round(reviewAvg) ? '#fbbf24' : '#334155'} />
                        ))}
                      </div>
                      <span className="review-summary-count">
                        Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="review-summary-empty">No reviews yet — be the first to share your experience.</p>
                )}
              </div>

              <div className="row g-4 align-items-start">
                <div className="col-lg-4">
                  <div className="write-review-card">
                    <h5>Write a review</h5>
                    <p className="write-review-hint">Honest feedback helps other riders choose with confidence.</p>
                    <form onSubmit={handleReviewSubmit} className="review-form">
                      <label className="review-label">Your name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control review-input"
                        placeholder="How should we credit you?"
                        required
                      />

                      <label className="review-label">Your rating</label>
                      <div className="review-star-picker" role="group" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const active = (hoverRating || formRating) >= n;
                          return (
                            <button
                              key={n}
                              type="button"
                              className={`review-star-btn ${active ? 'active' : ''}`}
                              aria-label={`${n} star${n > 1 ? 's' : ''}`}
                              onMouseEnter={() => setHoverRating(n)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setFormRating(n)}
                            >
                              <FaStar size={22} />
                            </button>
                          );
                        })}
                      </div>

                      <label className="review-label">Your review</label>
                      <textarea
                        name="comment"
                        className="form-control review-input"
                        placeholder="Fit, quality, shipping — what stood out?"
                        rows="4"
                        required
                      />
                      <button type="submit" className="btn btn-submit-review w-100">
                        Submit review
                      </button>
                    </form>
                  </div>
                </div>

                <div className="col-lg-8">
                  {reviewsLoading ? (
                    <div className="empty-reviews text-center">
                      <p className="mb-0">Loading reviews…</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="empty-reviews text-center">
                      <FaStar size={28} className="empty-reviews-icon mb-3" />
                      <p className="mb-0">Reviews from real customers will show up here.</p>
                    </div>
                  ) : (
                    <div className="reviews-scroll-area">
                      {reviews.map((r) => (
                        <article key={r.id || `${r.customer_name}-${r.created_at}`} className="review-card-modern">
                          <div className="review-card-top">
                            <div className="d-flex align-items-center gap-3">
                              <div className="user-avatar-circle" aria-hidden="true">
                                {(r.customer_name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div className="review-card-meta">
                                <div className="review-card-name-row">
                                  <h6 className="review-card-name mb-0">{r.customer_name}</h6>
                                  {r.is_verified ? (
                                    <span className="verified-badge-text">
                                      <FaCheckCircle size={11} /> Verified
                                    </span>
                                  ) : null}
                                </div>
                                <time className="review-card-date" dateTime={r.created_at || undefined}>
                                  {formatReviewDate(r.created_at) || 'Recent'}
                                </time>
                              </div>
                            </div>
                            <div className="stars-wrapper" aria-label={`${r.rating} out of 5 stars`}>
                              {[...Array(5)].map((_, s) => (
                                <FaStar key={s} size={14} color={s < r.rating ? '#fbbf24' : '#334155'} />
                              ))}
                            </div>
                          </div>
                          <p className="review-card-body mb-0">{r.comment}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="related-products-section mt-5 mb-4" aria-labelledby="related-products-heading">
            <div className="related-products-header">
              <div>
                <h3 id="related-products-heading" className="section-heading text-start mb-1">
                  More from {categoryName}
                </h3>
                <p className="related-products-sub">Same category — pick another piece of gear</p>
              </div>
              {(product.category_relation || product.category_id) && (
                <Link
                  to={categoryPath(product.category_relation || { id: product.category_id, name: categoryName })}
                  className="related-products-link"
                >
                  View all <FaArrowRight size={12} />
                </Link>
              )}
            </div>

            <div className="product-grid-modern related-products-grid">
              {relatedProducts.map((related) => (
                <div key={related.id} className="item-card">
                  <div className="item-thumb" onClick={() => navigate(productPath(related))}>
                    <img
                      src={
                        cardImage(related.images?.[0] || related.image_url) ||
                        related.images?.[0] ||
                        related.image_url ||
                        '/placeholder.png'
                      }
                      srcSet={cloudinarySrcSet(related.images?.[0] || related.image_url, [320, 400, 640])}
                      sizes="(max-width: 768px) 45vw, 22vw"
                      width={400}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      alt={related.name}
                    />
                    {related.discount_price && related.discount_price < related.price && (
                      <div className="discount-badge-image">
                        -{Math.round(((related.price - related.discount_price) / related.price) * 100)}%
                      </div>
                    )}
                    {related.reviewCount > 0 ? (
                      <div className="rating-badge-image">
                        <FaStar className="rating-badge-star" />
                        <span className="rating-badge-score">{related.averageRating}</span>
                        <span className="rating-badge-count">({related.reviewCount})</span>
                      </div>
                    ) : null}
                    <div className="item-overlay">
                      <button
                        type="button"
                        className="circle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addProductFromCard(related, { addToCart, navigate, toast, productPath });
                        }}
                      >
                        <FaShoppingCart />
                      </button>
                      <button
                        type="button"
                        className="circle-btn"
                        onClick={() => navigate(productPath(related))}
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{related.name}</h3>
                    <div className="item-pricing">
                      {related.discount_price && related.discount_price < related.price ? (
                        <>
                          <span className="price-original">${related.price}</span>
                          <span className="price-now">${related.discount_price}</span>
                        </>
                      ) : (
                        <span className="price-now">${related.price}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="card-buy-btn"
                      onClick={() =>
                        addProductFromCard(related, { addToCart, navigate, toast, productPath })
                      }
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <ThemeFooter />
    </div>
  );
};

export default ThemeProductDetail;