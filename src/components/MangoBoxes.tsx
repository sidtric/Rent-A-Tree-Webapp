import { useState } from 'react';
import { apiFetch } from '../lib/api';
import './MangoBoxes.css';
import '../pages/Shop.css';

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

function NotifyModal({ variety, onClose }: { variety: string; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr('Please enter your name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email.');
    if (phone && !/^\d{10}$/.test(phone)) return setErr('Enter a valid 10-digit phone number.');
    setErr('');
    setSubmitting(true);
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, message: `Notify me when ${variety} mango boxes are available.`, type: 'notify' }),
      });
      setDone(true);
    } catch (e: any) {
      setErr(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="notify-overlay" onClick={onClose}>
      <div className="notify-modal" onClick={e => e.stopPropagation()}>
        <button className="notify-close" onClick={onClose}>✕</button>
        {done ? (
          <div className="notify-success">
            <div className="notify-success-icon">✓</div>
            <h3>You're on the list!</h3>
            <p>We'll email you as soon as the {variety} boxes are ready to order.</p>
            <button className="notify-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="notify-litchi-icon">🥭</div>
            <h3 className="notify-title">Notify Me — {variety} Box</h3>
            <p className="notify-sub">Harvest starts soon. Drop your details and we'll let you know the moment it's ready to order.</p>
            <form onSubmit={handleSubmit} className="notify-form">
              <div className="notify-field">
                <label>Your name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="notify-field">
                <label>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="notify-field">
                <label>Phone <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                <input type="tel" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
              {err && <p className="notify-err">{err}</p>}
              <button type="submit" className="notify-submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Notify Me →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

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

      {notifyBox && <NotifyModal variety={notifyBox} onClose={() => setNotifyBox(null)} />}
    </section>
  );
}
