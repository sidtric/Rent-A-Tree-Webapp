import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  const { addItem, setOpen: openCart } = useCart();

  function handlePrebook(box: typeof BOXES[0]) {
    if (!user) { navigate('/login', { state: { from: '/' } }); return; }
    addItem({ id: `box-${box.id}`, name: `${box.name} Mango Box`, variety: box.id, type: 'box', price: box.price, img: box.img });
    navigate('/checkout');
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

        <div className="mb-cards">
          {BOXES.map(box => (
            <div key={box.id} className="mb-card">
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
                  <button
                    className="mb-btn-outline"
                    onClick={() => {
                      addItem({ id: `box-${box.id}`, name: `${box.name} Mango Box`, variety: box.id, type: 'box', price: box.price, img: box.img });
                      openCart(true);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button className="mb-btn-solid" onClick={() => handlePrebook(box)}>Prebook</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
