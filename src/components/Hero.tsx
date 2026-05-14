import { useState, useEffect, useRef, useCallback } from 'react';
import './Hero.css';

const API_BASE    = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';
const PHOTO_MS    = 5000;

interface HeroMedia { url: string; type: 'image' | 'video' }

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  const [media,   setMedia]   = useState<HeroMedia[]>([]);
  const [idx,     setIdx]     = useState(0);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef              = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.heroMedia) && d.heroMedia.length > 0) setMedia(d.heroMedia); })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    if (media.length < 2) return;
    setIdx(i => (i + 1) % media.length);
  }, [media.length]);

  // When idx changes and the current item is a photo, start a timer
  useEffect(() => {
    if (media.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (media[idx]?.type === 'image') {
      timerRef.current = setTimeout(next, PHOTO_MS);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, media, next]);

  // When idx changes and it's a video, play it (handles src swap)
  useEffect(() => {
    if (media[idx]?.type === 'video' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [idx, media]);

  const current = media[idx];
  const hasMedia = media.length > 0;

  return (
    <section className="hero">

      {/* Static fallback */}
      {!hasMedia && <div className="hero-bg-picture" />}

      {/* Media slideshow */}
      {hasMedia && (
        <div className="hero-bg-slides">
          {media.map((item, i) => (
            <div key={i} className={`hero-slide ${i === idx ? 'hero-slide--active' : ''}`}>
              {item.type === 'image' ? (
                <div className="hero-slide-img" style={{ backgroundImage: `url(${item.url})` }} />
              ) : (
                <video
                  ref={i === idx ? videoRef : undefined}
                  className="hero-slide-video"
                  src={item.url}
                  autoPlay
                  muted
                  playsInline
                  onEnded={next}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Overlay only on photos / no media */}
      {(!hasMedia || current?.type === 'image') && <div className="hero-overlay" />}

      <div className="hero-content">
        <p className="hero-label">Ramnagar, Uttarakhand</p>
        <h1 className="hero-heading">Rent a Tree.</h1>
        <p className="hero-sub">Own the harvest without owning the farm. Get fresh mangoes delivered straight from your tree.</p>
        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={() => scrollTo('browse-trees')}>Browse Trees</button>
          <button className="hero-btn-ghost" onClick={() => scrollTo('how-it-works')}>How It Works</button>
        </div>
      </div>
    </section>
  );
}
