import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { setPageSeo, SITE_NAME } from '../utils/seo';
import '../assets/css/InfoPages.css';

const META = {
  privacy: {
    title: 'Privacy Policy',
    path: '/privacy-policy',
    key: 'policy_privacy',
    description: `Privacy Policy for ${SITE_NAME} — how we handle customer data, cookies, and Stripe payments.`,
  },
  terms: {
    title: 'Terms of Service',
    path: '/terms-of-service',
    key: 'policy_terms',
    description: `Terms of Service for shopping at ${SITE_NAME}.`,
  },
  shipping: {
    title: 'Shipping Policy',
    path: '/shipping-policy',
    key: 'policy_shipping',
    description: `Shipping, processing times, carriers and tracking for ${SITE_NAME}.`,
  },
};

const PolicyPage = ({ type }) => {
  const meta = META[type] || META.privacy;
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const { get, loading } = useStoreSettings();
  const body = get(meta.key, '');
  const email = get('contact_email', '');
  const phone = get('contact_phone', '');
  const address = get('contact_address', '');

  useEffect(() => {
    setPageSeo({
      title: meta.title,
      description: meta.description,
      path: meta.path,
    });
  }, [meta]);

  return (
    <div className="info-page-wrapper">
      <header className="modern-header">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </header>

      <section className="container py-5" style={{ maxWidth: 860 }}>
        <p className="info-eyebrow">Legal</p>
        <h1 className="info-title">
          {meta.title.split(' ')[0]} <span>{meta.title.split(' ').slice(1).join(' ')}</span>
        </h1>

        {loading ? (
          <p className="info-body">Loading…</p>
        ) : (
          <div className="info-card policy-body">
            <pre className="policy-pre">{body || 'Content coming soon. Please check back shortly.'}</pre>
          </div>
        )}

        <div className="info-card mt-4">
          <h2 className="info-card-title">Questions?</h2>
          <p className="info-body mb-2">
            <Link to="/contact" className="info-link">
              Contact us
            </Link>
            {email ? (
              <>
                {' '}
                or email{' '}
                <a className="info-link" href={`mailto:${email}`}>
                  {email}
                </a>
              </>
            ) : null}
            .
          </p>
          {phone ? <p className="info-body mb-1">Phone: {phone}</p> : null}
          {address ? <p className="info-body mb-0">Address: {address}</p> : null}
          {!phone && !address ? (
            <p className="info-body mb-0" style={{ opacity: 0.75 }}>
              Phone and mailing address will appear here once added in Admin → Settings.
            </p>
          ) : null}
        </div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default PolicyPage;
