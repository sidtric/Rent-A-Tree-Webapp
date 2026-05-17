import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_BASE } from '../lib/api';
import { openBalancePayment } from '../lib/razorpay';
import { usePrices } from '../context/PricesContext';
import './Dashboard.css';

interface TreeUpdate {
  _id: string;
  caption: string;
  media: { url: string; type: 'image' | 'video' }[];
  variety?: string;
  createdAt: string;
}

interface Rental {
  _id: string;
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  season: string;
  deliveryAddress: string;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  balancePaid?: boolean;
  user?: { name: string };
}

interface BoxOrder {
  _id: string;
  variety: 'chausa' | 'dasheri' | 'langra';
  quantity: number;
  pricePerBox: number;
  totalAmount: number;
  deliveryAddress: string;
  status: 'pending_payment' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  createdAt: string;
}

const PLAN_META_BASE = {
  sapling: { label: 'Sapling Tree', size: 'Small Tree', yield: '15–20 kg', fallbackImg: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=600&q=80' },
  adult:   { label: 'Adult Tree',   size: 'Mid Tree',   yield: '30–45 kg', fallbackImg: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80' },
  grand:   { label: 'Grand Tree',   size: 'Big Tree',   yield: '50–70 kg', fallbackImg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
};


const VARIETY_META = {
  chausa:  { label: 'Chausa Aam',  img: '/chausa-box.jpg',  treeImg: '/chausa-tree.jpg' },
  dasheri: { label: 'Dasheri Aam', img: '/dasheri-box.jpg', treeImg: '/dasheri-tree.jpg' },
  langra:  { label: 'Langra Aam',  img: '/langra-box.jpg',  treeImg: '/langra-tree.jpg' },
};

const RENTAL_STATUS: Record<Rental['status'], { label: string; cls: string }> = {
  active:          { label: 'Confirmed',  cls: 'badge-green' },
  completed:       { label: 'Completed',  cls: 'badge-gray' },
  cancelled:       { label: 'Cancelled',  cls: 'badge-red' },
  pending_payment: { label: 'Pending',    cls: 'badge-orange' },
};

const ORDER_STATUS: Record<BoxOrder['status'], { label: string; cls: string }> = {
  confirmed:       { label: 'Confirmed',       cls: 'badge-green' },
  dispatched:      { label: 'Dispatched',      cls: 'badge-blue' },
  delivered:       { label: 'Delivered',       cls: 'badge-darkgreen' },
  cancelled:       { label: 'Cancelled',       cls: 'badge-red' },
  pending_payment: { label: 'Pending Payment', cls: 'badge-orange' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const BOX_STEPS:    BoxOrder['status'][]  = ['confirmed', 'dispatched', 'delivered'];
const RENTAL_STEPS: Rental['status'][]    = ['active', 'completed'];

function StatusStepper({ steps, current }: { steps: string[]; current: string }) {
  const idx = steps.indexOf(current);
  if (idx === -1) return null;
  return (
    <div className="dash-stepper">
      {steps.map((s, i) => (
        <div key={s} className={`dash-step ${i < idx ? 'done' : i === idx ? 'active' : ''}`}>
          <div className="dash-step-dot" />
          <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const prices = usePrices();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [orders, setOrders] = useState<BoxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [payingBalance, setPayingBalance] = useState<string | null>(null);
  const [allErr, setAllErr] = useState('');
  const [rentalView, setRentalView] = useState<'mine' | 'all'>('mine');
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [updatesByVariety, setUpdatesByVariety] = useState<Record<string, TreeUpdate[]>>({});
  const [treePhotos, setTreePhotos] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { state: { from: '/dashboard' } }); return; }

    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(d => {
        const photos: Partial<Record<string, string>> = {};
        if (d.saplingMedia?.[0]?.url) photos.sapling = d.saplingMedia[0].url;
        if (d.adultMedia?.[0]?.url)   photos.adult   = d.adultMedia[0].url;
        if (d.grandMedia?.[0]?.url)   photos.grand   = d.grandMedia[0].url;
        setTreePhotos(photos);
      })
      .catch(() => {});

    Promise.all([
      apiFetch<Rental[]>('/api/rentals/my'),
      apiFetch<BoxOrder[]>('/api/orders/my'),
    ]).then(([r, o]) => {
      setRentals(r);
      setOrders(o);
      const activeVarieties = [...new Set(r.filter(x => x.status === 'active').map(x => x.variety))];
      if (activeVarieties.length > 0) {
        Promise.all(
          activeVarieties.map(v =>
            apiFetch<TreeUpdate[]>(`/api/public-updates?variety=${v}`)
              .then(data => ({ variety: v, updates: data.filter((u: any) => u.variety === v) }))
              .catch(() => ({ variety: v, updates: [] }))
          )
        ).then(results => {
          const byVariety: Record<string, TreeUpdate[]> = {};
          results.forEach(({ variety, updates }) => { byVariety[variety] = updates; });
          setUpdatesByVariety(byVariety);
        });
      }
    }).finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  async function handleViewAll() {
    setRentalView('all');
    if (allRentals.length > 0) return;
    setAllLoading(true);
    try {
      const data = await apiFetch<Rental[]>('/api/rentals/all');
      setAllRentals(data);
    } catch {
      setAllErr('Could not load orchard trees. Please try again.');
      setTimeout(() => setAllErr(''), 4000);
    } finally {
      setAllLoading(false);
    }
  }

  async function handleCancelRental(id: string) {
    if (!confirm('Cancel this rental? This cannot be undone.')) return;
    setCancelling(id);
    try {
      const updated = await apiFetch<Rental>(`/api/rentals/${id}/cancel`, { method: 'PATCH' });
      setRentals(prev => prev.map(r => r._id === id ? updated : r));
    } catch (err: any) {
      alert(err.message || 'Could not cancel rental.');
    } finally {
      setCancelling(null);
    }
  }

  async function handlePayBalance(rental: Rental) {
    setPayingBalance(rental._id);
    try {
      await openBalancePayment({
        rentalId:  rental._id,
        userName:  user!.name,
        userEmail: user!.email,
        userPhone: user!.phone,
        onSuccess: async (paymentId, orderId, razorpaySignature) => {
          try {
            const updated = await apiFetch<Rental>(`/api/rentals/${rental._id}/pay-balance`, {
              method: 'PATCH',
              body: JSON.stringify({ razorpayOrderId: orderId, paymentId, razorpaySignature }),
            });
            setRentals(prev => prev.map(r => r._id === rental._id ? updated : r));
          } catch (err: any) {
            setAllErr('Payment received but failed to update. Contact support with payment ID: ' + paymentId);
          }
          setPayingBalance(null);
        },
        onError: (msg) => { setAllErr(msg); setPayingBalance(null); },
        onDismiss: () => setPayingBalance(null),
      });
    } catch (e: any) {
      setAllErr(e.message || 'Balance payment failed. Please try again.');
      setPayingBalance(null);
    }
  }

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  const activeRentals = rentals.filter(r => r.status === 'active').length;
  const PLAN_META = {
    sapling: { ...PLAN_META_BASE.sapling, img: treePhotos.sapling || PLAN_META_BASE.sapling.fallbackImg },
    adult:   { ...PLAN_META_BASE.adult,   img: treePhotos.adult   || PLAN_META_BASE.adult.fallbackImg   },
    grand:   { ...PLAN_META_BASE.grand,   img: treePhotos.grand   || PLAN_META_BASE.grand.fallbackImg   },
  };

  return (
    <div className="dash">
      {allErr && <div className="toast dash-err-toast">{allErr}</div>}

      {/* Banner */}
      <div className="dash-banner">
        <div className="dash-banner-inner">
          <div className="dash-banner-text">
            <p className="dash-banner-label">Your Orchard</p>
            <h1 className="dash-banner-title">Welcome back, {user?.name.split(' ')[0]}.</h1>
            <p className="dash-banner-sub">Here's everything growing in your orchard this season.</p>
          </div>
          <div className="dash-banner-stats">
            <div className="dash-stat">
              <span className="dash-stat-num">{activeRentals}</span>
              <span className="dash-stat-label">Active {activeRentals === 1 ? 'Tree' : 'Trees'}</span>
            </div>
            <div className="dash-stat-divider" />
            <div className="dash-stat">
              <span className="dash-stat-num">{orders.length}</span>
              <span className="dash-stat-label">Box {orders.length === 1 ? 'Order' : 'Orders'}</span>
            </div>
            <div className="dash-stat-divider" />
            <div className="dash-stat">
              <span className="dash-stat-num">{new Date().getFullYear()}</span>
              <span className="dash-stat-label">Season</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-body">


        {/* Rentals */}
        <section className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-top">
              <div>
                <span className="dash-section-label">Season Plans</span>
                <h2 className="dash-section-title">
                  {rentalView === 'mine' ? 'My Tree Rentals' : 'All Trees in the Orchard'}
                </h2>
                <p className="dash-section-sub">
                  {rentalView === 'mine'
                    ? 'Your tagged trees in Ramnagar, tended by our orchardists all season.'
                    : 'Every active tree rented this season across all orchard members.'}
                </p>
              </div>
              {user?.role === 'admin' && (
                <div className="dash-view-toggle">
                  <button
                    className={`dash-toggle-btn ${rentalView === 'mine' ? 'active' : ''}`}
                    onClick={() => setRentalView('mine')}
                  >
                    My Trees
                  </button>
                  <button
                    className={`dash-toggle-btn ${rentalView === 'all' ? 'active' : ''}`}
                    onClick={handleViewAll}
                  >
                    All Orchard Trees
                  </button>
                </div>
              )}
            </div>
          </div>

          {rentalView === 'all' ? (
            allLoading ? (
              <div className="dash-loading-inline"><div className="dash-spinner" /></div>
            ) : allRentals.length === 0 ? (
              <div className="dash-empty">
                <h3 className="dash-empty-title">No active trees yet</h3>
                <p className="dash-empty-desc">Be the first to rent a tree this season.</p>
              </div>
            ) : (
              <div className="dash-cards">
                {allRentals.map(r => {
                  const plan = PLAN_META[r.plan];
                  const variety = VARIETY_META[r.variety];
                  const ownerFirst = r.user?.name?.split(' ')[0] ?? 'A member';
                  const allCardImg = treePhotos[r.plan] || variety.treeImg;
                  return (
                    <div key={r._id} className="dash-card">
                      <div className="dash-card-img" style={{ backgroundImage: `url(${allCardImg})` }}>
                        <span className="dash-card-badge badge-green">Active</span>
                      </div>
                      <div className="dash-card-body">
                        <div className="dash-card-meta">
                          <span className="dash-card-size">{plan.size}</span>
                          <span className="dash-card-yield">{plan.yield} / season</span>
                        </div>
                        <h3 className="dash-card-name">{plan.label}</h3>
                        <p className="dash-card-variety">{variety.label} · Season {r.season}</p>
                        <div className="dash-card-footer">
                          <span className="dash-card-date">Owned by {ownerFirst}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : rentals.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V12"/><path d="M12 12C12 7 7 4 3 6"/><path d="M12 12C12 7 17 4 21 6"/>
                  <path d="M3 6c0 5 3 8 9 10"/><path d="M21 6c0 5-3 8-9 10"/>
                </svg>
              </div>
              <h3 className="dash-empty-title">No trees yet</h3>
              <p className="dash-empty-desc">Rent a tree this season and get fresh mangoes delivered from your own tree in Ramnagar.</p>
              <button className="dash-empty-btn" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('browse-trees')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                Browse Trees
              </button>
            </div>
          ) : (
            <div className="dash-cards">
              {rentals.map(r => {
                const plan = PLAN_META[r.plan];
                const variety = VARIETY_META[r.variety];
                const status = RENTAL_STATUS[r.status];
                const amounts = prices ? { token: prices.plans[r.plan].token, full: prices.plans[r.plan].full } : { token: 0, full: 0 };
                const balance = amounts.full - amounts.token;
                const showBalance = r.status !== 'completed' && r.status !== 'cancelled';
                const balanceDue = new Date(new Date(r.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const cardImg = treePhotos[r.plan] || variety.treeImg;
                return (
                  <div key={r._id} className="dash-card">
                    <div className="dash-card-img" style={{ backgroundImage: `url(${cardImg})` }}>
                      <span className={`dash-card-badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <div className="dash-card-body">
                      <div className="dash-card-meta">
                        <span className="dash-card-size">{plan.size}</span>
                        <span className="dash-card-yield">{plan.yield} / season</span>
                      </div>
                      <h3 className="dash-card-name">{plan.label}</h3>
                      <p className="dash-card-variety">{variety.label} · Season {r.season}</p>
                      <p className="dash-card-addr">{r.deliveryAddress}</p>
                      {showBalance && (
                        <div className="dash-balance-row">
                          <span className="dash-balance-paid">Token paid: ₹{amounts.token.toLocaleString('en-IN')}</span>
                          {r.balancePaid ? (
                            <span className="dash-balance-settled">Balance settled ✓</span>
                          ) : (
                            <span className="dash-balance-due">Balance due: ₹{balance.toLocaleString('en-IN')} by {balanceDue}</span>
                          )}
                        </div>
                      )}
                      {(r.status === 'active' || r.status === 'completed') && (
                        <StatusStepper steps={RENTAL_STEPS} current={r.status} />
                      )}
                      {r.status === 'active' && (() => {
                        const updates = updatesByVariety[r.variety];
                        const latest = updates?.[0];
                        if (!latest) return null;
                        const allMedia = latest.media.slice(0, 4);
                        return (
                          <div className="dash-card-update">
                            <div className="dash-card-update-header">
                              <span className="dash-card-update-label">This week from your tree</span>
                              <span className="dash-card-update-date">
                                {new Date(latest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="dash-card-update-thumbs">
                              {allMedia.map((m, mi) => (
                                <div key={mi} className="dash-card-update-thumb">
                                  {m.type === 'video'
                                    ? <video src={m.url} muted playsInline className="dash-card-update-thumb-media" />
                                    : <img src={m.url} alt="" className="dash-card-update-thumb-media" />}
                                </div>
                              ))}
                            </div>
                            {latest.caption && (
                              <p className="dash-card-update-caption">{latest.caption}</p>
                            )}
                          </div>
                        );
                      })()}
                      <div className="dash-card-footer">
                        <span className="dash-card-date">Rented {formatDate(r.createdAt)}</span>
                        {r.status === 'active' && !r.balancePaid && (
                          <button
                            className="dash-pay-balance-btn"
                            onClick={() => handlePayBalance(r)}
                            disabled={payingBalance === r._id}
                          >
                            {payingBalance === r._id ? 'Opening…' : `Pay Balance ₹${balance.toLocaleString('en-IN')}`}
                          </button>
                        )}
                        {r.status === 'active' && (
                          <button
                            className="dash-cancel-btn"
                            onClick={() => handleCancelRental(r._id)}
                            disabled={cancelling === r._id}
                          >
                            {cancelling === r._id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Box Orders */}
        <section className="dash-section">
          <div className="dash-section-header">
            <span className="dash-section-label">Direct Delivery</span>
            <h2 className="dash-section-title">My Mango Box Orders</h2>
            <p className="dash-section-sub">Fresh 10 kg boxes prebooked for this harvest season.</p>
          </div>

          {orders.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3 className="dash-empty-title">No box orders yet</h3>
              <p className="dash-empty-desc">Order a 10 kg box of Chausa, Dasheri, or Langra — delivered fresh from our orchard.</p>
              <button className="dash-empty-btn" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('mango-boxes')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                Order a Box
              </button>
            </div>
          ) : (
            <div className="dash-cards">
              {orders.map(o => {
                const variety = VARIETY_META[o.variety];
                const status = ORDER_STATUS[o.status];
                return (
                  <div key={o._id} className="dash-card">
                    <div className="dash-card-img" style={{ backgroundImage: `url(${variety.img})` }}>
                      <span className={`dash-card-badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <div className="dash-card-body">
                      <div className="dash-card-meta">
                        <span className="dash-card-size">10 kg Box</span>
                        <span className="dash-card-yield">{o.quantity} {o.quantity === 1 ? 'box' : 'boxes'}</span>
                      </div>
                      <h3 className="dash-card-name">{variety.label}</h3>
                      <p className="dash-card-variety">₹{o.totalAmount.toLocaleString('en-IN')} total · ₹{o.pricePerBox.toLocaleString('en-IN')} per box</p>
                      <p className="dash-card-addr">{o.deliveryAddress}</p>
                      {BOX_STEPS.includes(o.status) && (
                        <StatusStepper steps={BOX_STEPS} current={o.status} />
                      )}
                      <div className="dash-card-footer">
                        <span className="dash-card-date">Ordered {formatDate(o.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
