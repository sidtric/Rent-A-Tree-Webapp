import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { openRazorpayCheckout } from '../lib/razorpay';
import { apiFetch } from '../lib/api';
import './Checkout.css';

export default function Checkout() {
  const { user, updateUser } = useAuth();
  const { items, total, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const saved = user?.deliveryAddress;
  const [name,    setName]    = useState(user?.name || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [phone,   setPhone]   = useState(user?.phone || '');
  const [flat,    setFlat]    = useState(saved?.flat    || '');
  const [street,  setStreet]  = useState(saved?.street  || '');
  const [city,    setCity]    = useState(saved?.city    || '');
  const [state,   setState]   = useState(saved?.state   || '');
  const [pincode, setPincode] = useState(saved?.pincode || '');
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [err,     setErr]     = useState('');

  if (!user) {
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }

  if (items.length === 0 && !success) {
    navigate('/');
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!name.trim())                                                          return setErr('Please enter your full name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))          return setErr('Please enter a valid email.');
    if (!phone.trim() || !/^\d{10}$/.test(phone))                             return setErr('Enter a valid 10-digit phone number.');
    if (!flat.trim())                                                          return setErr('Please enter your flat / house number.');
    if (!street.trim())                                                        return setErr('Please enter your street / area.');
    if (!city.trim())                                                          return setErr('Please enter your city.');
    if (!state.trim())                                                         return setErr('Please enter your state.');
    if (!pincode.trim() || !/^\d{6}$/.test(pincode))                          return setErr('Enter a valid 6-digit pincode.');
    handlePay(`${flat}, ${street}, ${city}, ${state} – ${pincode}`);
  }

  async function handlePay(deliveryAddress: string) {
    const treeItems = items.filter(i => i.type === 'tree');
    const boxItems  = items.filter(i => i.type === 'box');
    const addr = { flat, street, city, state, pincode };

    const cartItems = [
      ...treeItems.map(i => ({ plan: i.plan!, quantity: i.qty })),
      ...boxItems.map(i => ({ variety: i.variety, quantity: i.qty })),
    ];

    const hasTree = treeItems.length > 0;
    const hasBox  = boxItems.length > 0;
    const desc = hasTree && hasBox
      ? 'YourOrchard — Trees & Mango Boxes'
      : hasTree ? 'Tree Booking — Mango Season 2026'
      : 'Mango Box Order';

    setPaying(true);
    try {
      await openRazorpayCheckout({
        type: 'cart',
        items: cartItems,
        userName: name,
        userEmail: email,
        userPhone: phone,
        description: desc,
        onSuccess: async (paymentId, orderId) => {
          await Promise.all([
            ...treeItems.flatMap(item =>
              Array.from({ length: item.qty }, () =>
                apiFetch('/api/rentals', {
                  method: 'POST',
                  body: JSON.stringify({
                    plan: item.plan,
                    variety: item.variety,
                    deliveryAddress,
                    razorpayOrderId: orderId,
                    paymentId,
                  }),
                })
              )
            ),
            ...boxItems.map(item =>
              apiFetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                  variety: item.variety,
                  quantity: item.qty,
                  deliveryAddress,
                  phone,
                  razorpayOrderId: orderId,
                  paymentId,
                }),
              })
            ),
            apiFetch('/api/auth/profile', {
              method: 'PUT',
              body: JSON.stringify({ phone, deliveryAddress: addr }),
            }).then(() => updateUser({ phone, deliveryAddress: addr })).catch(() => {}),
          ]);
          clearCart();
          setSuccess(true);
        },
        onDismiss: () => setPaying(false),
      });
    } catch (e: any) {
      setErr(e.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  }

  if (success) {
    return (
      <div className="chk-success">
        <div className="chk-success-icon">✓</div>
        <h2>Order Confirmed!</h2>
        <p>Your mango boxes are prebooked. We'll dispatch them as soon as the harvest starts.</p>
        <button onClick={() => navigate('/dashboard')}>View My Orders →</button>
      </div>
    );
  }

  return (
    <div className="chk-overlay">
      <div className="chk-fullscreen">

        {/* ── Left: Delivery form ── */}
        <div className="chk-left">
          <button className="chk-back" onClick={() => navigate(-1)}>← Back</button>
          <h2 className="chk-left-title">Delivery Details</h2>
          <p className="chk-left-sub">We'll ship your order to this address after harvest.</p>

          <form onSubmit={handleSubmit} className="chk-form" id="chk-form">
            <p className="chk-section-label">Personal info</p>

            <div className="chk-field">
              <label>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="chk-row">
              <div className="chk-field">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>Phone</label>
                <div className="chk-phone-wrap">
                  <span>+91</span>
                  <input type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
            </div>

            <p className="chk-section-label">Delivery address</p>

            <div className="chk-row">
              <div className="chk-field">
                <label>Flat / House no.</label>
                <input type="text" value={flat} onChange={e => setFlat(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>Street / Area</label>
                <input type="text" value={street} onChange={e => setStreet(e.target.value)} />
              </div>
            </div>

            <div className="chk-row chk-row-3">
              <div className="chk-field">
                <label>City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>State</label>
                <input type="text" value={state} onChange={e => setState(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>Pincode</label>
                <input type="text" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            {err && <p className="chk-err">{err}</p>}
          </form>
        </div>

        {/* ── Right: Cart + order summary ── */}
        <div className="chk-right">
          <div className="chk-summary">
            <div className="chk-summary-header">
              <img src="/logo.jpeg" alt="YourOrchard" className="chk-summary-logo" />
              <div>
                <p className="chk-summary-brand">YourOrchard</p>
                <p className="chk-summary-sub">Ramnagar, Uttarakhand</p>
              </div>
            </div>

            <div className="chk-divider" />
            <p className="chk-summary-section">Your Cart</p>

            <div className="chk-cart-items">
              {items.map(item => (
                <div key={item.id} className="chk-cart-item">
                  <div className="chk-cart-img" style={{ backgroundImage: `url(${item.img})` }} />
                  <div className="chk-cart-info">
                    <div className="chk-cart-name">{item.name}</div>
                    <div className="chk-cart-sub">
                      {item.type === 'tree' ? `${item.variety} · Token booking` : `${item.variety} · 10 kg box`}
                    </div>
                    <div className="chk-cart-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="chk-cart-controls">
                    <div className="chk-qty">
                      <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button type="button" className="chk-remove" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="chk-divider" />

            <div className="chk-summary-line">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="chk-summary-line">
              <span>Shipping</span>
              <span className="chk-free">Free</span>
            </div>

            <div className="chk-divider" />

            <div className="chk-summary-total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button type="submit" form="chk-form" className="chk-pay-btn" disabled={paying}>
              {paying ? 'Processing…' : `Pay ₹${total.toLocaleString('en-IN')} →`}
            </button>

            <p className="chk-secure-note">🔒 Secured by Razorpay · 256-bit encryption</p>
          </div>
        </div>

      </div>
    </div>
  );
}
