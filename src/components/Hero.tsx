import './Hero.css';

const BG = 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=1600&q=80';

export default function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${BG})` }}>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-label">Ramnagar, Uttarakhand</p>
        <h1 className="hero-heading">Rent a Tree.</h1>
        <p className="hero-sub">Own the harvest without owning the farm. Get fresh mangoes delivered straight from your tree.</p>
        <div className="hero-actions">
          <button className="hero-btn-primary">Browse Trees</button>
          <button className="hero-btn-ghost">How It Works</button>
        </div>
      </div>
    </section>
  );
}
