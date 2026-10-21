import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { SIZE_GUIDE } from '../content/sizeGuide';
import { setPageSeo, SITE_NAME } from '../utils/seo';
import '../assets/css/InfoPages.css';

const SizeGuide = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Size Guide',
      description: SIZE_GUIDE.description,
      path: '/size-guide',
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
          <p className="info-eyebrow">Fit</p>
          <h1 className="info-title">
            Size <span>Guide</span>
          </h1>
          <p className="info-lead">{SIZE_GUIDE.description}</p>

          {SIZE_GUIDE.sections.map((s) => (
            <div key={s.h2} className="info-card mb-3">
              <h2 className="info-card-title">{s.h2}</h2>
              <p className="info-body mb-0">{s.body}</p>
            </div>
          ))}

          <p className="info-body mt-4 mb-0">
            Still unsure?{' '}
            <Link to="/contact" className="info-link">
              Contact {SITE_NAME}
            </Link>{' '}
            or read the{' '}
            <Link to="/faq" className="info-link">
              FAQ
            </Link>
            .
          </p>
        </motion.div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default SizeGuide;
