import { useState, useEffect, useRef } from 'react';
import { api } from './api';
import type { Tree, Rental, User, Review, FarmUpdate, Video, FarmPhoto, PublicUpdate } from './types';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

const PLAN_EMOJI:  Record<string, string> = { sapling: '🌳', adult: '🌳', grand: '🌳' };
const PLAN_LABEL:  Record<string, string> = { sapling: 'Small Tree Pack', adult: 'Medium Tree Pack', grand: 'Premium Tree Pack' };
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);

const isAdmin = (user: { email?: string } | null) =>
  !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

const STEPS = [
  { n: 1, icon: '🌳', h: 'Choose Your Tree',   p: 'Pick a plan — Sapling, Adult, or Grand — from our Ramnagar orchard.' },
  { n: 2, icon: '💳', h: 'Rent the Yield',     p: 'Pay once and reserve your tree\'s harvest for the entire season.' },
  { n: 3, icon: '👨‍🌾', h: 'We Grow & Care',    p: 'Our orchardists nurture your tagged tree and send weekly photos & videos.' },
  { n: 4, icon: '📦', h: 'Harvest Delivered',  p: 'Handpicked from your tree, packed fresh, and dispatched straight to your door.' },
];

const PLAN_IMAGES: Record<string, string> = {
  sapling: '/hero-mango-v3.jpg',
  adult:   '/hero-mango-v3.jpg',
  grand:   '/hero-mango-v3.jpg',
};

const GALLERY_PHOTOS = [
  { url: '/hero-mango-v3.jpg', label: 'Fresh Mangoes' },
  { url: '/hero-mango-v3.jpg', label: 'Yellow Alphonso' },
  { url: '/hero-mango-v3.jpg', label: 'Orchard Canopy' },
  { url: '/hero-mango-v3.jpg', label: 'Our Farm' },
  { url: '/hero-mango-v3.jpg', label: 'Open Fields' },
  { url: '/hero-mango-v3.jpg', label: 'Harvest Basket' },
];

const FEATURES = [
  { num: '01', icon: '🌿', title: 'Natural Farming',        desc: 'No chemicals, no shortcuts. Your tree grows the way nature intended, all season long.',   tag: 'Certified natural',    cls: 'fc1' },
  { num: '02', icon: '☀️', title: 'Tree-Ripened Harvest',   desc: 'Left on the tree until peak ripeness — never treated or artificially ripened.',             tag: 'Naturally ripened',    cls: 'fc2' },
  { num: '03', icon: '🚚', title: 'Farm-to-Home',           desc: 'Harvested and dispatched within 24 hours of picking. No cold storage, no delays.',          tag: 'Same-day dispatch',    cls: 'fc3' },
  { num: '04', icon: '📷', title: 'Weekly Updates',         desc: 'Photos and videos of your specific tree, sent to your dashboard every single week.',         tag: 'Your tree, live',      cls: 'fc4' },
  { num: '05', icon: '🏷️', title: 'Named Tree',             desc: 'Your tree is tagged with your name. You own it exclusively for the full season.',            tag: 'Exclusive ownership',  cls: 'fc5' },
  { num: '06', icon: '👨‍🌾', title: 'Expert Orchardists',    desc: 'Seasoned farmers in Ramnagar, Uttarakhand care for your tree year-round with love.',        tag: 'Professional care',    cls: 'fc6' },
];

const MANGO_BOXES = [
  { id: 'chausa',   name: 'Chausa Mango',   tag: '✨ Jewel of Ramnagar',   desc: 'Velvety smooth, saffron-hued, and so juicy it\'s best enjoyed straight from the skin. Straight from our bagiche.',  price: 1, img: '/mango-basket.jpg' },
  { id: 'dasheri',  name: 'Dasheri Mango',  tag: '❤️ People\'s Favourite', desc: 'Honey-sweet, thin-skinned, and loved by everyone. Plucked fresh from our Ramnagar orchard at peak ripeness.',         price: 1, img: '/mango-dasheri.jpg' },
  { id: 'langra',   name: 'Langra Mango',   tag: '💛 Most Fulfilling',     desc: 'Buttery, fiberless, and deeply aromatic. One box from our Ramnagar bagiche and you\'re fully satisfied.',               price: 1, img: '/mango-langra.jpg' },
];

const VARIETIES = [
  {
    id: 'chausa',  name: 'Chausa',  tagline: 'Jewel of Ramnagar',
    img: '/mango-basket.jpg',
    treeImg: '/chausa-tree.jpg',
    gallery: [
      '/mango-basket.jpg',
      '/mango-basket.jpg',
      '/mango-basket.jpg',
    ],
  },
  {
    id: 'dasheri', name: 'Dasheri', tagline: 'People\'s Favourite',
    img: '/mango-dasheri.jpg',
    treeImg: '/dasheri-tree.jpg',
    gallery: [
      '/mango-dasheri.jpg',
      '/mango-dasheri.jpg',
      '/mango-dasheri.jpg',
    ],
  },
  {
    id: 'langra',  name: 'Langra',  tagline: 'Most Fulfilling',
    img: '/mango-langra.jpg',
    treeImg: '/langra-tree.jpg',
    gallery: [
      '/mango-langra.jpg',
      '/mango-langra.jpg',
      '/mango-langra.jpg',
    ],
  },
];

const TREE_SIZES = [
  { plan: 'sapling', label: 'Small Tree', icon: '🌱', yield: '15–20 kg', perks: 'Perfect for a small family. One young tree, full season harvest.',   img: '/langra-tree.jpg' },
  { plan: 'adult',   label: 'Mid Tree',   icon: '🌳', yield: '30–45 kg', perks: 'The sweet spot — generous yield, great value for a family of 4.',     img: '/langra-tree.jpg' },
  { plan: 'grand',   label: 'Big Tree',   icon: '🏕️', yield: '60–80 kg', perks: 'Maximum yield. Best for large families or gifting boxes to loved ones.', img: '/langra-tree.jpg' },
];

function LoopVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    v.muted = true;
    const onEnded = () => { v.currentTime = 0; v.play().catch(() => {}); };
    v.addEventListener('ended', onEnded);
    v.play().catch(() => {});
    return () => v.removeEventListener('ended', onEnded);
  }, [src]);
  return <video ref={ref} src={src} muted playsInline preload="auto" style={style} />;
}

