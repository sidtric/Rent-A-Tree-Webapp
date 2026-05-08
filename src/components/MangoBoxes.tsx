import './MangoBoxes.css';

const BOXES = [
  {
    id: 'chausa',
    name: 'Chausa',
    weight: '10 kg',
    price: 1299,
    available: 'May 15',
    desc: 'Velvety smooth, saffron-hued, and intensely sweet. Grown in our Ramnagar bagiche and harvested at peak ripeness.',
    img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
  },
  {
    id: 'dasheri',
    name: 'Dasheri',
    weight: '10 kg',
    price: 1499,
    available: 'June 1',
    desc: 'Honey-sweet, thin-skinned, and loved across India. Plucked fresh from our orchard at peak ripeness.',
    img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80',
  },
  {
    id: 'langra',
    name: 'Langra',
    weight: '10 kg',
    price: 1399,
    available: 'June 10',
    desc: 'Buttery, fiberless, and deeply aromatic. One box from our Ramnagar orchard and you will be fully satisfied.',
    img: 'https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=600&q=80',
  },
];

export default function MangoBoxes() {
  return (
    <section className="mb">
      <div className="mb-inner">
        <div className="mb-header">
          <span className="mb-label">Just Want Mangoes?</span>
          <h2 className="mb-title">Order a Box</h2>
          <p className="mb-sub">No tree rental needed. Pick your variety and get a fresh 10 kg box delivered from Ramnagar.</p>
          <div className="mb-harvest-note">Harvest starts May 15 — prebook now to reserve yours</div>
        </div>

        <div className="mb-cards">
          {BOXES.map(box => (
            <div key={box.id} className="mb-card">
              <div className="mb-card-img" style={{ backgroundImage: `url(${box.img})` }}>
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
                    <span className="mb-price">₹{box.price.toLocaleString()}</span>
                    <span className="mb-price-note">/ box</span>
                  </div>
                  <div className="mb-actions">
                    <button className="mb-btn-ghost">Add to Cart</button>
                    <button className="mb-btn-solid">Prebook</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
