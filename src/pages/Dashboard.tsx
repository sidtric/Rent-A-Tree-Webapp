import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
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

const PLAN_META = {
  sapling: { label: 'Sapling Tree', size: 'Small Tree', yield: '15–20 kg', img: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=600&q=80' },
  adult:   { label: 'Adult Tree',   size: 'Mid Tree',   yield: '30–45 kg', img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80' },
  grand:   { label: 'Grand Tree',   size: 'Big Tree',   yield: '60–80 kg', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
};

const PLAN_AMOUNTS = {
  sapling: { token: 799,  full: 4499 },
  adult:   { token: 1499, full: 6999 },
  grand:   { token: 2499, full: 9999 },
};

const VARIETY_META = {
  chausa:  { label: 'Chausa Aam',  img: '/chausa-box.jpg' },
  dasheri: { label: 'Dasheri Aam', img: '/dasheri-box.jpg' },
  langra:  { label: 'Langra Aam',  img: '/langra-box.jpg' },
};

const RENTAL_STATUS: Record<Rental['status'], { label: string; cls: string }> = {
  active:          { label: 'Active',          cls: 'badge-green' },
  completed:       { label: 'Completed',       cls: 'badge-gray' },
  cancelled:       { label: 'Cancelled',       cls: 'badge-red' },
  pending_payment: { label: 'Pending Payment', cls: 'badge-orange' },
};

const ORDER_STATUS: Record<BoxOrder['status'], { label: string; cls: string }> = {
  confirmed:       { label: 'Confirmed',       cls: 'badge-green' },
  dispatched:      { label: 'Dispatched',      cls: 'badge-blue' },
  delivered:       { label: 'Delivered',       cls: 'badge-darkgreen' },
  cancelled:       { label: 'Cancelled',       cls: 'badge-red' },
  pending_payment: { label: 'Pending Payment', cls: 'badge-orange' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [orders, setOrders] = useState<BoxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [rentalView, setRentalView] = useState<'mine' | 'all'>('mine');
  const [allRentals, setAllRentals] = useState<Rental[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [treeUpdates, setTreeUpdates] = useState<TreeUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [activeUpdateIdx, setActiveUpdateIdx] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { state: { from: '/dashboard' } }); return; }
    Promise.all([
      apiFetch<Rental[]>('/api/rentals/my'),
      apiFetch<BoxOrder[]>('/api/orders/my'),
    ]).then(([r, o]) => {
      setRentals(r);
      setOrders(o);
      const activeVariety = r.find(x => x.status === 'active')?.variety;
      if (activeVariety) {
        setUpdatesLoading(true);
        apiFetch<TreeUpdate[]>(`/api/public-updates?variety=${activeVariety}`)
          .then(setTreeUpdates)
          .catch(() => {})
          .finally(() => setUpdatesLoading(false));
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
      // silently fail
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

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    );
  }

  const activeRentals = rentals.filter(r => r.status === 'active').length;

  return (
    <div className="dash">

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
              <span className="dash-stat-num">2026</span>
              <span className="dash-stat-label">Season</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-body">

        {/* Your Tree This Week */}
        {(updatesLoading || treeUpdates.length > 0) && (
          <section className="dash-section">
            <div className="dash-section-header">
              <span className="dash-section-label">Live from the Farm</span>
              <h2 className="dash-section-title">Your Tree This Week</h2>
              <p className="dash-section-sub">Latest updates from our orchardists in Ramnagar.</p>
            </div>

            {updatesLoading ? (
              <div className="dash-loading-inline"><div className="dash-spinner" /></div>
            ) : (
              <div className="dash-updates-wrap">
                {/* Featured */}
                <div className="dash-update-featured">
                  {treeUpdates[activeUpdateIdx]?.media[0]?.type === 'video' ? (
                    <video
                      src={treeUpdates[activeUpdateIdx].media[0].url}
                      controls
                      className="dash-update-media"
                    />
                  ) : (
                    <img
                      src={treeUpdates[activeUpdateIdx]?.media[0]?.url}
                      alt={treeUpdates[activeUpdateIdx]?.caption}
                      className="dash-update-media"
                    />
                  )}
                  <div className="dash-update-caption">
                    <p>{treeUpdates[activeUpdateIdx]?.caption}</p>
                    <span className="dash-update-date">
                      {new Date(treeUpdates[activeUpdateIdx]?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {treeUpdates.length > 1 && (
                  <div className="dash-update-thumbs">
                    {treeUpdates.map((u, i) => (
                      <button
                        key={u._id}
                        className={`dash-update-thumb ${i === activeUpdateIdx ? 'active' : ''}`}
                        onClick={() => setActiveUpdateIdx(i)}
                      >
                        {u.media[0]?.type === 'video' ? (
                          <div className="dash-thumb-video-icon">▶</div>
                        ) : (
                          <img src={u.media[0]?.url} alt={u.caption} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

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
                  return (
                    <div key={r._id} className="dash-card">
                      <div className="dash-card-img" style={{ backgroundImage: `url(${plan.img})` }}>
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
                const amounts = PLAN_AMOUNTS[r.plan];
                const balance = amounts.full - amounts.token;
                const showBalance = r.status !== 'completed' && r.status !== 'cancelled';
                return (
                  <div key={r._id} className="dash-card">
                    <div className="dash-card-img" style={{ backgroundImage: `url(${plan.img})` }}>
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
                          <span className="dash-balance-due">Balance due: ₹{balance.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="dash-card-footer">
                        <span className="dash-card-date">Rented {formatDate(r.createdAt)}</span>
                        {r.status === 'active' && (
                          <button
                            className="dash-cancel-btn"
                            onClick={() => handleCancelRental(r._id)}
                            disabled={cancelling === r._id}
                          >
                            {cancelling === r._id ? 'Cancelling…' : 'Cancel Rental'}
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
