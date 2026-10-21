import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { setPageSeo, SITE_NAME, SITE_URL } from '../utils/seo';
import '../assets/css/InfoPages.css';

const Contact = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Contact',
      description: `Contact ${SITE_NAME} for orders, sizing help, and motorcycle gear questions. US biker apparel and guardian bells.`,
      path: '/contact',
    });
  }, []);

  return (
    <div className="info-page-wrapper">
      <header className="modern-header">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </header>

      <section className="container py-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="info-eyebrow">Get in touch</p>
          <h1 className="info-title">
            Contact <span>{SITE_NAME}</span>
          </h1>
          <p className="info-lead">
            Questions about motorcycle gear, sizing, shipping, or a recent order? We are here to help.
          </p>

          <div className="row g-4 mt-1">
            <div className="col-md-6">
              <div className="info-card h-100">
                <h2 className="info-card-title">Store</h2>
                <p className="info-body mb-2">
                  Website:{' '}
                  <a className="info-link" href={SITE_URL}>
                    {SITE_URL.replace('https://', '')}
                  </a>
                </p>
                <p className="info-body mb-0">
                  Also on{' '}
                  <a
                    className="info-link"
                    href="https://www.etsy.com/shop/IBelieveThis"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Etsy
                  </a>
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="info-card h-100">
                <h2 className="info-card-title">Policies</h2>
                <ul className="info-list">
                  <li>
                    <Link to="/return-policy" className="info-link">
                      7-day return &amp; exchange policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="info-link">
                      About {SITE_NAME}
                    </Link>
                  </li>
                  <li>
                    <Link to="/all-products" className="info-link">
                      Shop all products
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default Contact;
