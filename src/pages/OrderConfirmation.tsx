import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

interface RichItem {
  type: 'tree' | 'box';
  plan?: string;
  variety: string;
  qty: number;
  price?: number;
}

interface OrderState {
  orderNumber: string;
  items: RichItem[];
  buyer: { name: string; email: string; phone: string };
  deliveryAddress: string;
  total: number;
  notes?: string;
  hasTree: boolean;
  hasBox: boolean;
}

function itemLabel(item: RichItem): string {
  if (item.type === 'tree') {
    const plan = item.plan
      ? item.plan.charAt(0).toUpperCase() + item.plan.slice(1)
      : '';
    const variety = item.variety.charAt(0).toUpperCase() + item.variety.slice(1);
    return `${variety} ${plan} Tree Rental (Token)`;
  }
  const variety = item.variety.charAt(0).toUpperCase() + item.variety.slice(1);
  return `${variety} Mango Box`;
}

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderState | null;

  if (!state?.orderNumber) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const { orderNumber, items, buyer, deliveryAddress, total, notes, hasTree, hasBox } = state;

  return (
    <div className="oc">
      <div className="oc-inner">

        {/* Header */}
        <div className="oc-check">✓</div>
        <h1 className="oc-title">Order Confirmed</h1>
        <p className="oc-number">Order #{orderNumber}</p>
        <p className="oc-sub">A confirmation has been sent to {buyer.email}</p>

        {/* Items table */}
        <div className="oc-section">
          <h3>What you ordered</h3>
          <table className="oc-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{itemLabel(item)}</td>
                  <td className="oc-center">{item.qty}</td>
                  <td className="oc-right">
                    {item.price != null ? `₹${item.price.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="oc-right">
                    {item.price != null ? `₹${(item.price * item.qty).toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="oc-total-row">
            <span>Total paid</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Delivery */}
        <div className="oc-section">
          <h3>Delivery address</h3>
          <p>{deliveryAddress}</p>
        </div>

        {/* Notes */}
        {notes && (
          <div className="oc-section">
            <h3>Your notes</h3>
            <p>{notes}</p>
          </div>
        )}

        {/* What happens next */}
        <div className="oc-section oc-next">
          <h3>What happens next</h3>
          <div className="oc-timeline">
            {hasTree && (
              <>
                <div className="oc-step">
                  <span className="oc-step-icon">🌳</span>
                  <div>
                    <strong>Your tree is tagged</strong>
                    <p>Our orchardists in Ramnagar have set aside your tree for this season.</p>
                  </div>
                </div>
                <div className="oc-step">
                  <span className="oc-step-icon">💳</span>
                  <div>
                    <strong>Pay the balance within 7 days</strong>
                    <p>Log in to your dashboard and click "Pay Balance" to fully secure your slot.</p>
                  </div>
                </div>
              </>
            )}
            {hasBox && (
              <div className="oc-step">
                <span className="oc-step-icon">📦</span>
                <div>
                  <strong>Mango box confirmed</strong>
                  <p>We'll pack and dispatch on harvest day — no cold storage, ever.</p>
                </div>
              </div>
            )}
            <div className="oc-step">
              <span className="oc-step-icon">🥭</span>
              <div>
                <strong>Harvest delivered to your door</strong>
                <p>Fresh Ramnagar mangoes, June – July 2026, straight from our orchard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="oc-actions">
          <button className="oc-btn-outline" onClick={() => window.print()}>Print / Save</button>
          <button className="oc-btn-primary" onClick={() => navigate('/dashboard')}>View Dashboard <span className="btn-arrow">→</span></button>
        </div>

      </div>
    </div>
  );
}
