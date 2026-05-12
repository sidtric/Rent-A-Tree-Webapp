import { useState } from 'react';
import './MangoBoxes.css';
import '../pages/Shop.css';
import NotifyModal from './NotifyModal';

const BOXES = [
  {
    id: 'dasheri',
    name: 'Dasheri',
    weight: '10 kg',
    available: 'May 20',
    badge: "People's Favourite",
    desc: 'Honey-sweet, thin-skinned, and loved across India. Plucked fresh from our orchard at peak ripeness.',
    img: '/dasheri-box.jpg',
  },
  {
    id: 'chausa',
    name: 'Chausa',
    weight: '10 kg',
    available: 'June 10',
    badge: 'Jewel of Ramnagar',
    desc: 'Velvety smooth, saffron-hued, and intensely sweet. Grown in our Ramnagar bagiche and harvested at peak ripeness.',
    img: '/chausa-box.jpg',
  },
  {
    id: 'langra',
    name: 'Langra',
    weight: '10 kg',
    available: 'June 15',
    badge: 'Most Fulfilling',
    desc: 'Buttery, fiberless, and deeply aromatic. One box from our Ramnagar orchard and you will be fully satisfied.',
    img: '/langra-box.jpg',
  },
];

export default function MangoBoxes() {
  const [notifyBox, setNotifyBox] = useState<string | null>(null);

  return (
    <section className="mb" id="mango-boxes">
      <div className="mb-inner">
        <div className="mb-header">
          <span className="mb-label">Just Want Mangoes?</span>
          <h2 className="mb-title">Order a Box</h2>
          <p className="mb-sub">No tree rental needed. Pick your variety and get a fresh 10 kg box delivered from Ramnagar.</p>
          <div className="mb-harvest-note">Harvest starts May 20 — book now to reserve yours</div>
        </div>

        <div className="mb-cards">
          {BOXES.map(box => (
            <div key={box.id} className="mb-card">
              <div className="mb-ribbon">Coming Soon</div>
              <div className="mb-card-img">
                <div className="mb-box-scene">
                  <img src="/mango-crate.png" alt="Mango crate" className="mb-crate-photo" />
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
                  <button className="mb-btn-outline" onClick={() => setNotifyBox(box.name)}>
                    Notify Me When Available
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {notifyBox && (
        <NotifyModal
          icon="🥭"
          title={`Notify Me — ${notifyBox} Box`}
          subtitle="Harvest starts soon. Drop your details and we'll let you know the moment it's ready to order."
          successMsg={`We'll email you as soon as the ${notifyBox} boxes are ready to order.`}
          backendMessage={`Notify me when ${notifyBox} mango boxes are available.`}
          onClose={() => setNotifyBox(null)}
        />
      )}
    </section>
  );
}
