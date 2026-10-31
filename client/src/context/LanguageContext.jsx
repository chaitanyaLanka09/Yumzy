import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/dictionary';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('yumzy_lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('yumzy_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  // Translation lookup helper
  const t = (key) => {
    const langDict = translations[language] || translations.en;
    if (langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
