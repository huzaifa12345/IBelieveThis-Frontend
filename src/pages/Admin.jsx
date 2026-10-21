import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { themeApi } from '../services/themeApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../components/ProtectedRoute';
import ProductModal from '../components/ProductTypeModal';
import CategoryManagement from '../components/Admin/CategoryManagement';
import WebsiteSettings from '../components/Admin/WebsiteSettings';
import OrderManagement from '../components/Admin/OrderManagement';
import Dashboard from '../components/Admin/Dashboard';
import Products from '../components/Admin/ProductManagement';
import PaymentAudits from '../components/Admin/PaymentAudits';
import ShippingSettings from '../components/Admin/ShippingSettings';
import OrdersReport from '../components/Admin/OrdersReport';
import FailedEmails from '../components/Admin/FailedEmails';
import SizeManagement from '../components/Admin/SizeManagement';
import ReviewManagement from '../components/Admin/ReviewManagement';
import ContactMessages from '../components/Admin/ContactMessages';
import { isSuperAdmin } from '../utils/roles';

import { 
  LayoutDashboard, Package, Tags, Truck, 
  Settings, Menu, LogOut, Store, 
  Activity, Search, Trophy, ClipboardList, ShieldCheck,
  BarChart3, Mail, Ruler, Star, MessageSquare
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [productPage, setProductPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const ADMIN_PRODUCT_PAGE_SIZE = 20;
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nextSku, setNextSku] = useState('001');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category_id: '',
    stock_quantity: '', image_url: '', images: [], sizes: [], status: 'active', barcode: ''
  });

  const superAdmin = isSuperAdmin(user);

  const sidebarItems = [
    { id: 'dashboard', name: 'Analytics Hub', icon: LayoutDashboard },
    { id: 'products', name: 'Products Inventory', icon: Package }, 
    { id: 'categories', name: 'Categories', icon: Tags },
    { id: 'sizes', name: 'Sizes', icon: Ruler },
    { id: 'orders', name: 'Orders', icon: Truck },
    { id: 'orders-report', name: 'Orders Report', icon: BarChart3 },
    { id: 'shipping-settings', name: 'Shipping & Tax', icon: ClipboardList },
    { id: 'failed-emails', name: 'Failed Emails', icon: Mail },
    { id: 'reviews', name: 'Reviews', icon: Star },
    { id: 'contact-messages', name: 'Contact Inbox', icon: MessageSquare },
    ...(superAdmin ? [{ id: 'payment-audits', name: 'Payment Audit', icon: ShieldCheck }] : []),
    { id: 'website-settings', name: 'Settings', icon: Settings },
  ];

  const loadAdminProducts = async (page = 1, search = '') => {
    const productsRes = await themeApi.getProducts({
      page,
      limit: ADMIN_PRODUCT_PAGE_SIZE,
      include_inactive: true,
      ...(search.trim() ? { search: search.trim() } : {}),
    });
    setProducts(productsRes.products || []);
    const pagination = productsRes.pagination || {
      page,
      pages: 1,
      total: productsRes.products?.length || 0,
      limit: ADMIN_PRODUCT_PAGE_SIZE,
    };
    setProductPagination(pagination);
    setProductPage(pagination.page || page);
    return productsRes;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) { setLoading(false); return; }
      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          loadAdminProducts(1),
          themeApi.getCategories(),
          themeApi.getAllOrders({ limit: 500 })
        ]);
        setCategories(categoriesRes || []);
        setOrders(ordersRes.orders || []);
        setStats({
          totalProducts: productsRes.pagination?.total ?? productsRes.products?.length ?? 0,
          totalOrders: ordersRes.pagination?.total ?? ordersRes.orders?.length ?? 0,
          totalRevenue: ordersRes.orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0,
        });
      } catch (error) {
        toast.error('System Error: Data sync failed');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user, isAuthenticated]);

  const handleProductPageChange = async (nextPage) => {
    if (nextPage < 1 || nextPage > (productPagination.pages || 1)) return;
    try {
      await loadAdminProducts(nextPage, searchTerm);
    } catch (error) {
      toast.error('Failed to load products page');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '', description: '', price: '', category_id: '',
      stock_quantity: '', sizes: [], status: 'active', barcode: '',
    });
    setUploadedImages([]);
    fetchNextSku();
    setShowProductForm(true);
  };

  const fetchNextSku = async () => {
    try {
      const skuData = await themeApi.getNextSKU();
      setNextSku(skuData.sku || '001');
    } catch (error) { setNextSku('001'); }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      status: product.is_active ? 'active' : 'inactive',
    });
    setUploadedImages(Array.isArray(product.images) ? product.images : []);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to archive this formulation?")) {
      try {
        await themeApi.deleteProduct(id);
        toast.success('Product removed from active inventory');
        const productsRes = await loadAdminProducts(productPage, searchTerm);
        setStats((prev) => ({
          ...prev,
          totalProducts: productsRes.pagination?.total ?? Math.max(0, (prev.totalProducts || 1) - 1),
        }));
      } catch (error) {
        console.error("Delete Error:", error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (files.length > 10) {
      toast.error('Maximum 10 images per upload');
      return;
    }
    setUploadingImages(true);
    try {
      const result = await themeApi.uploadImages(Array.from(files));
      setUploadedImages(prev => [...prev, ...result.images]);
      toast.success(`${result.images.length} image(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    try {
      const sizes = Array.isArray(productForm.sizes) ? productForm.sizes : [];
      const sizeTotal = sizes.reduce((n, s) => n + (parseInt(s.quantity, 10) || 0), 0);
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: sizes.length > 0 ? sizeTotal : parseInt(productForm.stock_quantity, 10) || 0,
        sizes,
        image_url: uploadedImages[0] || productForm.image_url,
        images: uploadedImages.length ? uploadedImages : (productForm.images || []),
        is_active: productForm.status === 'active'
      };
      if (editingProduct) {
        await themeApi.updateProduct(editingProduct.id, productData);
        toast.success('Product updated');
      } else {
        await themeApi.createProduct(productData);
        toast.success('Product created');
      }
      setShowProductForm(false);
      setUploadedImages([]);
      const productsRes = await loadAdminProducts(productPage, searchTerm);
      setStats((prev) => ({
        ...prev,
        totalProducts: productsRes.pagination?.total ?? productsRes.products?.length ?? prev.totalProducts,
      }));
    } catch (error) { 
      toast.error('Save Failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const runProductSearch = async () => {
    try {
      const productsRes = await loadAdminProducts(1, searchTerm);
      setStats((prev) => ({
        ...prev,
        totalProducts: productsRes.pagination?.total ?? prev.totalProducts,
      }));
    } catch (error) {
      toast.error('Search failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen d-flex align-items-center justify-content-center bg-white">
      <div className="text-center">
        <Trophy size={48} className="text-primary animate-pulse mb-3" />
        <p className="fw-bold text-dark">Accessing Secure Database...</p>
      </div>
    </div>
  );

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="admin-wrapper" style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 55%, #eef2f7 100%)'
      }}>
        
        {/* --- REFINED IBELIEVETHIS ADMIN TOPBAR --- */}
        <header className="sticky-top w-100 shadow-lg" style={{ 
          background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)', 
          borderBottom: '3px solid #f26522',
          zIndex: 1050
        }}>
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between" style={{ height: '75px' }}>
              
              {/* LEFT: BRANDING */}
              <div className="d-flex align-items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-link text-white p-2 border-0 shadow-none">
                  <Menu size={24} />
                </button>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-3 shadow-lg d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #f26522, #fb923c)' }}>
                    <Trophy size={22} className="text-white" />
                  </div>
                  <div className="d-flex flex-column">
                    <span className="text-white fw-bold m-0" style={{ fontSize: '1.2rem', letterSpacing: '1px', lineHeight: '1.1' }}>IBelieveThis</span>
                    <span className="fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '2px', color: '#fb923c' }}>CONTROL PANEL</span>
                  </div>
                </div>
              </div>

              {/* CENTER: SYSTEM STATUS */}
              <div className="d-none d-xl-flex align-items-center bg-dark bg-opacity-25 rounded-pill px-4 py-2 border border-white border-opacity-10">
                <div className="d-flex align-items-center gap-4">
                  <div className="d-flex align-items-center gap-2">
                    <Activity size={14} className="text-success" />
                    <span className="text-white-50 small fw-medium">Status: <span className="text-success">Online</span></span>
                  </div>
                  <div className="vr bg-white opacity-25" style={{ height: '15px' }}></div>
                  <div className="d-flex align-items-center gap-2">
                    <Search size={14} className="text-white-50" />
                    <span className="text-white-50 small fw-medium">Node: <span className="text-primary">Global-v1</span></span>
                  </div>
                </div>
              </div>

              {/* RIGHT: CONTROLS */}
              <div className="d-flex align-items-center gap-2">
                <Link to="/" className="btn btn-sm btn-link text-white-50 text-decoration-none d-none d-md-flex align-items-center gap-2 px-3">
                  <Store size={18} /> <span className="fw-semibold small">Live Portal</span>
                </Link>
                <div className="vr bg-white opacity-25 mx-2" style={{ height: '30px' }}></div>
                <div className="d-flex align-items-center gap-3 ps-2">
                  <div className="text-end d-none d-sm-block">
                    <p className="text-white mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>
                      {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Administrator'}
                    </p>
                    <p className="text-primary mb-0 fw-bold" style={{ fontSize: '0.65rem' }}>
                      {superAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                    </p>
                  </div>
                  <button onClick={logout} className="btn btn-danger d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm border-0 fw-bold" style={{ fontSize: '0.8rem' }}>
                    <LogOut size={16} /> <span className="d-none d-lg-inline">TERMINATE SESSION</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </header>

        <div className="container-fluid py-4 px-md-5">
          <div className="row g-4">
            
            {/* SIDEBAR */}
            {sidebarOpen && (
              <div className="col-lg-3">
                <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '20px', position: 'sticky', top: '100px', background: '#ffffff', border: '1px solid rgba(242,101,34,0.12)' }}>
                  <div className="list-group list-group-flush border-0">
                    {sidebarItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`list-group-item list-group-item-action border-0 rounded-4 mb-2 py-3 px-4 d-flex align-items-center ${
                          activeTab === item.id ? 'fw-bold shadow-lg text-white' : 'text-secondary'
                        }`}
                        style={
                          activeTab === item.id
                            ? {
                                background: 'linear-gradient(135deg, #f26522 0%, #fb923c 100%)',
                                color: '#fff',
                                boxShadow: '0 12px 24px rgba(242,101,34,0.22)'
                              }
                            : {
                                background: '#f8fafc',
                                color: '#475569'
                              }
                        }
                      >
                        <item.icon size={19} className="me-3" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MAIN CONTENT */}
            <div className={`col-lg-${sidebarOpen ? '9' : '12'}`}>
              <div className="content-area" style={{ background: 'rgba(255,255,255,0.65)', borderRadius: '24px', padding: '8px' }}>
                {activeTab === 'dashboard' && <Dashboard stats={stats} products={products} categories={categories} />}
                {activeTab === 'products' && (
                  <Products 
                    products={products}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSearch={runProductSearch}
                    pagination={productPagination}
                    onPageChange={handleProductPageChange}
                    handleAddProduct={handleAddProduct}
                    handleEditProduct={handleEditProduct}
                    handleDeleteProduct={handleDeleteProduct}
                  />
                )}
                {activeTab === 'categories' && <CategoryManagement categories={categories} onCategoriesChange={() => {}} />}
                {activeTab === 'sizes' && <SizeManagement />}
                {activeTab === 'orders' && <OrderManagement orders={orders} onOrdersChange={() => {}} />}
                {activeTab === 'orders-report' && <OrdersReport />}
                {activeTab === 'shipping-settings' && <ShippingSettings />}
                {activeTab === 'failed-emails' && <FailedEmails />}
                {activeTab === 'reviews' && <ReviewManagement products={products} />}
                {activeTab === 'contact-messages' && <ContactMessages />}
                {activeTab === 'payment-audits' && superAdmin && <PaymentAudits />}
                {activeTab === 'website-settings' && <WebsiteSettings />}
              </div>
            </div>

          </div>
        </div>

        {showProductForm && (
          <ProductModal
            onClose={() => setShowProductForm(false)}
            productForm={productForm}
            setProductForm={setProductForm}
            editingProduct={editingProduct}
            nextSku={nextSku}
            categories={categories}
            uploadedImages={uploadedImages}
            uploadingImages={uploadingImages}
            handleImageUpload={handleImageUpload}
            removeUploadedImage={removeUploadedImage}
            handleSaveProduct={handleSaveProduct}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Admin;