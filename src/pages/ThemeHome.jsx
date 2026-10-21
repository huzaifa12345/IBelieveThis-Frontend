import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaSearch, FaShoppingCart, 
    FaArrowRight, FaStar, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { themeApi } from '../services/themeApi';
import websiteSettingsApi from '../services/websiteSettingsApi';
import toast from 'react-hot-toast';
import TopBar from '../components/TopBar'; 
import ThemeFooter from '../components/ThemeFooter';
import { productPath, categoryPath, setPageSeo, injectJsonLd, removeJsonLd, SITE_NAME, SITE_URL, SITE_TAGLINE, buildOrganizationSchema } from '../utils/seo';
import { cardImage, cardSrcSet, heroImage, heroSrcSet } from '../utils/cloudinary';
import { useCardAddToCart } from '../hooks/useCardAddToCart';
import { useStoreSettings } from '../hooks/useStoreSettings';

import '../assets/css/ThemeHome.css';

const SideDrawer = lazy(() => import('../components/SideDrawer'));

const DEFAULT_HERO = {
  image: '',
  title: 'Biker Gear & Motorcycle Guardian Bells | IBelieveThis',
  description: 'Motorcycle guardian bells, biker boots, jackets and riding gloves. Ships from the USA.',
};

function readBootstrapHero() {
  if (typeof window === 'undefined') return null;
  const boot = window.__HERO_BOOTSTRAP__;
  if (boot?.image) {
    return {
      image: boot.image,
      title: boot.title || DEFAULT_HERO.title,
      description: boot.description || DEFAULT_HERO.description,
    };
  }
  return null;
}

function slidesFromHeroSettings(heroSettings) {
  const slides = [];
  for (let i = 1; i <= 4; i++) {
    const imageSetting = heroSettings.find((s) => s.key === `hero_slide_${i}`);
    const titleSetting = heroSettings.find((s) => s.key === `hero_title_${i}`);
    const descSetting = heroSettings.find((s) => s.key === `hero_description_${i}`);
    if (imageSetting?.value) {
      slides.push({
        image: imageSetting.value,
        title: titleSetting?.value || `Slide ${i}`,
        description: descSetting?.value || '',
      });
    }
  }
  return slides;
}

