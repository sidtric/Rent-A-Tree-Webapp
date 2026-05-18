import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, removeItem, updateQty, total, count, open, setOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="cd-overlay" onClick={() => setOpen(false)} />
      <div className="cd">
        <div className="cd-header">
          <h2 className="cd-title">Your Cart <span className="cd-count">{count}</span></h2>
          <button className="cd-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cd-empty">
            <span className="cd-empty-icon">🛒</span>
            <p>Your cart is empty.</p>
            <button className="cd-shop-btn" onClick={() => { setOpen(false); navigate('/shop'); }}>Shop Now</button>
          </div>
        ) : (
          <>
            <div className="cd-items">
              {items.map(item => (
                <div key={item.id} className="cd-item">
                  <div className="cd-item-img" style={{ backgroundImage: `url(${item.img})` }} />
                  <div className="cd-item-info">
                    <div className="cd-item-name">{item.name}</div>
                    <div className="cd-item-variety">{item.variety} · {item.type === 'box' ? '10 kg box' : 'Tree rental'}</div>
                    <div className="cd-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="cd-item-right">
                    <div className="cd-qty">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button className="cd-remove" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cd-footer">
              <div className="cd-total">
                <span>Total</span>
                <span className="cd-total-amount">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <button className="cd-checkout" onClick={() => { setOpen(false); navigate('/checkout'); }}>
                Proceed to Checkout <span className="btn-arrow">→</span>
              </button>
              <button className="cd-continue" onClick={() => setOpen(false)}>Continue Shopping</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
