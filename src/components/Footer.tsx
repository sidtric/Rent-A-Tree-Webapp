import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

type ExploreItem =
  | { label: string; scrollTo: string; href?: never }
  | { label: string; href: string; scrollTo?: never };

const EXPLORE: ExploreItem[] = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', scrollTo: 'how-it-works' },
  { label: 'Browse Trees', scrollTo: 'browse-trees' },
  { label: 'Mango Boxes', scrollTo: 'mango-boxes' },
  { label: 'Life on the Farm', href: '/farm-life' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL = [
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund & Cancellation', href: '/refund' },
  { label: 'Shipping & Delivery', href: '/shipping' },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleExplore(item: ExploreItem) {
    if (item.href) {
      navigate(item.href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: 'smooth' }), 120);
    } else {
      document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function goToBrowseTrees() {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById('browse-trees')?.scrollIntoView({ behavior: 'smooth' }), 120);
    } else {
      document.getElementById('browse-trees')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

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
                  <button onClick={() => handleExplore(item)}>{item.label}</button>
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
            <button className="footer-cta" onClick={goToBrowseTrees}>
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
