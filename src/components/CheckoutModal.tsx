import { useState } from 'react';
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

type CheckoutModalProps = (RentalMode | BoxMode) & {
  loading: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; email: string; phone: string; deliveryAddress: string; quantity: number }) => void;
};

export default function CheckoutModal(props: CheckoutModalProps) {
  const { mode, variety, loading, onClose, onConfirm } = props;

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [flat,     setFlat]     = useState('');
  const [street,   setStreet]   = useState('');
  const [city,     setCity]     = useState('');
  const [state,    setState]    = useState('');
  const [pincode,  setPincode]  = useState('');
  const [quantity, setQuantity] = useState(1);
  const [err,      setErr]      = useState('');

  const pricePerUnit = mode === 'box' ? props.pricePerBox : props.price;
  const total = mode === 'box' ? pricePerUnit * quantity : pricePerUnit;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!name.trim())                              return setErr('Please enter your full name.');
    if (!email.trim() || !email.includes('@'))     return setErr('Please enter a valid email address.');
    if (!phone.trim() || !/^\d{10}$/.test(phone))  return setErr('Enter a valid 10-digit phone number.');
    if (!flat.trim())                              return setErr('Please enter your flat / house number.');
    if (!street.trim())                            return setErr('Please enter your street / area.');
    if (!city.trim())                              return setErr('Please enter your city.');
    if (!state.trim())                             return setErr('Please enter your state.');
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) return setErr('Enter a valid 6-digit pincode.');

    const deliveryAddress = `${flat}, ${street}, ${city}, ${state} – ${pincode}`;
    onConfirm({ name, email, phone, deliveryAddress, quantity });
  }

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <button className="cm-close" onClick={onClose}>✕</button>

        <div className="cm-header">
          <h2>{mode === 'rental' ? 'Confirm Your Rental' : 'Prebook Mango Box'}</h2>
          <p className="cm-variety">{variety.charAt(0).toUpperCase() + variety.slice(1)} Aam</p>
        </div>

        {mode === 'rental' && (
          <div className="cm-plan">
            <span>{props.treeName}</span>
            <span className="cm-price">₹{props.price.toLocaleString('en-IN')}</span>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="cm-form">
          <p className="cm-section-label">Personal details</p>

          <div className="cm-field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Ravi Kumar"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="cm-row">
            <div className="cm-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="ravi@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
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
              <input
                type="text"
                placeholder="Flat 4B, Green Tower"
                value={flat}
                onChange={e => setFlat(e.target.value)}
              />
            </div>
            <div className="cm-field">
              <label>Street / Area</label>
              <input
                type="text"
                placeholder="MG Road, Sector 12"
                value={street}
                onChange={e => setStreet(e.target.value)}
              />
            </div>
          </div>

          <div className="cm-row cm-row-3">
            <div className="cm-field">
              <label>City</label>
              <input
                type="text"
                placeholder="Delhi"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <div className="cm-field">
              <label>State</label>
              <input
                type="text"
                placeholder="Delhi"
                value={state}
                onChange={e => setState(e.target.value)}
              />
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

          <div className="cm-footer">
            <div className="cm-total">
              <span>Total</span>
              <span className="cm-total-amount">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button type="submit" className="cm-btn" disabled={loading}>
              {loading ? 'Processing…' : 'Proceed to Payment →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
