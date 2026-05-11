import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { openRazorpayCheckout } from '../lib/razorpay';
import { apiFetch } from '../lib/api';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [name,    setName]    = useState(user?.name || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [phone,   setPhone]   = useState('');
  const [flat,    setFlat]    = useState('');
  const [street,  setStreet]  = useState('');
  const [city,    setCity]    = useState('');
  const [state,   setState]   = useState('');
  const [pincode, setPincode] = useState('');
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [err,     setErr]     = useState('');

  const boxItems = items.filter(i => i.type === 'box');

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
    if (!name.trim())                                return setErr('Please enter your full name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email.');
    if (!phone.trim() || !/^\d{10}$/.test(phone))    return setErr('Enter a valid 10-digit phone number.');
    if (!flat.trim())                                return setErr('Please enter your flat / house number.');
    if (!street.trim())                              return setErr('Please enter your street / area.');
    if (!city.trim())                                return setErr('Please enter your city.');
    if (!state.trim())                               return setErr('Please enter your state.');
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) return setErr('Enter a valid 6-digit pincode.');

    const deliveryAddress = `${flat}, ${street}, ${city}, ${state} – ${pincode}`;
    handlePay(deliveryAddress);
  }

  async function handlePay(deliveryAddress: string) {
    setPaying(true);
    try {
      await openRazorpayCheckout({
        type: 'cart',
        items: boxItems.map(i => ({ variety: i.variety, quantity: i.qty })),
        userName: name,
        userEmail: email,
        userPhone: phone,
        onSuccess: async (paymentId, orderId) => {
          await Promise.all(boxItems.map(item =>
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
          ));
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

        {/* Left – form */}
        <div className="chk-left">
          <button className="chk-back" onClick={() => navigate(-1)}>← Back</button>
          <h2 className="chk-left-title">Delivery Details</h2>
          <p className="chk-left-sub">We'll ship your order to this address after harvest.</p>

          <form onSubmit={handleSubmit} className="chk-form" id="chk-form">
            <p className="chk-section-label">Personal info</p>

            <div className="chk-field">
              <label>Full name</label>
              <input type="text" placeholder="Ravi Kumar" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="chk-row">
              <div className="chk-field">
                <label>Email</label>
                <input type="email" placeholder="ravi@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>Phone</label>
                <div className="chk-phone-wrap">
                  <span>+91</span>
                  <input type="tel" placeholder="9876543210" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
            </div>

            <p className="chk-section-label">Delivery address</p>

            <div className="chk-row">
              <div className="chk-field">
                <label>Flat / House no.</label>
                <input type="text" placeholder="Flat 4B, Green Tower" value={flat} onChange={e => setFlat(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>Street / Area</label>
                <input type="text" placeholder="MG Road, Sector 12" value={street} onChange={e => setStreet(e.target.value)} />
              </div>
            </div>

            <div className="chk-row chk-row-3">
              <div className="chk-field">
                <label>City</label>
                <input type="text" placeholder="Delhi" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>State</label>
                <input type="text" placeholder="Delhi" value={state} onChange={e => setState(e.target.value)} />
              </div>
              <div className="chk-field">
                <label>Pincode</label>
                <input type="text" placeholder="110001" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            {err && <p className="chk-err">{err}</p>}
          </form>
        </div>

        {/* Right – order summary */}
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
            <p className="chk-summary-section">Order summary</p>

            {items.map(item => (
              <div key={item.id} className="chk-summary-item">
                <span className="chk-item-name">{item.name} ×{item.qty}</span>
                <span className="chk-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}

            <div className="chk-divider" />

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
