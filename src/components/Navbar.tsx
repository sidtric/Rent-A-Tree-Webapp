import { useState } from 'react';
import './Navbar.css';

const LINKS = ['Home', 'How It Works', 'Browse Trees', 'About', 'Contact'];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">YourOrchard</div>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {LINKS.map(link => (
            <li key={link}><a href="#">{link}</a></li>
          ))}
        </ul>

        <div className="navbar-auth">
          <button className="btn-ghost">Login</button>
          <button className="btn-solid">Sign Up</button>
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