function SeamlessVideo({ src }: { src: string }) {
  const style: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
  return <video src={src} autoPlay muted loop playsInline preload="auto" style={style} />;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [farmPhotos, setFarmPhotos] = useState<FarmPhoto[]>([]);
  const [publicUpdates, setPublicUpdates] = useState<PublicUpdate[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoForm, setVideoForm] = useState({ title: '', description: '' });
  type View = 'home' | 'dashboard' | 'about' | 'contact' | 'blog' | 'terms' | 'privacy' | 'refund' | 'shipping' | 'farm' | 'admin';
  const validViews: View[] = ['home','dashboard','about','contact','blog','terms','privacy','refund','shipping','farm','admin'];
  const hashView = window.location.hash.replace('#','') as View;
  const [view, setView] = useState<View>(validViews.includes(hashView) ? hashView : 'home');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [rentModal, setRentModal] = useState<Tree | null>(null);
  const [rentForm, setRentForm] = useState({ treeId: '', deliveryAddress: '', season: '2026' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [reviewFiles, setReviewFiles] = useState<FileList | null>(null);
  const [updates, setUpdates] = useState<Record<string, FarmUpdate[]>>({});
  const [expandedRental, setExpandedRental] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [featIdx, setFeatIdx] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [activeBlog, setActiveBlog] = useState<{ emoji: string; title: string; date: string; desc: string } | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number; img: string; type?: 'tree'; treeObj?: Tree; season?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<'items' | 'address'>('items');
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', house: '', street: '', city: '', state: '', pin: '' });

  useEffect(() => {
    const t = setInterval(() => setFeatIdx(i => (i + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    api.get('/trees').then(setTrees).catch(() => {});
    api.get('/reviews').then(setReviews).catch(() => {});
    api.get('/videos').then(setVideos).catch(() => {});
    api.get('/farm-photos').then(setFarmPhotos).catch(() => {});
    api.get('/public-updates').then(setPublicUpdates).catch(() => {});
    const saved = localStorage.getItem('user');
    if (localStorage.getItem('token') && saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/rentals/my').then((data: Rental[]) => {
        setRentals(data);
        data.forEach((r: Rental) => {
          api.get(`/farm-updates/${r._id}`).then((u: FarmUpdate[]) =>
            setUpdates(prev => ({ ...prev, [r._id]: Array.isArray(u) ? u : [] }))
          ).catch(() => {});
        });
      }).catch(() => {});
    }
  }, [user]);

  const navigate = (v: View) => { setView(v); window.location.hash = v === 'home' ? '' : v; };
  const logout = () => { localStorage.clear(); setUser(null); setRentals([]); setCart([]); setCartOpen(false); navigate('home'); };

  const handleAuth = async () => {
    if (!form.email.trim() || !form.password.trim()) { setMsg('Please fill all fields'); return; }
    if (authModal === 'register') {
      if (!form.firstName.trim() || !form.lastName.trim()) { setMsg('Please enter your full name'); return; }
      if (!/^\d{10}$/.test(form.phone.trim())) { setMsg('Please enter a valid 10-digit phone number'); return; }
      if (form.password !== form.confirm) { setMsg('Passwords do not match'); return; }
    }
    try {
      const endpoint = authModal === 'register' ? '/auth/register' : '/auth/login';
      const payload  = authModal === 'register'
        ? { name: `${form.firstName.trim()} ${form.lastName.trim()}`, email: form.email.trim(), phone: `+91${form.phone.trim()}`, password: form.password }
        : { email: form.email.trim(), password: form.password };
      const res = await api.post(endpoint, payload);
      if (!res.token) { setMsg(res.message || 'Something went wrong'); return; }
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      setAuthModal(null);
      setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
      setMsg('');
    } catch { setMsg('Could not connect. Try again.'); }
  };

  const closeAuthModal = () => { setAuthModal(null); setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' }); setMsg(''); };

  const handleRent = async () => {
    if (!rentForm.treeId || !rentForm.deliveryAddress) { setMsg('Fill all fields'); return; }
    const tree = trees.find(t => t._id === rentForm.treeId);
    if (!tree) return;
    await openRazorpay(tree, rentForm.deliveryAddress, rentForm.season);
  };

  const openRazorpay = async (tree: Tree, deliveryAddress: string, season: string) => {
    if (!deliveryAddress.trim()) { setMsg('Please enter a delivery address'); return; }
    try {
      const order = await api.post('/payments/create-order', { treeId: tree._id });
      if (!order.orderId) { setMsg(order.message || 'Could not initiate payment'); return; }

      const rzp = new (window as any).Razorpay({
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    order.currency,
        name:        'YourOrchard',
        description: `${tree.name} — Season ${season}`,
        order_id:    order.orderId,
        prefill:     { name: user?.name, email: user?.email },
        theme:       { color: '#2d6a4f' },
        handler: async (response: any) => {
          const rental = await api.post('/payments/verify', {
            ...response,
            treeId: tree._id,
            deliveryAddress,
            season,
          });
          if (rental._id) {
            setMsg('Tree rented! Welcome to YourOrchard 🌳');
            setRentModal(null);
            setRentForm({ treeId: '', deliveryAddress: '', season: '2026' });
            api.get('/trees').then(setTrees);
            api.get('/rentals/my').then(setRentals);
            navigate('dashboard');
          } else {
            setMsg(rental.message || 'Payment received but rental creation failed. Contact support.');
          }
        },
      });
      rzp.open();
    } catch {
      setMsg('Payment failed. Please try again.');
    }
  };

  const prebookBox = (box: { name: string; price: number }) => {
    if (!user) { setAuthModal('register'); return; }
    const rzp = new (window as any).Razorpay({
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      box.price * 100,
      currency:    'INR',
      name:        'YourOrchard',
      description: `${box.name} — 10 kg box`,
      prefill:     { name: user.name, email: user.email },
      theme:       { color: '#2d6a4f' },
      handler: () => {
        setMsg(`${box.name} box prebooked! We'll confirm your delivery date by WhatsApp. 🥭`);
      },
    });
    rzp.open();
  };

  const handleReview = async () => {
    if (!reviewForm.comment.trim()) { setMsg('Please write a comment'); return; }
    try {
      const data = new FormData();
      data.append('rating', String(reviewForm.rating));
      data.append('comment', reviewForm.comment);
      data.append('name', user?.name || reviewForm.name || 'Anonymous');
      if (reviewFiles) Array.from(reviewFiles).forEach(f => data.append('media', f));
      const res = await fetch(`${API_BASE}/api/reviews`, { method: 'POST', body: data }).then(r => r.json());
      if (res._id) {
        setMsg('Review posted! Thank you 🌳'); setReviewForm({ rating: 5, comment: '', name: '' }); setReviewFiles(null);
        api.get('/reviews').then(setReviews).catch(() => {});
      } else setMsg(res.message || 'Error posting review');
    } catch {
      setMsg('Could not connect to server. Please try again.');
    }
  };

  const handleContact = async () => {
    const { name, email, message } = contactForm;
    if (!name.trim() || !email.trim() || !message.trim()) { setMsg('Please fill all fields'); return; }
    try {
      const res = await api.post('/contact', { name, email, message });
      if (res.message?.includes('received')) {
        setMsg('Message sent! We\'ll get back to you soon 🌿');
        setContactForm({ name: '', email: '', message: '' });
      } else setMsg(res.message || 'Something went wrong');
    } catch {
      setMsg('Could not connect to server. Please try again.');
    }
  };

  const loadUpdates = async (rentalId: string) => {
    if (!updates[rentalId]) {
      const data = await api.get(`/farm-updates/${rentalId}`);
      setUpdates(u => ({ ...u, [rentalId]: Array.isArray(data) ? data : [] }));
    }
  };

  const mediaUrl = (url: string) => url.startsWith('http') ? url : `${API_BASE}${url}`;

  const addToCart = (box: { id: string; name: string; price: number; img: string }, andOpen = false) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === box.id);
      if (existing) return prev.map(i => i.id === box.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...box, qty: 1 }];
    });
    if (andOpen) setCartOpen(true);
    else setMsg(`${box.name} added to cart`);
  };

  const addTreeToCart = (tree: Tree, andOpen = false) => {
    if (!user) { setAuthModal('register'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.id === tree._id);
      if (existing) return prev;
      return [...prev, { id: tree._id, name: tree.name, price: tree.pricePerSeason, qty: 1, img: '/hero-mango-v3.jpg', type: 'tree', treeObj: tree, season: '2026' }];
    });
    if (andOpen) setCartOpen(true);
    else setMsg(`${tree.name} added to cart`);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const proceedToCheckout = () => {
    if (!user) { setAuthModal('register'); setCartOpen(false); return; }
    if (cart.length === 0) return;
    const hasTree = cart.some(i => i.type === 'tree');
    if (hasTree) { setCartStep('address'); return; }
    checkoutCart('');
  };

  const checkoutCart = async (address: string) => {
    if (!user) return;

    const treeItems = cart.filter(i => i.type === 'tree');
    const boxItems  = cart.filter(i => i.type !== 'tree');

    if (treeItems.length > 0) {
      const item = treeItems[0];
      const tree = item.treeObj!;
      try {
        const order = await api.post('/payments/create-order', { treeId: tree._id });
        if (!order.orderId) { setMsg(order.message || 'Could not initiate payment'); return; }
        const rzp = new (window as any).Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      order.amount,
          currency:    order.currency,
          name:        'YourOrchard',
          description: `${tree.name} — Season ${item.season}`,
          order_id:    order.orderId,
          prefill:     { name: user.name, email: user.email },
          theme:       { color: '#2d6a4f' },
          handler: async (response: any) => {
            const rental = await api.post('/payments/verify', {
              ...response,
              treeId: tree._id,
              deliveryAddress: address,
              season: item.season,
            });
            if (rental._id) {
              setCart(prev => prev.filter(i => i.id !== item.id));
              setAddrForm({ name: '', phone: '', house: '', street: '', city: '', state: '', pin: '' });
              setCartStep('items');
              setMsg('Tree rented! Welcome to YourOrchard');
              api.get('/trees').then(setTrees);
              api.get('/rentals/my').then(setRentals);
              navigate('dashboard');
              setCartOpen(false);
            } else {
              setMsg(rental.message || 'Payment received but rental creation failed. Contact support.');
            }
          },
        });
        rzp.open();
      } catch {
        setMsg('Payment failed. Please try again.');
      }
      return;
    }

    const rzp = new (window as any).Razorpay({
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:      cartTotal * 100,
      currency:    'INR',
      name:        'YourOrchard',
      description: boxItems.map(i => `${i.name} x${i.qty}`).join(', '),
      prefill:     { name: user.name, email: user.email },
      theme:       { color: '#2d6a4f' },
      handler: () => {
        setCart([]);
        setCartOpen(false);
        setCartStep('items');
        setAddrForm({ name: '', phone: '', house: '', street: '', city: '', state: '', pin: '' });
        setMsg('Order placed! We\'ll confirm your delivery date by WhatsApp.');
      },
    });
    rzp.open();
  };

  const cancelRental = async (id: string) => {
    await api.patch(`/rentals/${id}/cancel`);
    api.get('/rentals/my').then(setRentals);
    api.get('/trees').then(setTrees);
  };

  const planCards = Object.values(
    trees.reduce((acc, t) => { acc[t.plan] = acc[t.plan] || t; return acc; }, {} as Record<string, Tree>)
  );

  if (view === 'admin' && user && isAdmin(user)) {
    return (
      <div className="app">
        <AdminDashboard user={user} onExit={() => navigate('home')} />
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="nav">
        <img className="logo-full" src="/logo-full.jpeg" alt="YourOrchard — Rooted in Nature, Delivered with Care" onClick={() => { navigate('home'); setMobileMenu(false); }} />
        <div className="nav-center">
          <span className={`nav-link ${view === 'home' ? 'nav-link-active' : ''}`} onClick={() => navigate('home')}>Home</span>
          <span className="nav-link" onClick={() => { navigate('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>How It Works</span>
          <span className="nav-link" onClick={() => { navigate('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Browse Trees</span>
          <span className={`nav-link ${view === 'farm' ? 'nav-link-active' : ''}`} onClick={() => navigate('farm')}>Life on Farm</span>
          <span className={`nav-link ${view === 'about' ? 'nav-link-active' : ''}`} onClick={() => navigate('about')}>About Us</span>
          <span className={`nav-link ${view === 'blog' ? 'nav-link-active' : ''}`} onClick={() => navigate('blog')}>Blog</span>
          <span className={`nav-link ${view === 'contact' ? 'nav-link-active' : ''}`} onClick={() => navigate('contact')}>Contact</span>
          <span className="nav-link" onClick={() => { navigate('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Shop</span>
          {user && <span className={`nav-link ${view === 'dashboard' ? 'nav-link-active' : ''}`} onClick={() => navigate('dashboard')}>My Tree</span>}
          {isAdmin(user) && <span className="nav-link nav-link-admin" onClick={() => navigate('admin')}>⚙ Admin</span>}
        </div>
        <div className="nav-links">
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          {user ? (
            <span className="nav-welcome">Hello {(user.name || '').split(' ')[0] || 'friend'}</span>
          ) : (
            <>
              <button className="btn-sm outline" onClick={() => setAuthModal('login')}>Login</button>
              <button className="btn-sm" onClick={() => setAuthModal('register')}>Sign Up</button>
            </>
          )}
        </div>
        <button className="nav-hamburger" onClick={() => setMobileMenu(m => !m)}>
          {mobileMenu ? '✕' : '☰'}
        </button>
      </nav>
      {user && (
        <div className="mobile-top-welcome">🌳 Hello {(user.name || '').split(' ')[0] || 'friend'}, welcome to your bagicha</div>
      )}
      {mobileMenu && (
        <div className="mobile-menu">
          {user && (
            <div className="mobile-welcome">🌳 Hello {(user.name || '').split(' ')[0] || 'friend'}, welcome to your bagicha</div>
          )}
          <span className="mobile-nav-link" onClick={() => { navigate('home'); setMobileMenu(false); }}>Home</span>
          <span className="mobile-nav-link" onClick={() => { navigate('about'); setMobileMenu(false); }}>About</span>
          <span className="mobile-nav-link" onClick={() => { navigate('farm'); setMobileMenu(false); }}>Life on Farm</span>
          <span className="mobile-nav-link" onClick={() => { navigate('blog'); setMobileMenu(false); }}>Blog</span>
          <span className="mobile-nav-link" onClick={() => { navigate('contact'); setMobileMenu(false); }}>Contact</span>
          {user && <span className="mobile-nav-link" onClick={() => { navigate('dashboard'); setMobileMenu(false); }}>My Tree</span>}
          <span className="mobile-nav-link" onClick={() => { navigate('home'); setMobileMenu(false); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Shop</span>
          {!user && (
            <div className="mobile-menu-auth">
              <button className="btn-sm outline" onClick={() => { setAuthModal('login'); setMobileMenu(false); }}>Login</button>
              <button className="btn-sm" onClick={() => { setAuthModal('register'); setMobileMenu(false); }}>Sign Up</button>
            </div>
          )}
        </div>
      )}


      <a
        className="whatsapp-btn"
        href="https://wa.me/917535850398?text=Hi%2C%20I%27m%20interested%20in%20renting%20a%20tree%20on%20YourOrchard%21"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 8.5A10.43 10.43 0 0 0 16 5.5C10.75 5.5 6.5 9.75 6.5 15c0 1.63.43 3.22 1.24 4.63L6.5 26.5l7.07-1.85A10.46 10.46 0 0 0 16 25c5.25 0 9.5-4.25 9.5-9.5 0-2.54-.99-4.93-2.77-6.73-.19-.19-.15-.27 0 0zM16 23.25a8.7 8.7 0 0 1-4.44-1.22l-.32-.19-3.3.86.88-3.22-.21-.33A8.71 8.71 0 1 1 16 23.25zm4.78-6.52c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.3-1.55-1.45-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.14 0 1.26.92 2.48 1.05 2.65.13.17 1.8 2.75 4.37 3.86.61.26 1.09.42 1.46.54.61.19 1.17.16 1.61.1.49-.07 1.54-.63 1.75-1.24.22-.6.22-1.12.15-1.23-.06-.11-.24-.17-.5-.3z" fill="#fff"/></svg>
      </a>

      {msg && <div className="toast" onClick={() => setMsg('')}>{msg}</div>}

      {view === 'home' && (
        <>
          <section className="hero">
            <div className="hero-text">
              <div className="hero-label">🌿 Orchard to Doorstep</div>
              <h1 className="hero-heading">Rent a <span>Tree.</span></h1>
              <p className="hero-subheading">Fresh Harvest, Delivered to You.</p>
              <p className="hero-sub">Own the harvest without owning the farm. Rent your own tree in Ramnagar, Uttarakhand and enjoy farm-fresh fruits delivered straight to your door.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => { navigate('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Browse Trees →</button>
                <button className="btn-outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>▶ How it works</button>
              </div>
              <div className="hero-trust">
                <div className="trust-item"><span>📅</span> Weekly Updates</div>
                <div className="trust-item"><span>🌱</span> Natural Farming</div>
                <div className="trust-item"><span>🛡️</span> Safe &amp; Secure</div>
                <div className="trust-item"><span>📦</span> Free Delivery</div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-img-wrap">
                <img className="hero-img" src="/hero-mango-v3.jpg" alt="Mango orchard at sunset in Ramnagar, Uttarakhand" />
              </div>
            </div>
          </section>


          <section className="trust-howit" id="how-it-works">
            <div className="trust-howit-inner">
              <div className="howit-panel">
                <h3 className="howit-title">How it works</h3>
                <div className="howit-cards">
                  <div className="howit-card">
                    <div className="howit-num">1</div>
                    <div className="howit-icon">🌳</div>
                    <h4>Choose a Tree</h4>
                    <p>Pick your favorite fruit tree and location.</p>
                  </div>
                  <div className="howit-arrow">▸ ▸ ▸</div>
                  <div className="howit-card">
                    <div className="howit-num">2</div>
                    <div className="howit-icon">👨‍🌾</div>
                    <h4>We Grow &amp; Care</h4>
                    <p>Our farmers take care of your tree naturally.</p>
                  </div>
                  <div className="howit-arrow">▸ ▸ ▸</div>
                  <div className="howit-card">
                    <div className="howit-num">3</div>
                    <div className="howit-icon">🧺</div>
                    <h4>You Receive Harvest</h4>
                    <p>Enjoy fresh, seasonal fruits at your doorstep.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="section plans-section" id="plans">
            <div className="section-title">
              <span className="section-label">Seasonal Plans</span>
              <h2>Choose Your <span>Tree</span></h2>
              <p>Pick a variety, then choose your tree size. All plans include free home delivery.</p>
            </div>

            <div className="variety-row">
              {VARIETIES.map(variety => (
                <div
                  key={variety.id}
                  className={`variety-card ${selectedVariety === variety.id ? 'active' : ''}`}
                  onClick={() => setSelectedVariety(selectedVariety === variety.id ? null : variety.id)}
                >
                  <div className="variety-card-img" style={{ backgroundImage: `url(${variety.img})` }} />
                  <div className="variety-card-info">
                    <span className="variety-card-name">{variety.name} Aam</span>
                    <span className="variety-card-tagline">{variety.tagline}</span>
                  </div>
                  <span className="variety-card-arrow">{selectedVariety === variety.id ? '▲' : '▼'}</span>
                </div>
              ))}
            </div>

            {selectedVariety && (
              <div className="tree-size-popup">
                <div className="tree-size-popup-header">
                  {VARIETIES.find(v => v.id === selectedVariety)?.name} Aam — Choose Tree Size
                </div>
                <div className="tree-size-grid">
                  {TREE_SIZES.map(size => {
                    const available = trees.filter(t => t.plan === size.plan && t.isAvailable).length;
                    const treeRef = planCards.find(t => t.plan === size.plan);
                    const variety = VARIETIES.find(v => v.id === selectedVariety);
                    const treeImage = variety?.treeImg || size.img;
                    return (
                      <div key={size.plan} className={`tsize-card ${treeRef && available === 0 ? 'unavailable' : ''}`}>
                        <div className="tsize-img" style={{ backgroundImage: `url(${treeImage})` }}>
                          <span className="tsize-badge">{size.icon} {size.label}</span>
                        </div>
                        <div className="tsize-body">
                          <div className="tsize-yield">{treeRef ? `${treeRef.yieldMin}–${treeRef.yieldMax}` : size.yield} kg / season</div>
                          <p className="tsize-perks">{size.perks}</p>
                          {treeRef && <div className="tsize-price">₹{treeRef.priceMin.toLocaleString()} <span>– ₹{treeRef.priceMax.toLocaleString()}</span></div>}
                          <div className="plan-loc">📍 Ramnagar, Uttarakhand</div>
                          {treeRef
                            ? available > 0
                              ? (
                                <div className="card-actions">
                                  <button className="btn-outline" onClick={() => addTreeToCart(treeRef)}>Add to Cart</button>
                                  <button className="btn-primary" onClick={() => addTreeToCart(treeRef, true)}>Buy Now</button>
                                </div>
                              )
                              : <div className="unavail-badge">Fully Booked</div>
                            : <button className="btn-primary full" onClick={() => { if (user) navigate('dashboard'); else setAuthModal('register'); }}>{user ? 'Rent Now' : 'Sign Up to Rent'}</button>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="section mango-box-section" id="boxes">
            <div className="section-title">
              <span className="section-label">Just Want Mangoes?</span>
              <h2>Order a <span>10 kg Box</span></h2>
              <p>No tree rental needed. Pick your variety and get a fresh 10 kg box delivered straight from Ramnagar.</p>
              <div className="prebook-banner">🌿 Prebook now — Harvest starts May 15</div>
            </div>
            <div className="mango-boxes">
              {MANGO_BOXES.map(box => (
                <div key={box.id} className="box-card">
                  <div className="box-card-img" style={{ backgroundImage: `url(${box.img})` }}>
                    <div className="box-weight-badge">10 kg</div>
                    <div className="box-tag-popup">{box.tag}</div>
                  </div>
                  <div className="box-card-body">
                    <div className="box-name">{box.name}</div>
                    <p className="box-desc">{box.desc}</p>
                    <div className="box-price">₹{box.price.toLocaleString()} <span>/ box</span></div>
                    <div className="card-actions">
                      <button className="btn-outline" onClick={() => addToCart(box)}>Add to Cart</button>
                      <button className="btn-primary" onClick={() => addToCart(box, true)}>Buy Now</button>
                    </div>
                  </div>
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


            <div className="feat-grid">
              {FEATURES.map((f) => (
                <div key={f.num} className={`feat-card ${f.cls}`}>
                  <div className="feat-card-top">
                    <span className="feat-card-num">{f.num}</span>
                    <div className="feat-card-icon">{f.icon}</div>
                  </div>
                  <div className="feat-card-body">
                    <div className="feat-card-title">{f.title}</div>
                    <div className="feat-card-desc">{f.desc}</div>
                    <div className="feature-tag"><span className="feature-tag-dot" />{f.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </>
      )}

      {authModal && (
        <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}>
          <div className="auth-modal">
            <button className="auth-close" onClick={closeAuthModal}>✕</button>
            <h2>{authModal === 'register' ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="auth-sub">{authModal === 'register' ? 'Join YourOrchard to rent a tree' : 'Login to your YourOrchard account'}</p>
            {authModal === 'register' && (
              <div className="auth-row">
                <input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                />
                <input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            )}
            <input
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />
            {authModal === 'register' && (
              <div className="phone-input">
                <span className="phone-prefix">🇮🇳 +91</span>
                <input
                  className="phone-field"
                  placeholder="Phone number"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            )}
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />
            {authModal === 'register' && (
              <input
                placeholder="Confirm Password"
                type="password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
            )}
            <button className="btn-primary full" onClick={handleAuth}>
              {authModal === 'register' ? 'Create Account →' : 'Login →'}
            </button>
            <p className="auth-toggle">
              {authModal === 'register'
                ? <>Already have an account? <span onClick={() => { setAuthModal('login'); setMsg(''); }}>Login</span></>
                : <>New here? <span onClick={() => { setAuthModal('register'); setMsg(''); }}>Create account</span></>
              }
            </p>
          </div>
        </div>
      )}

      {rentModal && (
        <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) setRentModal(null); }}>
          <div className="auth-modal">
            <button className="auth-close" onClick={() => setRentModal(null)}>✕</button>
            <h2>Rent {PLAN_LABEL[rentModal.plan]}</h2>
            <p className="auth-sub">₹{rentModal.pricePerSeason.toLocaleString()} · {rentModal.yieldMin}–{rentModal.yieldMax} kg · Season 2026</p>
            <select value={rentForm.season} onChange={e => setRentForm(f => ({ ...f, season: e.target.value }))}>
              <option value="2026">Season 2026</option>
            </select>
            <button className="btn-primary full" onClick={() => {
              setCart(prev => {
                const existing = prev.find(i => i.id === rentModal._id);
                if (existing) return prev;
                return [...prev, { id: rentModal._id, name: rentModal.name, price: rentModal.pricePerSeason, qty: 1, img: '/hero-mango-v3.jpg', type: 'tree', treeObj: rentModal, season: rentForm.season }];
              });
              setRentModal(null);
              setRentForm({ treeId: '', deliveryAddress: '', season: '2026' });
              setCartOpen(true);
            }}>
              Add to Cart →
            </button>
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
                    {r.status === 'active' && (
                      <div className="rental-actions">
                        <button className="btn-cancel" onClick={() => cancelRental(r._id)}>Cancel Rental</button>
                      </div>
                    )}
                    <div className="farm-updates">
                      <p className="updates-heading">📷 Orchard Updates</p>
                      {!updates[r._id] ? (
                        <p className="empty">Loading updates…</p>
                      ) : updates[r._id].length === 0 ? (
                        <p className="empty">Our orchardist will post your first update soon! 🌱</p>
                      ) : updates[r._id].map(u => (
                        <div key={u._id} className="update-card">
                          <p className="update-date">📅 {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          {u.caption && <p className="update-caption">{u.caption}</p>}
                          {u.media.length > 0 && (
                            <div className="update-media-grid">
                              {u.media.map((m, i) => m.type === 'image'
                                ? <img key={i} src={mediaUrl(m.url)} alt="orchard update" />
                                : <video key={i} src={mediaUrl(m.url)} controls />)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
              <p>hello@yourorchard.in<br />support@yourorchard.in</p>
            </div>
            <div className="contact-card">
              <div className="info-icon">📞</div>
              <h3>Call Us</h3>
              <p>+91 75358 50398<br />Mon–Sat, 9am–6pm</p>
            </div>
          </div>
          <div className="contact-form-wrap">
            <h2>Send a Message</h2>
            <div className="contact-form">
              <input placeholder="Your Name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} />
              <input placeholder="Email Address" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
              <textarea placeholder="Your message..." rows={5} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
              <button className="btn-primary" onClick={handleContact}>Send Message</button>
            </div>
          </div>
          <section className="section reviews-section" id="reviews">
            <div className="section-title">
              <span className="section-label">Tree Owner Reviews</span>
              <h2>What Our <span>Owners Say</span></h2>
              <p>Honest reviews from real tree owners across India.</p>
            </div>
            <div className="review-form-card">
              <h3>Leave a Review</h3>
              <input placeholder="Your Name" value={user ? user.name : reviewForm.name} onChange={e => { if (!user) setReviewForm(f => ({ ...f, name: e.target.value })); }} readOnly={!!user} />
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
              { emoji: '👨‍💻', title: 'We\'re a Bunch of Techies from Uttarakhand — and That\'s Exactly Why We Built This', date: 'April 2026', desc: 'We are a bunch of techies, marketers, and builders — all from Uttarakhand, all with farming somewhere in our roots. Growing up, our dads and uncles had bagichas. We watched fruits — mangoes, litchis, guavas, pears — get picked, packed in old wooden crates, and sold for nothing at the local mandi. We moved to cities, learned to code, learned to run ads, learned to build products. But we never stopped thinking about those orchards. YourOrchard is our way back. Not to leave the city — but to connect it, honestly, to the farm we grew up around. We are starting with mangoes but this is bigger than one fruit. Uttarakhand grows some of the finest produce in the country — and we are here to make sure it reaches your door, season after season, fruit after fruit. We are not romanticising farming. We know it is hard, unpredictable, and underpaid. That is exactly why we built this — so the orchardist earns more, the city family eats better, and every tree gets the care it deserves.' },
              { emoji: '🥭', title: 'How To Check If A Mango Is Ripe & Sweet?', date: 'April 2026', desc: 'Most people squeeze a mango and hope for the best. There is a better way. A ripe mango gives slightly under gentle pressure — not soft, not rock hard. Smell the stem end: a strong, sweet fragrance means the sugars have developed fully. The skin colour is a myth — some of the sweetest mangoes stay green even when perfectly ripe. Look instead at the shoulder: a ripe mango fills out around the stem, with no hollow dip. And taste a small piece near the seed — that is where the flavour concentrates first. At our Ramnagar bagiche, we let every mango tell us when it is ready. Tree-ripened fruit does not need tricks — it announces itself.' },
              { emoji: '🏆', title: '5 Foolproof Ways To Find The Best Mango', date: 'April 2026', desc: '1. Smell it first — the nose never lies. A great mango smells like a great mango even before you peel it. 2. Press gently near the stem — it should yield slightly, like a ripe avocado. 3. Check the weight — a dense, heavy mango has more flesh and juice than a light one of the same size. 4. Look at the skin texture — fine, smooth skin with no shrivelling means it was picked at the right time. 5. Know the variety — Chausa, Dasheri, and Langra each have a different peak window. Buying the right variety at the wrong time is the most common mistake. The simplest rule: buy from a source that knows exactly when the fruit was picked. That is the whole reason we built YourOrchard.' },
            ].map(post => (
              <div key={post.title} className="blog-card">
                <div className="blog-emoji">{post.emoji}</div>
                <div className="blog-date">{post.date}</div>
                <h3>{post.title}</h3>
                <p className="blog-excerpt">{post.desc.slice(0, 110)}…</p>
                <span className="blog-read" onClick={() => setActiveBlog(post)}>Read more →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeBlog && (
        <div className="blog-overlay" onClick={e => { if (e.target === e.currentTarget) setActiveBlog(null); }}>
          <div className="blog-modal">
            <button className="blog-modal-close" onClick={() => setActiveBlog(null)}>✕</button>
            <div className="blog-modal-emoji">{activeBlog.emoji}</div>
            <div className="blog-modal-date">{activeBlog.date}</div>
            <h2 className="blog-modal-title">{activeBlog.title}</h2>
            <p className="blog-modal-body">{activeBlog.desc}</p>
          </div>
        </div>
      )}

      {view === 'terms' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>Terms & Conditions</h1>
            <p>Last updated: April 2026. Please read these terms carefully before renting a tree.</p>
          </div>
          <div className="policy-body">
            <div className="policy-section">
              <h3>1. The Tree Rental Agreement</h3>
              <p>When you rent a tree on YourOrchard, you are reserving the exclusive harvest yield of a specific, tagged mango tree on our farm in Ramnagar, Uttarakhand for one full season. The tree remains on our land and under our care at all times. You do not acquire any ownership, land rights, or physical access to the tree.</p>
            </div>
            <div className="policy-section">
              <h3>2. Yield & Harvest</h3>
              <p>The yield ranges shown (e.g., 15–20 kg, 25–35 kg) are honest estimates based on tree age, historical output, and typical seasonal conditions. They are not guaranteed quantities. Natural factors — weather, rainfall, pest activity, or disease — can affect the final yield. In the rare event that a tree produces significantly below the minimum estimate (less than 70% of the lower bound), we will offer a proportional credit or partial refund at our discretion.</p>
            </div>
            <div className="policy-section">
              <h3>3. Weekly Updates</h3>
              <p>We commit to sending at least one photo or video update of your specific tree every week during the active growing season (April–July). Updates are shared through your dashboard. Delays of up to 3 days may occasionally occur due to connectivity issues in Ramnagar.</p>
            </div>
            <div className="policy-section">
              <h3>4. Delivery</h3>
              <p>Harvest is dispatched within 24–48 hours of picking, via a reputable courier partner. Delivery is available across India. You are responsible for providing an accurate and complete delivery address. YourOrchard is not liable for delays caused by incorrect addresses or courier issues beyond our control.</p>
            </div>
            <div className="policy-section">
              <h3>5. User Responsibilities</h3>
              <p>You agree to provide accurate personal and delivery information. You must be at least 18 years old to rent a tree. You agree not to misuse the platform, including fraudulent payment attempts or false claims about delivery or yield.</p>
            </div>
            <div className="policy-section">
              <h3>6. Payments</h3>
              <p>All payments are processed securely via Razorpay. YourOrchard does not store your card or banking details. The rental fee is charged in full at the time of booking. Applicable taxes are included in the displayed price.</p>
            </div>
            <div className="policy-section">
              <h3>7. Governing Law</h3>
              <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Uttarakhand, India.</p>
            </div>
            <div className="policy-section">
              <h3>8. Changes to Terms</h3>
              <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'privacy' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>Privacy Policy</h1>
            <p>Last updated: April 2026. Your privacy matters to us.</p>
          </div>
          <div className="policy-body">
            <div className="policy-section">
              <h3>1. What We Collect</h3>
              <p>We collect only what's necessary to operate the service: your name, email address, phone number (optional), and delivery address. We also collect basic usage data to improve the platform.</p>
            </div>
            <div className="policy-section">
              <h3>2. How We Use It</h3>
              <p>Your information is used to manage your tree rental, send you weekly orchard updates, process your harvest delivery, and communicate service-related information. We do not use your data for unrelated marketing without your consent.</p>
            </div>
            <div className="policy-section">
              <h3>3. Sharing of Data</h3>
              <p>We do not sell or share your personal data with third parties except: (a) our delivery partner, who receives your name and address to complete your shipment, and (b) Razorpay, for payment processing. Both are bound by their own privacy policies.</p>
            </div>
            <div className="policy-section">
              <h3>4. Data Storage & Security</h3>
              <p>Your data is stored securely on MongoDB Atlas servers. Passwords are hashed using bcrypt and are never stored in plain text. We use HTTPS across the platform.</p>
            </div>
            <div className="policy-section">
              <h3>5. Your Rights</h3>
              <p>You can request access to, correction of, or deletion of your personal data at any time by emailing hello@yourorchard.in. We will respond within 7 business days.</p>
            </div>
            <div className="policy-section">
              <h3>6. Cookies</h3>
              <p>We use minimal cookies — only those necessary for authentication (keeping you logged in). We do not use advertising or tracking cookies.</p>
            </div>
            <div className="policy-section">
              <h3>7. Contact</h3>
              <p>For any privacy-related concerns, write to us at hello@yourorchard.in.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'refund' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>Refund & Cancellation Policy</h1>
            <p>Last updated: April 2026. We want you to rent with confidence.</p>
          </div>
          <div className="policy-body">
            <div className="policy-section">
              <h3>Cancellation Window</h3>
              <p>We understand plans change. Here's how cancellations work:</p>
              <ul>
                <li><strong>Within 48 hours of payment:</strong> Full refund, no questions asked.</li>
                <li><strong>3–7 days after payment:</strong> 75% refund. A 25% charge covers the tagging, documentation, and early-season care already invested in your tree.</li>
                <li><strong>After 7 days:</strong> No refund once the season is underway and your tree has been actively tended for your rental.</li>
              </ul>
            </div>
            <div className="policy-section">
              <h3>Poor Yield Situations</h3>
              <p>If your tree yields less than 70% of the minimum estimated quantity due to factors within our control, we will issue a store credit equal to the shortfall value, usable on your next season's rental.</p>
              <p>If the tree is completely unable to produce due to an act of nature (flood, disease outbreak, fire), you will receive a full credit for the following season.</p>
            </div>
            <div className="policy-section">
              <h3>Delivery Issues</h3>
              <p>If your harvest box arrives damaged, with significant spoilage, or does not arrive within 5 days of dispatch, contact us at hello@yourorchard.in with your order details and a photo. We will arrange a replacement shipment or issue a refund for the affected portion within 5 business days.</p>
            </div>
            <div className="policy-section">
              <h3>How Refunds Are Processed</h3>
              <p>Approved refunds are credited to your original payment method within 5–7 business days, depending on your bank. Razorpay processes all refund transactions.</p>
            </div>
            <div className="policy-section">
              <h3>Contact for Refunds</h3>
              <p>Email hello@yourorchard.in with your registered email and order details. Our team will get back to you within 2 business days.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'shipping' && (
        <div className="info-page">
          <div className="info-hero">
            <h1>Shipping & Delivery 📦</h1>
            <p>How your harvest travels from our Ramnagar bagiche to your door.</p>
          </div>
          <div className="policy-body">
            <p>Last updated: April 2026. We take great care to ensure your mangoes arrive fresh and on time.</p>
            <div className="policy-section">
              <h3>Harvest & Dispatch</h3>
              <p>Your mangoes are harvested by hand at peak ripeness and dispatched within 24 hours of picking. We do not use cold storage — your box goes straight from the tree to the courier. This ensures maximum freshness and flavour when it arrives at your door.</p>
            </div>
            <div className="policy-section">
              <h3>Delivery Timeline</h3>
              <ul>
                <li><strong>Northern India (Delhi, UP, Uttarakhand, Punjab, Haryana):</strong> 1–2 business days after dispatch.</li>
                <li><strong>Western & Central India (Mumbai, Pune, Rajasthan, MP, Gujarat):</strong> 2–3 business days after dispatch.</li>
                <li><strong>Southern India (Bengaluru, Chennai, Hyderabad, Kerala):</strong> 3–4 business days after dispatch.</li>
                <li><strong>Eastern India (Kolkata, Odisha, Bihar, Northeast):</strong> 3–5 business days after dispatch.</li>
              </ul>
              <p>All timelines are estimates and may vary due to courier delays, weather, or local public holidays.</p>
            </div>
            <div className="policy-section">
              <h3>Delivery Partners</h3>
              <p>We ship via trusted courier partners including DTDC, Delhivery, and Blue Dart depending on your location. A tracking number will be shared with you via email or WhatsApp once your box is dispatched.</p>
            </div>
            <div className="policy-section">
              <h3>Packaging</h3>
              <p>Each mango box is packed in ventilated cardboard boxes with cushioning to protect the fruit during transit. The packaging is designed to maintain airflow and prevent bruising. We use minimal plastic and prefer eco-friendly materials wherever possible.</p>
            </div>
            <div className="policy-section">
              <h3>Delivery Address</h3>
              <p>Please ensure your delivery address is accurate and complete at the time of rental or box order. We are not responsible for delays or non-delivery caused by incorrect or incomplete addresses. Address changes after dispatch are not possible.</p>
            </div>
            <div className="policy-section">
              <h3>Failed Delivery</h3>
              <p>If a delivery attempt fails (no one available to receive), the courier will attempt re-delivery once. If the second attempt also fails, the box will be held at the nearest courier hub for 48 hours. After that, the box may be returned. Perishable nature of the goods means we cannot re-ship returned boxes, but we will review each case individually — write to us at hello@yourorchard.in.</p>
            </div>
            <div className="policy-section">
              <h3>Damaged or Spoiled Delivery</h3>
              <p>If your box arrives with significant damage or spoilage, photograph the box and contents immediately and email hello@yourorchard.in within 24 hours of delivery. We will arrange a replacement or refund for the affected portion. Claims made after 24 hours of delivery may not be accepted.</p>
            </div>
            <div className="policy-section">
              <h3>Shipping Charges</h3>
              <p>Shipping is included in the price of all tree rental plans and mango box orders. There are no hidden delivery charges.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'farm' && (
        <div className="info-page farm-page">
          <div className="farm-bg-video farm-bg-video--full">
            <SeamlessVideo src="/farm-intro.mp4" />
            <div className="farm-bg-video-overlay">
              <span className="section-label" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>Ramnagar, Uttarakhand</span>
              <h1 className="farm-hero-h1">Life on the Farm</h1>
              <p className="farm-hero-sub">Step inside our orchard. This is where your mangoes grow, ripen, and begin their journey to you.</p>
              <div className="farm-hero-divider" />
              <span className="section-label" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>Our Bagiche</span>
              <h2 className="farm-hero-h2">A Living, <span>Breathing Orchard</span></h2>
              <p className="farm-hero-body">Nestled in the foothills of the Himalayas, our orchard in Ramnagar sits at the edge of Corbett country. The soil is rich, the water is clean, and the air carries the scent of mango blossoms every spring.</p>
              <p className="farm-hero-body" style={{ marginTop: 12 }}>Our orchardists have been growing mangoes here for two generations — no chemicals, no shortcuts, just traditional farming, patient hands, and deep knowledge of the land.</p>
            </div>
          </div>

          <div className="farm-moments section">
            <div className="section-title">
              <span className="section-label">From the Orchard Floor</span>
              <h2>Moments From <span>Our Farm</span></h2>
              <p>Unfiltered glimpses of daily life at the bagiche — the people, the trees, and the harvest.</p>
            </div>
            {publicUpdates.length === 0 ? (
              <p className="empty" style={{ textAlign: 'center' }}>Content coming soon — our orchardist is out in the field!</p>
            ) : (
              <div className="farm-media-grid">
                {publicUpdates.flatMap(update =>
                  update.media.map(m => ({ ...m, caption: update.caption }))
                ).map((m, i) => (
                  <div key={m.url + i} className="farm-media-card">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.caption || 'Farm photo'} />
                    ) : (
                      <LoopVideo src={m.url} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="farm-cta">
            <h2>Own a Piece of This Orchard</h2>
            <p>Rent a tree, get weekly updates from this very farm, and receive your harvest at home.</p>
            <button className="btn-primary" onClick={() => { if (user) navigate('dashboard'); else setAuthModal('register'); }}>Rent a Tree This Season →</button>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-overlay" onClick={e => { if (e.target === e.currentTarget) { setCartOpen(false); setCartStep('items'); } }}>
          <div className="cart-drawer">
            <div className="cart-header">
              {cartStep === 'address' ? (
                <>
                  <button className="cart-back" onClick={() => setCartStep('items')}>← Back</button>
                  <h3>Delivery Address</h3>
                </>
              ) : (
                <h3>Your Cart {cartCount > 0 && <span className="cart-header-count">{cartCount}</span>}</h3>
              )}
              <button className="cart-close" onClick={() => { setCartOpen(false); setCartStep('items'); }}>✕</button>
            </div>

            {cartStep === 'address' ? (
              <div className="cart-address-step">
                <p className="cart-address-hint">Where should we deliver your harvest?</p>
                <div className="addr-form">
                  <div className="addr-row">
                    <div className="addr-field">
                      <label>Full Name</label>
                      <input placeholder="Recipient name" value={addrForm.name} onChange={e => setAddrForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="addr-field">
                      <label>Phone</label>
                      <input placeholder="10-digit number" type="tel" maxLength={10} value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                  </div>
                  <div className="addr-field full">
                    <label>House / Flat / Building</label>
                    <input placeholder="House no., flat, building name" value={addrForm.house} onChange={e => setAddrForm(f => ({ ...f, house: e.target.value }))} />
                  </div>
                  <div className="addr-field full">
                    <label>Street / Area / Locality</label>
                    <input placeholder="Street name, area, locality" value={addrForm.street} onChange={e => setAddrForm(f => ({ ...f, street: e.target.value }))} />
                  </div>
                  <div className="addr-row">
                    <div className="addr-field">
                      <label>City</label>
                      <input placeholder="City" value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div className="addr-field">
                      <label>State</label>
                      <input placeholder="State" value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} />
                    </div>
                  </div>
                  <div className="addr-field" style={{ maxWidth: '160px' }}>
                    <label>PIN Code</label>
                    <input placeholder="6-digit PIN" type="tel" maxLength={6} value={addrForm.pin} onChange={e => setAddrForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))} />
                  </div>
                </div>
                <div className="cart-footer">
                  <div className="cart-total-row">
                    <span>Total</span>
                    <span className="cart-total-price">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button className="btn-primary full" onClick={() => {
                    const { name, phone, house, street, city, state, pin } = addrForm;
                    if (!name.trim() || !phone.trim() || !house.trim() || !city.trim() || !state.trim() || !pin.trim()) {
                      setMsg('Please fill all address fields'); return;
                    }
                    if (phone.length !== 10) { setMsg('Enter a valid 10-digit phone number'); return; }
                    if (pin.length !== 6) { setMsg('Enter a valid 6-digit PIN code'); return; }
                    const fullAddress = `${name}, ${phone} — ${house}, ${street ? street + ', ' : ''}${city}, ${state} - ${pin}`;
                    checkoutCart(fullAddress);
                  }}>
                    Pay ₹{cartTotal.toLocaleString()} →
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <span>Add a mango box or rent a tree to get started</span>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-img" style={{ backgroundImage: `url(${item.img})` }} />
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        {item.type === 'tree' ? (
                          <div className="cart-item-sub">Tree rental · Season {item.season}</div>
                        ) : (
                          <>
                            <div className="cart-item-sub">10 kg box · ₹{item.price.toLocaleString()}</div>
                            <div className="cart-item-controls">
                              <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                              <span>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="cart-item-right">
                        <div className="cart-item-total">₹{(item.price * item.qty).toLocaleString()}</div>
                        <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total-row">
                    <span>Total</span>
                    <span className="cart-total-price">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <p className="cart-delivery-note">Free delivery · Harvest from May 15</p>
                  <button className="btn-primary full" onClick={proceedToCheckout}>
                    {user ? 'Checkout →' : 'Login to Checkout →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo">YourOrchard</div>
            <p className="footer-brand-desc">Fresh produce from our Ramnagar orchard to your door. Rent a tree for the season — simple, transparent, real.</p>
            <div className="footer-social">
              <a className="footer-social-btn" href="tel:+917535850398">📞</a>
              <a className="footer-social-btn" href="mailto:hello@yourorchard.in">✉️</a>
              <a className="footer-social-btn" href="https://maps.google.com/?q=Ramnagar,Uttarakhand,India" target="_blank" rel="noopener noreferrer">📍</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li onClick={() => { navigate('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>How it works</li>
              <li onClick={() => { navigate('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Our Trees</li>
              <li onClick={() => navigate('about')}>About</li>
              <li onClick={() => navigate('blog')}>Blog</li>
              <li onClick={() => navigate('contact')}>Contact</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li onClick={() => navigate('terms')}>Terms & Conditions</li>
              <li onClick={() => navigate('privacy')}>Privacy Policy</li>
              <li onClick={() => navigate('refund')}>Refund Policy</li>
              <li onClick={() => navigate('shipping')}>Shipping & Delivery</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p className="footer-contact-line">hello@yourorchard.in</p>
            <p className="footer-contact-line dim">Ramnagar, Uttarakhand</p>
            <button className="footer-reserve-btn" onClick={() => { navigate('home'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Rent a Tree →</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 <strong>YourOrchard</strong>. All rights reserved.</p>
          {user && (
            <button className="footer-logout-btn" onClick={logout}>Logout</button>
          )}
        </div>
      </footer>
    </div>
  );
}
