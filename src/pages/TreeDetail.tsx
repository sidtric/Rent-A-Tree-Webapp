import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout } from '../lib/razorpay';
import { apiFetch } from '../lib/api';
import './TreeDetail.css';

type Variety = 'chausa' | 'dasheri' | 'langra';
type Tier = 'Base' | 'Mid' | 'Big';

interface Tree {
  slug: string;
  id: string;
  variety: Variety;
  varietyLabel: string;
  tier: Tier;
  fullPrice: number;
  tokenPrice: number;
  yield: string;
  img: string;
}

const VARIETY_IMG: Record<Variety, string> = {
  chausa:  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
  dasheri: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=800&q=80',
  langra:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
};

const VARIETY_LABEL: Record<Variety, string> = {
  chausa: 'Chausa',
  dasheri: 'Dasheri',
  langra: 'Langra',
};

const TIER_DATA: Record<Tier, { fullPrice: number; tokenPrice: number; yield: string }> = {
  Base: { fullPrice: 4499, tokenPrice: 799, yield: '15–20 kg' },
  Mid:  { fullPrice: 6999, tokenPrice: 1499, yield: '30–45 kg' },
  Big:  { fullPrice: 9999, tokenPrice: 2499, yield: '60–80 kg' },
};

const VARIETY_CODE: Record<Variety, string> = {
  chausa: 'CH',
  dasheri: 'DA',
  langra: 'LA',
};

const TIER_NUM: Record<Tier, string> = { Base: '01', Mid: '02', Big: '03' };

function buildTrees(): Tree[] {
  const list: Tree[] = [];
  (['chausa', 'dasheri', 'langra'] as Variety[]).forEach((variety, vi) => {
    (['Base', 'Mid', 'Big'] as Tier[]).forEach((tier) => {
      const num = String(vi + 1).padStart(2, '0');
      list.push({
        slug: `${variety}-${tier.toLowerCase()}`,
        id: `TREE27MG${VARIETY_CODE[variety]}${num}${TIER_NUM[tier]}`,
        variety,
        varietyLabel: VARIETY_LABEL[variety],
        tier,
        fullPrice: TIER_DATA[tier].fullPrice,
        tokenPrice: TIER_DATA[tier].tokenPrice,
        yield: TIER_DATA[tier].yield,
        img: VARIETY_IMG[variety],
      });
    });
  });
  return list;
}

const TREES: Tree[] = buildTrees();
const TREE_BY_SLUG: Record<string, Tree> = Object.fromEntries(TREES.map(t => [t.slug, t]));
const LEGACY_MAP: Record<string, string> = { sapling: 'chausa-base', adult: 'dasheri-mid', grand: 'langra-big' };

const TIER_COLOR: Record<Tier, string> = { Base: '#4b5563', Mid: '#2563eb', Big: '#d97706' };

const BOOKED_KEY = 'yo_booked_trees';
function getBooked(): string[] {
  try { return JSON.parse(localStorage.getItem(BOOKED_KEY) || '[]'); } catch { return []; }
}
function addBooked(slug: string) {
  const list = getBooked();
  if (!list.includes(slug)) {
    list.push(slug);
    localStorage.setItem(BOOKED_KEY, JSON.stringify(list));
  }
}

