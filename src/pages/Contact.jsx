import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { setPageSeo, SITE_NAME, SITE_URL } from '../utils/seo';
import '../assets/css/InfoPages.css';

const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const Contact = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const { get } = useStoreSettings();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    order_number: '',
    message: '',
  });

  const email = get('contact_email', '');
  const phone = get('contact_phone', '');
  const address = get('contact_address', '');
  const hours = get('business_hours', 'Mon–Fri, 9am–5pm US Eastern');
  const reply = get('reply_time', 'We typically reply within 1–2 business days.');
  const returnDays = get('return_window_days', '7');

  useEffect(() => {
    setPageSeo({
      title: 'Contact',
      description: `Contact ${SITE_NAME} for orders, sizing help, and motorcycle gear questions.`,
      path: '/contact',
    });
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${apiBase}/contact`, form);
      toast.success(data.message || 'Message sent!');
      setForm({ name: '', email: '', order_number: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Could not send message');
    } finally {
      setSubmitting(false);
    }
  };

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
            Questions about motorcycle gear, sizing, shipping, or a recent order? Send a message —
            {reply ? ` ${reply}` : ' we will get back to you soon.'}
          </p>

          <div className="row g-4 mt-1">
            <div className="col-lg-7">
              <form className="info-card" onSubmit={onSubmit}>
                <h2 className="info-card-title">Send a message</h2>
                <div className="mb-3">
                  <label className="form-label text-white">Name *</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    minLength={2}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Order number (optional)</label>
                  <input
                    className="form-control"
                    name="order_number"
                    value={form.order_number}
                    onChange={onChange}
                    placeholder="e.g. ORD-12345"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label text-white">Message *</label>
                  <textarea
                    className="form-control"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={onChange}
                    required
                    minLength={10}
                  />
                </div>
                <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </form>
            </div>

            <div className="col-lg-5">
              <div className="info-card mb-3">
                <h2 className="info-card-title">Support</h2>
                {email ? (
                  <p className="info-body mb-2">
                    Email:{' '}
                    <a className="info-link" href={`mailto:${email}`}>
                      {email}
                    </a>
                  </p>
                ) : (
                  <p className="info-body mb-2" style={{ opacity: 0.8 }}>
                    Support email: add in Admin → Settings → contact
                  </p>
                )}
                {phone ? <p className="info-body mb-2">Phone: {phone}</p> : null}
                {address ? <p className="info-body mb-2">Address: {address}</p> : null}
                <p className="info-body mb-2">Hours: {hours}</p>
                <p className="info-body mb-0">{reply}</p>
              </div>
              <div className="info-card">
                <h2 className="info-card-title">Quick links</h2>
                <ul className="info-list">
                  <li>
                    <Link to="/return-policy" className="info-link">
                      {returnDays}-day return &amp; exchange
                    </Link>
                  </li>
                  <li>
                    <Link to="/shipping-policy" className="info-link">
                      Shipping policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="info-link">
                      About {SITE_NAME}
                    </Link>
                  </li>
                  <li>
                    <a className="info-link" href={SITE_URL}>
                      {SITE_URL.replace('https://', '')}
                    </a>
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
