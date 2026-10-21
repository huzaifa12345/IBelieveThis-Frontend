import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  X, Home, ShoppingBag, User, LogOut,
  LayoutDashboard, Info, RotateCcw, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import { isStaff } from '../utils/roles';
import { useState, useEffect } from 'react';
import { themeApi } from '../services/themeApi';
import { SITE_NAME } from '../utils/seo';
import '../assets/css/SideDrawer.css';

const SideDrawer = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { websiteLogo } = useLogo();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await themeApi.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="side-drawer-container"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="drawer-header">
              <div className="header-brand">
                <span className="menu-title">{SITE_NAME}</span>
                <span className="menu-subtitle">Motorcycle Gear</span>
              </div>
              <button type="button" className="close-btn" onClick={onClose} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <label className="section-label">Main Menu</label>
                <Link to="/" className="drawer-link" onClick={onClose}>
                  <Home className="nav-icon" size={18} /> Home
                </Link>
                <Link to="/all-products" className="drawer-link" onClick={onClose}>
                  <ShoppingBag className="nav-icon" size={18} /> Shop Products
                </Link>
                <Link to="/cart" className="drawer-link" onClick={onClose}>
                  <ShoppingCart className="nav-icon" size={18} /> Cart
                </Link>
                <Link to="/about" className="drawer-link" onClick={onClose}>
                  <Info className="nav-icon" size={18} /> About Us
                </Link>
                <Link to="/return-policy" className="drawer-link" onClick={onClose}>
                  <RotateCcw className="nav-icon" size={18} /> Return Policy
                </Link>
              </div>

              {categories.length > 0 && (
                <div className="drawer-section">
                  <label className="section-label">Product Categories</label>
                  <ul className="cat-list">
                    {categories.map((category) => (
                      <li
                        key={category.id}
                        className="cat-item"
                        onClick={() => {
                          navigate(`/category/${category.id}`);
                          onClose();
                        }}
                      >
                        <span className="cat-name">{category.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="drawer-section">
                <label className="section-label">Account</label>
                {isStaff(user) && (
                  <Link to="/admin" className="drawer-link admin-link" onClick={onClose}>
                    <LayoutDashboard className="nav-icon" size={18} /> Admin Dashboard
                  </Link>
                )}
                {user ? (
                  <button type="button" className="drawer-btn logout-btn" onClick={handleLogout}>
                    <LogOut className="nav-icon" size={18} /> Logout
                  </button>
                ) : (
                  <Link to="/login" className="drawer-link" onClick={onClose}>
                    <User className="nav-icon" size={18} /> Login / Register
                  </Link>
                )}
              </div>
            </div>

            <div className="drawer-footer">
              {websiteLogo ? (
                <img src={websiteLogo} alt={SITE_NAME} className="footer-mini-logo" />
              ) : null}
              <p className="copyright-text">© 2026 {SITE_NAME}</p>
              <p className="codebase-tag">
                Powered by <span>CodeBase Solutions</span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideDrawer;
