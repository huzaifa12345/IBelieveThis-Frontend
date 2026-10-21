import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { GUIDES, getGuide } from '../content/guides';
import {
  setPageSeo,
  injectJsonLd,
  removeJsonLd,
  absoluteUrl,
  SITE_NAME,
  SITE_URL,
} from '../utils/seo';
import '../assets/css/InfoPages.css';

export const GuidesIndex = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: 'Motorcycle Gear Guides',
      description: `Guides on guardian bells, hanging tips, and choosing biker boots from ${SITE_NAME}.`,
      path: '/guides',
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
          <p className="info-eyebrow">Learn</p>
          <h1 className="info-title">
            Motorcycle Gear <span>Guides</span>
          </h1>
          <p className="info-lead">
            Practical articles for US riders — guardian bell tradition, hanging tips, and boot fit basics.
          </p>
          <ul className="info-list">
            {GUIDES.map((g) => (
              <li key={g.slug} className="mb-3">
                <Link to={`/guides/${g.slug}`} className="info-link fw-bold">
                  {g.title}
                </Link>
                <p className="info-body mb-0 mt-1">{g.description}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export const GuideArticle = () => {
  const { slug } = useParams();
  const guide = getGuide(slug);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    if (!guide) return undefined;
    setPageSeo({
      title: guide.title,
      description: guide.description,
      path: `/guides/${guide.slug}`,
      type: 'article',
    });
    injectJsonLd('seo-article-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      datePublished: guide.datePublished,
      dateModified: guide.dateModified,
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/IBelieveThis.png` },
      },
      mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
    });
    return () => removeJsonLd('seo-article-jsonld');
  }, [guide]);

  if (!guide) return <Navigate to="/guides" replace />;

  return (
    <div className="info-page-wrapper">
      <header className="modern-header">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </header>

      <article className="container py-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="info-eyebrow">
            <Link to="/guides" className="info-link">
              Guides
            </Link>
          </p>
          <h1 className="info-title">{guide.title}</h1>
          <p className="info-lead">{guide.description}</p>
          <p className="info-body" style={{ opacity: 0.85 }}>
            By {SITE_NAME} · Updated {guide.dateModified}
          </p>

          {guide.sections.map((s) => (
            <section key={s.h2} className="mb-4">
              <h2 className="info-section-title">{s.h2}</h2>
              <p className="info-body">{s.body}</p>
            </section>
          ))}

          <h2 className="info-section-title">Related</h2>
          <ul className="info-list">
            {guide.relatedLinks.map((l) => (
              <li key={l.href}>
                <Link to={l.href} className="info-link">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/all-products" className="info-link">
                Shop all products
              </Link>
            </li>
          </ul>
        </motion.div>
      </article>

      <ThemeFooter />
    </div>
  );
};
