import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

type NavLink = {
  label: string;
  scrollTo?: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
};

const LINKS: NavLink[] = [
  { label: 'Home', scrollTo: 'root-top' },
  { label: 'How It Works', scrollTo: 'how-it-works' },
  { label: 'Pick Your Tree', scrollTo: 'browse-trees' },
  { label: 'Life on the Farm', href: '/farm-life' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  {
    label: 'Shop',
    href: '/shop',
    dropdown: [
      { label: 'Rent a Tree', href: '/shop#browse-trees' },
      { label: 'Mango Box', href: '/shop#mango-boxes' },
      { label: 'Litchi', href: '/shop#litchi' },
    ],
  },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const shopRef = useRef<HTMLLIElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { count, setOpen: openCart } = useCart();

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleClick = (link: NavLink) => {
    setMenuOpen(false);
    setShopOpen(false);
    if (link.scrollTo === 'root-top') {
      if (location.pathname !== '/') navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    setProfileOpen(false);
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
            <li
              key={link.label}
              ref={link.dropdown ? shopRef : undefined}
              className={link.dropdown ? 'navbar-dropdown-parent' : undefined}
              onMouseEnter={link.dropdown ? () => { if (!menuOpen) setShopOpen(true); } : undefined}
              onMouseLeave={link.dropdown ? () => { if (!menuOpen) setShopOpen(false); } : undefined}
            >
              <a
                href={link.scrollTo ? undefined : link.href}
                onClick={
                  link.scrollTo
                    ? () => handleClick(link)
                    : link.dropdown
                    ? (e) => { e.preventDefault(); setShopOpen(o => !o); }
                    : () => { setMenuOpen(false); setShopOpen(false); }
                }
                style={link.scrollTo || link.dropdown ? { cursor: 'pointer' } : undefined}
                className={link.dropdown ? 'navbar-dropdown-toggle' : undefined}
              >
                {link.label}
                {link.dropdown && <span className="navbar-dropdown-arrow">▾</span>}
              </a>
              {link.dropdown && shopOpen && (
                <ul className="navbar-dropdown">
                  {link.dropdown.map(item => (
                    <li key={item.label}>
                      <a href={item.href} onClick={() => { setShopOpen(false); setMenuOpen(false); }}>{item.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="navbar-auth">
          {user ? (
            <div className="navbar-profile" ref={profileRef}>
              <button className="navbar-profile-btn" onClick={() => setProfileOpen(o => !o)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <span className="navbar-profile-name">{user.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {profileOpen && (
                <div className="navbar-profile-dropdown">
                  <button onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}>Dashboard</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-solid" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>

        <button className="navbar-cart" onClick={() => openCart(true)} aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {count > 0 && <span className="navbar-cart-badge">{count}</span>}
        </button>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
