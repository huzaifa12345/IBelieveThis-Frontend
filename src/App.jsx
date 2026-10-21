import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LogoProvider } from './context/LogoContext';
import { CardAddToCartProvider } from './context/CardAddToCartContext';

import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/theme-fixes.css';

import ThemeHome from './pages/ThemeHome';

const About = lazy(() => import('./pages/About'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const Faq = lazy(() => import('./pages/Faq'));
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const GuidesIndex = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuidesIndex })));
const GuideArticle = lazy(() => import('./pages/Guides').then((m) => ({ default: m.GuideArticle })));
const DynamicCategory = lazy(() => import('./pages/DynamicCategory'));
const ThemeProductDetail = lazy(() => import('./pages/ThemeProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const AllProducts = lazy(() => import('./pages/AllProducts'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/Admin'));

const RouteFallback = () => null;

const PrivacyPolicy = () => <PolicyPage type="privacy" />;
const TermsOfService = () => <PolicyPage type="terms" />;
const ShippingPolicy = () => <PolicyPage type="shipping" />;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LogoProvider>
          <Router>
            <CardAddToCartProvider>
              <div className="App">
                <main>
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
                      <Route path="/faq" element={<Faq />} />
                      <Route path="/size-guide" element={<SizeGuide />} />
                      <Route path="/guides" element={<GuidesIndex />} />
                      <Route path="/guides/:slug" element={<GuideArticle />} />
                      <Route path="/return-policy" element={<ReturnPolicy />} />
                      <Route path="/refund-policy" element={<ReturnPolicy />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/shipping-policy" element={<ShippingPolicy />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/all-products" element={<AllProducts />} />
                      <Route path="/product/:slug" element={<ThemeProductDetail />} />
                      <Route path="/category/:categorySlug" element={<DynamicCategory />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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
            </CardAddToCartProvider>
          </Router>
        </LogoProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
