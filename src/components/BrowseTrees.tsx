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
    name: 'Base',
    icon: '🌱',
    size: 'Small Tree',
    yield: '15 – 20 kg',
    price: 4499,
    tokenPrice: 799,
    desc: 'Perfect for a small family. One young tree, full season harvest.',
    img: '/chausa-box.jpg',
  },
  {
    id: 'adult',
    name: 'Mid',
    icon: '🌿',
    size: 'Mid Tree',
    yield: '30 – 45 kg',
    desc: 'The sweet spot — generous yield, great value for a family of four.',
    price: 6999,
    tokenPrice: 1499,
    img: '/dasheri-box.jpg',
  },
  {
    id: 'grand',
    name: 'Big',
    icon: '🌳',
    size: 'Big Tree',
    yield: '60 – 80 kg',
    desc: 'Maximum yield. Best for large families or gifting boxes to loved ones.',
    price: 9999,
    tokenPrice: 2499,
    img: '/langra-box.jpg',
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
    navigate(`/trees/${tree.id}`);
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
                <h3 className="bt-card-name"><span className="bt-card-icon">{tree.icon}</span> {tree.name} Tree</h3>
                <p className="bt-card-desc">{tree.desc}</p>
                <div className="bt-card-token">
                  <span className="bt-token-amount">₹{tree.tokenPrice.toLocaleString('en-IN')}</span>
                  <span className="bt-token-caption">Pre-book token amount due now</span>
                </div>
                <div className="bt-card-full-note">
                  Total ₹{tree.price.toLocaleString('en-IN')} · balance ₹{(tree.price - tree.tokenPrice).toLocaleString('en-IN')} due in 7 days
                </div>
                <button className="bt-btn bt-btn-full" onClick={() => handleRentNow(tree)}>Pre-book Now</button>
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
