import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import { useState } from 'react';
import SideDrawer from '../components/SideDrawer';
import { SITE_NAME } from '../utils/seo';
import '../assets/css/InfoPages.css';

const About = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  return (
    <div className="info-page-wrapper">
      <header className="modern-header">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
        <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />
      </header>

      <section className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="row g-4 align-items-start"
        >
          <div className="col-lg-7">
            <p className="info-eyebrow">Our Story</p>
            <h1 className="info-title">
              About <span>{SITE_NAME}</span>
            </h1>
            <p className="info-lead">
              {SITE_NAME} is a motorcycle lifestyle shop built for riders who want gear that looks sharp
              on the road and holds up for the long haul. From leather jackets and riding gloves to
              biker boots and everyday rider essentials, we curate pieces that blend classic biker
              style with real-world durability.
            </p>
            <p className="info-body">
              You can also find us on{' '}
              <a
                href="https://www.etsy.com/shop/IBelieveThis"
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                Etsy
              </a>
              — same brand, same focus: premium motorcycle apparel and accessories for men and women
              who ride with confidence.
            </p>
          </div>

          <div className="col-lg-5">
            <div className="info-card">
              <h2 className="info-card-title">What We Sell</h2>
              <ul className="info-list">
                <li>Leather motorcycle jackets &amp; riding outerwear</li>
                <li>Riding gloves built for grip, comfort, and style</li>
                <li>Biker boots &amp; lace-up riding footwear</li>
                <li>Rider-ready apparel and motorcycle lifestyle essentials</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-7">
            <h2 className="info-section-title">Built for the Ride</h2>
            <p className="info-body">
              Every collection is chosen with riders in mind — tough materials, clean finishes, and
              silhouettes that work whether you are on two wheels or off the bike. We focus on
              quality you can feel: solid stitching, reliable hardware, and designs that stay true
              to motorcycle culture.
            </p>
            <p className="info-body">
              Whether you are upgrading your weekend kit or searching for a statement piece,{' '}
              {SITE_NAME} is here to help you gear up with confidence.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="info-card">
              <h2 className="info-card-title">Why Riders Choose Us</h2>
              <ul className="info-list">
                <li>
                  <strong>Rider-first selection</strong> — jackets, gloves, boots, and more
                </li>
                <li>
                  <strong>Style that lasts</strong> — classic biker looks with everyday wearability
                </li>
                <li>
                  <strong>Clear policies</strong> —{' '}
                  <Link to="/return-policy" className="info-link">
                    7-day money-back &amp; exchange
                  </Link>
                </li>
                <li>
                  <strong>Direct support</strong> — shop online with care that feels personal
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="info-band">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-6">
              <h2 className="info-section-title">Our Vision</h2>
              <p className="info-body mb-0">
                To be a go-to destination for motorcycle apparel and gear — where style, toughness,
                and rider culture meet in every order.
              </p>
            </div>
            <div className="col-md-6">
              <h2 className="info-section-title">Our Promise</h2>
              <p className="info-body mb-0">
                Honest product details, careful packing, and support you can count on — from first
                click to the moment your gear arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default About;
