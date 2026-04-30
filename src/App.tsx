import { useState, useEffect } from 'react';
import { api } from './api';
import type { Tree, Rental, User, Review, FarmUpdate, Video } from './types';
import './App.css';

const PLAN_EMOJI:  Record<string, string> = { sapling: '🌳', adult: '🌳', grand: '🌳' };
const PLAN_LABEL:  Record<string, string> = { sapling: 'Small Tree Pack', adult: 'Medium Tree Pack', grand: 'Premium Tree Pack' };
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const STEPS = [
  { n: 1, icon: '🌳', h: 'Choose Your Tree',   p: 'Pick a plan — Sapling, Adult, or Grand — from our Ramnagar orchard.' },
  { n: 2, icon: '💳', h: 'Rent the Yield',     p: 'Pay once and reserve your tree\'s harvest for the entire season.' },
  { n: 3, icon: '👨‍🌾', h: 'We Grow & Care',    p: 'Our orchardists nurture your tagged tree and send weekly photos & videos.' },
  { n: 4, icon: '📦', h: 'Harvest Delivered',  p: 'Fresh produce handpicked and shipped to your door within 24 hours.' },
];

const PLAN_IMAGES: Record<string, string> = {
  sapling: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80',
  adult:   'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=400&q=80',
  grand:   'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=400&q=80',
};

