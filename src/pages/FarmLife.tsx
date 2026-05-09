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
      <div className="fl-inner">
        <div className="fl-header">
          <span className="fl-label">From the Orchard</span>
          <h1 className="fl-title">Life on the Farm</h1>
          <p className="fl-sub">Peek inside our Ramnagar orchard — updates, harvests, and everyday moments from the bagiche.</p>
        </div>

        {loading ? (
          <div className="fl-loading">
            <div className="fl-spinner" />
          </div>
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
  );
}
