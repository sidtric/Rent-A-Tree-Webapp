import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

type NavLink = {
  label: string;
  scrollTo?: string;
  href?: string;
};

const LINKS: NavLink[] = [
  { label: 'Home', scrollTo: 'root-top' },
  { label: 'How It Works', scrollTo: 'how-it-works' },
  { label: 'Browse Trees', scrollTo: 'browse-trees' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (link: NavLink) => {
    if (link.scrollTo) scrollTo(link.scrollTo);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <img
          src="/logo.jpeg"
          alt="YourOrchard"
          className="navbar-logo"
          onClick={() => navigate('/')}
        />

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {LINKS.map(link => (
            <li key={link.label}>
              <a
                href={link.scrollTo ? undefined : link.href}
                onClick={link.scrollTo ? () => handleClick(link) : undefined}
                style={link.scrollTo ? { cursor: 'pointer' } : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-auth">
          <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-solid" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