const ThemeHome = () => {
    const navigate = useNavigate();
    const { handleAddToCart } = useCardAddToCart();
    const { settings } = useStoreSettings();
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroReady, setHeroReady] = useState(false);
    const [heroSlides, setHeroSlides] = useState(() => {
      const boot = readBootstrapHero();
      return boot ? [boot] : [DEFAULT_HERO];
    });

    useEffect(() => {
        setPageSeo({
            title: 'Biker Gear & Motorcycle Guardian Bells | IBelieveThis',
            description: SITE_TAGLINE,
            path: '/',
        });

        injectJsonLd('seo-org-jsonld', buildOrganizationSchema(settings));

        injectJsonLd('seo-website-jsonld', {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            inLanguage: 'en-US',
            potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/all-products?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        });

        return () => {
            removeJsonLd('seo-org-jsonld');
            removeJsonLd('seo-website-jsonld');
        };
    }, [settings]);

    // Hero settings — do not block first paint if bootstrap image exists
    useEffect(() => {
        let cancelled = false;
        const fetchHeroSlides = async () => {
            try {
                const response = await websiteSettingsApi.getWebsiteSettings();
                if (cancelled) return;
                if (response.success && response.data?.hero) {
                    const slides = slidesFromHeroSettings(response.data.hero);
                    if (slides.length > 0) {
                        setHeroSlides(slides);
                        return;
                    }
                }
                if (!readBootstrapHero()?.image) {
                    setHeroSlides([DEFAULT_HERO]);
                }
            } catch (error) {
                console.error('Error fetching hero slides:', error);
            }
        };
        fetchHeroSlides();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleNextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.max(heroSlides.length, 1));
    }, [heroSlides.length]);

    const handlePrevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % Math.max(heroSlides.length, 1));
    }, [heroSlides.length]);

    // Auto-advance only after LCP image has painted
    useEffect(() => {
        if (!heroReady || heroSlides.length < 2) return undefined;
        const interval = setInterval(handleNextSlide, 6000);
        return () => clearInterval(interval);
    }, [heroReady, heroSlides.length, handleNextSlide]);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                setCatalogLoading(true);
                const categoriesData = await themeApi.getCategories();
                if (cancelled || !categoriesData || !Array.isArray(categoriesData)) return;

                const activeCategories = categoriesData.filter((cat) => cat.is_active);
                setCategories(activeCategories);

                const productsData = {};
                await Promise.all(
                    activeCategories.map(async (category) => {
                        const response = await themeApi.getProductsByCategory(category.id);
                        const products = response.products || response || [];
                        productsData[category.id] = products.slice(0, 4);
                    })
                );
                if (!cancelled) setProductsByCategory(productsData);
            } catch (error) {
                console.error('Error:', error);
                if (!cancelled) toast.error('Failed to load products');
            } finally {
                if (!cancelled) setCatalogLoading(false);
            }
        };
        fetchData();
        return () => {
            cancelled = true;
        };
    }, []);

    const slide = heroSlides[currentSlide] || heroSlides[0] || DEFAULT_HERO;
    const isFirstPaintSlide = currentSlide === 0;
    const heroSrc = heroImage(slide.image, 800) || slide.image;
    const heroSet = slide.image ? heroSrcSet(slide.image) : undefined;

    return (
        <div className="home-modern-layout">
            <TopBar 
                onMenuToggle={() => setSideDrawerOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) navigate(`/all-products?search=${searchQuery}`);
                }}
            />

            <section className="hero-wrapper">
                <div className="container position-relative">
                    {heroSlides.length > 1 && (
                      <>
                        <button type="button" className="slider-arrow prev-arrow" onClick={handlePrevSlide} aria-label="Previous slide">
                            <FaChevronLeft />
                        </button>
                        <button type="button" className="slider-arrow next-arrow" onClick={handleNextSlide} aria-label="Next slide">
                            <FaChevronRight />
                        </button>
                      </>
                    )}

                    <div className="hero-grid">
                        <div className="hero-info-col">
                            <span className="hero-tag">Premium Quality • Professional Grade</span>
                            <h1 className="hero-title">
                              {(slide.title || '').replace(/Charlie Bells/gi, 'IBelieveThis')}
                            </h1>
                            <p className="hero-desc">
                              {(slide.description || '').replace(/Charlie Bells/gi, 'IBelieveThis')}
                            </p>
                            <div className="hero-btns">
                                <Link to="/all-products" className="btn-main">Shop Now <FaArrowRight /></Link>
                                <Link to="/all-products" className="btn-sec">View Catalog</Link>
                            </div>
                        </div>

                        <div className="hero-visual-col">
                            <div className="image-frame">
                                {/* Plain <img> — no fade/scale animation (delays LCP) */}
                                {heroSrc ? (
                                  <img
                                    key={slide.image || currentSlide}
                                    src={heroSrc}
                                    srcSet={heroSet}
                                    sizes="100vw"
                                    alt={slide.title || 'IBelieveThis hero'}
                                    width={1200}
                                    height={800}
                                    fetchPriority={isFirstPaintSlide ? 'high' : 'auto'}
                                    loading={isFirstPaintSlide ? 'eager' : 'lazy'}
                                    decoding="async"
                                    className="hero-img"
                                    onLoad={() => {
                                      if (isFirstPaintSlide) setHeroReady(true);
                                    }}
                                  />
                                ) : (
                                  <div className="hero-img hero-img-placeholder" aria-hidden="true" />
                                )}
                                <div className="floating-badge">
                                    <FaStar /> <span>Ships from the USA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {heroSlides.length > 1 && (
                      <div className="hero-dots">
                          {heroSlides.map((_, i) => (
                              <button
                                type="button"
                                key={i}
                                className={`dot ${i === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                              />
                          ))}
                      </div>
                    )}
                </div>
            </section>

            <section className="content-area container">
                {catalogLoading ? (
                  <div className="home-catalog-skeleton" aria-busy="true" aria-label="Loading products">
                    <div className="home-skel-block" />
                    <div className="home-skel-block" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="category-group">
                        <div className="group-header">
                            <div>
                                <h2 className="group-title">
                                  <Link to={categoryPath(category)} className="text-decoration-none" style={{ color: 'inherit' }}>
                                    {category.name}
                                  </Link>
                                </h2>
                                <div className="title-line"></div>
                            </div>
                            <Link to={categoryPath(category)} className="view-link">Explore All</Link>
                        </div>

                        <div className="product-grid-modern">
                            {productsByCategory[category.id]?.map((product) => {
                              const img = product.images?.[0] || product.image_url;
                              return (
                                <div key={product.id} className="item-card">
                                    <div className="item-thumb">
                                        <img
                                          src={cardImage(img) || img || '/placeholder.png'}
                                          srcSet={cardSrcSet(img)}
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
                                            <div className="rating-badge-image" title={`${product.averageRating} from ${product.reviewCount} review${product.reviewCount === 1 ? '' : 's'}`}>
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
                                            <button type="button" onClick={() => navigate(productPath(product))} className="circle-btn"><FaSearch /></button>
                                        </div>
                                    </div>
                                    <div className="item-details">
                                        <h3 className="item-name">{product.name}</h3>
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
                                        <button type="button" onClick={(e) => handleAddToCart(product, e)} className="card-buy-btn">Add to Cart</button>
                                    </div>
                                </div>
                              );
                            })}
                        </div>
                    </div>
                  ))
                )}
            </section>

            <ThemeFooter />
            {sideDrawerOpen ? (
              <Suspense fallback={null}>
                <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
              </Suspense>
            ) : null}
        </div>
    );
};

export default ThemeHome;
