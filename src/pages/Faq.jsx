import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { FaqAnswerText } from '../components/FaqSection';
import { SITE_FAQS, toFaqPageSchema } from '../content/faqs';
import { setPageSeo, injectJsonLd, removeJsonLd, SITE_NAME } from '../utils/seo';
import '../assets/css/InfoPages.css';

const Faq = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'FAQ',
      description: `Answers about guardian bells, sizing, shipping, returns, care, and contacting ${SITE_NAME}.`,
      path: '/faq',
    });
    injectJsonLd('seo-faq-jsonld', toFaqPageSchema(SITE_FAQS));
    return () => removeJsonLd('seo-faq-jsonld');
  }, []);

  return (
    <div className="info-page-wrapper">
      <header className="modern-header">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </header>

      <section className="container py-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="info-eyebrow">Help</p>
          <h1 className="info-title">
            Frequently Asked <span>Questions</span>
          </h1>
          <p className="info-lead">
            Short answers for US riders. Shipping rates and tax are calculated at checkout — see the{' '}
            <Link to="/shipping-policy" className="info-link">
              Shipping Policy
            </Link>{' '}
            and{' '}
            <Link to="/return-policy" className="info-link">
              Return &amp; Exchange Policy
            </Link>{' '}
            for rules, or{' '}
            <Link to="/contact" className="info-link">
              Contact
            </Link>{' '}
            us with order questions.
          </p>

          {SITE_FAQS.map((f) => (
            <article key={f.q} className="info-card mb-3">
              <h2 className="info-card-title" style={{ fontSize: '1.15rem' }}>
                {f.q}
              </h2>
              <FaqAnswerText text={f.a} />
            </article>
          ))}

          <p className="info-body mt-4 mb-0">
            <Link to="/size-guide" className="info-link">
              Size Guide
            </Link>
            {' · '}
            <Link to="/guides" className="info-link">
              Guides
            </Link>
            {' · '}
            <Link to="/contact" className="info-link">
              Contact
            </Link>
          </p>
        </motion.div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default Faq;
