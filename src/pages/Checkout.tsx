import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { openRazorpayCheckout } from '../lib/razorpay';
import { apiFetch } from '../lib/api';
import './Checkout.css';

const validators = {
  name:    (v: string) => !v.trim() ? 'Full name is required.' : !/^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(v.trim()) ? 'Letters only (min 2 characters).' : '',
  email:   (v: string) => !v.trim() ? 'Email is required.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address.' : '',
  phone:   (v: string) => !v.trim() ? 'Phone number is required.' : !/^[6-9]\d{9}$/.test(v) ? 'Must start with 6–9 and be 10 digits.' : '',
  flat:    (v: string) => !v.trim() ? 'Flat / house number is required.' : '',
  street:  (v: string) => !v.trim() ? 'Street / area is required.' : v.trim().length < 3 ? 'At least 3 characters.' : '',
  city:    (v: string) => !v.trim() ? 'City is required.' : !/^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(v.trim()) ? 'Letters only.' : '',
  state:   (v: string) => !v.trim() ? 'State is required.' : !/^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(v.trim()) ? 'Letters only.' : '',
  pincode: (v: string) => !v.trim() ? 'Pincode is required.' : !/^[1-9]\d{5}$/.test(v) ? 'Must be 6 digits, cannot start with 0.' : '',
};

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
  const [paying,   setPaying]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [hadTree,  setHadTree]  = useState(false);
  const [hadBox,   setHadBox]   = useState(false);
  const [err,      setErr]      = useState('');
  const [touched,  setTouched]  = useState<Record<string, boolean>>({});

  function touch(field: string) { setTouched(prev => ({ ...prev, [field]: true })); }

  function inputClass(field: string, value: string) {
    if (!touched[field]) return '';
    return validators[field as keyof typeof validators](value) ? 'input-error' : 'input-valid';
  }

  function fieldErr(field: string, value: string) {
    if (!touched[field]) return '';
    return validators[field as keyof typeof validators](value);
  }

  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(pincode)) return;
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then(r => r.json())
      .then((data: any) => {
        const po = data?.[0]?.PostOffice?.[0];
        if (!po) return;
        if (!city.trim())  { setCity(po.District || po.Name);  setTouched(t => ({ ...t, city: true })); }
        if (!state.trim()) { setState(po.State);               setTouched(t => ({ ...t, state: true })); }
      })
      .catch(() => {});
  }, [pincode]);

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
    const all = { name: true, email: true, phone: true, flat: true, street: true, city: true, state: true, pincode: true };
    setTouched(all);
    const values = { name, email, phone, flat, street, city, state, pincode };
    const firstErr = (Object.keys(all) as (keyof typeof validators)[]).map(f => validators[f](values[f])).find(e => e);
    if (firstErr) { setErr(firstErr); return; }
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

    const richItems = [
      ...treeItems.map(i => ({ type: 'tree' as const, plan: i.plan!, variety: i.variety, qty: i.qty })),
      ...boxItems.map(i => ({ type: 'box' as const, variety: i.variety, qty: i.qty })),
    ];

    const hasTree = treeItems.length > 0;
    const hasBox  = boxItems.length > 0;
    setHadTree(hasTree);
    setHadBox(hasBox);
    const desc = hasTree && hasBox
      ? 'YourOrchard — Trees & Mango Boxes'
      : hasTree ? 'Tree Booking — Mango Season 2026'
      : 'Mango Box Order';

    setPaying(true);
    try {
      await openRazorpayCheckout({
        type: 'cart',
        items: cartItems,
        richItems,
        userName: name,
        userEmail: email,
        userPhone: phone,
        deliveryAddress,
        phone,
        description: desc,
        onSuccess: async (paymentId, orderId, razorpaySignature) => {
          try {
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
                      razorpaySignature,
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
                    razorpaySignature,
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
          } catch {
            setErr('Payment was received but we could not save your order. Please contact support with your payment ID: ' + paymentId);
            setPaying(false);
          }
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
        <p>
          {hadTree && hadBox
            ? "Your tree rental and mango boxes are booked. We'll be in touch with harvest updates."
            : hadTree
            ? "Your tree is booked for the season. Pay the balance within 7 days to confirm your slot."
            : "Your mango boxes are booked. We'll dispatch them as soon as the harvest starts."}
        </p>
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
              <input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                className={inputClass('name', name)}
                onChange={e => setName(e.target.value.replace(/[^A-Za-z\s.'-]/g, ''))}
                onBlur={() => touch('name')}
              />
              {fieldErr('name', name) && <span className="chk-field-err">{fieldErr('name', name)}</span>}
            </div>

            <div className="chk-row">
              <div className="chk-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  className={inputClass('email', email)}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                />
                {fieldErr('email', email) && <span className="chk-field-err">{fieldErr('email', email)}</span>}
              </div>
              <div className="chk-field">
                <label>Phone</label>
                <div className={`chk-phone-wrap ${touched.phone ? (validators.phone(phone) ? 'phone-error' : 'phone-valid') : ''}`}>
                  <span>+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => touch('phone')}
                  />
                </div>
                {fieldErr('phone', phone) && <span className="chk-field-err">{fieldErr('phone', phone)}</span>}
              </div>
            </div>

            <p className="chk-section-label">Delivery address</p>

            <div className="chk-row">
              <div className="chk-field">
                <label>Flat / House no.</label>
                <input
                  type="text"
                  placeholder="B-204, Green Valley Apts"
                  value={flat}
                  className={inputClass('flat', flat)}
                  onChange={e => setFlat(e.target.value)}
                  onBlur={() => touch('flat')}
                />
                {fieldErr('flat', flat) && <span className="chk-field-err">{fieldErr('flat', flat)}</span>}
              </div>
              <div className="chk-field">
                <label>Street / Area</label>
                <input
                  type="text"
                  placeholder="MG Road, Koramangala"
                  value={street}
                  className={inputClass('street', street)}
                  onChange={e => setStreet(e.target.value)}
                  onBlur={() => touch('street')}
                />
                {fieldErr('street', street) && <span className="chk-field-err">{fieldErr('street', street)}</span>}
              </div>
            </div>

            <div className="chk-row chk-row-3">
              <div className="chk-field">
                <label>City</label>
                <input
                  type="text"
                  placeholder="Bengaluru"
                  value={city}
                  className={inputClass('city', city)}
                  onChange={e => setCity(e.target.value.replace(/[^A-Za-z\s.'-]/g, ''))}
                  onBlur={() => touch('city')}
                />
                {fieldErr('city', city) && <span className="chk-field-err">{fieldErr('city', city)}</span>}
              </div>
              <div className="chk-field">
                <label>State</label>
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={state}
                  className={inputClass('state', state)}
                  onChange={e => setState(e.target.value.replace(/[^A-Za-z\s.'-]/g, ''))}
                  onBlur={() => touch('state')}
                />
                {fieldErr('state', state) && <span className="chk-field-err">{fieldErr('state', state)}</span>}
              </div>
              <div className="chk-field">
                <label>Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="560001"
                  value={pincode}
                  className={inputClass('pincode', pincode)}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => touch('pincode')}
                />
                {fieldErr('pincode', pincode) && <span className="chk-field-err">{fieldErr('pincode', pincode)}</span>}
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
