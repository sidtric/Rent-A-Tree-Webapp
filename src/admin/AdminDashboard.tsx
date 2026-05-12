import { useState, useEffect } from 'react';
import { api } from '../api';
import './admin.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

type Tab =
  | 'overview'
  | 'trees'
  | 'rentals'
  | 'orders'
  | 'reviews'
  | 'publicupdates'
  | 'messages'
  | 'userroles'
  | 'payments';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'overview',      icon: '📊', label: 'Overview'      },
  { id: 'trees',         icon: '🌳', label: 'Trees'         },
  { id: 'rentals',       icon: '📋', label: 'Rentals'       },
  { id: 'orders',        icon: '📦', label: 'Box Orders'    },
  { id: 'publicupdates', icon: '🌿', label: 'Life on Farm'  },
  { id: 'reviews',       icon: '⭐', label: 'Reviews'       },
  { id: 'messages',      icon: '✉️', label: 'Messages'      },
  { id: 'userroles',     icon: '🔑', label: 'User Roles'    },
  { id: 'payments',      icon: '💳', label: 'Payments'      },
];

interface TreeForm {
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  price: string;
  yieldMin: string;
  yieldMax: string;
  available: boolean;
}

const emptyTreeForm: TreeForm = {
  plan: 'sapling',
  variety: 'chausa',
  price: '',
  yieldMin: '',
  yieldMax: '',
  available: true,
};

interface Props { onExit: () => void; user: { name: string; email: string } }

