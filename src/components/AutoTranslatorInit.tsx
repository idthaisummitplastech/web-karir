'use client';

import * as React from 'react';
import { useEffect } from 'react';
import Script from 'next/script';
import { useLanguage } from '@/lib/LanguageContext';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function AutoTranslatorInit() {
  const { language } = useLanguage();

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'id',
            includedLanguages: 'en,id',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  // Sync Google Translate dropdown whenever language changes
  useEffect(() => {
    const syncTranslate = () => {
      try {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select && select.value !== language) {
          select.value = language;
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {
        // Silently handled
      }
    };

    const t1 = setTimeout(syncTranslate, 300);
    const t2 = setTimeout(syncTranslate, 800);
    const t3 = setTimeout(syncTranslate, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [language]);

  return (
    <>
      {/* Hidden translator hook container */}
      <div
        id="google_translate_element"
        style={{ display: 'none' }}
        className="notranslate"
        translate="no"
      />

      {/* Global CSS to suppress Google Translate banner, top bars, tooltips & styling clashes */}
      <style jsx global>{`
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        iframe.goog-te-banner-frame,
        .VIpgJd-ZVi9od-OR9QNe-Oxf9uv,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO,
        .VIpgJd-ZVi9od-SmfZ-Ouevl,
        body > .skiptranslate:first-child,
        #goog-gt-tt,
        .goog-te-balloon-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          max-height: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Load Google Translate Script asynchronously */}
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
