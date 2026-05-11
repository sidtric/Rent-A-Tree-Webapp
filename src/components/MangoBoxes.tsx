import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout } from '../lib/razorpay';
import { apiFetch } from '../lib/api';
import { useCart } from '../context/CartContext';
import CheckoutModal from './CheckoutModal';
import './MangoBoxes.css';

const BOXES = [
  {
    id: 'chausa',
    name: 'Chausa',
    weight: '10 kg',
    price: 1299,
    available: 'May 15',
    badge: 'Jewel of Ramnagar',
    desc: 'Velvety smooth, saffron-hued, and intensely sweet. Grown in our Ramnagar bagiche and harvested at peak ripeness.',
    img: '/chausa-box.jpg',
  },
  {
    id: 'dasheri',
    name: 'Dasheri',
    weight: '10 kg',
    price: 1499,
    available: 'June 1',
    badge: "People's Favourite",
    desc: 'Honey-sweet, thin-skinned, and loved across India. Plucked fresh from our orchard at peak ripeness.',
    img: '/dasheri-box.jpg',
  },
  {
    id: 'langra',
    name: 'Langra',
    weight: '10 kg',
    price: 1399,
    available: 'June 10',
    badge: 'Most Fulfilling',
    desc: 'Buttery, fiberless, and deeply aromatic. One box from our Ramnagar orchard and you will be fully satisfied.',
    img: '/langra-box.jpg',
  },
];

export default function MangoBoxes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [checkoutBox, setCheckoutBox] = useState<typeof BOXES[0] | null>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState('');

  function handlePrebook(box: typeof BOXES[0]) {
    if (!user) { navigate('/login', { state: { from: '/' } }); return; }
    setCheckoutBox(box);
    setSuccess('');
  }

  async function handleConfirm({ deliveryAddress, phone, quantity }: { deliveryAddress: string; phone: string; quantity: number }) {
    if (!checkoutBox || !user) return;
    setPaying(true);
    try {
      await openRazorpayCheckout({
        type: 'box',
        variety: checkoutBox.id,
        quantity,
        userName: user.name,
        userEmail: user.email,
        userPhone: phone,
        onSuccess: async (paymentId, orderId) => {
          await apiFetch('/api/orders', {
            method: 'POST',
            body: JSON.stringify({
              variety: checkoutBox.id,
              quantity,
              deliveryAddress,
              phone,
              razorpayOrderId: orderId,
              paymentId,
            }),
          });
          setCheckoutBox(null);
          setSuccess(checkoutBox.name);
          setTimeout(() => setSuccess(''), 5000);
        },
        onDismiss: () => setPaying(false),
      });
    } catch (err: any) {
      alert(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <section className="mb" id="mango-boxes">
      <div className="mb-inner">
        <div className="mb-header">
          <span className="mb-label">Just Want Mangoes?</span>
          <h2 className="mb-title">Order a Box</h2>
          <p className="mb-sub">No tree rental needed. Pick your variety and get a fresh 10 kg box delivered from Ramnagar.</p>
          <div className="mb-harvest-note">Harvest starts May 15 — prebook now to reserve yours</div>
        </div>

        {success && (
          <div className="mb-success">
            {success} box prebooked! We will dispatch it as soon as the harvest starts.
          </div>
        )}

        <div className="mb-cards">
          {BOXES.map(box => (
            <div key={box.id} className="mb-card">
              <div className="mb-card-img">
                <div className="mb-box-scene">
                  {/* Back mangoes */}
                  <span className="mb-mango mb-mango-back-l">🥭</span>
                  <span className="mb-mango mb-mango-back-r">🥭</span>

                  {/* The box */}
                  <div className="mb-box">
                    <span className="mb-box-dot mb-box-dot-tl" />
                    <span className="mb-box-dot mb-box-dot-tr" />
                    <span className="mb-box-dot mb-box-dot-ml" />
                    <span className="mb-box-dot mb-box-dot-mr" />
                    <span className="mb-box-dot mb-box-dot-bl" />
                    <span className="mb-box-dot mb-box-dot-br" />
                    <div className="mb-box-content">
                      <div className="mb-box-left">
                        <img src="/logo.jpeg" alt="YourOrchard" className="mb-box-logo" />
                        <span className="mb-box-fresh">Farm Fresh</span>
                        <span className="mb-box-variety">{box.name}<br />Aam</span>
                        <span className="mb-box-natural">Natural · Chemical Free</span>
                      </div>
                      {/* Large mango overlapping out of box */}
                      <span className="mb-mango-hero">🥭</span>
                    </div>
                  </div>

                  {/* Front mangoes on tray */}
                  <span className="mb-mango mb-mango-front-l">🥭</span>
                  <span className="mb-mango mb-mango-front-r">🥭</span>
                </div>
                <div className="mb-card-tag">Available from {box.available}</div>
              </div>
              <div className="mb-card-body">
                <div className="mb-card-top">
                  <h3 className="mb-card-name">{box.name}</h3>
                  <span className="mb-card-weight">{box.weight}</span>
                </div>
                <p className="mb-card-desc">{box.desc}</p>
                <div className="mb-card-footer">
                  <div className="mb-card-price">
                    <span className="mb-coming-soon">Coming Soon</span>
                  </div>
                  <div className="mb-actions">
                    <button className="mb-btn-outline" onClick={() => addItem({ id: `box-${box.id}`, name: box.name, variety: box.id, type: 'box', price: box.price, img: box.img })}>Add to Cart</button>
                    <button className="mb-btn-solid" onClick={() => handlePrebook(box)}>Prebook</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {checkoutBox && (
        <CheckoutModal
          mode="box"
          variety={checkoutBox.id}
          pricePerBox={checkoutBox.price}
          loading={paying}
          onClose={() => setCheckoutBox(null)}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
}
