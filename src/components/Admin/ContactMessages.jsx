import { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../../assets/css/admin-email-retry.css';

const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${apiBase}/contact`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMessages(data.messages || []);
    } catch {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${apiBase}/contact/${id}`,
        { status },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success('Updated');
      await load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="fe-panel">
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2 text-dark">
            <Mail size={22} /> Contact Messages
          </h4>
          <p className="text-secondary small mb-0">Messages submitted from the store Contact page.</p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm text-dark" onClick={load}>
          <RefreshCw size={14} className="me-1" /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-secondary bg-white p-3 rounded shadow-sm mb-0">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-secondary bg-white p-3 rounded shadow-sm mb-0">No messages yet.</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>When</th>
                <th>From</th>
                <th>Order #</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td className="small text-nowrap text-dark">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="small text-dark">
                    <div className="fw-semibold">{m.name}</div>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                  </td>
                  <td className="small text-dark">{m.order_number || '—'}</td>
                  <td className="small text-dark" style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>
                    {m.message}
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm bg-white text-dark border"
                      value={m.status || 'new'}
                      onChange={(e) => setStatus(m.id, e.target.value)}
                    >
                      <option value="new">new</option>
                      <option value="read">read</option>
                      <option value="replied">replied</option>
                      <option value="archived">archived</option>
                    </select>
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

export default ContactMessages;
