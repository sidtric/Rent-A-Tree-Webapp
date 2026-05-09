import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleClick = (link: NavLink) => {
    setMenuOpen(false);
    if (!link.scrollTo) return;
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollTo(link.scrollTo!), 100);
    } else {
      scrollTo(link.scrollTo);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
          {user ? (
            <>
              <span className="navbar-username">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn-ghost" onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>Dashboard</button>
              <button className="btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-solid" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
