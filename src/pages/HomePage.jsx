import React, { useState } from 'react';
import WalletModal from '../components/WalletModal';
import './HomePage.css';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="content-wrapper">
        <div className="homepage-container">
          <div className="hero-section">
    
            <div className="decorative-globes">
                <div className="small-globe small-globe-1">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image" />
                </div>
                <div className="small-globe small-globe-2">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image" />
                </div>
                <div className="small-globe small-globe-3">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image" />
                </div>
                <div className="small-globe small-globe-4">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image" />
                </div>
                 <div className="small-globe small-globe-5">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image" />
                </div>
                 <div className="small-globe small-globe-6">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image" />
                </div>
            </div>
    
            <div className="hero-content">
              <div className="globe-container">
                <img src="/globe.png" alt="Crypto Wallets Globe" className="globe-image" />
              </div>
    
              <h1>$MORI COIN 🚀</h1>
              <p className="subtitle">
                Добрый день, господа.<br />
                Начинаем творить историю.
              </p>
              <div className="info-box">
                <p>Получите до <strong>50.000 $MORI COIN</strong> на свой кошелек в день листинга (25.06)</p>
              </div>
              <button className="claim-button" onClick={() => setIsModalOpen(true)}>
                Получить $MORI COIN
              </button>
              <p className="forum-link">
                Наш форум: <a href="https://t.me/moriforum" target="_blank" rel="noopener noreferrer">@moriforum</a>
              </p>
            </div>
          </div>
          
          {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} />}
        </div>
    </div>
  );
};

export default HomePage;