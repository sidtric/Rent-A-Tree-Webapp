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
  onConfirm: (data: { deliveryAddress: string; phone: string; quantity: number }) => void;
};

export default function CheckoutModal(props: CheckoutModalProps) {
  const { mode, variety, loading, onClose, onConfirm } = props;
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [err, setErr] = useState('');

  const pricePerBox = mode === 'box' ? props.pricePerBox : props.price;
  const total = mode === 'box' ? pricePerBox * quantity : pricePerBox;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!address.trim()) return setErr('Please enter a delivery address.');
    if (!phone.trim() || !/^\d{10}$/.test(phone)) return setErr('Enter a valid 10-digit phone number.');
    onConfirm({ deliveryAddress: address, phone, quantity });
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
          <div className="cm-field">
            <label>Phone number</label>
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

          <div className="cm-field">
            <label>Delivery address</label>
            <textarea
              rows={3}
              placeholder="House / flat no., street, city, pincode"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          {err && <p className="cm-err">{err}</p>}

          <div className="cm-footer">
            <div className="cm-total">
              <span>Total</span>
              <span className="cm-total-amount">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button type="submit" className="cm-btn" disabled={loading}>
              {loading ? 'Processing…' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