const GALLERY_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80', label: 'Fresh Mangoes' },
  { url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=500&q=80', label: 'Yellow Alphonso' },
  { url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=500&q=80', label: 'Orchard Canopy' },
  { url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=900&q=80', label: 'Our Farm' },
  { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=500&q=80', label: 'Open Fields' },
  { url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=500&q=80', label: 'Harvest Basket' },
];

const FEATURES = [
  { num: '01', icon: '🌿', title: 'Natural Farming',        desc: 'No chemicals, no shortcuts. Your tree grows the way nature intended, all season long.',   tag: 'Certified natural',    cls: 'fc1' },
  { num: '02', icon: '☀️', title: 'Tree-Ripened Harvest',   desc: 'Left on the tree until peak ripeness — never treated or artificially ripened.',             tag: 'Naturally ripened',    cls: 'fc2' },
  { num: '03', icon: '🚚', title: 'Farm-to-Home',           desc: 'Harvested and dispatched within 24 hours of picking. No cold storage, no delays.',          tag: 'Same-day dispatch',    cls: 'fc3' },
  { num: '04', icon: '📷', title: 'Weekly Updates',         desc: 'Photos and videos of your specific tree, sent to your dashboard every single week.',         tag: 'Your tree, live',      cls: 'fc4' },
  { num: '05', icon: '🏷️', title: 'Named Tree',             desc: 'Your tree is tagged with your name. You own it exclusively for the full season.',            tag: 'Exclusive ownership',  cls: 'fc5' },
  { num: '06', icon: '👨‍🌾', title: 'Expert Orchardists',    desc: 'Seasoned farmers in Ramnagar, Uttarakhand care for your tree year-round with love.',        tag: 'Professional care',    cls: 'fc6' },
];

const authFetch = (url: string, body: FormData) =>
  fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body }).then(r => r.json());

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoForm, setVideoForm] = useState({ title: '', description: '' });
  const [view, setView] = useState<'home' | 'login' | 'register' | 'dashboard' | 'about' | 'contact' | 'blog'>('home');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [rentForm, setRentForm] = useState({ treeId: '', deliveryAddress: '', season: '2025' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [reviewFiles, setReviewFiles] = useState<FileList | null>(null);
  const [updates, setUpdates] = useState<Record<string, FarmUpdate[]>>({});
  const [updateFiles, setUpdateFiles] = useState<FileList | null>(null);
  const [updateCaption, setUpdateCaption] = useState('');
  const [expandedRental, setExpandedRental] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [featIdx, setFeatIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setFeatIdx(i => (i + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get('/trees').then(setTrees).catch(() => {});
    api.get('/reviews').then(setReviews).catch(() => {});
    api.get('/videos').then(setVideos).catch(() => {});
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

  const uploadVideo = async () => {
    if (!videoFile) { setMsg('Please select a video'); return; }
    const data = new FormData();
    data.append('video', videoFile);
    data.append('title', videoForm.title || 'Orchard Video');
    data.append('description', videoForm.description);
    const res = await authFetch(`${API_BASE}/api/videos`, data);
    if (res._id) {
      setVideos(v => [res, ...v]); setVideoFile(null); setVideoForm({ title: '', description: '' }); setMsg('Video uploaded!');
    } else setMsg(res.message || 'Upload failed');
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
    const res = await authFetch(`${API_BASE}/api/farm-updates/${rentalId}`, data);
    if (res._id) {
      setUpdates(u => ({ ...u, [rentalId]: [res, ...(u[rentalId] || [])] }));
      setUpdateCaption(''); setUpdateFiles(null); setMsg('Update posted!');
    }
  };

  const cancelRental = async (id: string) => {
    await api.patch(`/rentals/${id}/cancel`);
    api.get('/rentals/my').then(setRentals);
    api.get('/trees').then(setTrees);
  };

  const planCards = Object.values(
    trees.reduce((acc, t) => { acc[t.plan] = acc[t.plan] || t; return acc; }, {} as Record<string, Tree>)
  );

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo" onClick={() => setView('home')}>YourOrchard</div>
        <div className="nav-center">
          <span className="nav-link" onClick={() => setView('home')}>Home</span>
          <span className="nav-link" onClick={() => setView('about')}>About</span>
          <span className="nav-link" onClick={() => setView('blog')}>Blog</span>
          <span className="nav-link" onClick={() => setView('contact')}>Contact</span>
          {user && <span className="nav-link" onClick={() => setView('dashboard')}>My Tree</span>}
          <span className="nav-link" onClick={() => { setView('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Shop</span>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <span className="nav-greeting">Hi, {user.name.split(' ')[0]}</span>
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
              <div className="hero-label">● Orchard to Doorstep</div>
              <p className="hero-brand">YourOrchard</p>
              <div className="hero-tagline">
                {'Have you city kids tasted the real mangoes?'.split(' ').map((word, i) => (
                  <span key={i} className="hero-word" style={{ animationDelay: `${i * 0.12}s` }}>{word}</span>
                ))}
              </div>
              <h1 className="hero-heading">Rent a <span>Tree.</span></h1>
              <p className="hero-sub">Own the harvest without owning the farm. Rent your own tree in Ramnagar, Uttarakhand and enjoy fresh produce delivered straight to your door.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => { setView('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Browse Trees →</button>
                <button className="btn-outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
              </div>
              <div className="hero-trust">
                <div className="trust-item"><span>📷</span> Weekly Updates</div>
                <div className="trust-item"><span>🌿</span> Natural Farming</div>
                <div className="trust-item"><span>🚚</span> Free Delivery</div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-img-wrap">
                <img className="hero-img" src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=680&q=85" alt="Fresh mangoes from our Ramnagar orchard" />
                <div className="hero-img-badge">🌿 Ramnagar, Uttarakhand</div>
                <div className="hero-img-pill">🥭 Mango Season 2025</div>
              </div>
            </div>
          </section>


          <section className="section how-it-works" id="how-it-works">
            <div className="section-title">
              <span className="section-label">How It Works</span>
              <h2>From Tree to Your <span>Table</span> — Simply</h2>
              <p>Three simple steps stand between you and a season full of fresh, naturally ripened produce.</p>
            </div>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div key={s.n} className="step-wrapper">
                  <div className="step">
                    <div className="step-label">STEP 0{s.n}</div>
                    <div className="step-icon-wrap">{s.icon}</div>
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="step-connector">
                      <div className="step-connector-arrow">→</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="section features-section">
            <div className="section-title">
              <span className="section-label">Why YourOrchard</span>
              <h2>Our Promise, <span>Every Season</span></h2>
              <p>We don't just deliver produce — we deliver trust, transparency, and taste you can trace back to your tree.</p>
            </div>

            <div className="feat-tabs">
              {FEATURES.map((f, i) => (
                <button key={f.num} className={`feat-tab ${i === featIdx ? 'active' : ''}`} onClick={() => setFeatIdx(i)}>
                  <span>{f.icon}</span>{f.title}
                </button>
              ))}
            </div>

            <div className="feat-carousel">
              <button className="feat-arrow" onClick={() => setFeatIdx(i => (i - 1 + FEATURES.length) % FEATURES.length)}>‹</button>
              <div className="feat-track-wrap">
                <div className="feat-track" style={{ transform: `translateX(-${featIdx * 100}%)` }}>
                  {FEATURES.map(f => (
                    <div key={f.num} className={`feat-slide ${f.cls}`}>
                      <div className="feat-slide-top">
                        <span className="feat-slide-num">{f.num}</span>
                        <div className="feat-slide-icon">{f.icon}</div>
                      </div>
                      <div className="feat-slide-body">
                        <div className="feat-slide-title">{f.title}</div>
                        <div className="feat-slide-desc">{f.desc}</div>
                        <div className="feature-tag"><span className="feature-tag-dot" />{f.tag}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="feat-arrow" onClick={() => setFeatIdx(i => (i + 1) % FEATURES.length)}>›</button>
            </div>

            <div className="feat-dots">
              {FEATURES.map((_, i) => (
                <button key={i} className={`feat-dot ${i === featIdx ? 'active' : ''}`} onClick={() => setFeatIdx(i)} />
              ))}
            </div>
          </section>

          <section className="section orchard-gallery">
            <div className="section-title">
              <span className="section-label">Life on the Farm</span>
              <h2>From the <span>Orchard Floor</span></h2>
              <p>A peek into your tree's world — mangoes ripening under the Himalayan sun in Ramnagar.</p>
            </div>
            <div className="gallery-grid">
              {GALLERY_PHOTOS.map((p, i) => (
                <div key={i} className={`gallery-item gi-${i + 1}`}>
                  <img src={p.url} alt={p.label} />
                  <div className="gallery-label">{p.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section plans-section" id="plans">
            <div className="section-title">
              <span className="section-label">Seasonal Plans</span>
              <h2>Choose Your <span>Tree</span></h2>
              <p>Pick a plan — key details and pricing on each card. All include free home delivery.</p>
            </div>
            <div className="plans">
              {trees.length === 0 ? <p className="empty">No trees available — seed the backend first!</p> : planCards.map(tree => {
                const available = trees.filter(t => t.plan === tree.plan && t.isAvailable).length;
                return (
                  <div key={tree.plan} className={`plan-card plan-${tree.plan} ${available === 0 ? 'unavailable' : ''}`}>
                    <div className="plan-card-header" style={{ backgroundImage: `url(${PLAN_IMAGES[tree.plan]})` }}>
                      <span className="plan-emoji">{PLAN_EMOJI[tree.plan]}</span>
                      <div className="plan-name">{PLAN_LABEL[tree.plan]}</div>
                    </div>
                    <div className="plan-card-body">
                      <div className="plan-price">₹{tree.priceMin.toLocaleString()} <span>– ₹{tree.priceMax.toLocaleString()}</span></div>
                      <div className="plan-yield">{tree.yieldMin}–{tree.yieldMax} kg / season</div>
                      <div className="plan-loc">📍 {tree.location}</div>
                      <div className="plan-avail">{available} tree{available !== 1 ? 's' : ''} available</div>
                      {available > 0
                        ? <button className="btn-primary full" onClick={() => { setRentForm(f => ({ ...f, treeId: '' })); setView(user ? 'dashboard' : 'register'); }}>{user ? 'Rent This Plan' : 'Sign Up to Rent'}</button>
                        : <div className="unavail-badge">Fully Booked</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>


          <section className="section videos-section" id="videos">
            <div className="section-title">
              <span className="section-label">From Our Orchard</span>
              <h2>A Glimpse Into <span>Your Tree's Home</span></h2>
              <p>Watch our orchard in action — every week, straight from Ramnagar.</p>
            </div>
            {videos.length === 0 ? <p className="empty">No videos yet — check back soon!</p> : (
              <div className="videos-grid">
                {videos.map(v => (
                  <div key={v._id} className="video-card">
                    <video src={`${API_BASE}${v.url}`} controls />
                    <div className="video-info">
                      <div className="video-title">{v.title}</div>
                      {v.description && <div className="video-desc">{v.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="section reviews-section" id="reviews">
            <div className="section-title">
              <span className="section-label">Tree Owner Reviews</span>
              <h2>What Our <span>Owners Say</span></h2>
              <p>Real reviews from real tree owners.</p>
            </div>
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
            <p>Get fresh produce from our Ramnagar orchard delivered every season.</p>
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
          <h2>My Tree</h2>
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
                        {expandedRental === r._id ? 'Hide Updates' : '📷 View Orchard Updates'}
                      </button>
                    </div>
                    {expandedRental === r._id && (
                      <div className="farm-updates">
                        {(updates[r._id] || []).length === 0 ? (
                          <p className="empty">Our orchardist will post your first update soon! 🌱</p>
                        ) : (updates[r._id] || []).map(u => (
                          <div key={u._id} className="update-card">
                            <p className="update-date">📅 {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            {u.caption && <p className="update-caption">{u.caption}</p>}
                            {u.media.length > 0 && (
                              <div className="update-media-grid">
                                {u.media.map((m, i) => m.type === 'image'
                                  ? <img key={i} src={`${API_BASE}${m.url}`} alt="orchard update" />
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

      {view === 'about' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>About YourOrchard 🌳</h1>
            <p>We connect city families with real trees on our Ramnagar orchard in Uttarakhand.</p>
          </div>
          <div className="info-content">
            <div className="info-card">
              <div className="info-icon">🌿</div>
              <h3>Our Story</h3>
              <p>YourOrchard was born from a simple idea — city kids should know where their food comes from. We started with a small orchard in Ramnagar and a big dream: let every family own a tree, no matter where they live.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">👨‍🌾</div>
              <h3>Our Orchardists</h3>
              <p>Our team of experienced orchardists in Ramnagar care for every tree like their own. They send you weekly photos and videos so you never miss a moment of your tree's journey.</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📦</div>
              <h3>The Promise</h3>
              <p>Every harvest is handpicked at peak ripeness and shipped directly to your door within 24 hours — no middlemen, no cold storage, just fresh produce straight from the orchard.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'contact' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>Get in Touch 📬</h1>
            <p>We'd love to hear from you. Reach out anytime.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="info-icon">📍</div>
              <h3>Visit Us</h3>
              <p>Ramnagar, Uttarakhand<br />India — 244715</p>
            </div>
            <div className="contact-card">
              <div className="info-icon">📧</div>
              <h3>Email Us</h3>
              <p>hello@mytree.in<br />support@mytree.in</p>
            </div>
            <div className="contact-card">
              <div className="info-icon">📞</div>
              <h3>Call Us</h3>
              <p>+91 98765 43210<br />Mon–Sat, 9am–6pm</p>
            </div>
          </div>
          <div className="contact-form-wrap">
            <h2>Send a Message</h2>
            <div className="contact-form">
              <input placeholder="Your Name" />
              <input placeholder="Email Address" type="email" />
              <textarea placeholder="Your message..." rows={5} />
              <button className="btn-primary">Send Message</button>
            </div>
          </div>
        </div>
      )}

      {view === 'blog' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>From the Orchard 📖</h1>
            <p>Stories, tips, and updates from our team in Ramnagar.</p>
          </div>
          <div className="blog-grid">
            {[
              { emoji: '🌸', title: 'How We Care for Your Tree Through Winter', date: 'March 2025', desc: 'Winter in Ramnagar can be cold, but our trees love it. Here\'s how we prepare them for the best spring bloom.' },
              { emoji: '💧', title: 'Why Orchard Water Tastes Different', date: 'February 2025', desc: 'The streams flowing from the Himalayas give our orchard a natural advantage. We break it down for you.' },
              { emoji: '📦', title: 'From Tree to Doorstep in 24 Hours', date: 'January 2025', desc: 'A behind-the-scenes look at how we pick, pack, and ship your harvest the same day it\'s plucked.' },
            ].map(post => (
              <div key={post.title} className="blog-card">
                <div className="blog-emoji">{post.emoji}</div>
                <div className="blog-date">{post.date}</div>
                <h3>{post.title}</h3>
                <p>{post.desc}</p>
                <span className="blog-read">Read more →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">YourOrchard</div>
            <p className="footer-brand-desc">Fresh produce from our Ramnagar orchard to your door. Rent a tree for the season — simple, transparent, real.</p>
            <div className="footer-social">
              <div className="footer-social-btn">📞</div>
              <div className="footer-social-btn">✉️</div>
              <div className="footer-social-btn">📍</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li onClick={() => { setView('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>How it works</li>
              <li onClick={() => { setView('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Our Trees</li>
              <li onClick={() => setView('about')}>About</li>
              <li onClick={() => setView('blog')}>Blog</li>
              <li onClick={() => setView('contact')}>Contact</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p className="footer-contact-line">hello@yourorchard.in</p>
            <p className="footer-contact-line dim">Ramnagar, Uttarakhand</p>
            <button className="footer-reserve-btn" onClick={() => setView(user ? 'dashboard' : 'register')}>Rent a Tree →</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 <strong>YourOrchard</strong>. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
