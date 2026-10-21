import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { SITE_NAME } from '../utils/seo';
import '../assets/css/InfoPages.css';

const ReturnPolicy = () => {
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
        >
          <p className="info-eyebrow">Customer Care</p>
          <h1 className="info-title">
            Return <span>&amp; Exchange Policy</span>
          </h1>
          <p className="info-lead">
            At {SITE_NAME}, we want you to love your gear. If something is not right, we offer a{' '}
            <strong>7-day money-back guarantee</strong> and exchange options on eligible orders.
          </p>

          <div className="row g-4 mt-1">
            <div className="col-md-6">
              <div className="info-card h-100">
                <h2 className="info-card-title">7-Day Money-Back Guarantee</h2>
                <p className="info-body">
                  You may request a refund within <strong>7 days</strong> of delivery if the item
                  is unused, undamaged, and in its original condition with tags and packaging
                  intact.
                </p>
                <ul className="info-list">
                  <li>Request must be submitted within 7 days of receiving your order</li>
                  <li>Item must not have been worn for riding, washed, or altered</li>
                  <li>All original tags, labels, and packaging should be included</li>
                  <li>Approved refunds are issued to the original payment method</li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="info-card h-100">
                <h2 className="info-card-title">Exchanges</h2>
                <p className="info-body">
                  Need a different size or style? We offer exchanges within the same{' '}
                  <strong>7-day window</strong>, subject to stock availability.
                </p>
                <ul className="info-list">
                  <li>Exchange for size or an available alternate item of equal value</li>
                  <li>If the new item costs more, you pay the difference</li>
                  <li>If it costs less, we refund the difference after inspection</li>
                  <li>Exchanges follow the same condition rules as returns</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="info-card mt-4">
            <h2 className="info-card-title">How to Start a Return or Exchange</h2>
            <ol className="info-steps">
              <li>
                Contact us within 7 days of delivery with your order number and reason for return
                or exchange.
              </li>
              <li>
                Wait for approval and return instructions. Do not ship items back without
                confirmation.
              </li>
              <li>
                Pack the item securely in its original packaging and ship it as directed.
              </li>
              <li>
                Once we receive and inspect the item, we process your refund or ship the exchange.
              </li>
            </ol>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <div className="info-card h-100">
                <h2 className="info-card-title">Non-Returnable Items</h2>
                <ul className="info-list">
                  <li>Items returned after the 7-day window</li>
                  <li>Used, worn, damaged, or altered products</li>
                  <li>Items missing tags, accessories, or original packaging</li>
                  <li>Final-sale or clearance items marked as non-returnable</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="info-card h-100">
                <h2 className="info-card-title">Shipping &amp; Timing</h2>
                <ul className="info-list">
                  <li>Return shipping costs may be the customer&apos;s responsibility unless the item arrived damaged or incorrect</li>
                  <li>Inspection typically completes within a few business days of receipt</li>
                  <li>Refunds can take additional time to appear on your statement depending on your bank</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="info-body mt-4 mb-0">
            Questions? Reach out through our{' '}
            <Link to="/about" className="info-link">
              About
            </Link>{' '}
            page or shop contact options — we are happy to help you complete a smooth return or
            exchange.
          </p>
        </motion.div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default ReturnPolicy;
