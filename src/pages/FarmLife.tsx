import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import './FarmLife.css';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface Update {
  _id: string;
  caption: string;
  media: MediaItem[];
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function UpdateCard({ update }: { update: Update }) {
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const first = update.media[0];

  return (
    <>
      <div className="fl-card">
        {first && (
          <div className="fl-card-media" onClick={() => first.type === 'image' ? setLightbox(first) : undefined}>
            {first.type === 'image' ? (
              <img src={first.url} alt={update.caption} className="fl-card-img" />
            ) : (
              <video src={first.url} controls className="fl-card-video" />
            )}
            {update.media.length > 1 && (
              <div className="fl-card-more">+{update.media.length - 1}</div>
            )}
          </div>
        )}
        <div className="fl-card-body">
          {update.caption && <p className="fl-card-caption">{update.caption}</p>}
          <span className="fl-card-date">{formatDate(update.createdAt)}</span>
        </div>
      </div>

      {lightbox && (
        <div className="fl-lightbox" onClick={() => setLightbox(null)}>
          <button className="fl-lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.url} alt="" className="fl-lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

export default function FarmLife() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/public-updates')
      .then(setUpdates)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fl">
      {/* ── Hero ── */}
      <div className="fl-hero">
        <div className="fl-hero-overlay" />
        <div className="fl-hero-content">
          <span className="fl-location-pill">Ramnagar, Uttarakhand</span>
          <h1 className="fl-hero-title">Life on the Farm</h1>
          <p className="fl-hero-sub">
            Step inside our orchard. This is where your mangoes grow, ripen, and begin their journey to you.
          </p>
          <div className="fl-hero-divider" />
          <span className="fl-bagiche-pill">Our Bagiche</span>
          <h2 className="fl-orchard-title">
            A Living, <span className="fl-orchard-green">Breathing Orchard</span>
          </h2>
          <p className="fl-orchard-para">
            Nestled in the foothills of the Himalayas, our orchard in Ramnagar sits at the edge of Corbett country. The soil is rich, the water is clean, and the air carries the scent of mango blossoms every spring.
          </p>
          <p className="fl-orchard-para">
            Our orchardists have been growing mangoes here for two generations — no chemicals, no shortcuts, just traditional farming, patient hands, and deep knowledge of the land.
          </p>
        </div>
      </div>

      {/* ── Updates grid ── */}
      <div className="fl-updates">
        <div className="fl-updates-inner">
          {loading ? (
            <div className="fl-loading"><div className="fl-spinner" /></div>
          ) : updates.length === 0 ? (
            <div className="fl-empty">
              <p>Updates coming soon — we're getting the camera ready. 🌿</p>
            </div>
          ) : (
            <div className="fl-grid">
              {updates.map(u => <UpdateCard key={u._id} update={u} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
