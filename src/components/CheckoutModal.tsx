import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CheckoutModal.css';

interface RentalMode {
  mode: 'rental';
  treeName: string;
  variety: string;
  price: number;
}

interface BoxMode {
  mode: 'box';
  variety: string;
  pricePerBox: number;
}

export interface ConfirmData {
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  addressParts: { flat: string; street: string; city: string; state: string; pincode: string };
  quantity: number;
}

type CheckoutModalProps = (RentalMode | BoxMode) & {
  loading: boolean;
  onClose: () => void;
  onConfirm: (data: ConfirmData) => void;
};

export default function CheckoutModal(props: CheckoutModalProps) {
  const { mode, variety, loading, onClose, onConfirm } = props;
  const { user } = useAuth();
  const saved = user?.deliveryAddress;

  const [name,    setName]    = useState(user?.name  || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [phone,   setPhone]   = useState(user?.phone || '');
  const [flat,    setFlat]    = useState(saved?.flat    || '');
  const [street,  setStreet]  = useState(saved?.street  || '');
  const [city,    setCity]    = useState(saved?.city    || '');
  const [state,   setState]   = useState(saved?.state   || '');
  const [pincode, setPincode] = useState(saved?.pincode || '');
  const [quantity, setQuantity] = useState(1);
  const [err,     setErr]     = useState('');

  const pricePerUnit = mode === 'box' ? props.pricePerBox : props.price;
  const total = mode === 'box' ? pricePerUnit * quantity : pricePerUnit;
  const varietyLabel = variety.charAt(0).toUpperCase() + variety.slice(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!name.trim())                                return setErr('Please enter your full name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email address.');
    if (!phone.trim() || !/^\d{10}$/.test(phone))    return setErr('Enter a valid 10-digit phone number.');
    if (!flat.trim())                                return setErr('Please enter your flat / house number.');
    if (!street.trim())                              return setErr('Please enter your street / area.');
    if (!city.trim())                                return setErr('Please enter your city.');
    if (!state.trim())                               return setErr('Please enter your state.');
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) return setErr('Enter a valid 6-digit pincode.');

    const deliveryAddress = `${flat}, ${street}, ${city}, ${state} – ${pincode}`;
    const addressParts = { flat, street, city, state, pincode };
    onConfirm({ name, email, phone, deliveryAddress, addressParts, quantity });
  }

  return (
    <div className="cm-overlay">
      <div className="cm-fullscreen">

        {/* ── Left: Form ── */}
        <div className="cm-left">
          <button className="cm-back" onClick={onClose}>← Back</button>
          <h2 className="cm-left-title">Delivery Details</h2>
          <p className="cm-left-sub">We'll ship your order to this address after harvest.</p>

          <form onSubmit={handleSubmit} className="cm-form" id="checkout-form">

            <p className="cm-section-label">Personal info</p>

            <div className="cm-field">
              <label>Full name</label>
              <input type="text" placeholder="Ravi Kumar" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="cm-row">
              <div className="cm-field">
                <label>Email</label>
                <input type="email" placeholder="ravi@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="cm-field">
                <label>Phone</label>
                <div className="cm-phone-wrap">
                  <span>+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>

            <p className="cm-section-label">Delivery address</p>

            <div className="cm-row">
              <div className="cm-field">
                <label>Flat / House no.</label>
                <input type="text" placeholder="Flat 4B, Green Tower" value={flat} onChange={e => setFlat(e.target.value)} />
              </div>
              <div className="cm-field">
                <label>Street / Area</label>
                <input type="text" placeholder="MG Road, Sector 12" value={street} onChange={e => setStreet(e.target.value)} />
              </div>
            </div>

            <div className="cm-row cm-row-3">
              <div className="cm-field">
                <label>City</label>
                <input type="text" placeholder="Delhi" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="cm-field">
                <label>State</label>
                <input type="text" placeholder="Delhi" value={state} onChange={e => setState(e.target.value)} />
              </div>
              <div className="cm-field">
                <label>Pincode</label>
                <input
                  type="text"
                  placeholder="110001"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {err && <p className="cm-err">{err}</p>}
          </form>
        </div>

        {/* ── Right: Order summary ── */}
        <div className="cm-right">
          <div className="cm-summary">
            <div className="cm-summary-header">
              <img src="/logo.jpeg" alt="YourOrchard" className="cm-summary-logo" />
              <div>
                <p className="cm-summary-brand">YourOrchard</p>
                <p className="cm-summary-sub">Ramnagar, Uttarakhand</p>
              </div>
            </div>

            <div className="cm-summary-divider" />

            <p className="cm-summary-section">Order summary</p>

            <div className="cm-summary-item">
              <span className="cm-summary-item-name">
                {mode === 'rental' ? props.treeName : `${varietyLabel} Mango Box`}
              </span>
              <span className="cm-summary-item-variety">{varietyLabel} Aam</span>
            </div>

            {mode === 'box' && (
              <div className="cm-qty-row">
                <span>Quantity</span>
                <div className="cm-qty-ctrl">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>
            )}

            <div className="cm-summary-divider" />

            <div className="cm-summary-line">
              <span>{mode === 'box' ? `₹${pricePerUnit.toLocaleString('en-IN')} × ${quantity}` : 'Token amount'}</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="cm-summary-line cm-summary-shipping">
              <span>Shipping</span>
              <span className="cm-free">Free</span>
            </div>

            <div className="cm-summary-divider" />

            <div className="cm-summary-total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="cm-pay-btn"
              disabled={loading}
            >
              {loading ? 'Processing…' : `Pay ₹${total.toLocaleString('en-IN')} →`}
            </button>

            <p className="cm-secure-note">🔒 Secured by Razorpay · 256-bit encryption</p>
          </div>
        </div>

      </div>
    </div>
  );
}
