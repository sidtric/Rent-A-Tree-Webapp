import { useState, useEffect } from 'react';
import type { Tree, Review, Video, User, FarmPhoto, PublicUpdate } from '../types';
import { api } from '../api';
import './admin.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

type Tab = 'overview' | 'trees' | 'reviews' | 'farmupdates' | 'videos' | 'farmphotos' | 'publicupdates' | 'userroles' | 'payments';

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'overview',      icon: '📊', label: 'Overview'      },
  { id: 'trees',         icon: '🌳', label: 'Trees'         },
  { id: 'publicupdates', icon: '🌿', label: 'Life on Farm'  },
  { id: 'farmupdates',   icon: '📷', label: 'User Updates'  },
  { id: 'reviews',       icon: '⭐', label: 'Reviews'       },
  { id: 'userroles',     icon: '🔑', label: 'User Roles'    },
  { id: 'payments',      icon: '💳', label: 'Payments'      },
];

interface TreeForm {
  plan: 'sapling' | 'adult' | 'grand';
  name: string;
  location: string;
  yieldMin: string;
  yieldMax: string;
  priceMin: string;
  priceMax: string;
  pricePerSeason: string;
  isAvailable: boolean;
}

const emptyTreeForm: TreeForm = {
  plan: 'sapling', name: '', location: 'Ramnagar, Uttarakhand',
  yieldMin: '', yieldMax: '', priceMin: '', priceMax: '', pricePerSeason: '',
  isAvailable: true,
};

interface Props { onExit: () => void; user: User; }

