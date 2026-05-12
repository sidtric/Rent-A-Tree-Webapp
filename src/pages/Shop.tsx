import BrowseTrees from '../components/BrowseTrees';
import MangoBoxes from '../components/MangoBoxes';
import NotifyModal from '../components/NotifyModal';
import { useState } from 'react';
import './Shop.css';

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

      {showNotify && (
        <NotifyModal
          icon="🍈"
          title="Notify Me for Litchi"
          subtitle="Our Ramnagar litchi season opens in June. Drop your details and we'll let you know the moment it's live."
          successMsg="We'll email you as soon as our Litchi season opens. First to know, first to order."
          backendMessage="Please notify me when Litchi is available."
          onClose={() => setShowNotify(false)}
        />
      )}
    </>
  );
}
