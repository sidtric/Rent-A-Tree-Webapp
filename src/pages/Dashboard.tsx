import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import './Dashboard.css';

interface Rental {
  _id: string;
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  season: string;
  deliveryAddress: string;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
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

const PLAN_LABELS = { sapling: 'Sapling Tree', adult: 'Adult Tree', grand: 'Grand Tree' };
const VARIETY_LABELS = { chausa: 'Chausa Aam', dasheri: 'Dasheri Aam', langra: 'Langra Aam' };

const RENTAL_STATUS_CLASS: Record<Rental['status'], string> = {
  active: 'badge-green',
  completed: 'badge-gray',
  cancelled: 'badge-red',
  pending_payment: 'badge-orange',
};

const ORDER_STATUS_CLASS: Record<BoxOrder['status'], string> = {
  confirmed: 'badge-green',
  dispatched: 'badge-blue',
  delivered: 'badge-darkgreen',
  cancelled: 'badge-red',
  pending_payment: 'badge-orange',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [orders, setOrders] = useState<BoxOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      apiFetch('/api/rentals/my'),
      apiFetch('/api/orders/my'),
    ]).then(([r, o]) => {
      setRentals(r);
      setOrders(o);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  async function handleCancelRental(id: string) {
    if (!confirm('Cancel this rental?')) return;
    setCancelling(id);
    try {
      const updated = await apiFetch(`/api/rentals/${id}/cancel`, { method: 'PATCH' });
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

  return (
    <div className="dash">
      <div className="dash-inner">
        <div className="dash-header">
          <h1 className="dash-title">My Dashboard</h1>
          <p className="dash-sub">Welcome back, {user?.name.split(' ')[0]}. Here's everything in your orchard.</p>
        </div>

        {/* Rentals */}
        <section className="dash-section">
          <div className="dash-section-header">
            <span className="dash-section-icon">🌳</span>
            <h2 className="dash-section-title">My Tree Rentals</h2>
            <span className="dash-section-count">{rentals.length}</span>
          </div>
          {rentals.length === 0 ? (
            <div className="dash-empty">
              <p>No rentals yet.</p>
              <button className="dash-cta" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('browse-trees')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                Browse Trees
              </button>
            </div>
          ) : (
            <div className="dash-cards">
              {rentals.map(r => (
                <div key={r._id} className="dash-card">
                  <div className="dash-card-top">
                    <div>
                      <p className="dash-card-name">{PLAN_LABELS[r.plan]}</p>
                      <p className="dash-card-sub">{VARIETY_LABELS[r.variety]} · Season {r.season}</p>
                    </div>
                    <span className={`dash-badge ${RENTAL_STATUS_CLASS[r.status]}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="dash-card-addr">{r.deliveryAddress}</p>
                  <div className="dash-card-footer">
                    <span className="dash-card-date">Rented on {formatDate(r.createdAt)}</span>
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
              ))}
            </div>
          )}
        </section>

        {/* Box Orders */}
        <section className="dash-section">
          <div className="dash-section-header">
            <span className="dash-section-icon">📦</span>
            <h2 className="dash-section-title">My Mango Box Orders</h2>
            <span className="dash-section-count">{orders.length}</span>
          </div>
          {orders.length === 0 ? (
            <div className="dash-empty">
              <p>No orders yet.</p>
              <button className="dash-cta" onClick={() => { navigate('/'); setTimeout(() => document.getElementById('mango-boxes')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                Order a Box
              </button>
            </div>
          ) : (
            <div className="dash-cards">
              {orders.map(o => (
                <div key={o._id} className="dash-card">
                  <div className="dash-card-top">
                    <div>
                      <p className="dash-card-name">{VARIETY_LABELS[o.variety]} Box</p>
                      <p className="dash-card-sub">{o.quantity} {o.quantity === 1 ? 'box' : 'boxes'} · ₹{o.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`dash-badge ${ORDER_STATUS_CLASS[o.status]}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="dash-card-addr">{o.deliveryAddress}</p>
                  <div className="dash-card-footer">
                    <span className="dash-card-date">Ordered on {formatDate(o.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
