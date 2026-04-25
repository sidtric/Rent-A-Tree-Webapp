import { useState, useEffect } from 'react';
import { api } from './api';
import type { Tree, Rental, User, Review, FarmUpdate } from './types';
import './App.css';

const PLAN_EMOJI: Record<string, string> = { sapling: '🌱', adult: '🌳', grand: '🏔️' };
const API_BASE = 'http://localhost:5000';

const STATS = [['15–60 kg', 'Per Season'], ['3', 'Tree Varieties']];
const STEPS = [
  { n: 1, icon: '🛒', h: 'Pick Your Plan',      p: 'Choose a tree size — Sapling, Adult, or Grand.' },
  { n: 2, icon: '🌳', h: 'We Assign Your Tree', p: 'A dedicated tree is tagged with your name on our Ramnagar farm.' },
  { n: 3, icon: '👨‍🌾', h: 'We Care For It',      p: 'Our farmers nurture your tree year-round — weekly photos & videos sent straight to your dashboard.' },
  { n: 4, icon: '📦', h: 'Harvest Delivered',   p: 'Fresh produce handpicked and shipped to your home within 24 hours.' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [view, setView] = useState<'home' | 'login' | 'register' | 'dashboard'>('home');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [rentForm, setRentForm] = useState({ treeId: '', deliveryAddress: '', season: '2025' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [reviewFiles, setReviewFiles] = useState<FileList | null>(null);
  const [updates, setUpdates] = useState<Record<string, FarmUpdate[]>>({});
  const [updateFiles, setUpdateFiles] = useState<FileList | null>(null);
  const [updateCaption, setUpdateCaption] = useState('');
  const [expandedRental, setExpandedRental] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/trees').then(setTrees).catch(() => {});
    api.get('/reviews').then(setReviews).catch(() => {});
    const saved = localStorage.getItem('user');
    if (localStorage.getItem('token') && saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) api.get('/rentals/my').then(setRentals).catch(() => {});
  }, [user]);

  const logout = () => { localStorage.clear(); setUser(null); setRentals([]); setView('home'); };

  const handleAuth = async (type: 'login' | 'register') => {
    const res = await api.post(`/auth/${type}`, form);
    if (!res.token) { setMsg(res.message || 'Error'); return; }
    if (type === 'register') {
      setMsg('Signup successful! Your baby tree is waiting for you 🌱');
      setTimeout(() => { setMsg(''); setForm({ name: '', email: '', password: '', phone: '' }); setView('login'); }, 2500);
    } else {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user); setView('dashboard'); setMsg('');
    }
  };

  const handleRent = async () => {
    if (!rentForm.treeId || !rentForm.deliveryAddress) { setMsg('Fill all fields'); return; }
    const res = await api.post('/rentals', rentForm);
    if (res._id) {
      setMsg('Tree rented successfully!');
      api.get('/trees').then(setTrees);
      api.get('/rentals/my').then(setRentals);
      setRentForm({ treeId: '', deliveryAddress: '', season: '2025' });
    } else setMsg(res.message || 'Error');
  };

  const handleReview = async () => {
    if (!reviewForm.comment.trim()) { setMsg('Please write a comment'); return; }
    const data = new FormData();
    data.append('rating', String(reviewForm.rating));
    data.append('comment', reviewForm.comment);
    data.append('name', user?.name || reviewForm.name || 'Anonymous');
    if (reviewFiles) Array.from(reviewFiles).forEach(f => data.append('media', f));
    const res = await fetch(`${API_BASE}/api/reviews`, { method: 'POST', body: data }).then(r => r.json());
    if (res._id) {
      setMsg('Review posted!'); setReviewForm({ rating: 5, comment: '', name: '' }); setReviewFiles(null);
      api.get('/reviews').then(setReviews);
    } else setMsg(res.message || 'Error posting review');
  };

  const loadUpdates = async (rentalId: string) => {
    if (expandedRental === rentalId) { setExpandedRental(null); return; }
    setExpandedRental(rentalId);
    if (!updates[rentalId]) {
      const data = await api.get(`/farm-updates/${rentalId}`);
      setUpdates(u => ({ ...u, [rentalId]: data }));
    }
  };

  const postFarmUpdate = async (rentalId: string) => {
    const data = new FormData();
    data.append('caption', updateCaption);
    if (updateFiles) Array.from(updateFiles).forEach(f => data.append('media', f));
    const res = await fetch(`${API_BASE}/api/farm-updates/${rentalId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: data,
    }).then(r => r.json());
    if (res._id) {
      setUpdates(u => ({ ...u, [rentalId]: [res, ...(u[rentalId] || [])] }));
      setUpdateCaption(''); setUpdateFiles(null);
      setMsg('Update posted!');
    }
  };

  const cancelRental = async (id: string) => {
    await api.patch(`/rentals/${id}/cancel`);
    api.get('/rentals/my').then(setRentals);
    api.get('/trees').then(setTrees);
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo" onClick={() => setView('home')}>MyTree 🌳</div>
        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-greeting">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-sm" onClick={() => setView('dashboard')}>Dashboard</button>
              <button className="btn-sm outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-sm outline" onClick={() => setView('login')}>Login</button>
              <button className="btn-sm" onClick={() => setView('register')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {msg && <div className="toast" onClick={() => setMsg('')}>{msg}</div>}

      {view === 'home' && (
        <>
          <section className="hero">
            <div className="hero-text">
              <div className="badge">🌿 Farm-to-Door Experience</div>
              <h1>Own a <span>Tree.</span><br />Get Fresh Produce Every Season.</h1>
              <p>Rent a real tree on our Ramnagar farm. We grow it, you enjoy the harvest — fresh produce delivered to your door.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => setView(user ? 'dashboard' : 'register')}>Rent My Tree →</button>
                <button className="btn-outline" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>See Plans</button>
              </div>
            </div>
            <div className="hero-emoji">🌳</div>
          </section>

          <div className="stats-bar">
            {STATS.map(([n, l]) => (
              <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>

          <section className="section">
            <div className="section-title"><h2>How It Works</h2><p>Simple, transparent, rewarding.</p></div>
            <div className="steps">
              {STEPS.map(s => (
                <div key={s.n} className="step">
                  <div className="step-num">{s.n}</div>
                  <div className="step-icon">{s.icon}</div>
                  <h3>{s.h}</h3><p>{s.p}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section plans-section" id="plans">
            <div className="section-title"><h2>Choose Your Tree</h2><p>All plans include free home delivery.</p></div>
            <div className="plans">
              {trees.length === 0 ? <p className="empty">No trees available — seed the backend first!</p> :
                Object.values(trees.reduce((acc, tree) => { acc[tree.plan] = acc[tree.plan] || tree; return acc; }, {} as Record<string, typeof trees[0]>))
                .map(tree => {
                  const available = trees.filter(t => t.plan === tree.plan && t.isAvailable).length;
                  return (
                    <div key={tree.plan} className={`plan-card ${available === 0 ? 'unavailable' : ''}`}>
                      <div className="plan-emoji">{PLAN_EMOJI[tree.plan]}</div>
                      <div className="plan-name">{tree.name}</div>
                      <div className="plan-price">₹{tree.pricePerSeason.toLocaleString()} <span>/ season</span></div>
                      <div className="plan-yield">{tree.yieldMin}–{tree.yieldMax} kg yield</div>
                      <div className="plan-loc">📍 {tree.location}</div>
                      <div className="plan-avail">{available} tree{available !== 1 ? 's' : ''} available</div>
                      {available > 0
                        ? <button className="btn-primary full" onClick={() => { setRentForm(f => ({ ...f, treeId: '' })); setView(user ? 'dashboard' : 'register'); }}>{user ? 'Rent This Plan' : 'Sign Up to Rent'}</button>
                        : <div className="unavail-badge">Fully Booked</div>}
                    </div>
                  );
                })
              }
            </div>
          </section>

          <section className="section reviews-section" id="reviews">
            <div className="section-title"><h2>What Our Tree Owners Say</h2><p>Real reviews from real tree owners.</p></div>
            <div className="review-form-card">
              <h3>Leave a Review</h3>
              {!user && <input placeholder="Your Name" value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))} />}
              <div className="star-row">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`star ${n <= reviewForm.rating ? 'filled' : ''}`} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>★</span>
                ))}
              </div>
              <textarea placeholder="Share your experience..." value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
              <label className="upload-label">
                📷 Add Photos / Videos
                <input type="file" multiple accept="image/*,video/*" onChange={e => setReviewFiles(e.target.files)} />
              </label>
              {reviewFiles && <p className="file-count">{reviewFiles.length} file(s) selected</p>}
              <button className="btn-primary" onClick={handleReview}>Post Review</button>
            </div>
            <div className="reviews-grid">
              {reviews.length === 0 ? <p className="empty">No reviews yet — be the first!</p> : reviews.map(r => (
                <div key={r._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">{r.name[0].toUpperCase()}</div>
                    <div>
                      <div className="reviewer-name">{r.name}</div>
                      <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  {r.media.length > 0 && (
                    <div className="review-media">
                      {r.media.map((m, i) => m.type === 'image'
                        ? <img key={i} src={`${API_BASE}${m.url}`} alt="review" />
                        : <video key={i} src={`${API_BASE}${m.url}`} controls />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="cta-bottom">
            <h2>Your Tree is Waiting 🌳</h2>
            <p>Get fresh, chemical-free produce from our Ramnagar farm delivered every season.</p>
            <button className="btn-primary" onClick={() => setView(user ? 'dashboard' : 'register')}>Rent a Tree Now →</button>
          </div>
        </>
      )}

      {(view === 'login' || view === 'register') && (
        <div className="auth-page">
          <div className="auth-card">
            <h2>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            {view === 'register' && <input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />}
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            {view === 'register' && <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />}
            <button className="btn-primary full" onClick={() => handleAuth(view)}>{view === 'login' ? 'Login' : 'Create Account'}</button>
            <p className="auth-toggle">
              {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => setView(view === 'login' ? 'register' : 'login')}>{view === 'login' ? 'Sign Up' : 'Login'}</span>
            </p>
          </div>
        </div>
      )}

      {view === 'dashboard' && user && (
        <div className="dashboard">
          <h2>My Dashboard</h2>
          <div className="dash-section">
            <h3>Rent a Tree</h3>
            <div className="rent-form">
              <select value={rentForm.treeId} onChange={e => setRentForm(f => ({ ...f, treeId: e.target.value }))}>
                <option value="">Select a tree...</option>
                {trees.filter(t => t.isAvailable).map(t => (
                  <option key={t._id} value={t._id}>{PLAN_EMOJI[t.plan]} {t.name} — ₹{t.pricePerSeason.toLocaleString()} ({t.yieldMin}–{t.yieldMax} kg)</option>
                ))}
              </select>
              <input placeholder="Delivery Address" value={rentForm.deliveryAddress} onChange={e => setRentForm(f => ({ ...f, deliveryAddress: e.target.value }))} />
              <select value={rentForm.season} onChange={e => setRentForm(f => ({ ...f, season: e.target.value }))}>
                <option value="2025">Season 2025</option>
                <option value="2026">Season 2026</option>
              </select>
              <button className="btn-primary" onClick={handleRent}>Confirm Rental</button>
            </div>
          </div>
          <div className="dash-section">
            <h3>My Rentals</h3>
            {rentals.length === 0 ? <p className="empty">No active rentals yet. Rent your first tree above!</p> : (
              <div className="rentals-list">
                {rentals.map(r => (
                  <div key={r._id} className={`rental-card status-${r.status}`}>
                    <div className="rental-top">
                      <span className="rental-tree">{PLAN_EMOJI[r.tree?.plan]} {r.tree?.name}</span>
                      <span className={`rental-badge ${r.status}`}>{r.status}</span>
                    </div>
                    <div className="rental-info">
                      <span>Season: {r.season}</span>
                      <span>Est. Yield: {r.estimatedYield} kg</span>
                      <span>📍 {r.deliveryAddress}</span>
                    </div>
                    <div className="rental-actions">
                      {r.status === 'active' && <button className="btn-cancel" onClick={() => cancelRental(r._id)}>Cancel Rental</button>}
                      <button className="btn-updates" onClick={() => loadUpdates(r._id)}>
                        {expandedRental === r._id ? 'Hide Updates' : '📷 View Farm Updates'}
                      </button>
                    </div>
                    {expandedRental === r._id && (
                      <div className="farm-updates">
                        <div className="update-upload">
                          <input placeholder="Caption (optional)" value={updateCaption} onChange={e => setUpdateCaption(e.target.value)} />
                          <label className="upload-label">
                            📷 Upload Photos / Videos
                            <input type="file" multiple accept="image/*,video/*" onChange={e => setUpdateFiles(e.target.files)} />
                          </label>
                          {updateFiles && <p className="file-count">{updateFiles.length} file(s) selected</p>}
                          <button className="btn-primary" onClick={() => postFarmUpdate(r._id)}>Post Update</button>
                        </div>
                        {(updates[r._id] || []).length === 0
                          ? <p className="empty">No updates yet — check back soon!</p>
                          : (updates[r._id] || []).map(u => (
                            <div key={u._id} className="update-card">
                              <p className="update-date">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              {u.caption && <p className="update-caption">{u.caption}</p>}
                              {u.media.length > 0 && (
                                <div className="review-media">
                                  {u.media.map((m, i) => m.type === 'image'
                                    ? <img key={i} src={`${API_BASE}${m.url}`} alt="update" />
                                    : <video key={i} src={`${API_BASE}${m.url}`} controls />)}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer>
        <p><strong>MyTree</strong> © 2025 — Grown with love in Ramnagar, Uttarakhand 🌿</p>
      </footer>
    </div>
  );
}
