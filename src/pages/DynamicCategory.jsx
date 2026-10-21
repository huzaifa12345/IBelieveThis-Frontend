import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaStar } from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import SideDrawer from '../components/SideDrawer';
import ThemeFooter from '../components/ThemeFooter';
import TopBar from '../components/TopBar';
import FilterBar from '../components/FilterBar';
import FaqSection from '../components/FaqSection';
import { categoryIntro } from '../content/categoryIntros';
import { faqsForCategory } from '../content/faqs';
import { productPath, setPageSeo, injectJsonLd, removeJsonLd, absoluteUrl, SITE_NAME } from '../utils/seo';
import { useCardAddToCart } from '../hooks/useCardAddToCart';
import { cardImage, cardSrcSet } from '../utils/cloudinary';
import './DynamicCategory.css';

const DynamicCategory = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { handleAddToCart } = useCardAddToCart();

  const [category, setCategory] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const intro = useMemo(() => (category ? categoryIntro(category) : ''), [category]);
  const categoryFaqs = useMemo(() => (category ? faqsForCategory(category) : []), [category]);

  useEffect(() => {
    if (!category) return;
    const path = `/category/${categorySlug}`;
    const desc = intro.slice(0, 160);
    setPageSeo({
      title: category.name,
      description:
        desc ||
        `Shop ${category.name} at ${SITE_NAME} — motorcycle guardian bells, biker boots, jackets, gloves and rider gear.`,
      path,
      image: category.image_url,
    });
    injectJsonLd('seo-breadcrumb-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: absoluteUrl('/all-products') },
        { '@type': 'ListItem', position: 3, name: category.name, item: absoluteUrl(path) },
      ],
    });
    return () => removeJsonLd('seo-breadcrumb-jsonld');
  }, [category, categorySlug, intro]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setCategoryLoading(true);
        setNotFound(false);
        const categoryData = await themeApi.getCategoryById(categorySlug);
        if (!categoryData || categoryData.error || categoryData.success === false) {
          setNotFound(true);
          setCategory(null);
          return;
        }
        setCategory(categoryData.data || categoryData);
      } catch (error) {
        setNotFound(true);
        setCategory(null);
      } finally {
        setCategoryLoading(false);
      }
    };

    if (categorySlug) fetchCategoryData();
  }, [categorySlug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      if (!categorySlug || notFound) return;
      try {
        setProductsLoading(true);
        const productsData = await themeApi.getProductsByCategory(categorySlug, {
          page: currentPage,
          limit: 12,
          search: debouncedSearchQuery,
          sort_by: sortBy,
          ...(priceMin !== '' && { min_price: priceMin }),
          ...(priceMax !== '' && { max_price: priceMax }),
        });
        if (cancelled) return;
        setFilteredProducts(productsData.products || []);
        setTotalPages(productsData.pagination?.pages || 1);
      } catch (error) {
        if (!cancelled) toast.error('Failed to load products');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, currentPage, debouncedSearchQuery, sortBy, priceMin, priceMax, notFound]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const setPriceRange = (range) => {
    setPriceMin(range?.min ?? '');
    setPriceMax(range?.max ?? '');
    setCurrentPage(1);
  };

  if (notFound) {
    navigate('/404', { replace: true });
    return null;
  }

  if (categoryLoading) {
    return (
      <div className="ct-loader-wrapper d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 fw-bold text-white">Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className="ct-category-page-wrapper">
      <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        priceRange={{ min: priceMin, max: priceMax }}
        setPriceRange={setPriceRange}
        onApplyFilters={() => setCurrentPage(1)}
      />

      <div className="container py-5">
        {category && (
          <header className="mb-4">
            <nav className="mb-2" aria-label="Breadcrumb" style={{ fontSize: '0.9rem', opacity: 0.85 }}>
              <Link to="/" className="text-decoration-none" style={{ color: 'var(--brand-primary)' }}>
                Home
              </Link>
              {' › '}
              <Link to="/all-products" className="text-decoration-none" style={{ color: 'var(--brand-primary)' }}>
                Shop
              </Link>
              {' › '}
              <span className="text-white">{category.name}</span>
            </nav>
            <h1 className="text-white fw-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              {category.name}
            </h1>
            <p className="text-white-50 mb-0" style={{ maxWidth: '52rem', lineHeight: 1.65, color: '#cbd5e1' }}>
              {intro}
            </p>
            <p className="mt-2 mb-0">
              <Link to="/size-guide" style={{ color: 'var(--brand-primary)' }}>
                Size Guide
              </Link>
              {' · '}
              <Link to="/shipping-policy" style={{ color: 'var(--brand-primary)' }}>
                Shipping Policy
              </Link>
              {' · '}
              <Link to="/faq" style={{ color: 'var(--brand-primary)' }}>
                FAQ
              </Link>
            </p>
          </header>
        )}

        {productsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 fw-bold text-muted">Loading products…</p>
          </div>
        ) : (
          <div className={`product-grid-modern ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-5 no-results">
                <h3>No products found</h3>
                <p>Try adjusting your search filters.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className={`item-card ${viewMode === 'list' ? 'list-card' : ''}`}>
                  <div className="item-thumb" onClick={() => navigate(productPath(product))}>
                    <img
                      src={cardImage(product.images?.[0] || product.image_url) || product.images?.[0] || product.image_url || '/placeholder.png'}
                      srcSet={cardSrcSet(product.images?.[0] || product.image_url)}
                      sizes="(max-width: 768px) 45vw, 22vw"
                      width={300}
                      height={300}
                      loading="lazy"
                      decoding="async"
                      alt={product.name}
                    />
                    {product.discount_price && product.discount_price < product.price && (
                      <div className="discount-badge-image">
                        -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                      </div>
                    )}
                    {product.reviewCount > 0 ? (
                      <div
                        className="rating-badge-image"
                        title={`${product.averageRating} from ${product.reviewCount} review${product.reviewCount === 1 ? '' : 's'}`}
                      >
                        <FaStar className="rating-badge-star" />
                        <span className="rating-badge-score">{product.averageRating}</span>
                        <span className="rating-badge-count">({product.reviewCount})</span>
                      </div>
                    ) : null}
                    <div className="item-overlay">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="circle-btn"
                      >
                        <FaShoppingCart />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(productPath(product));
                        }}
                        className="circle-btn"
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </div>

                  <div className="item-details">
                    <div className="item-meta">
                      <h5 className="item-name" title={product.name}>
                        {product.name}
                      </h5>
                      <div className="item-pricing">
                        {product.discount_price && product.discount_price < product.price ? (
                          <>
                            <span className="price-original">${product.price}</span>
                            <span className="price-now">${product.discount_price}</span>
                          </>
                        ) : (
                          <span className="price-now">${product.price}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="card-buy-btn"
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        Add to Cart
                      </button>
                    </div>
                    <div className="item-inline-actions">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="circle-btn item-inline-btn"
                      >
                        <FaShoppingCart />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(productPath(product));
                        }}
                        className="circle-btn item-inline-btn"
                      >
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {totalPages > 1 && !productsLoading && (
          <div className="ct-pagination-wrapper mt-5">
            <button
              className="ct-page-nav-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <div className="ct-page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`ct-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="ct-page-nav-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {categoryFaqs.length > 0 && (
        <FaqSection faqs={categoryFaqs} title={`FAQ about ${category?.name || 'this category'}`} />
      )}

      <ThemeFooter />
    </div>
  );
};

export default DynamicCategory;
