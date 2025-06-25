import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TermsOfService from './pages/TermsOfService';
import './App.css';

function App() {
  // ВАЖНО: Убедитесь, что здесь указан ваш Ключ сайта (Site Key) от Google
  const RECAPTCHA_SITE_KEY = "6LewUW0rAAAAABFwcZ31QIBuH-eU1aRmZpzcRhjb";

  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
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
    </GoogleReCaptchaProvider>
  );
}

export default App;