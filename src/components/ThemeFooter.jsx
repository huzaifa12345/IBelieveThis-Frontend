import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPinterestP, FaEtsy, FaArrowUp } from 'react-icons/fa';
import { useStoreSettings } from '../hooks/useStoreSettings';
import '../assets/css/Footer.css';

const Footer = () => {
  const { get } = useStoreSettings();
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socials = [
    { key: 'social_pinterest', href: get('social_pinterest'), className: 'pinterest', label: 'Pinterest', Icon: FaPinterestP },
    { key: 'social_etsy', href: get('social_etsy'), className: 'etsy', label: 'Etsy', Icon: FaEtsy },
    { key: 'social_instagram', href: get('social_instagram'), className: 'instagram', label: 'Instagram', Icon: FaInstagram },
    { key: 'social_facebook', href: get('social_facebook'), className: 'facebook', label: 'Facebook', Icon: FaFacebookF },
  ].filter((s) => s.href && s.href !== '#');

  const email = get('contact_email', '');
  const phone = get('contact_phone', '');

  return (
    <footer className="ts-simple-footer">
      <div className="ts-footer-middle">
        {socials.length > 0 && (
          <div className="ts-social-bar">
            {socials.map(({ key, href, className, label, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`ts-soc-btn ${className}`}
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        )}

        <nav className="ts-footer-links" aria-label="Footer">
          <Link to="/about" onClick={handleScrollTop}>About</Link>
          <Link to="/contact" onClick={handleScrollTop}>Contact</Link>
          <Link to="/shipping-policy" onClick={handleScrollTop}>Shipping Policy</Link>
          <Link to="/return-policy" onClick={handleScrollTop}>Return &amp; Exchange</Link>
          <Link to="/privacy-policy" onClick={handleScrollTop}>Privacy Policy</Link>
          <Link to="/terms-of-service" onClick={handleScrollTop}>Terms of Service</Link>
        </nav>

        {(email || phone) && (
          <p className="ts-footer-contact">
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
            {email && phone ? ' · ' : null}
            {phone ? <span>{phone}</span> : null}
          </p>
        )}

        <div className="ts-payment-row">
          <span className="ts-pay-badge">Visa</span>
          <span className="ts-pay-badge">Mastercard</span>
          <span className="ts-pay-badge">Amex</span>
          <span className="ts-pay-badge">Discover</span>
          <span className="ts-stripe-note">Secure checkout by Stripe</span>
        </div>
      </div>

      <div className="ts-bottom-wood-bar">
        <div className="ts-wood-bar-content">
          <p className="ts-copy-text">
            &copy; 2026 <b>IBelieveThis</b> - Designed by{' '}
            <Link to="https://codebasesln.com" target="_blank" rel="noopener noreferrer">
              <span className="ts-dev-text">CodeBase Solutions</span>
            </Link>
          </p>
          <button className="ts-wood-scroll-btn" onClick={handleScrollTop} aria-label="Scroll to top">
            <FaArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
