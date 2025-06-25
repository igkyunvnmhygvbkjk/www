import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="app-header">
    <div className="content-wrapper">
      <Link to="/" className="logo">$MORI COIN</Link>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/terms-of-service">Terms</Link>
      </nav>
    </div>
  </header>
);

export default Header;