export default function AdminDashboard({ onExit, user }: Props) {
  const [tab, setTab]               = useState<Tab>('overview');
  const [msg, setMsg]               = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [trees, setTrees]         = useState<Tree[]>([]);
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [videos, setVideos]       = useState<Video[]>([]);
  const [myRentals, setMyRentals] = useState<any[]>([]);
  const [stats, setStats]         = useState<{ totalTrees: number; availableTrees: number; rentedTrees: number; totalRentals: number; cancelledRentals: number; reviews: number; users: number; videos: number; totalRevenue: number } | null>(null);

  const [showForm, setShowForm]     = useState(false);
  const [treeForm, setTreeForm]     = useState<TreeForm>(emptyTreeForm);
  const [savingTree, setSavingTree] = useState(false);

  const [fuRentalId, setFuRentalId] = useState('');
  const [fuCaption, setFuCaption]   = useState('');
  const [fuFiles, setFuFiles]       = useState<FileList | null>(null);
  const [fuPosting, setFuPosting]   = useState(false);

  const [vidTitle, setVidTitle]         = useState('');
  const [vidDesc, setVidDesc]           = useState('');
  const [vidFile, setVidFile]           = useState<File | null>(null);
  const [vidUploading, setVidUploading] = useState(false);

  const [farmPhotos, setFarmPhotos]         = useState<FarmPhoto[]>([]);
  const [photoCaption, setPhotoCaption]     = useState('');
  const [photoFile, setPhotoFile]           = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [publicUpdates, setPublicUpdates]   = useState<PublicUpdate[]>([]);
  const [puCaption, setPuCaption]           = useState('');
  const [puFiles, setPuFiles]               = useState<FileList | null>(null);
  const [puPosting, setPuPosting]           = useState(false);

  // ── Payments ─────────────────────────────────────────────
  const [payments, setPayments]             = useState<any[]>([]);
  const [paymentsTotal, setPaymentsTotal]   = useState(0);
  const [paymentsCaptured, setPaymentsCaptured] = useState(0);
  const [paymentsLoading, setPaymentsLoading]   = useState(false);
  const [paymentsError, setPaymentsError]       = useState('');
  const [payCount, setPayCount]             = useState(50);

  // ── User Roles ────────────────────────────────────────────
  const [roleSearch, setRoleSearch]         = useState('');
  const [roleResults, setRoleResults]       = useState<any[]>([]);
  const [roleSearching, setRoleSearching]   = useState(false);
  const [roleUpdating, setRoleUpdating]     = useState<string | null>(null);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  useEffect(() => {
    api.get("/admin/trees").then(d => setTrees(Array.isArray(d) ? d : [])).catch(() => {});
    api.get("/admin/reviews").then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
    api.get("/admin/videos").then(d => setVideos(Array.isArray(d) ? d : [])).catch(() => {});
    api.get("/admin/rentals").then(d => setMyRentals(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/stats').then(setStats).catch(() => {});
    api.get('/farm-photos').then(setFarmPhotos).catch(() => {});
    api.get('/public-updates').then(setPublicUpdates).catch(() => {});
  }, []);

  // ── Create Tree ──────────────────────────────────────────
  const handleCreateTree = async () => {
    if (!treeForm.name || !treeForm.yieldMin || !treeForm.pricePerSeason) {
      flash('Fill all required fields (*) to continue'); return;
    }
    setSavingTree(true);
    try {
      const body = {
        ...treeForm,
        yieldMin: Number(treeForm.yieldMin),    yieldMax: Number(treeForm.yieldMax),
        priceMin: Number(treeForm.priceMin),     priceMax: Number(treeForm.priceMax),
        pricePerSeason: Number(treeForm.pricePerSeason),
      };
      const res = await api.post('/trees', body);
      if (res._id) {
        setTrees(t => [res, ...t]);
        setTreeForm(emptyTreeForm); setShowForm(false);
        flash('Tree created and live on the site!');
      } else flash(res.message || 'Failed to create tree');
    } finally { setSavingTree(false); }
  };

  // ── Post Farm Update ─────────────────────────────────────
  const postFarmUpdate = async () => {
    if (!fuRentalId.trim()) { flash('Enter a rental ID'); return; }
    setFuPosting(true);
    try {
      const data = new FormData();
      data.append('caption', fuCaption);
      if (fuFiles) Array.from(fuFiles).forEach(f => data.append('media', f));
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/farm-updates/${fuRentalId.trim()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: data,
      }).then(r => r.json());
      if (res._id) {
        flash('Farm update posted to customer!');
        setFuRentalId(''); setFuCaption(''); setFuFiles(null);
      } else flash(res.message || 'Failed — check rental ID');
    } finally { setFuPosting(false); }
  };

  // ── Upload Video ─────────────────────────────────────────
  const uploadVideo = async () => {
    if (!vidFile) { flash('Please select a video file'); return; }
    setVidUploading(true);
    try {
      const data = new FormData();
      data.append('title', vidTitle); data.append('description', vidDesc);
      data.append('video', vidFile);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/videos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: data,
      }).then(r => r.json());
      if (res._id) {
        setVideos(v => [res, ...v]);
        setVidTitle(''); setVidDesc(''); setVidFile(null);
        flash('Video uploaded!');
      } else flash(res.message || 'Upload failed');
    } finally { setVidUploading(false); }
  };

  // ── Upload Farm Photo ────────────────────────────────────
  const uploadFarmPhoto = async () => {
    if (!photoFile) { flash('Please select a photo'); return; }
    setPhotoUploading(true);
    try {
      const data = new FormData();
      data.append('caption', photoCaption);
      data.append('photo', photoFile);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/farm-photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: data,
      }).then(r => r.json());
      if (res._id) {
        setFarmPhotos(p => [res, ...p]);
        setPhotoCaption(''); setPhotoFile(null);
        flash('Photo uploaded!');
      } else flash(res.message || 'Upload failed');
    } finally { setPhotoUploading(false); }
  };

  const deleteFarmPhoto = async (id: string) => {
    await api.del(`/farm-photos/${id}`);
    setFarmPhotos(p => p.filter(x => x._id !== id));
    flash('Photo deleted');
  };

  // ── Post Public Update ───────────────────────────────────
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
        flash('Farm update posted to Life on Farm page!');
      } else flash(res.message || 'Upload failed');
    } finally { setPuPosting(false); }
  };

  const deletePublicUpdate = async (id: string) => {
    await api.del(`/public-updates/${id}`);
    setPublicUpdates(u => u.filter(x => x._id !== id));
    flash('Update deleted');
  };

  const deleteMediaItem = async (updateId: string, idx: number) => {
    await api.del(`/public-updates/${updateId}/media/${idx}`);
    setPublicUpdates(u => u.flatMap(x => {
      if (x._id !== updateId) return [x];
      const media = x.media.filter((_, i) => i !== idx);
      return media.length === 0 ? [] : [{ ...x, media }];
    }));
  };

  // ── Derived stats ────────────────────────────────────────
  const planCounts = trees.reduce((acc, t) => {
    acc[t.plan] = (acc[t.plan] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

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

  const searchUsers = async () => {
    if (!roleSearch.trim()) return;
    setRoleSearching(true);
    try {
      const results = await api.get(`/admin/users/search?email=${encodeURIComponent(roleSearch.trim())}`);
      setRoleResults(Array.isArray(results) ? results : []);
      if (!Array.isArray(results) || results.length === 0) flash('No users found for that email');
    } catch { flash('Search failed'); }
    finally { setRoleSearching(false); }
  };

  const setRole = async (userId: string, role: 'user' | 'admin') => {
    setRoleUpdating(userId);
    try {
      const updated = await api.patchBody(`/admin/users/${userId}/role`, { role });
      if (updated._id) {
        setRoleResults(prev => prev.map(u => u._id === userId ? updated : u));
        flash(`Role updated to "${role}" successfully`);
      } else flash(updated.message || 'Update failed');
    } catch { flash('Failed to update role'); }
    finally { setRoleUpdating(null); }
  };

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
                <div className="adm-kpi-label">Total Revenue</div>
                <div className="adm-kpi-sub">{stats?.cancelledRentals ?? 0} refund(s)</div>
              </div>
              <div className="adm-kpi adm-kpi--amber">
                <div className="adm-kpi-icon">🌳</div>
                <div className="adm-kpi-val">{stats?.totalTrees ?? trees.length}</div>
                <div className="adm-kpi-label">Total Trees</div>
                <div className="adm-kpi-sub">{stats?.availableTrees ?? '—'} available · {stats?.rentedTrees ?? '—'} rented</div>
              </div>
              <div className="adm-kpi adm-kpi--blue">
                <div className="adm-kpi-icon">📋</div>
                <div className="adm-kpi-val">{stats?.totalRentals ?? myRentals.length}</div>
                <div className="adm-kpi-label">Total Rentals</div>
                <div className="adm-kpi-sub">{stats?.cancelledRentals ?? 0} cancelled</div>
              </div>
              <div className="adm-kpi adm-kpi--purple">
                <div className="adm-kpi-icon">👥</div>
                <div className="adm-kpi-val">{stats?.users ?? '—'}</div>
                <div className="adm-kpi-label">Registered Users</div>
              </div>
            </div>

            <div className="adm-row-2">
              <div className="adm-card">
                <h2 className="adm-card-title">Trees by Plan</h2>
                {(['sapling', 'adult', 'grand'] as const).map(plan => {
                  const count = planCounts[plan] || 0;
                  const pct   = trees.length > 0 ? (count / trees.length) * 100 : 0;
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
                {trees.length === 0 && <p className="adm-empty" style={{ margin: 0 }}>No trees loaded.</p>}
              </div>

              <div className="adm-card">
                <h2 className="adm-card-title">Review Ratings</h2>
                {[5, 4, 3, 2, 1].map(n => {
                  const count = reviews.filter(r => r.rating === n).length;
                  const pct   = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
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
                {reviews.length === 0 && <p className="adm-empty" style={{ margin: 0 }}>No reviews yet.</p>}
              </div>
            </div>

            <div className="adm-card">
              <h2 className="adm-card-title">Recent Reviews</h2>
              {reviews.length === 0 ? (
                <p className="adm-empty">No reviews yet — be the first!</p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.slice(0, 6).map(r => (
                      <tr key={r._id}>
                        <td>
                          <div className="adm-td-user">
                            <div className="adm-avatar">{r.name[0].toUpperCase()}</div>
                            <span className="adm-td-name">{r.name}</span>
                          </div>
                        </td>
                        <td><span className="adm-stars">{'★'.repeat(r.rating)}</span></td>
                        <td className="adm-td-comment">
                          {r.comment.slice(0, 80)}{r.comment.length > 80 ? '…' : ''}
                        </td>
                        <td className="adm-td-date">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
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
                <p className="adm-sub">{trees.length} trees currently in inventory</p>
              </div>
              <button
                className="adm-btn-primary"
                onClick={() => { setShowForm(f => !f); setTreeForm(emptyTreeForm); }}
              >
                {showForm ? '✕ Cancel' : '+ Add Tree'}
              </button>
            </header>

            {showForm && (
              <div className="adm-card adm-form-card">
                <h2 className="adm-card-title">Add New Tree</h2>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label>Plan *</label>
                    <select
                      value={treeForm.plan}
                      onChange={e => setTreeForm(f => ({ ...f, plan: e.target.value as any }))}
                    >
                      <option value="sapling">Sapling — Small Pack</option>
                      <option value="adult">Adult — Medium Pack</option>
                      <option value="grand">Grand — Premium Pack</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Tree Name *</label>
                    <input
                      placeholder="e.g. Mango Tree #14"
                      value={treeForm.name}
                      onChange={e => setTreeForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Location</label>
                    <input
                      value={treeForm.location}
                      onChange={e => setTreeForm(f => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Yield Min (kg) *</label>
                    <input
                      type="number" placeholder="15"
                      value={treeForm.yieldMin}
                      onChange={e => setTreeForm(f => ({ ...f, yieldMin: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Yield Max (kg)</label>
                    <input
                      type="number" placeholder="25"
                      value={treeForm.yieldMax}
                      onChange={e => setTreeForm(f => ({ ...f, yieldMax: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Display Price Min (₹)</label>
                    <input
                      type="number" placeholder="2999"
                      value={treeForm.priceMin}
                      onChange={e => setTreeForm(f => ({ ...f, priceMin: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Display Price Max (₹)</label>
                    <input
                      type="number" placeholder="4999"
                      value={treeForm.priceMax}
                      onChange={e => setTreeForm(f => ({ ...f, priceMax: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Price / Season (₹) *</label>
                    <input
                      type="number" placeholder="3499"
                      value={treeForm.pricePerSeason}
                      onChange={e => setTreeForm(f => ({ ...f, pricePerSeason: e.target.value }))}
                    />
                  </div>
                  <div className="adm-field adm-field--check">
                    <label>
                      <input
                        type="checkbox"
                        checked={treeForm.isAvailable}
                        onChange={e => setTreeForm(f => ({ ...f, isAvailable: e.target.checked }))}
                      />
                      Available for rental
                    </label>
                  </div>
                </div>
                <button
                  className="adm-btn-primary"
                  onClick={handleCreateTree}
                  disabled={savingTree}
                >
                  {savingTree ? 'Creating…' : 'Create Tree'}
                </button>
              </div>
            )}

            <div className="adm-card">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Yield</th>
                    <th>Price / Season</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trees.map(t => (
                    <tr key={t._id}>
                      <td>
                        <span className={`adm-plan-badge adm-plan--${t.plan}`}>{t.plan}</span>
                      </td>
                      <td className="adm-td-bold">{t.name}</td>
                      <td className="adm-td-dim">{t.location}</td>
                      <td>{t.yieldMin}–{t.yieldMax} kg</td>
                      <td>₹{t.pricePerSeason.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`adm-status adm-status--${t.isAvailable ? 'avail' : 'rented'}`}>
                          {t.isAvailable ? '● Available' : '● Rented'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {trees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="adm-td-empty">No trees in inventory</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="adm-info-note">
              <span>ℹ️</span>
              <span>
                Edit &amp; delete require admin API routes on the backend.
                Newly created trees appear on the live site immediately.
              </span>
            </div>
          </div>
        )}

        {/* ════════ FARM UPDATES ════════ */}
        {tab === 'farmupdates' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">User Updates</h1>
                <p className="adm-sub">Send weekly orchard updates to specific customers</p>
              </div>
            </header>

            <div className="adm-card adm-form-card">
              <h2 className="adm-card-title">Post New Update</h2>

              {myRentals.length > 0 && (
                <div className="adm-field adm-field--wide" style={{ marginBottom: 16 }}>
                  <label>Quick-select from your rentals</label>
                  <select value={fuRentalId} onChange={e => setFuRentalId(e.target.value)}>
                    <option value="">— pick a rental —</option>
                    {myRentals.map((r: any) => (
                      <option key={r._id} value={r._id}>
                        {r.tree?.name} — Season {r.season} ({r.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="adm-field adm-field--wide" style={{ marginBottom: 16 }}>
                <label>Rental ID *</label>
                <input
                  placeholder="Paste the customer's rental _id from the database"
                  value={fuRentalId}
                  onChange={e => setFuRentalId(e.target.value)}
                />
              </div>

              <div className="adm-field adm-field--wide" style={{ marginBottom: 16 }}>
                <label>Caption</label>
                <textarea
                  rows={3}
                  placeholder="Your mangoes are growing beautifully this week! 🌿 The rains have been kind to your tree."
                  value={fuCaption}
                  onChange={e => setFuCaption(e.target.value)}
                />
              </div>

              <div className="adm-upload-zone" style={{ marginBottom: 20 }}>
                <label>
                  <span className="adm-upload-icon">📷</span>
                  <span>Attach Photos / Videos</span>
                  <input
                    type="file" multiple accept="image/*,video/*"
                    onChange={e => setFuFiles(e.target.files)}
                  />
                </label>
                {fuFiles && <p className="adm-file-count">{fuFiles.length} file(s) selected</p>}
              </div>

              <button
                className="adm-btn-primary"
                onClick={postFarmUpdate}
                disabled={fuPosting || !fuRentalId.trim()}
              >
                {fuPosting ? 'Posting…' : 'Post Update'}
              </button>
            </div>

            {myRentals.filter((r: any) => r.status === 'active').length > 0 && (
              <div className="adm-card">
                <h2 className="adm-card-title">Your Active Rentals</h2>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Tree</th>
                      <th>Season</th>
                      <th>Status</th>
                      <th>Rental ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRentals
                      .filter((r: any) => r.status === 'active')
                      .map((r: any) => (
                        <tr key={r._id}>
                          <td className="adm-td-bold">{r.tree?.name}</td>
                          <td>{r.season}</td>
                          <td>
                            <span className="adm-status adm-status--avail">● Active</span>
                          </td>
                          <td className="adm-td-mono">{r._id}</td>
                          <td>
                            <button
                              className="adm-btn-sm"
                              onClick={() => setFuRentalId(r._id)}
                            >
                              Use this ID
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════ REVIEWS ════════ */}
        {tab === 'reviews' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Reviews</h1>
                <p className="adm-sub">{reviews.length} customer reviews · avg {avgRating} ★</p>
              </div>
            </header>

            <div className="adm-reviews-grid">
              {reviews.map(r => (
                <div key={r._id} className="adm-review-card">
                  <div className="adm-review-top">
                    <div className="adm-td-user">
                      <div className="adm-avatar">{r.name[0].toUpperCase()}</div>
                      <div>
                        <div className="adm-td-name">{r.name}</div>
                        <div className="adm-stars">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="adm-review-date">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="adm-review-text">{r.comment}</p>
                  {r.media.length > 0 && (
                    <div className="adm-review-media">
                      {r.media.map((m, i) =>
                        m.type === 'image'
                          ? <img key={i} src={`${API_BASE}${m.url}`} alt="review" />
                          : <video key={i} src={`${API_BASE}${m.url}`} controls />
                      )}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="adm-empty">No reviews yet.</p>
              )}
            </div>

            <div className="adm-info-note">
              <span>ℹ️</span>
              <span>
                Review moderation (delete / flag) requires a DELETE admin route on the backend.
              </span>
            </div>
          </div>
        )}

        {/* ════════ VIDEOS ════════ */}
        {tab === 'videos' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Farm Videos</h1>
                <p className="adm-sub">{videos.length} videos on the Life on Farm page</p>
              </div>
            </header>

            <div className="adm-card adm-form-card">
              <h2 className="adm-card-title">Upload New Video</h2>
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label>Title *</label>
                  <input
                    placeholder="Weekly Orchard Update — Week 12"
                    value={vidTitle}
                    onChange={e => setVidTitle(e.target.value)}
                  />
                </div>
                <div className="adm-field">
                  <label>Description</label>
                  <input
                    placeholder="A quick look at how your mangoes are doing…"
                    value={vidDesc}
                    onChange={e => setVidDesc(e.target.value)}
                  />
                </div>
                <div className="adm-field adm-field--wide">
                  <div className="adm-upload-zone">
                    <label>
                      <span className="adm-upload-icon">🎥</span>
                      <span>{vidFile ? vidFile.name : 'Select Video File'}</span>
                      <input
                        type="file" accept="video/*"
                        onChange={e => setVidFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <button
                className="adm-btn-primary"
                onClick={uploadVideo}
                disabled={vidUploading}
              >
                {vidUploading ? 'Uploading…' : 'Upload Video'}
              </button>
            </div>

            <div className="adm-videos-grid">
              {videos.map(v => (
                <div key={v._id} className="adm-video-card">
                  <video
                    src={`${API_BASE}${v.url}`}
                    controls
                    className="adm-video-player"
                  />
                  <div className="adm-video-body">
                    <div className="adm-video-title">{v.title}</div>
                    {v.description && (
                      <div className="adm-video-desc">{v.description}</div>
                    )}
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <p className="adm-empty">No videos yet. Upload your first one above.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'publicupdates' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Life on Farm</h1>
                <p className="adm-sub">Post photos & videos to the Life on Farm page</p>
              </div>
            </header>

            <div className="adm-card adm-form-card">
              <h2 className="adm-card-title">Post New Update</h2>
              <div className="adm-form-grid">
                <div className="adm-field adm-field--wide">
                  <label>Caption (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Mangoes are ripening beautifully this week at Block A 🌿"
                    value={puCaption}
                    onChange={e => setPuCaption(e.target.value)}
                  />
                </div>
                <div className="adm-field adm-field--wide">
                  <div className="adm-upload-zone">
                    <label>
                      <span className="adm-upload-icon">📸</span>
                      <span>{puFiles && puFiles.length > 0 ? `${puFiles.length} file(s) selected` : 'Select Photos & Videos (multiple allowed)'}</span>
                      <input
                        type="file" multiple accept="image/*,video/*"
                        onChange={e => setPuFiles(e.target.files)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <button className="adm-btn-primary" onClick={postPublicUpdate} disabled={puPosting}>
                {puPosting ? 'Uploading…' : 'Post to Life on Farm'}
              </button>
            </div>

            <div style={{ marginTop: 32 }}>
              {publicUpdates.map(update => (
                <div key={update._id} className="adm-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: '0.9rem', color: '#444', flex: 1 }}>{update.caption || <em style={{ color: '#aaa' }}>No caption</em>}</p>
                    <button className="adm-btn-danger-sm" onClick={() => deletePublicUpdate(update._id)}>Delete</button>
                  </div>
                  <div className="adm-farm-photos-grid">
                    {update.media.map((m, i) => (
                      <div key={i} className="adm-farm-photo-card" style={{ position: 'relative' }}>
                        {m.type === 'image'
                          ? <img src={m.url} alt="farm" />
                          : <video src={m.url} controls style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                        <button
                          onClick={() => deleteMediaItem(update._id, i)}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1 }}
                          title="Remove this item"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {publicUpdates.length === 0 && <p className="adm-empty">No updates yet. Post your first one above.</p>}
            </div>
          </div>
        )}

        {tab === 'farmphotos' && (
          <div className="adm-content">
            <header className="adm-header">
              <div>
                <h1 className="adm-h1">Farm Photos</h1>
                <p className="adm-sub">{farmPhotos.length} photos on the Life on Farm page</p>
              </div>
            </header>

            <div className="adm-card adm-form-card">
              <h2 className="adm-card-title">Upload New Photo</h2>
              <div className="adm-form-grid">
                <div className="adm-field">
                  <label>Caption (optional)</label>
                  <input
                    placeholder="Harvest day at Block A…"
                    value={photoCaption}
                    onChange={e => setPhotoCaption(e.target.value)}
                  />
                </div>
                <div className="adm-field adm-field--wide">
                  <div className="adm-upload-zone">
                    <label>
                      <span className="adm-upload-icon">🌿</span>
                      <span>{photoFile ? photoFile.name : 'Select Photo (JPG/PNG/WebP)'}</span>
                      <input
                        type="file" accept="image/*"
                        onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <button
                className="adm-btn-primary"
                onClick={uploadFarmPhoto}
                disabled={photoUploading}
              >
                {photoUploading ? 'Uploading…' : 'Upload Photo'}
              </button>
            </div>

            <div className="adm-farm-photos-grid">
              {farmPhotos.map(p => (
                <div key={p._id} className="adm-farm-photo-card">
                  <img src={p.url} alt={p.caption || 'Farm photo'} />
                  <div className="adm-farm-photo-body">
                    <span className="adm-farm-photo-caption">{p.caption || 'No caption'}</span>
                    <button className="adm-btn-danger-sm" onClick={() => deleteFarmPhoto(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {farmPhotos.length === 0 && (
                <p className="adm-empty">No photos yet. Upload your first one above.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Payments Tab ───────────────────────────── */}
        {tab === 'payments' && (
          <div className="adm-pay-page">

            {/* Header */}
            <div className="adm-pay-header">
              <div className="adm-pay-header-left">
                <h2>💳 Payments</h2>
                <p>Live payment data from Razorpay — {payments.length > 0 ? `${payments.length} transactions loaded` : 'No data loaded yet'}</p>
              </div>
            </div>

            {/* Controls bar */}
            <div className="adm-pay-bar">
              <label>Show</label>
              <select value={payCount} onChange={e => setPayCount(Number(e.target.value))}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>Last {n} payments</option>)}
              </select>
              <button className="adm-pay-refresh" onClick={() => fetchPayments(payCount)} disabled={paymentsLoading}>
                {paymentsLoading ? <><span className="spin" />Loading…</> : payments.length ? '↻ Refresh' : '↻ Load Payments'}
              </button>
            </div>

            {/* Error */}
            {paymentsError && (
              <div className="adm-pay-error">⚠️ {paymentsError}</div>
            )}

            {/* KPI Strip */}
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
                      <div className="adm-pay-kpi-val">{payments.length}</div>
                      <div className="adm-pay-kpi-lbl">Total Transactions</div>
                    </div>
                  </div>
                  <div className="adm-pay-kpi">
                    <div className="adm-pay-kpi-icon adm-pay-kpi-icon--amber">✅</div>
                    <div className="adm-pay-kpi-body">
                      <div className="adm-pay-kpi-val">{payments.filter(p => p.status === 'captured').length}</div>
                      <div className="adm-pay-kpi-lbl">Successful</div>
                    </div>
                  </div>
                  <div className="adm-pay-kpi">
                    <div className="adm-pay-kpi-icon adm-pay-kpi-icon--red">❌</div>
                    <div className="adm-pay-kpi-body">
                      <div className="adm-pay-kpi-val">{payments.filter(p => p.status === 'failed').length}</div>
                      <div className="adm-pay-kpi-lbl">Failed</div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="adm-pay-table-card">
                  <div className="adm-pay-table-head">
                    <h3>Transaction History</h3>
                    <span className="adm-pay-count-pill">{payments.length} records</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="adm-pay-table">
                      <thead>
                        <tr>
                          <th>Payment ID</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Method</th>
                          <th>Customer</th>
                          <th>Rental</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => {
                          const statusLabel: Record<string, string> = { captured: 'Captured', failed: 'Failed', refunded: 'Refunded', authorized: 'Authorized', created: 'Pending' };
                          return (
                            <tr key={p.id}>
                              <td><span className="adm-pay-id" title={p.id}>{p.id}</span></td>
                              <td><span className="adm-pay-amount">₹{p.amount.toLocaleString('en-IN')}</span></td>
                              <td>
                                <span className={`adm-pay-badge adm-pay-badge--${p.status}`}>
                                  <span className="adm-pay-badge-dot" />
                                  {(statusLabel)[p.status] || p.status}
                                </span>
                              </td>
                              <td><span className="adm-pay-method">{p.method || '—'}</span></td>
                              <td>
                                {p.rental?.user
                                  ? <>
                                      <div className="adm-pay-customer-name">{(p.rental.user).name}</div>
                                      <div className="adm-pay-customer-email">{(p.rental.user).email}</div>
                                    </>
                                  : <div className="adm-pay-customer-email">{p.email || '—'}</div>
                                }
                              </td>
                              <td>
                                {p.rental
                                  ? <>
                                      <div className="adm-pay-rental-tree">{(p.rental.tree)?.name || '—'}</div>
                                      <span className="adm-pay-rental-plan">{(p.rental.tree)?.plan}</span>
                                    </>
                                  : <span className="adm-pay-customer-email">—</span>
                                }
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

            {/* Empty state */}
            {!paymentsLoading && payments.length === 0 && !paymentsError && (
              <div className="adm-pay-table-card">
                <div className="adm-pay-empty">
                  <div className="adm-pay-empty-icon">💳</div>
                  <h4>No payments loaded</h4>
                  <p>Click “Load Payments” above to fetch live transaction data from Razorpay.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── User Roles Tab ──────────────────────────── */}
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
              <button
                className="adm-btn-primary"
                onClick={searchUsers}
                disabled={roleSearching}
              >
                {roleSearching ? 'Searching…' : 'Search'}
              </button>
            </div>

            {roleResults.length > 0 && (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleResults.map(u => (
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
                            <button
                              className="adm-btn-danger-sm"
                              disabled={roleUpdating === u._id}
                              onClick={() => setRole(u._id, 'user')}
                            >
                              {roleUpdating === u._id ? '…' : 'Revoke Admin'}
                            </button>
                          ) : (
                            <button
                              className="adm-btn-primary-sm"
                              disabled={roleUpdating === u._id}
                              onClick={() => setRole(u._id, 'admin')}
                            >
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

      </main>
    </div>
  );
}
