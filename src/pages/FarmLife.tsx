import { useEffect, useState, useRef, useCallback } from 'react';
import { apiFetch, API_BASE } from '../lib/api';
import './FarmLife.css';

const PHOTO_MS = 5000;

interface MediaItem  { url: string; type: 'image' | 'video' }
interface Update     { _id: string; caption: string; media: MediaItem[]; createdAt: string }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface WallItem extends MediaItem { caption: string; date: string }

function MediaWall({ updates }: { updates: Update[] }) {
  const [lightbox, setLightbox] = useState<WallItem | null>(null);

  const items: WallItem[] = updates.flatMap(u =>
    u.media.map(m => ({ ...m, caption: u.caption, date: u.createdAt }))
  );

  // Give certain items a "wide" class (span 2 cols) for the varied big-grid look
  // Pattern: positions 0, 4, 9, 14... — feels organic without being perfectly uniform
  const wideSet = new Set<number>();
  let pos = 0;
  const pattern = [4, 5, 4, 5]; // gaps between wide items
  let pi = 0;
  while (pos < items.length) {
    wideSet.add(pos);
    pos += pattern[pi % pattern.length];
    pi++;
  }

  return (
    <>
      <div className="fl-wall">
        {items.map((item, i) => (
          <div
            key={i}
            className={`fl-wall-item${wideSet.has(i) ? ' fl-wall-item--wide' : ''}`}
            onClick={() => item.type === 'image' ? setLightbox(item) : undefined}
          >
            {item.type === 'image'
              ? <img src={item.url} alt={item.caption} className="fl-wall-img" loading="lazy" />
              : <video src={item.url} autoPlay loop muted playsInline controls className="fl-wall-video" />}
            {item.caption && item.type === 'image' && (
              <div className="fl-wall-overlay">
                <p className="fl-wall-caption">{item.caption}</p>
                <span className="fl-wall-date">{formatDate(item.date)}</span>
              </div>
            )}
            {item.type !== 'image' && item.caption && (
              <div className="fl-wall-video-caption">
                <p>{item.caption}</p>
                <span>{formatDate(item.date)}</span>
              </div>
            )}
          </div>
        ))}
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

function FarmHero() {
  const [media, setMedia] = useState<MediaItem[]>(() => {
    try {
      const cached = localStorage.getItem('farm-hero-media');
      const parsed = cached ? JSON.parse(cached) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return [...parsed].reverse();
    } catch {}
    return [];
  });
  const [idx,     setIdx]    = useState(0);
  const timerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef             = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.farmHeroMedia) && d.farmHeroMedia.length > 0) {
          setMedia([...d.farmHeroMedia].reverse());
          localStorage.setItem('farm-hero-media', JSON.stringify(d.farmHeroMedia));
        }
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    if (media.length < 2) return;
    setIdx(i => (i + 1) % media.length);
  }, [media.length]);

  useEffect(() => {
    if (media.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (media[idx]?.type === 'image') timerRef.current = setTimeout(next, PHOTO_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, media, next]);

  useEffect(() => {
    if (media[idx]?.type === 'video' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [idx, media]);

  const current  = media[idx];
  const hasMedia = media.length > 0;

  return (
    <>
      {/* Static background — fades out once admin media is ready */}
      <div className={`fl-hero-bg-static${hasMedia ? ' fl-hero-bg-static--hidden' : ''}`} />

      <div className="fl-hero-slides">
        {media.map((item, i) => (
          <div key={i} className={`fl-hero-slide ${i === idx ? 'fl-hero-slide--active' : ''}`}>
            {item.type === 'image'
              ? <div className="fl-hero-slide-img" style={{ backgroundImage: `url(${item.url})` }} />
              : <video ref={i === idx ? videoRef : undefined} className="fl-hero-slide-video" src={item.url} autoPlay muted playsInline onEnded={next} />}
          </div>
        ))}
      </div>

      <div className="fl-hero-overlay" style={{ background: current?.type === 'video' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.38)' }} />
    </>
  );
}

export default function FarmLife() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Update[]>('/api/public-updates')
      .then(setUpdates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fl">
      <div className="fl-hero">
        <FarmHero />
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

      <div className="fl-updates">
        <div className="fl-updates-header">
          <span className="fl-updates-label">Fresh from the Orchard</span>
          <h2 className="fl-updates-title">What's Happening on the Farm</h2>
          <p className="fl-updates-sub">Real photos and videos from our orchardists — your mangoes growing in real time.</p>
        </div>
        <div className="fl-updates-inner">
          {loading ? (
            <div className="fl-loading"><div className="fl-spinner" /></div>
          ) : updates.length === 0 ? (
            <div className="fl-empty">
              <p>Updates coming soon — we're getting the camera ready. 🌿</p>
            </div>
          ) : (
            <MediaWall updates={updates} />
          )}
        </div>
      </div>
    </div>
  );
}
