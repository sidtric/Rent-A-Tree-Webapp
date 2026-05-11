import './Hero.css';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  return (
    <section className="hero">
      <picture className="hero-bg-picture">
        <source srcSet="/hero-bg-mobile.jpg?v=3" media="(max-width: 768px)" />
        <img src="/hero-bg.jpg?v=3" alt="" className="hero-bg-img" />
      </picture>
      <div className="hero-overlay" />
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
