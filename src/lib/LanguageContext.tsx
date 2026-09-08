'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Language, CareerTranslations, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof CareerTranslations, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English is strictly the default language for everything
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read saved preference from localStorage, strictly default to 'en'
    const saved = localStorage.getItem('itsp_language') as Language | null;
    const initialLang: Language = saved === 'id' ? 'id' : 'en';
    setLanguageState(initialLang);
    applyLanguage(initialLang);
  }, []);

  const applyLanguage = (lang: Language) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;

      const targetTrans = lang === 'en' ? '/id/en' : '/id/id';
      document.cookie = `googtrans=${targetTrans}; path=/;`;
      document.cookie = `googtrans=${targetTrans}; path=/; domain=${window.location.hostname};`;

      try {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = lang;
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {
        // Silently handled
      }
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('itsp_language', lang);
      applyLanguage(lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'id' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: keyof CareerTranslations, fallback?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: keyof CareerTranslations, fallback?: string) => fallback || key,
    };
  }
  return context;
}
