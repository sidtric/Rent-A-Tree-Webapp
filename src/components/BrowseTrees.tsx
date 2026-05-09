import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout } from '../lib/razorpay';
import { apiFetch } from '../lib/api';
import CheckoutModal from './CheckoutModal';
import './BrowseTrees.css';

const VARIETIES = ['chausa', 'dasheri', 'langra'] as const;
type Variety = typeof VARIETIES[number];

const VARIETY_LABELS: Record<Variety, string> = {
  chausa: 'Chausa Aam',
  dasheri: 'Dasheri Aam',
  langra: 'Langra Aam',
};

const TREES = [
  {
    id: 'sapling',
    name: 'Sapling',
    size: 'Small Tree',
    yield: '15 – 20 kg',
    price: 2499,
    desc: 'Perfect for a small family. One young tree, full season harvest.',
    img: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=600&q=80',
  },
  {
    id: 'adult',
    name: 'Adult',
    size: 'Mid Tree',
    yield: '30 – 45 kg',
    desc: 'The sweet spot — generous yield, great value for a family of four.',
    price: 4499,
    img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80',
  },
  {
    id: 'grand',
    name: 'Grand',
    size: 'Big Tree',
    yield: '60 – 80 kg',
    desc: 'Maximum yield. Best for large families or gifting boxes to loved ones.',
    price: 7999,
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
];

export default function BrowseTrees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedVariety, setSelectedVariety] = useState<Variety>('chausa');
  const [checkoutTree, setCheckoutTree] = useState<typeof TREES[0] | null>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleRentNow(tree: typeof TREES[0]) {
    if (!user) { navigate('/login'); return; }
    setCheckoutTree(tree);
    setSuccess(false);
  }

  async function handleConfirm({ deliveryAddress, phone }: { deliveryAddress: string; phone: string; quantity: number }) {
    if (!checkoutTree || !user) return;
    setPaying(true);
    try {
      await openRazorpayCheckout({
        type: 'rental',
        plan: checkoutTree.id,
        variety: selectedVariety,
        userName: user.name,
        userEmail: user.email,
        userPhone: phone,
        onSuccess: async (paymentId, orderId) => {
          await apiFetch('/api/rentals', {
            method: 'POST',
            body: JSON.stringify({
              plan: checkoutTree.id,
              variety: selectedVariety,
              deliveryAddress,
              razorpayOrderId: orderId,
              paymentId,
            }),
          });
          setCheckoutTree(null);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 5000);
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
    <section className="bt" id="browse-trees">
      <div className="bt-inner">
        <div className="bt-header">
          <span className="bt-label">Seasonal Plans</span>
          <h2 className="bt-title">Rent Your Tree</h2>
          <p className="bt-sub">Choose a tree size. All plans include weekly farm updates and free home delivery.</p>
        </div>

        <div className="bt-variety-row">
          {VARIETIES.map(v => (
            <span
              key={v}
              className={`bt-variety-tag ${selectedVariety === v ? 'active' : ''}`}
              onClick={() => setSelectedVariety(v)}
            >
              {VARIETY_LABELS[v]}
            </span>
          ))}
        </div>

        {success && (
          <div className="bt-success">
            Your tree has been rented! Check your dashboard for updates.
          </div>
        )}

        <div className="bt-cards">
          {TREES.map((tree, i) => (
            <div key={tree.id} className={`bt-card ${i === 1 ? 'featured' : ''}`}>
              {i === 1 && <div className="bt-card-badge">Most Popular</div>}
              <div className="bt-card-img" style={{ backgroundImage: `url(${tree.img})` }} />
              <div className="bt-card-body">
                <div className="bt-card-meta">
                  <span className="bt-card-size">{tree.size}</span>
                  <span className="bt-card-yield">{tree.yield} / season</span>
                </div>
                <h3 className="bt-card-name">{tree.name}</h3>
                <p className="bt-card-desc">{tree.desc}</p>
                <div className="bt-card-footer">
                  <div className="bt-card-price">
                    <span className="bt-price">₹{tree.price.toLocaleString('en-IN')}</span>
                    <span className="bt-price-note">/ season</span>
                  </div>
                  <button className="bt-btn" onClick={() => handleRentNow(tree)}>Rent Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="bt-note">All trees are located in Ramnagar, Uttarakhand. Available varieties: Chausa, Dasheri, Langra.</p>
      </div>

      {checkoutTree && (
        <CheckoutModal
          mode="rental"
          treeName={`${checkoutTree.name} Tree`}
          variety={selectedVariety}
          price={checkoutTree.price}
          loading={paying}
          onClose={() => setCheckoutTree(null)}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
}
