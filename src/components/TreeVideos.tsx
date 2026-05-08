import { useState } from 'react';
import './TreeVideos.css';

const VIDEOS = [
  {
    id: 1,
    videoId: 'iO7iQzGQpgY',
    customer: 'Sharma Family',
    location: 'Delhi',
    tree: 'Chausa — Adult Tree',
    date: 'Week 4 Update',
  },
  {
    id: 2,
    videoId: 'aCZWNNsecdQ',
    customer: 'Mehta Family',
    location: 'Mumbai',
    tree: 'Dasheri — Grand Tree',
    date: 'Week 6 Update',
  },
  {
    id: 3,
    videoId: 'jh_ukt8g53c',
    customer: 'Kapoor Family',
    location: 'Bengaluru',
    tree: 'Langra — Sapling',
    date: 'Week 2 Update',
  },
  {
    id: 4,
    videoId: 'iO7iQzGQpgY',
    customer: 'Verma Family',
    location: 'Pune',
    tree: 'Chausa — Grand Tree',
    date: 'Week 8 Update',
  },
];

export default function TreeVideos() {
  const [active, setActive] = useState<(typeof VIDEOS)[0] | null>(null);

  return (
    <section className="tv">
      <div className="tv-inner">
        <div className="tv-header">
          <span className="tv-label">Live from the Orchard</span>
          <h2 className="tv-title">Your Tree, This Week</h2>
          <p className="tv-sub">Weekly video updates sent directly from our orchardists to every tree owner.</p>
        </div>

        <div className="tv-grid">
          {VIDEOS.map(v => (
            <div
              key={v.id}
              className="tv-card"
              onClick={() => setActive(v)}
              style={{ backgroundImage: `url(https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg)` }}
            >
              <div className="tv-card-overlay" />
              <div className="tv-play">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <div className="tv-date">{v.date}</div>
              <div className="tv-card-info">
                <div className="tv-tree">{v.tree}</div>
                <div className="tv-customer">
                  <span className="tv-name">{v.customer}</span>
                  <span className="tv-loc">{v.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div className="tv-modal-overlay" onClick={() => setActive(null)}>
          <div className="tv-modal" onClick={e => e.stopPropagation()}>
            <button className="tv-modal-close" onClick={() => setActive(null)}>✕</button>
            <div className="tv-embed-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1`}
                title={active.tree}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <div className="tv-modal-info">
              <div className="tv-modal-tree">{active.tree}</div>
              <div className="tv-modal-customer">{active.customer} · {active.location}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