export default function TreeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [successFor, setSuccessFor] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>(getBooked);
  const [balanceDate] = useState(() =>
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    }),
  );

  const slug = id ? (LEGACY_MAP[id] || id) : '';
  const success = successFor === slug;
  const tree = TREE_BY_SLUG[slug];

  if (!tree) {
    return (
      <div className="td-empty">
        <h2>Tree not found</h2>
        <button onClick={() => navigate('/')}>Back to home</button>
      </div>
    );
  }

  const balance = tree.fullPrice - tree.tokenPrice;
  const sameVarietyTrees = TREES.filter(t => t.variety === tree.variety);
  const isBooked = booked.includes(tree.slug);

  async function handlePrebook() {
    if (!user) { navigate('/login'); return; }
    if (!tree || isBooked) return;
    setPaying(true);
    try {
      await openRazorpayCheckout({
        type: 'rental',
        variety: tree.variety,
        userName: user.name,
        userEmail: user.email,
        userPhone: '',
        onSuccess: async (paymentId, orderId) => {
          await apiFetch('/api/rentals', {
            method: 'POST',
            body: JSON.stringify({
              tree: tree.id,
              variety: tree.variety,
              tier: tree.tier,
              deliveryAddress: 'To be confirmed',
              razorpayOrderId: orderId,
              paymentId,
              tokenPaid: tree.tokenPrice,
              balanceDue: balance,
            }),
          });
          addBooked(tree.slug);
          setBooked(getBooked());
          setSuccessFor(tree.slug);
        },
        onDismiss: () => setPaying(false),
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Payment failed.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="td">
      <div className="td-grid">
        <div className="td-image">
          <img src={tree.img} alt={`${tree.varietyLabel} mango`} />
          <span className="td-image-caption">Image for reference only.</span>
        </div>

        <div className="td-info">
          <h1 className="td-title">Mango {tree.varietyLabel} <span className="td-id-hash">#{tree.id.slice(-4)}</span></h1>

          <div className="td-tags">
            <span className="td-tag-tier" style={{ background: TIER_COLOR[tree.tier] }}>{tree.tier}</span>
            <span className="td-tag-variety">{tree.varietyLabel}</span>
            <span className="td-tag-category">Mango</span>
          </div>

          <p className="td-id">{tree.id}</p>

          <h2 className="td-price">₹{tree.tokenPrice.toLocaleString('en-IN')}</h2>
          <p className="td-price-caption">pre booking token</p>

          <p className="td-balance-note">
            Pay the balance of <strong>₹{balance.toLocaleString('en-IN')}</strong> within 7 days (by <strong>{balanceDate}</strong>).
            Token is non-refundable if balance is not paid in time.
          </p>

          {isBooked ? (
            <div className="td-booked">🔒 This tree is booked</div>
          ) : success ? (
            <div className="td-success">
              ✓ Pre-booking confirmed! Pay balance ₹{balance.toLocaleString('en-IN')} by {balanceDate}.
            </div>
          ) : (
            <button className="td-prebook-btn" onClick={handlePrebook} disabled={paying}>
              {paying ? 'Processing…' : 'Pre-book Now'}
            </button>
          )}
        </div>
      </div>

      <section className="td-related">
        <h2 className="td-related-title">All {tree.varietyLabel} Trees</h2>
        <p className="td-related-sub">Pick a size that fits your family. All sizes are {tree.varietyLabel} mangoes from our Ramnagar orchard.</p>
        <div className="td-related-grid">
          {sameVarietyTrees.map(t => {
            const tBooked = booked.includes(t.slug);
            return (
              <div key={t.slug} className={`td-related-card ${tBooked ? 'is-booked' : ''}`}>
                <div className="td-related-img" style={{ backgroundImage: `url(${t.img})` }}>
                  {tBooked && <span className="td-related-booked-badge">Booked</span>}
                </div>
                <div className="td-related-body">
                  <div className="td-related-tier-row">
                    <span className="td-related-tier" style={{ background: TIER_COLOR[t.tier] }}>{t.tier}</span>
                    <span className="td-related-yield">{t.yield}</span>
                  </div>
                  <p className="td-related-id">{t.id}</p>
                  <div className="td-related-price">
                    <span className="td-related-token">₹{t.tokenPrice.toLocaleString('en-IN')}</span>
                    <span className="td-related-token-note">token</span>
                  </div>
                  {tBooked ? (
                    <button className="td-related-btn td-related-btn-disabled" disabled>Tree is booked</button>
                  ) : (
                    <Link className="td-related-btn" to={`/trees/${t.slug}`}>View &amp; Pre-book →</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="td-description">
        <h2 className="td-description-title">Description</h2>
        <p>
          Own a real {tree.varietyLabel} mango tree at our Ramnagar orchard in Uttarakhand — without the hassle of farming. Each tree is hand-tagged, well-cared-for, and reserved exclusively for you for the entire season.
        </p>
        <p>
          When you reserve a tree with YourOrchard, you get weekly photo and video updates straight from the farm. Watch your tree blossom, set fruit, and ripen — all from your phone. Our local orchardists follow sustainable, residue-free practices that have been passed down for generations.
        </p>
        <p>
          Your tree is identified with a personal nameplate, so it is genuinely yours for the season. We guarantee a minimum yield of <strong>{tree.yield}</strong> based on the tier you selected. If your assigned tree under-yields for any reason, we make up the difference from our reserve trees so you always get the harvest you paid for.
        </p>
        <p>
          When the fruit is at peak ripeness, our team handpicks it the same morning, packs it carefully, and ships it directly to your doorstep anywhere in India. No middlemen, no cold storage chains — just farm-fresh {tree.varietyLabel} mangoes from our orchard to your home.
        </p>
      </section>
    </div>
  );
}
