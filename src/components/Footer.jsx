import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="app-footer">
    <div className="content-wrapper">
      <p>© {new Date().getFullYear()} $MORI COIN. All Rights Reserved.</p>
      <Link to="/terms-of-service">Пользовательское соглашение</Link>
    </div>
  </footer>
);

export default Footer;