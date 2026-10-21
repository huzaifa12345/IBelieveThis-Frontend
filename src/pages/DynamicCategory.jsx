import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaStar } from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import SideDrawer from '../components/SideDrawer';
import ThemeFooter from '../components/ThemeFooter';
import TopBar from '../components/TopBar';
import FilterBar from '../components/FilterBar';
import { productPath, setPageSeo, injectJsonLd, removeJsonLd, absoluteUrl, SITE_NAME } from '../utils/seo';
import { addProductFromCard } from '../utils/cartHelpers';
import './DynamicCategory.css';

const DynamicCategory = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

  useEffect(() => {
    if (!category) return;
    const path = `/category/${categorySlug}`;
    setPageSeo({
      title: category.name,
      description:
        category.description ||
        `Shop ${category.name} at ${SITE_NAME} — motorcycle guardian bells, biker boots, jackets, gloves and rider gear.`,
      path,
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
  }, [category, categorySlug]);

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

  const handleAddToCart = (product) => {
    addProductFromCard(product, { addToCart, navigate, toast, productPath });
  };

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
                      src={product.images?.[0] || product.image_url || '/placeholder.png'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="circle-btn"
                      >
                        <FaShoppingCart />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(productPath(product))}
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
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                    <div className="item-inline-actions">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="circle-btn item-inline-btn"
                      >
                        <FaShoppingCart />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(productPath(product))}
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

      <ThemeFooter />
    </div>
  );
};

export default DynamicCategory;
