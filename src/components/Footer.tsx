import './Footer.css';

const EXPLORE = [
  { label: 'Home', href: '#' },
  { label: 'How It Works', scrollTo: 'how-it-works' },
  { label: 'Browse Trees', scrollTo: 'browse-trees' },
  { label: 'Mango Boxes', scrollTo: 'mango-boxes' },
  { label: 'About Us', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#' },
];

const LEGAL = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund & Cancellation', href: '/refund' },
  { label: 'Shipping & Delivery', href: '/shipping' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">

          <div className="footer-brand">
            <div className="footer-logo">YourOrchard</div>
            <p className="footer-desc">
              Fresh produce from our Ramnagar orchard to your door. Rent a tree for the season — simple, transparent, real.
            </p>
            <div className="footer-contact-block">
              <a href="mailto:support.YourOrchard@gmail.com" className="footer-contact-line">support.YourOrchard@gmail.com</a>
              <a href="tel:+917535850398" className="footer-contact-line">+91 75358 50398</a>
              <span className="footer-contact-line muted">Ramnagar, Uttarakhand — 244715</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-links">
              {EXPLORE.map(item => (
                <li key={item.label}>
                  {item.scrollTo ? (
                    <button onClick={() => scrollTo(item.scrollTo!)}>{item.label}</button>
                  ) : (
                    <a href={item.href}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-links">
              {LEGAL.map(item => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Season 2026</h4>
            <p className="footer-season-text">
              Harvest window: May 15 – July 31. Tree rentals are now open. Book early — slots are limited.
            </p>
            <button className="footer-cta" onClick={() => scrollTo('browse-trees')}>
              Rent a Tree
            </button>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 YourOrchard. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/refund">Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
