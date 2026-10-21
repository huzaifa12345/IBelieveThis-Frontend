import { useEffect, useState } from 'react';
import { Star, Plus, Trash2, RefreshCw, Check } from 'lucide-react';
import { themeApi } from '../../services/themeApi';
import toast from 'react-hot-toast';
import '../../assets/css/admin-email-retry.css';

const emptyForm = {
  product_id: '',
  customer_name: '',
  rating: 5,
  comment: '',
  review_date: '',
  is_verified: true,
};

const ReviewManagement = ({ products = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      const data = await themeApi.getAllReviews({ limit: 100 });
      setReviews(data.reviews || []);
    } catch (e) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.customer_name || !form.comment) {
      toast.error('Product, name, and review text are required');
      return;
    }
    try {
      setSaving(true);
      await themeApi.adminCreateReview({
        product_id: Number(form.product_id),
        customer_name: form.customer_name.trim(),
        rating: Number(form.rating),
        comment: form.comment.trim(),
        is_verified: Boolean(form.is_verified),
        review_date: form.review_date || undefined,
        status: 'approved',
      });
      toast.success('Review added');
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add review');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await themeApi.deleteReview(id);
      toast.success('Deleted');
      await load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const setStatus = async (id, status) => {
    try {
      await themeApi.updateReviewStatus(id, status);
      toast.success(`Marked ${status}`);
      await load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="fe-panel review-management animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Product Reviews</h4>
          <p className="text-secondary small mb-0">
            Add or import real customer reviews (e.g. from Etsy). Never publish fake reviews.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm text-dark" onClick={load}>
          <RefreshCw size={14} className="me-1" /> Refresh
        </button>
      </div>

      <form className="card border-0 shadow-sm p-4 mb-4 bg-white" onSubmit={onSubmit}>
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
          <Plus size={16} className="text-primary" /> Add / import review
        </h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark">Product *</label>
            <select
              className="form-select bg-white text-dark border"
              name="product_id"
              value={form.product_id}
              onChange={onChange}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark">Customer name *</label>
            <input
              className="form-control bg-white text-dark border"
              name="customer_name"
              value={form.customer_name}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold text-dark">Rating</label>
            <select
              className="form-select bg-white text-dark border"
              name="rating"
              value={form.rating}
              onChange={onChange}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold text-dark">Review date</label>
            <input
              type="date"
              className="form-control bg-white text-dark border"
              name="review_date"
              value={form.review_date}
              onChange={onChange}
            />
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="is_verified"
                id="is_verified"
                checked={form.is_verified}
                onChange={onChange}
              />
              <label className="form-check-label text-dark" htmlFor="is_verified">
                Verified purchase / imported from Etsy
              </label>
            </div>
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold text-dark">Review text *</label>
            <textarea
              className="form-control bg-white text-dark border"
              name="comment"
              rows={3}
              value={form.comment}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary fw-bold"
              style={{ backgroundColor: '#f26522', border: 'none' }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Add review'}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <p className="text-secondary bg-white p-3 rounded shadow-sm mb-0">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-secondary bg-white p-3 rounded shadow-sm mb-0">
          No reviews yet. Add real customer feedback above.
        </p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Rating</th>
                <th>Text</th>
                <th>Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="small fw-semibold">{r.product?.name || r.product_id}</td>
                  <td className="text-dark">
                    {r.customer_name}
                    {r.is_verified ? (
                      <span className="badge bg-success ms-1" title="Verified">
                        <Check size={10} /> Verified
                      </span>
                    ) : null}
                  </td>
                  <td className="text-dark">
                    <Star size={12} className="text-warning me-1" fill="#f59e0b" />
                    {r.rating}
                  </td>
                  <td className="small text-dark" style={{ maxWidth: 280 }}>
                    {r.comment}
                  </td>
                  <td className="small text-nowrap text-dark">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm bg-white text-dark border"
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                    >
                      <option value="approved">approved</option>
                      <option value="pending">pending</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(r.id)}
                      aria-label="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
