import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BrowseTrees.css';

const VARIETIES = ['dasheri', 'chausa', 'langra'] as const;
type Variety = typeof VARIETIES[number];

const VARIETY_LABELS: Record<Variety, string> = {
  chausa:  'Chausa Aam',
  dasheri: 'Dasheri Aam',
  langra:  'Langra Aam',
};

const VARIETY_DESCS: Record<Variety, string> = {
  chausa:  'Velvety smooth, saffron-hued, and intensely sweet. The jewel of our Ramnagar orchard.',
  dasheri: 'Honey-sweet, thin-skinned, and loved across India. Our most popular variety.',
  langra:  'Buttery, fiberless, and deeply aromatic. The most fulfilling mango you will ever taste.',
};

const VARIETY_IMG: Record<Variety, string> = {
  chausa:  '/chausa-tree.jpg',
  dasheri: '/dasheri-tree.jpg',
  langra:  '/langra-tree.jpg',
};

export default function BrowseTrees() {
  const navigate = useNavigate();
  const [selectedVariety, setSelectedVariety] = useState<Variety>('chausa');

  return (
    <section className="bt" id="browse-trees">
      <div className="bt-inner">
        <div className="bt-header">
          <span className="bt-label">Seasonal Plans</span>
          <h2 className="bt-title">Rent Your Tree</h2>
          <p className="bt-sub">Choose a variety and book your tree for the 2026 season.</p>
        </div>

        <div className="bt-variety-row" id="browse-trees-cards">
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

        <div className="bt-single-card" onClick={() => navigate(`/trees/${selectedVariety}-base`)}>
          <div className="bt-single-img" style={{ backgroundImage: `url(${VARIETY_IMG[selectedVariety]})` }} />
          <div className="bt-single-body">
            <h3 className="bt-single-name">{VARIETY_LABELS[selectedVariety]}</h3>
            <p className="bt-single-desc">{VARIETY_DESCS[selectedVariety]}</p>
            <div className="bt-single-meta">
              <span>📍 Ramnagar, Uttarakhand</span>
              <span>3 sizes available</span>
            </div>
            <button className="bt-btn bt-btn-full">View Trees &amp; Book Now <span className="btn-arrow">→</span></button>
          </div>
        </div>

        <p className="bt-note">All trees are located in Ramnagar, Uttarakhand. Available varieties: Chausa, Dasheri, Langra.</p>
      </div>
    </section>
  );
}