const RENTAL_STATUSES = ['pending_payment', 'active', 'completed', 'cancelled'];
const ORDER_STATUSES = ['pending_payment', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

export default function AdminDashboard({ onExit, user }: Props) {
  const [tab, setTab]               = useState<Tab>('overview');
  const [msg, setMsg]               = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [trees, setTrees]         = useState<any[]>([]);
  const [rentals, setRentals]     = useState<any[]>([]);
  const [orders, setOrders]       = useState<any[]>([]);
  const [reviews, setReviews]     = useState<any[]>([]);
  const [messages, setMessages]   = useState<any[]>([]);
  const [publicUpdates, setPublicUpdates] = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);

  const [showForm, setShowForm]     = useState(false);
  const [treeForm, setTreeForm]     = useState<TreeForm>(emptyTreeForm);
  const [savingTree, setSavingTree] = useState(false);
  const [editingTree, setEditingTree] = useState<any | null>(null);

  const [puCaption, setPuCaption]   = useState('');
  const [puFiles, setPuFiles]       = useState<FileList | null>(null);
  const [puPosting, setPuPosting]   = useState(false);

  const [payments, setPayments]             = useState<any[]>([]);
  const [paymentsTotal, setPaymentsTotal]   = useState(0);
  const [paymentsCaptured, setPaymentsCaptured] = useState(0);
  const [paymentsLoading, setPaymentsLoading]   = useState(false);
  const [paymentsError, setPaymentsError]       = useState('');
  const [payCount, setPayCount]             = useState(50);

  const [roleSearch, setRoleSearch]         = useState('');
  const [roleResults, setRoleResults]       = useState<any[]>([]);
  const [roleSearching, setRoleSearching]   = useState(false);
  const [roleUpdating, setRoleUpdating]     = useState<string | null>(null);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  useEffect(() => {
    api.get('/admin/trees').then(d => setTrees(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/rentals').then(d => setRentals(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/orders').then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/reviews').then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/messages').then(d => setMessages(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/public-updates').then(d => setPublicUpdates(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/stats').then(setStats).catch(() => {});
  }, []);

  // ── Create / Edit Tree ────────────────────────────────────────────
  const handleSaveTree = async () => {
    if (!treeForm.price || !treeForm.yieldMin) {
      flash('Price and Yield Min are required'); return;
    }
    setSavingTree(true);
    try {
      const body = {
        plan: treeForm.plan,
        variety: treeForm.variety,
        price: Number(treeForm.price),
        yieldMin: Number(treeForm.yieldMin),
        yieldMax: Number(treeForm.yieldMax),
        available: treeForm.available,
      };
      if (editingTree) {
        const res = await api.patchBody(`/admin/trees/${editingTree._id}`, body);
        if (res._id) {
          setTrees(t => t.map(x => x._id === res._id ? res : x));
          flash('Tree updated!');
        } else flash(res.message || 'Update failed');
      } else {
        const res = await api.post('/trees', body);
        if (res._id) {
          setTrees(t => [res, ...t]);
          flash('Tree created!');
        } else flash(res.message || 'Create failed');
      }
      setShowForm(false); setEditingTree(null); setTreeForm(emptyTreeForm);
    } finally { setSavingTree(false); }
  };

  const startEdit = (tree: any) => {
    setTreeForm({
      plan: tree.plan,
      variety: tree.variety,
      price: String(tree.price),
      yieldMin: String(tree.yieldMin),
      yieldMax: String(tree.yieldMax),
      available: tree.available,
    });
    setEditingTree(tree);
    setShowForm(true);
  };

  const deleteTree = async (id: string) => {
    await api.del(`/admin/trees/${id}`);
    setTrees(t => t.filter(x => x._id !== id));
    flash('Tree deleted');
  };

  // ── Update Rental / Order Status ──────────────────────────────────
  const updateRentalStatus = async (id: string, status: string) => {
    const res = await api.patchBody(`/admin/rentals/${id}/status`, { status });
    if (res._id) {
      setRentals(r => r.map(x => x._id === id ? res : x));
      flash('Rental updated');
    } else flash(res.message || 'Failed');
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const res = await api.patchBody(`/admin/orders/${id}/status`, { status });
    if (res._id) {
      setOrders(o => o.map(x => x._id === id ? res : x));
      flash('Order updated');
    } else flash(res.message || 'Failed');
  };

  // ── Delete Review / Message ───────────────────────────────────────
  const deleteReview = async (id: string) => {
    await api.del(`/admin/reviews/${id}`);
    setReviews(r => r.filter(x => x._id !== id));
    flash('Review deleted');
  };

  const deleteMessage = async (id: string) => {
    await api.del(`/admin/messages/${id}`);
    setMessages(m => m.filter(x => x._id !== id));
    flash('Message deleted');
  };

  // ── Post Public Update ────────────────────────────────────────────
  const postPublicUpdate = async () => {
    if (!puFiles || puFiles.length === 0) { flash('Select at least one photo or video'); return; }
    setPuPosting(true);
    try {
      const data = new FormData();
      data.append('caption', puCaption);
      Array.from(puFiles).forEach(f => data.append('media', f));
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/public-updates`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: data,
      }).then(r => r.json());
      if (res._id) {
        setPublicUpdates(u => [res, ...u]);
        setPuCaption(''); setPuFiles(null);
        flash('Posted to Life on Farm!');
      } else flash(res.message || 'Upload failed');
    } finally { setPuPosting(false); }
  };

  const deletePublicUpdate = async (id: string) => {
    await api.del(`/admin/public-updates/${id}`);
    setPublicUpdates(u => u.filter(x => x._id !== id));
    flash('Update deleted');
  };

  // ── Payments ──────────────────────────────────────────────────────
  const fetchPayments = async (count = payCount) => {
    setPaymentsLoading(true); setPaymentsError('');
    try {
      const data = await api.get(`/admin/payments?count=${count}`);
      if (data.message) { setPaymentsError(data.message); return; }
      setPayments(data.payments || []);
      setPaymentsTotal(data.total || 0);
      setPaymentsCaptured(data.totalCaptured || 0);
    } catch { setPaymentsError('Failed to load payments'); }
    finally { setPaymentsLoading(false); }
  };

  // ── User Roles ────────────────────────────────────────────────────
  const searchUsers = async () => {
    if (!roleSearch.trim()) return;
    setRoleSearching(true);
    try {
      const results = await api.get(`/admin/users/search?email=${encodeURIComponent(roleSearch.trim())}`);
      setRoleResults(Array.isArray(results) ? results : []);
      if (!Array.isArray(results) || results.length === 0) flash('No users found');
    } catch { flash('Search failed'); }
    finally { setRoleSearching(false); }
  };

  const setRole = async (userId: string, role: 'user' | 'admin') => {
    setRoleUpdating(userId);
    try {
      const updated = await api.patchBody(`/admin/users/${userId}/role`, { role });
      if (updated._id) {
        setRoleResults(prev => prev.map(u => u._id === userId ? updated : u));
        flash(`Role updated to "${role}"`);
      } else flash(updated.message || 'Update failed');
    } catch { flash('Failed to update role'); }
    finally { setRoleUpdating(null); }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const go = (t: Tab) => { setTab(t); setMobileOpen(false); };

  return (
    <div className="adm-shell">
      {msg && <div className="toast adm-toast" onClick={() => setMsg('')}>{msg}</div>}

      {/* ── Sidebar ──────────────────────────────── */}
      <aside className={`adm-sidebar ${mobileOpen ? 'adm-sidebar--open' : ''}`}>
        <div className="adm-sidebar-top">
          <div className="adm-logo">YourOrchard</div>
          <div className="adm-role-pill">Admin Panel</div>
        </div>

        <nav className="adm-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`adm-nav-btn ${tab === t.id ? 'adm-nav-btn--active' : ''}`}
              onClick={() => go(t.id)}
            >
              <span className="adm-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-user-row">
            <div className="adm-avatar adm-avatar--lg">{user.name[0].toUpperCase()}</div>
            <div className="adm-user-info">
              <div className="adm-user-name">{user.name}</div>
              <div className="adm-user-email">{user.email}</div>
            </div>
          </div>
          <button className="adm-exit-btn" onClick={onExit}>← Back to Site</button>
        </div>
      </aside>

      {/* ── Mobile bar ───────────────────────────── */}
      <div className="adm-mobile-bar">
        <button className="adm-hamburger" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
        <span className="adm-mobile-title">
          {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
        </span>
        <button className="adm-exit-btn-sm" onClick={onExit}>Exit</button>
      </div>

      {/* ── Main area ────────────────────────────── */}
      <main className="adm-main">

        {/* ════════ OVERVIEW ════════ */}
        {tab === 'overview' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Dashboard</h1>
                <p className="adm-sub">Live snapshot of YourOrchard operations</p>
              </div>
              <div className="adm-season-badge">🌿 Season 2026</div>
            </header>

            <div className="adm-kpi-grid">
              <div className="adm-kpi adm-kpi--green">
                <div className="adm-kpi-icon">💰</div>
                <div className="adm-kpi-val">₹{(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</div>
                <div className="adm-kpi-label">Revenue (est.)</div>
                <div className="adm-kpi-sub">{stats?.cancelledRentals ?? 0} cancellation(s)</div>
              </div>
              <div className="adm-kpi adm-kpi--amber">
                <div className="adm-kpi-icon">🌳</div>
                <div className="adm-kpi-val">{stats?.totalTrees ?? trees.length}</div>
                <div className="adm-kpi-label">Total Trees</div>
                <div className="adm-kpi-sub">{stats?.availableTrees ?? '—'} available · {stats?.rentedTrees ?? '—'} rented</div>
              </div>
              <div className="adm-kpi adm-kpi--blue">
                <div className="adm-kpi-icon">📋</div>
                <div className="adm-kpi-val">{stats?.totalRentals ?? rentals.length}</div>
                <div className="adm-kpi-label">Total Rentals</div>
                <div className="adm-kpi-sub">{stats?.activeRentals ?? '—'} active</div>
              </div>
              <div className="adm-kpi adm-kpi--purple">
                <div className="adm-kpi-icon">👥</div>
                <div className="adm-kpi-val">{stats?.users ?? '—'}</div>
                <div className="adm-kpi-label">Registered Users</div>
                <div className="adm-kpi-sub">{stats?.totalOrders ?? '—'} box orders</div>
              </div>
            </div>

            <div className="adm-row-2">
              <div className="adm-card">
                <h2 className="adm-card-title">Trees by Plan</h2>
                {(['sapling', 'adult', 'grand'] as const).map(plan => {
                  const count = trees.filter(t => t.plan === plan).length;
                  const pct = trees.length > 0 ? (count / trees.length) * 100 : 0;
                  return (
                    <div key={plan} className="adm-bar-row">
                      <span className={`adm-plan-badge adm-plan--${plan}`}>{plan}</span>
                      <div className="adm-bar-track">
                        <div className={`adm-bar-fill adm-bar--${plan}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="adm-bar-num">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="adm-card">
                <h2 className="adm-card-title">Review Ratings</h2>
                {[5, 4, 3, 2, 1].map(n => {
                  const count = reviews.filter((r: any) => r.rating === n).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={n} className="adm-bar-row">
                      <span className="adm-star-label">{'★'.repeat(n)}</span>
                      <div className="adm-bar-track">
                        <div className="adm-bar-fill adm-bar--star" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="adm-bar-num">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="adm-card">
              <h2 className="adm-card-title">Recent Rentals</h2>
              {rentals.length === 0 ? (
                <p className="adm-empty">No rentals yet.</p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr><th>Customer</th><th>Plan</th><th>Variety</th><th>Season</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {rentals.slice(0, 8).map((r: any) => (
                      <tr key={r._id}>
                        <td>
                          <div className="adm-td-user">
                            <div className="adm-avatar">{(r.user?.name || 'U')[0].toUpperCase()}</div>
                            <div>
                              <div className="adm-td-name">{r.user?.name || '—'}</div>
                              <div className="adm-td-dim">{r.user?.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`adm-plan-badge adm-plan--${r.plan}`}>{r.plan}</span></td>
                        <td className="adm-td-dim">{r.variety}</td>
                        <td>{r.season}</td>
                        <td><span className={`adm-status adm-status--${r.status}`}>● {r.status}</span></td>
                        <td className="adm-td-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ════════ TREES ════════ */}
        {tab === 'trees' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Trees</h1>
                <p className="adm-sub">{trees.length} trees in inventory</p>
              </div>
              <button
                className="adm-btn-primary"
                onClick={() => { setShowForm(f => !f); setEditingTree(null); setTreeForm(emptyTreeForm); }}
              >
                {showForm && !editingTree ? '✕ Cancel' : '+ Add Tree'}
              </button>
            </header>

            {showForm && (
              <div className="adm-card adm-form-card">
                <h2 className="adm-card-title">{editingTree ? 'Edit Tree' : 'Add New Tree'}</h2>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label>Plan *</label>
                    <select value={treeForm.plan} onChange={e => setTreeForm(f => ({ ...f, plan: e.target.value as any }))}>
                      <option value="sapling">Sapling</option>
                      <option value="adult">Adult</option>
                      <option value="grand">Grand</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Variety *</label>
                    <select value={treeForm.variety} onChange={e => setTreeForm(f => ({ ...f, variety: e.target.value as any }))}>
                      <option value="chausa">Chausa</option>
                      <option value="dasheri">Dasheri</option>
                      <option value="langra">Langra</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Price (₹) *</label>
                    <input type="number" placeholder="1499" value={treeForm.price} onChange={e => setTreeForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="adm-field">
                    <label>Yield Min (kg) *</label>
                    <input type="number" placeholder="15" value={treeForm.yieldMin} onChange={e => setTreeForm(f => ({ ...f, yieldMin: e.target.value }))} />
                  </div>
                  <div className="adm-field">
                    <label>Yield Max (kg)</label>
                    <input type="number" placeholder="25" value={treeForm.yieldMax} onChange={e => setTreeForm(f => ({ ...f, yieldMax: e.target.value }))} />
                  </div>
                  <div className="adm-field adm-field--check">
                    <label>
                      <input type="checkbox" checked={treeForm.available} onChange={e => setTreeForm(f => ({ ...f, available: e.target.checked }))} />
                      Available for rental
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="adm-btn-primary" onClick={handleSaveTree} disabled={savingTree}>
                    {savingTree ? 'Saving…' : editingTree ? 'Update Tree' : 'Create Tree'}
                  </button>
                  {editingTree && (
                    <button className="adm-btn-secondary" onClick={() => { setShowForm(false); setEditingTree(null); setTreeForm(emptyTreeForm); }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="adm-card">
              <table className="adm-table">
                <thead>
                  <tr><th>Plan</th><th>Variety</th><th>Price</th><th>Yield</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {trees.map(t => (
                    <tr key={t._id}>
                      <td><span className={`adm-plan-badge adm-plan--${t.plan}`}>{t.plan}</span></td>
                      <td className="adm-td-bold">{t.variety}</td>
                      <td>₹{t.price?.toLocaleString('en-IN')}</td>
                      <td>{t.yieldMin}–{t.yieldMax} kg</td>
                      <td>
                        <span className={`adm-status adm-status--${t.available ? 'avail' : 'rented'}`}>
                          {t.available ? '● Available' : '● Rented'}
                        </span>
                      </td>
                      <td>
                        <div className="adm-action-row">
                          <button className="adm-btn-sm" onClick={() => startEdit(t)}>Edit</button>
                          <button className="adm-btn-danger-sm" onClick={() => deleteTree(t._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {trees.length === 0 && (
                    <tr><td colSpan={6} className="adm-td-empty">No trees in inventory</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ RENTALS ════════ */}
        {tab === 'rentals' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Rentals</h1>
                <p className="adm-sub">{rentals.length} total rentals</p>
              </div>
            </header>
            <div className="adm-card">
              <table className="adm-table">
                <thead>
                  <tr><th>Customer</th><th>Plan</th><th>Variety</th><th>Season</th><th>Address</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {rentals.map((r: any) => (
                    <tr key={r._id}>
                      <td>
                        <div className="adm-td-user">
                          <div className="adm-avatar">{(r.user?.name || 'U')[0].toUpperCase()}</div>
                          <div>
                            <div className="adm-td-name">{r.user?.name || '—'}</div>
                            <div className="adm-td-dim">{r.user?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`adm-plan-badge adm-plan--${r.plan}`}>{r.plan}</span></td>
                      <td className="adm-td-dim">{r.variety}</td>
                      <td>{r.season}</td>
                      <td className="adm-td-dim" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.deliveryAddress}</td>
                      <td>
                        <select
                          className="adm-status-select"
                          value={r.status}
                          onChange={e => updateRentalStatus(r._id, e.target.value)}
                        >
                          {RENTAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="adm-td-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    </tr>
                  ))}
                  {rentals.length === 0 && (
                    <tr><td colSpan={7} className="adm-td-empty">No rentals yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ BOX ORDERS ════════ */}
        {tab === 'orders' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Box Orders</h1>
                <p className="adm-sub">{orders.length} total orders</p>
              </div>
            </header>
            <div className="adm-card">
              <table className="adm-table">
                <thead>
                  <tr><th>Customer</th><th>Variety</th><th>Qty</th><th>Total</th><th>Address</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o._id}>
                      <td>
                        <div className="adm-td-user">
                          <div className="adm-avatar">{(o.user?.name || 'U')[0].toUpperCase()}</div>
                          <div>
                            <div className="adm-td-name">{o.user?.name || '—'}</div>
                            <div className="adm-td-dim">{o.user?.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="adm-td-bold">{o.variety}</td>
                      <td>{o.quantity} box{o.quantity > 1 ? 'es' : ''}</td>
                      <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="adm-td-dim" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.deliveryAddress}</td>
                      <td>
                        <select
                          className="adm-status-select"
                          value={o.status}
                          onChange={e => updateOrderStatus(o._id, e.target.value)}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="adm-td-date">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={7} className="adm-td-empty">No orders yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ LIFE ON FARM ════════ */}
        {tab === 'publicupdates' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Life on Farm</h1>
                <p className="adm-sub">Post photos & videos visible to all visitors</p>
              </div>
            </header>

            <div className="adm-card adm-form-card">
              <h2 className="adm-card-title">Post New Update</h2>
              <div className="adm-form-grid">
                <div className="adm-field adm-field--wide">
                  <label>Caption (optional)</label>
                  <textarea rows={3} placeholder="Mangoes are ripening beautifully this week at Block A 🌿" value={puCaption} onChange={e => setPuCaption(e.target.value)} />
                </div>
                <div className="adm-field adm-field--wide">
                  <div className="adm-upload-zone">
                    <label>
                      <span className="adm-upload-icon">📸</span>
                      <span>{puFiles && puFiles.length > 0 ? `${puFiles.length} file(s) selected` : 'Select Photos & Videos (multiple allowed)'}</span>
                      <input type="file" multiple accept="image/*,video/*" onChange={e => setPuFiles(e.target.files)} />
                    </label>
                  </div>
                </div>
              </div>
              <button className="adm-btn-primary" onClick={postPublicUpdate} disabled={puPosting}>
                {puPosting ? 'Uploading…' : 'Post to Life on Farm'}
              </button>
            </div>

            <div style={{ marginTop: 32 }}>
              {publicUpdates.map((update: any) => (
                <div key={update._id} className="adm-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: '0.9rem', color: '#444', flex: 1 }}>{update.caption || <em style={{ color: '#aaa' }}>No caption</em>}</p>
                    <button className="adm-btn-danger-sm" onClick={() => deletePublicUpdate(update._id)}>Delete</button>
                  </div>
                  <div className="adm-farm-photos-grid">
                    {update.media?.map((m: any, i: number) => (
                      <div key={i} className="adm-farm-photo-card">
                        {m.type === 'image'
                          ? <img src={m.url} alt="farm" />
                          : <video src={m.url} controls style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {publicUpdates.length === 0 && <p className="adm-empty">No updates yet.</p>}
            </div>
          </div>
        )}

        {/* ════════ REVIEWS ════════ */}
        {tab === 'reviews' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Reviews</h1>
                <p className="adm-sub">{reviews.length} reviews · avg {avgRating} ★</p>
              </div>
            </header>
            <div className="adm-reviews-grid">
              {reviews.map((r: any) => (
                <div key={r._id} className="adm-review-card">
                  <div className="adm-review-top">
                    <div className="adm-td-user">
                      <div className="adm-avatar">{(r.name || 'A')[0].toUpperCase()}</div>
                      <div>
                        <div className="adm-td-name">{r.name}</div>
                        <div className="adm-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="adm-review-date">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button className="adm-btn-danger-sm" onClick={() => deleteReview(r._id)}>Delete</button>
                    </div>
                  </div>
                  <p className="adm-review-text">{r.comment}</p>
                  {r.media?.length > 0 && (
                    <div className="adm-review-media">
                      {r.media.map((m: any, i: number) =>
                        m.type === 'image'
                          ? <img key={i} src={`${API_BASE}${m.url}`} alt="review" />
                          : <video key={i} src={`${API_BASE}${m.url}`} controls />
                      )}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && <p className="adm-empty">No reviews yet.</p>}
            </div>
          </div>
        )}

        {/* ════════ MESSAGES ════════ */}
        {tab === 'messages' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Contact Messages</h1>
                <p className="adm-sub">{messages.length} messages received</p>
              </div>
            </header>
            <div className="adm-card">
              <table className="adm-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Message</th><th>Type</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {messages.map((m: any) => (
                    <tr key={m._id}>
                      <td className="adm-td-bold">{m.name}</td>
                      <td className="adm-td-dim">{m.email}</td>
                      <td className="adm-td-comment">{m.message?.slice(0, 100)}{m.message?.length > 100 ? '…' : ''}</td>
                      <td><span className="adm-role-badge adm-role-badge--user">{m.type || 'contact'}</span></td>
                      <td className="adm-td-date">{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td><button className="adm-btn-danger-sm" onClick={() => deleteMessage(m._id)}>Delete</button></td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr><td colSpan={6} className="adm-td-empty">No messages yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ USER ROLES ════════ */}
        {tab === 'userroles' && (
          <div className="adm-section">
            <div className="adm-section-hdr">
              <h2>🔑 User Roles</h2>
              <p className="adm-section-sub">Search a user by email and grant or revoke admin access.</p>
            </div>
            <div className="adm-role-search-bar">
              <input
                className="adm-input"
                placeholder="Search by email address..."
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUsers()}
              />
              <button className="adm-btn-primary" onClick={searchUsers} disabled={roleSearching}>
                {roleSearching ? 'Searching…' : 'Search'}
              </button>
            </div>
            {roleResults.length > 0 && (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Current Role</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {roleResults.map((u: any) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`adm-role-badge adm-role-badge--${u.role || 'user'}`}>
                            {u.role === 'admin' ? '🔑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td>
                          {u.role === 'admin' ? (
                            <button className="adm-btn-danger-sm" disabled={roleUpdating === u._id} onClick={() => setRole(u._id, 'user')}>
                              {roleUpdating === u._id ? '…' : 'Revoke Admin'}
                            </button>
                          ) : (
                            <button className="adm-btn-primary-sm" disabled={roleUpdating === u._id} onClick={() => setRole(u._id, 'admin')}>
                              {roleUpdating === u._id ? '…' : 'Grant Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════ PAYMENTS ════════ */}
        {tab === 'payments' && (
          <div className="adm-pay-page">
            <div className="adm-pay-header">
              <div className="adm-pay-header-left">
                <h2>💳 Payments</h2>
                <p>Live data from Razorpay — {payments.length > 0 ? `${payments.length} transactions` : 'No data loaded yet'}</p>
              </div>
            </div>
            <div className="adm-pay-bar">
              <label>Show</label>
              <select value={payCount} onChange={e => setPayCount(Number(e.target.value))}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>Last {n} payments</option>)}
              </select>
              <button className="adm-pay-refresh" onClick={() => fetchPayments(payCount)} disabled={paymentsLoading}>
                {paymentsLoading ? <><span className="spin" />Loading…</> : payments.length ? '↻ Refresh' : '↻ Load Payments'}
              </button>
            </div>
            {paymentsError && <div className="adm-pay-error">⚠️ {paymentsError}</div>}
            {payments.length > 0 && (
              <>
                <div className="adm-pay-kpis">
                  <div className="adm-pay-kpi">
                    <div className="adm-pay-kpi-icon adm-pay-kpi-icon--green">💰</div>
                    <div className="adm-pay-kpi-body">
                      <div className="adm-pay-kpi-val">₹{paymentsCaptured.toLocaleString('en-IN')}</div>
                      <div className="adm-pay-kpi-lbl">Revenue Captured</div>
                    </div>
                  </div>
                  <div className="adm-pay-kpi">
                    <div className="adm-pay-kpi-icon adm-pay-kpi-icon--blue">📋</div>
                    <div className="adm-pay-kpi-body">
                      <div className="adm-pay-kpi-val">{paymentsTotal}</div>
                      <div className="adm-pay-kpi-lbl">Total Transactions</div>
                    </div>
                  </div>
                  <div className="adm-pay-kpi">
                    <div className="adm-pay-kpi-icon adm-pay-kpi-icon--amber">✅</div>
                    <div className="adm-pay-kpi-body">
                      <div className="adm-pay-kpi-val">{payments.filter((p: any) => p.status === 'captured').length}</div>
                      <div className="adm-pay-kpi-lbl">Successful</div>
                    </div>
                  </div>
                  <div className="adm-pay-kpi">
                    <div className="adm-pay-kpi-icon adm-pay-kpi-icon--red">❌</div>
                    <div className="adm-pay-kpi-body">
                      <div className="adm-pay-kpi-val">{payments.filter((p: any) => p.status === 'failed').length}</div>
                      <div className="adm-pay-kpi-lbl">Failed</div>
                    </div>
                  </div>
                </div>
                <div className="adm-pay-table-card">
                  <div className="adm-pay-table-head">
                    <h3>Transaction History</h3>
                    <span className="adm-pay-count-pill">{payments.length} records</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="adm-pay-table">
                      <thead>
                        <tr><th>Payment ID</th><th>Amount</th><th>Status</th><th>Method</th><th>Customer</th><th>Rental</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {payments.map((p: any) => {
                          const statusLabel: Record<string, string> = { captured: 'Captured', failed: 'Failed', refunded: 'Refunded', authorized: 'Authorized', created: 'Pending' };
                          return (
                            <tr key={p.id}>
                              <td><span className="adm-pay-id" title={p.id}>{p.id}</span></td>
                              <td><span className="adm-pay-amount">₹{p.amount?.toLocaleString('en-IN')}</span></td>
                              <td><span className={`adm-pay-badge adm-pay-badge--${p.status}`}><span className="adm-pay-badge-dot" />{statusLabel[p.status] || p.status}</span></td>
                              <td><span className="adm-pay-method">{p.method || '—'}</span></td>
                              <td>
                                {p.rental?.user
                                  ? <><div className="adm-pay-customer-name">{p.rental.user.name}</div><div className="adm-pay-customer-email">{p.rental.user.email}</div></>
                                  : <div className="adm-pay-customer-email">{p.email || '—'}</div>}
                              </td>
                              <td>
                                {p.rental
                                  ? <><div className="adm-pay-rental-tree">{p.rental.plan} · {p.rental.variety}</div></>
                                  : <span className="adm-pay-customer-email">—</span>}
                              </td>
                              <td><span className="adm-pay-date">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            {!paymentsLoading && payments.length === 0 && !paymentsError && (
              <div className="adm-pay-table-card">
                <div className="adm-pay-empty">
                  <div className="adm-pay-empty-icon">💳</div>
                  <h4>No payments loaded</h4>
                  <p>Click "Load Payments" to fetch live data from Razorpay.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
