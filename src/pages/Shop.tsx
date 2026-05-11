import { useState } from 'react';
import BrowseTrees from '../components/BrowseTrees';
import MangoBoxes from '../components/MangoBoxes';
import { apiFetch } from '../lib/api';
import './Shop.css';

function NotifyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr('Please enter your name.');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Please enter a valid email.');
    setErr('');
    setSubmitting(true);
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: 'Please notify me when Litchi is available.' }),
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
            <p>We'll email you as soon as our Litchi season opens. First to know, first to order.</p>
            <button className="notify-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="notify-litchi-icon">🍈</div>
            <h3 className="notify-title">Notify Me for Litchi</h3>
            <p className="notify-sub">Our Ramnagar litchi season opens in June. Drop your details and we'll let you know the moment it's live.</p>
            <form onSubmit={handleSubmit} className="notify-form">
              <div className="notify-field">
                <label>Your name</label>
                <input
                  type="text"
                  placeholder="Ravi Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="notify-field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="ravi@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
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

export default function Shop() {
  const [showNotify, setShowNotify] = useState(false);

  return (
    <>
      <BrowseTrees />
      <MangoBoxes />
      <section className="shop-litchi" id="litchi">
        <div className="shop-litchi-inner">
          <span className="shop-litchi-label">Coming Soon</span>
          <h2 className="shop-litchi-title">Fresh Litchi from Ramnagar</h2>
          <p className="shop-litchi-sub">
            Juicy, thin-skinned litchi grown in the same Kumaon foothills as our mangoes.
            Season opens June — register your interest and we'll notify you first.
          </p>
          <button className="shop-litchi-btn" onClick={() => setShowNotify(true)}>
            Notify Me When Available
          </button>
        </div>
      </section>

      {showNotify && <NotifyModal onClose={() => setShowNotify(false)} />}
    </>
  );
}
