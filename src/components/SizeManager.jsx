import { useState, useEffect } from 'react';
import { Plus, Trash2, Ruler } from 'lucide-react';
import { themeApi } from '../services/themeApi';
import '../assets/css/admin-size-manager.css';

/**
 * Etsy-style product size variations.
 * Pick from the Size catalog (Admin → Sizes) and set stock per size.
 */
const SizeManager = ({ sizes = [], onChange }) => {
  const [catalog, setCatalog] = useState([]);
  const [newSize, setNewSize] = useState({ size: '', quantity: 1 });
  const [customSize, setCustomSize] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await themeApi.getSizes();
        const list = Array.isArray(data) ? data : data?.sizes || [];
        setCatalog(list);
      } catch (error) {
        console.error('Failed to load size catalog:', error);
        setCatalog([]);
      }
    };
    load();
  }, []);

  const usedNames = new Set((sizes || []).map((s) => s.size));

  const addSize = () => {
    const label = (newSize.size === '__custom__' ? customSize : newSize.size).trim();
    if (!label) return;
    if (usedNames.has(label)) return;

    onChange([...(sizes || []), { size: label, quantity: Math.max(0, parseInt(newSize.quantity, 10) || 0) }]);
    setNewSize({ size: '', quantity: 1 });
    setCustomSize('');
  };

  const removeSize = (index) => {
    onChange((sizes || []).filter((_, i) => i !== index));
  };

  const updateSize = (index, field, value) => {
    onChange(
      (sizes || []).map((row, i) =>
        i === index
          ? { ...row, [field]: field === 'quantity' ? Math.max(0, parseInt(value, 10) || 0) : value }
          : row
      )
    );
  };

  return (
    <div className="size-manager">
      <div className="d-flex align-items-center gap-2 mb-2">
        <Ruler size={16} className="text-primary" />
        <label className="form-label fw-bold mb-0">Size variations (Etsy-style)</label>
      </div>
      <p className="text-muted small mb-3">
        Add sizes from your catalog (Admin → Sizes), then set stock for each. Shoppers will pick a size before checkout.
      </p>

      <div className="row g-2 mb-3">
        <div className="col-md-5">
          <select
            className="form-select"
            value={newSize.size}
            onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
          >
            <option value="">Select size…</option>
            {catalog
              .filter((s) => s?.size && !usedNames.has(s.size))
              .map((s) => (
                <option key={s.id || s.size} value={s.size}>
                  {s.size}{s.description ? ` — ${s.description}` : ''}
                </option>
              ))}
            <option value="__custom__">Custom size…</option>
          </select>
        </div>
        {newSize.size === '__custom__' && (
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Medium / 2 inch"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
            />
          </div>
        )}
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Qty"
            min="0"
            value={newSize.quantity}
            onChange={(e) => setNewSize({ ...newSize, quantity: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={addSize}
            disabled={!(newSize.size === '__custom__' ? customSize.trim() : newSize.size)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {catalog.length === 0 && (
        <div className="alert alert-warning py-2 small mb-3">
          No sizes in catalog yet. Go to <strong>Admin → Sizes</strong> and add options first (e.g. Small, Medium, Large).
        </div>
      )}

      {(sizes || []).length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0 bg-white rounded border">
            <thead className="table-light">
              <tr>
                <th>Size</th>
                <th style={{ width: 110 }}>Stock</th>
                <th style={{ width: 50 }} />
              </tr>
            </thead>
            <tbody>
              {sizes.map((sizeItem, index) => (
                <tr key={`${sizeItem.size}-${index}`}>
                  <td className="fw-semibold text-dark">{sizeItem.size}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="0"
                      value={sizeItem.quantity ?? 0}
                      onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                    />
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeSize(index)}>
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

export default SizeManager;
