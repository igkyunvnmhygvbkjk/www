import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'; // Удален импорт провайдера reCAPTCHA v3
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TermsOfService from './pages/TermsOfService';
import './App.css';

function App() {
  // Для reCAPTCHA v2 "Я не робот" провайдер не нужен на уровне App.jsx
  // Ключ сайта будет использоваться непосредственно в WalletModal.jsx

  return (
    // <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}> // Удален провайдер reCAPTCHA v3
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </main>
        <Footer />
      </div>
    // </GoogleReCaptchaProvider> // Удален провайдер reCAPTCHA v3
  );
}

export default App;