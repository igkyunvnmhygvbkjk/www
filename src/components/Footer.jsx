import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="app-footer">
    <div className="content-wrapper">
      <p>© {new Date().getFullYear()} $MORI COIN. All Rights Reserved.</p>
      <Link to="/terms-of-service">Пользовательское соглашение</Link>
      <p>
        Не получается забрать награду? Напишите в поддержку: <a href="https://t.me/MoriartiSupport" target="_blank" rel="noopener noreferrer">@MoriartiSupport</a>
      </p>
    </div>
  </footer>
);

export default Footer;