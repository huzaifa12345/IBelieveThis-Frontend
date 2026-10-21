import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LogoProvider } from './context/LogoContext';

import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/theme-fixes.css';

/** Home is eager — avoids Suspense "Loading…" then ThemeHome loader (double flash) */
import ThemeHome from './pages/ThemeHome';

/** Public storefront — code-split so admin/Stripe stay out of the main chunk */
const About = lazy(() => import('./pages/About'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const DynamicCategory = lazy(() => import('./pages/DynamicCategory'));
const ThemeProductDetail = lazy(() => import('./pages/ThemeProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const AllProducts = lazy(() => import('./pages/AllProducts'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Heavy / private — never in the public critical path */
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));

/** Minimal fallback — pages that have their own loader won't feel double-loaded */
const RouteFallback = () => null;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LogoProvider>
          <Router>
            <div className="App">
              <main>
                <AnimatePresence mode="wait">
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<ThemeHome />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/change-password" element={<ChangePassword />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/return-policy" element={<ReturnPolicy />} />
                      <Route path="/refund-policy" element={<ReturnPolicy />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/all-products" element={<AllProducts />} />
                      <Route path="/product/:slug" element={<ThemeProductDetail />} />
                      <Route path="/category/:categorySlug" element={<DynamicCategory />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </main>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { background: '#363636', color: '#fff' },
                success: {
                  duration: 3000,
                  iconTheme: { primary: '#22c55e', secondary: '#fff' },
                },
                error: {
                  duration: 5000,
                  iconTheme: { primary: '#ff4b4b', secondary: '#fff' },
                },
              }}
            />
          </Router>
        </LogoProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
