import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

interface Coupon {
  _id: string;
  code: string;
  discountPct: number;
  active: boolean;
  createdAt: string;
}

export default function CouponsTab({ flash }: { flash: (m: string) => void }) {
  const [coupons, setCoupons]   = useState<Coupon[]>([]);
  const [loading, setLoading]   = useState(true);
  const [code,    setCode]      = useState('');
  const [pct,     setPct]       = useState('');
  const [saving,  setSaving]    = useState(false);

  useEffect(() => {
    apiFetch<Coupon[]>('/api/admin/coupons')
      .then(setCoupons)
      .catch(() => flash('Failed to load coupons.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !pct) return;
    setSaving(true);
    try {
      const created = await apiFetch<Coupon>('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim().toUpperCase(), discountPct: Number(pct) }),
      });
      setCoupons(prev => [created, ...prev.filter(c => c.code !== created.code)]);
      setCode(''); setPct('');
      flash(`Coupon ${created.code} created.`);
    } catch (err: any) {
      flash(err.message || 'Failed to create coupon.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      const updated = await apiFetch<Coupon>(`/api/admin/coupons/${id}/toggle`, { method: 'PATCH' });
      setCoupons(prev => prev.map(c => c._id === id ? updated : c));
    } catch {
      flash('Failed to update coupon.');
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      await apiFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      setCoupons(prev => prev.filter(c => c._id !== id));
      flash(`Coupon ${code} deleted.`);
    } catch {
      flash('Failed to delete coupon.');
    }
  }

  return (
    <div className="adm-tab-content">
      <div className="adm-section-header">
        <h2 className="adm-section-title">Coupons</h2>
        <p className="adm-section-sub">Create discount codes for customers.</p>
      </div>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <input
          className="adm-input"
          placeholder="Code (e.g. YOURORCHARD99)"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          style={{ flex: '1 1 180px', fontFamily: 'monospace', letterSpacing: '0.05em' }}
          required
        />
        <input
          className="adm-input"
          type="number"
          placeholder="Discount %"
          min={1} max={100}
          value={pct}
          onChange={e => setPct(e.target.value)}
          style={{ width: 120 }}
          required
        />
        <button className="adm-btn adm-btn-primary" type="submit" disabled={saving}>
          {saving ? 'Creating…' : '+ Create Coupon'}
        </button>
      </form>

      {loading ? (
        <div className="adm-loading"><div className="adm-spinner" /></div>
      ) : coupons.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>No coupons yet.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c._id}>
                <td><code style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.code}</code></td>
                <td>{c.discountPct}%</td>
                <td>
                  <button
                    className={`adm-badge ${c.active ? 'adm-badge-green' : 'adm-badge-gray'}`}
                    onClick={() => handleToggle(c._id)}
                    style={{ cursor: 'pointer', border: 'none', padding: '3px 10px', borderRadius: 20 }}
                  >
                    {c.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ color: '#888', fontSize: 13 }}>
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <button className="adm-btn adm-btn-danger-sm" onClick={() => handleDelete(c._id, c.code)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
