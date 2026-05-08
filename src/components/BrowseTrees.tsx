import './BrowseTrees.css';

const VARIETIES = ['Chausa', 'Dasheri', 'Langra'];

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
            <span key={v} className="bt-variety-tag">{v} Aam</span>
          ))}
        </div>

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
                    <span className="bt-price">₹{tree.price.toLocaleString()}</span>
                    <span className="bt-price-note">/ season</span>
                  </div>
                  <button className="bt-btn">Rent Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="bt-note">All trees are located in Ramnagar, Uttarakhand. Available varieties: Chausa, Dasheri, Langra.</p>
      </div>
    </section>
  );
}
