import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import { setPageSeo, SITE_NAME } from '../utils/seo';
import '../assets/css/InfoPages.css';

const NotFound = () => {
  useEffect(() => {
    setPageSeo({
      title: 'Page Not Found',
      description: `The page you requested was not found on ${SITE_NAME}.`,
      path: '/404',
      noindex: true,
    });
  }, []);

  return (
    <div className="info-page-wrapper">
      <TopBar onMenuToggle={() => {}} />
      <section className="container py-5 text-center" style={{ maxWidth: 640 }}>
        <p className="info-eyebrow">404</p>
        <h1 className="info-title">Page not found</h1>
        <p className="info-lead">
          This URL does not match a product, category, or page in our store.
        </p>
        <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
          <Link to="/" className="btn btn-primary px-4">
            Go Home
          </Link>
          <Link to="/all-products" className="btn btn-outline-light px-4">
            Shop Products
          </Link>
        </div>
      </section>
      <ThemeFooter />
    </div>
  );
};

export default NotFound;
