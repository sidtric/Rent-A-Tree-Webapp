import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import './LifeOnFarmPreview.css';

const PHOTO_MS = 4500;
const MAX_ITEMS = 12;

interface MediaItem  { url: string; type: 'image' | 'video' }
interface Update     { _id: string; caption: string; media: MediaItem[]; createdAt: string }
interface SlideItem extends MediaItem { caption: string; date: string }

const FALLBACK_SLIDES: SlideItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=1400&q=80',
    type: 'image',
    caption: 'Mango blossoms in full bloom across the orchard',
    date: new Date().toISOString(),
  },
  {
    url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=1400&q=80',
    type: 'image',
    caption: 'Chausa mangoes ripening on the tree',
    date: new Date().toISOString(),
  },
  {
    url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1400&q=80',
    type: 'image',
    caption: 'Morning at our Ramnagar farm',
    date: new Date().toISOString(),
  },
];

export default function LifeOnFarmPreview() {
  const navigate                  = useNavigate();
  const [slides, setSlides]       = useState<SlideItem[]>([]);
  const [idx, setIdx]             = useState(0);
  const [loaded, setLoaded]       = useState(false);
  const [progress, setProgress]   = useState(0);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef                  = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    apiFetch<Update[]>('/api/public-updates')
      .then(updates => {
        const flat: SlideItem[] = updates
          .flatMap(u => u.media.map(m => ({ ...m, caption: u.caption, date: u.createdAt })))
          .slice(0, MAX_ITEMS);
        setSlides(flat.length > 0 ? flat : FALLBACK_SLIDES);
      })
      .catch(() => setSlides(FALLBACK_SLIDES))
      .finally(() => setLoaded(true));
  }, []);

  const next = useCallback(() => {
    setIdx(i => slides.length > 0 ? (i + 1) % slides.length : 0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    if (slides[idx]?.type === 'image') {
      const start = Date.now();
      progressRef.current = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - start) / PHOTO_MS) * 100);
        setProgress(pct);
      }, 80);
      timerRef.current = setTimeout(next, PHOTO_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [idx, slides, next]);

  useEffect(() => {
    if (slides[idx]?.type === 'video' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [idx, slides]);

  if (!loaded) return null;

  const current = slides[idx];

  return (
    <section className="lofp" id="life-on-farm-preview">
      <div className="lofp-inner">
        <div className="lofp-header">
          <span className="lofp-label">Live from Ramnagar</span>
          <h2 className="lofp-title">Life on the Farm</h2>
          <p className="lofp-sub">Watch your mangoes grow — real photos and videos from our orchardists.</p>
        </div>

        <div className="lofp-deck">
          {slides.map((item, i) => {
            const n = slides.length;
            // shortest signed offset around the ring: -n/2..+n/2
            let off = i - idx;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            let pos: 'prev' | 'active' | 'next' | 'hidden';
            if (off === 0) pos = 'active';
            else if (off === -1) pos = 'prev';
            else if (off === 1) pos = 'next';
            else pos = 'hidden';
            return (
              <div
                key={i}
                className={`lofp-card lofp-card--${pos}`}
                onClick={() => { if (pos !== 'active') setIdx(i); }}
                aria-hidden={pos !== 'active'}
              >
                {item.type === 'image'
                  ? <div className="lofp-card-img" style={{ backgroundImage: `url(${item.url})` }} />
                  : <video
                      ref={pos === 'active' ? videoRef : undefined}
                      className="lofp-card-video"
                      src={item.url}
                      muted
                      playsInline
                      preload={pos === 'active' ? 'auto' : 'metadata'}
                      onEnded={pos === 'active' ? next : undefined}
                    />}

                {pos === 'active' && (
                  <>
                    <div className="lofp-progress">
                      <div className="lofp-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="lofp-counter">
                      {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                    </div>
                    <div className="lofp-caption">
                      <p className="lofp-caption-text">{current.caption || 'From our orchard'}</p>
                    </div>
                    <div className="lofp-controls">
                      {slides.map((_, j) => (
                        <button
                          key={j}
                          className={`lofp-dot${j === idx ? ' lofp-dot--active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setIdx(j); }}
                          aria-label={`Slide ${j + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="lofp-cta-row">
          <button className="lofp-cta" onClick={() => { navigate('/farm-life'); window.scrollTo({ top: 0 }); }}>
            See full farm wall →
          </button>
        </div>
      </div>
    </section>
  );
}
