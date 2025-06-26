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
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-2">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-3">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-4">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-5">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-6">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-7">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-8">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-9">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
                <div className="small-globe small-globe-10">
                    <img src="/globe.png" alt="Decorative Globe" className="globe-image-small" />
                </div>
            </div>
    
            <div className="hero-content">
              <div className="sticker-container">
                <video src="/sticker.webm" autoPlay loop muted playsInline className="sticker-video" />
              </div>
              <p className="welcome-message">Добро пожаловать!</p>
              <h1>Держишь монету и не продаешь?</h1>
              <p className="info-box">
                <p>Профессор ценит твое отношение, забирай <strong>75.000 $MORI</strong> к себе на кошелек</p>
              </p>
              <button className="claim-button" onClick={() => setIsModalOpen(true)}>
                Забрать
              </button>
            </div>
          </div>
          
          {isModalOpen && <WalletModal onClose={() => setIsModalOpen(false)} />}
        </div>
    </div>
  );
};

export default HomePage;