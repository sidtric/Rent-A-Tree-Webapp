import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { TIER_DATA } from '../constants/prices';
import { apiFetch } from '../lib/api';
import './TreeDetail.css';
import { useState, useEffect } from 'react';

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
  chausa:  '/chausa-tree.jpg',
  dasheri: '/dasheri-tree.jpg',
  langra:  '/langra-tree.jpg',
};

const VARIETY_LABEL: Record<Variety, string> = {
  chausa: 'Chausa',
  dasheri: 'Dasheri',
  langra: 'Langra',
};


const VARIETY_CODE: Record<Variety, string> = {
  chausa: 'CH',
  dasheri: 'DA',
  langra: 'LA',
};

const TIER_NUM: Record<Tier, string> = { Base: '01', Mid: '02', Big: '03' };
const TIER_TO_PLAN: Record<Tier, string> = { Base: 'sapling', Mid: 'adult', Big: 'grand' };

function buildTrees(): Tree[] {
  const list: Tree[] = [];
  (['dasheri', 'chausa', 'langra'] as Variety[]).forEach((variety, vi) => {
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

const PLAN_TO_TIER: Record<string, string> = { sapling: 'base', adult: 'mid', grand: 'big' };

export default function TreeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addItem, setOpen } = useCart();
  const [bookedSlugs, setBookedSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ plan: string; variety: string }[]>('/api/rentals')
      .then(rentals => {
        const slugs = rentals
          .filter(r => PLAN_TO_TIER[r.plan])
          .map(r => `${r.variety}-${PLAN_TO_TIER[r.plan]}`);
        setBookedSlugs(slugs);
      })
      .catch(() => {});
  }, [user]);

  const slug = id ? (LEGACY_MAP[id] || id) : '';
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
  const isBooked = bookedSlugs.includes(tree.slug);
  const inCart = items.some(i => i.id === tree.slug);

  function handleBook() {
    if (!user) { navigate('/login', { state: { from: `/trees/${tree.slug}` } }); return; }
    addItem({
      id: tree.slug,
      name: `${tree.varietyLabel} ${tree.tier} Tree`,
      variety: tree.variety,
      type: 'tree',
      plan: TIER_TO_PLAN[tree.tier],
      price: tree.tokenPrice,
      img: tree.img,
    });
    setOpen(true);
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
            Pay the balance of <strong>₹{balance.toLocaleString('en-IN')}</strong> within 7 days of booking.
            Token is non-refundable.
          </p>

          {isBooked ? (
            <div className="td-booked">🔒 This tree is booked</div>
          ) : inCart ? (
            <button className="td-prebook-btn td-prebook-btn--added" onClick={() => setOpen(true)}>
              Added to Cart — View Cart →
            </button>
          ) : (
            <button className="td-prebook-btn" onClick={handleBook}>
              Book Now
            </button>
          )}

        </div>
      </div>

      <section className="td-related">
        <h2 className="td-related-title">All {tree.varietyLabel} Trees</h2>
        <p className="td-related-sub">Pick a size that fits your family. All sizes are {tree.varietyLabel} mangoes from our Ramnagar orchard.</p>
        <div className="td-related-grid">
          {sameVarietyTrees.map(t => {
            const tBooked = bookedSlugs.includes(t.slug);
            return (
              <div key={t.slug} className={`td-related-card ${tBooked ? 'is-booked' : ''} ${t.slug === tree.slug ? 'is-current' : ''}`}>
                <div className="td-related-img" style={{ backgroundImage: `url(${t.img})` }}>
                  {tBooked && <span className="td-related-booked-badge">Booked</span>}
                </div>
                <div className="td-related-body">
                  <div className="td-plan-header">
                    <span className="td-plan-name">{t.tier} Tree</span>
                    <span className={`td-plan-badge td-plan-badge-${t.tier.toLowerCase()}`}>{t.tier}</span>
                  </div>
                  <p className="td-plan-prebook">Booking available</p>
                  <ul className="td-plan-features">
                    <li>{t.yield} minimum yield</li>
                    <li>Fresh delivery included</li>
                    <li>Weekly video updates</li>
                    <li>Personal nameplate on tree</li>
                  </ul>
                  <div className="td-plan-custom">₹{t.tokenPrice.toLocaleString('en-IN')} <span>token · {t.id}</span></div>
                  {tBooked ? (
                    <button className="td-related-btn td-related-btn-disabled" disabled>Tree is booked</button>
                  ) : (
                    <Link className={`td-plan-btn td-plan-btn-${t.tier.toLowerCase()}`} to={`/trees/${t.slug}`}>Book Now</Link>
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
