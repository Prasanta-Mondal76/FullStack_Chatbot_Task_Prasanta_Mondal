import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';
import logo from '../assets/favicon.svg';

const LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Services', href: '#services' },
  { label: 'Courses', href: '#courses' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar" id="top">
      <div className="container nav-inner">
        <a href="#top" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <img src={logo} alt="Drone Logo" width="30" height="20" />
          </span>
          <span className="brand-text">
            DroneTV <em>Assistant</em>
          </span>
        </a>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <Link to="/admin" className="nav-admin" onClick={() => setOpen(false)}>
            Admin
          </Link>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
