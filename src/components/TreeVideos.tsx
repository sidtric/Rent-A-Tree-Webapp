import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import './TreeVideos.css';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface Update {
  _id: string;
  caption: string;
  variety?: string;
  media: MediaItem[];
  createdAt: string;
}

const FALLBACK: Update[] = [
  {
    _id: 'f1',
    caption: 'Chausa trees in full bloom — Week 4 update from our Ramnagar orchard.',
    variety: 'chausa',
    media: [{ url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video' }],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'f2',
    caption: 'Dasheri mangoes setting fruit — looking great this season.',
    variety: 'dasheri',
    media: [{ url: 'https://www.w3schools.com/html/movie.mp4', type: 'video' }],
    createdAt: new Date().toISOString(),
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TreeVideos() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<{ url: string; caption: string } | null>(null);

  useEffect(() => {
    apiFetch<Update[]>('/api/public-updates')
      .then(data => {
        const videos = data.filter(u => u.media.some(m => m.type === 'video'));
        setUpdates(videos.length > 0 ? videos : FALLBACK);
      })
      .catch(() => setUpdates(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="tv">
      <div className="tv-inner">
        <div className="tv-header">
          <span className="tv-label">Live from the Orchard</span>
          <h2 className="tv-title">Your Tree, This Week</h2>
          <p className="tv-sub">Weekly video updates sent directly from our orchardists to every tree owner.</p>
        </div>

        <div className="tv-grid">
          {updates.map(u => {
            const video = u.media.find(m => m.type === 'video')!;
            return (
              <div
                key={u._id}
                className="tv-card tv-card-native"
                onClick={() => setActive({ url: video.url, caption: u.caption })}
              >
                <video src={video.url} className="tv-native-bg" muted preload="metadata" />
                <div className="tv-card-overlay" />
                <div className="tv-play">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                {u.variety && <div className="tv-date">{u.variety.charAt(0).toUpperCase() + u.variety.slice(1)}</div>}
                <div className="tv-card-info">
                  <div className="tv-tree">{u.caption}</div>
                  <div className="tv-customer">
                    <span className="tv-loc">{formatDate(u.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {active && (
        <div className="tv-modal-overlay" onClick={() => setActive(null)}>
          <div className="tv-modal" onClick={e => e.stopPropagation()}>
            <button className="tv-modal-close" onClick={() => setActive(null)}>✕</button>
            <div className="tv-embed-wrap">
              <video src={active.url} controls autoPlay className="tv-native-player" />
            </div>
            <div className="tv-modal-info">
              <div className="tv-modal-tree">{active.caption}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
