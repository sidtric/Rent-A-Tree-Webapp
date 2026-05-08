import { useEffect, useState } from 'react';
import './Hero.css';

const SLIDES = [
  'https://images.unsplash.com/photo-1553279768-865429fa0078?w=1600&q=80',
  'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=1600&q=80',
  'https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=1600&q=80',
  'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=1600&q=80',
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <div className="hero-slides">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`hero-slide ${i === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <p className="hero-label">Ramnagar, Uttarakhand</p>
        <h1 className="hero-heading">Rent a Tree.</h1>
        <p className="hero-sub">Own the harvest without owning the farm. Get fresh mangoes delivered straight from your tree.</p>
        <div className="hero-actions">
          <button className="hero-btn-primary">Browse Trees</button>
          <button className="hero-btn-ghost">How It Works</button>
        </div>
      </div>

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </section>
  );
}
