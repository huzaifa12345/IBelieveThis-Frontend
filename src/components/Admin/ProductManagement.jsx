import React from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const Products = ({ 
  products, 
  searchTerm, 
  setSearchTerm,
  onSearch,
  pagination,
  onPageChange,
  handleAddProduct, 
  handleEditProduct, 
  handleDeleteProduct 
}) => {
  const page = pagination?.page || 1;
  const pages = pagination?.pages || 1;
  const total = pagination?.total ?? (products || []).length;

  return (
    <div className="row animate__animated animate__fadeIn">
      <div className="col-12">
        {/* Header Card */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="card-header bg-white py-3 border-0">
            <div className="row align-items-center g-3">
              <div className="col-md-4">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
                  <Package size={22} className="text-primary" /> 
                  Inventory Stock
                </h5>
                <p className="text-muted small mb-0">
                  {total} product{total === 1 ? '' : 's'} total
                  {pages > 1 ? ` · page ${page} of ${pages}` : ''}
                </p>
              </div>
              
              <div className="col-md-8">
                <div className="d-flex flex-wrap justify-content-md-end gap-2">
                  <div className="input-group" style={{ maxWidth: '350px' }}>
                    <span className="input-group-text bg-light border-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 bg-light shadow-none"
                      placeholder="Search products..."
                      style={{ fontSize: '0.9rem' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && typeof onSearch === 'function') onSearch();
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => typeof onSearch === 'function' && onSearch()}
                    >
                      Search
                    </button>
                  </div>
                  
                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" 
                    style={{ backgroundColor: '#0284c7', border: 'none', borderRadius: '8px' }}
                    onClick={handleAddProduct}
                  >
                    <Plus size={18} />
                    <span>New Entry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    <th className="px-4 py-3 border-0">PRODUCT SPECIFICATIONS</th>
                    <th className="text-center py-3 border-0">CATEGORY</th>
                    <th className="text-center py-3 border-0">UNIT PRICE</th>
                    <th className="text-center py-3 border-0">STOCK LEVEL</th>
                    <th className="text-center py-3 border-0">AVAILABILITY</th>
                    <th className="text-end px-4 py-3 border-0">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {(products || []).length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={product.image_url || product.images?.[0] || '/placeholder.png'}
                              alt={product.name}
                              className="rounded"
                              style={{ width: 48, height: 48, objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-semibold text-dark">{product.name}</div>
                              <code className="text-muted" style={{ fontSize: '0.75rem' }}>
                                SKU-{(product.sku || product.id || '').toString().padStart(3, '0')}
                              </code>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          {product.category_relation?.name || product.category || '—'}
                        </td>
                        <td className="text-center fw-semibold">
                          ${Number(product.price || 0).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${(product.stock_quantity || 0) > 10 ? 'bg-success' : 'bg-danger'} rounded-pill`} style={{ fontSize: '0.75rem' }}>
                            {product.stock_quantity ?? 0}
                          </span>
                          {(product.stock_quantity || 0) <= 10 && (
                            <small className="text-danger mt-1 d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.65rem' }}>
                              <AlertCircle size={10} /> Low Stock
                            </small>
                          )}
                        </td>
                        <td className="text-center">
                          {product.is_active !== false ? (
                            <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1">
                              <CheckCircle2 size={14} /> ACTIVE
                            </span>
                          ) : (
                            <span className="badge bg-secondary">INACTIVE</span>
                          )}
                        </td>
                        <td className="text-end px-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-white btn-sm px-3"
                              title="Edit Product"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit size={15} className="text-primary" />
                            </button>
                            <button
                              className="btn btn-white btn-sm px-3"
                              title="Archive Product"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 size={15} className="text-danger" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <Package size={48} className="text-muted opacity-25 mb-3" />
                        <h6 className="text-muted">No products found matching your search.</h6>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 py-3 px-4">
            <span className="text-muted small">
              {total === 0
                ? 'No products'
                : `Showing ${(page - 1) * (pagination?.limit || 20) + 1}–${Math.min(page * (pagination?.limit || 20), total)} of ${total}`}
            </span>

            {pages > 1 && (
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  disabled={page <= 1}
                  onClick={() => onPageChange?.(page - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="d-flex align-items-center gap-1 flex-wrap">
                  {[...Array(pages)].map((_, i) => {
                    const pageNum = i + 1;
                    // For long lists, show first/last + window around current
                    const show =
                      pages <= 7 ||
                      pageNum === 1 ||
                      pageNum === pages ||
                      Math.abs(pageNum - page) <= 1;
                    const showEllipsisBefore = pages > 7 && pageNum === page - 2 && page > 3;
                    const showEllipsisAfter = pages > 7 && pageNum === page + 2 && page < pages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={`e-${pageNum}`} className="px-1 text-muted">
                          …
                        </span>
                      );
                    }
                    if (!show) return null;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={page === pageNum ? { backgroundColor: '#0284c7', borderColor: '#0284c7' } : undefined}
                        onClick={() => onPageChange?.(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  disabled={page >= pages}
                  onClick={() => onPageChange?.(page + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
