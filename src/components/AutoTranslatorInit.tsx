'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function AutoTranslatorInit() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const isTestPage = pathname?.startsWith('/portal/test');

  useEffect(() => {
    // If on test pages, prevent translation injection and ensure default id language
    if (isTestPage) {
      try {
        document.cookie = 'googtrans=/id/id; path=/;';
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select && select.value !== 'id') {
          select.value = 'id';
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {}
      return;
    }

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

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [isTestPage]);

  // Sync Google Translate dropdown whenever language changes
  useEffect(() => {
    if (isTestPage) {
      try {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select && select.value !== 'id') {
          select.value = 'id';
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {}
      return;
    }

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
  }, [language, isTestPage]);

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
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
            .notranslate, [translate="no"], .itsp-idcard-card, #itsp-idcard-printable-container {
              -webkit-translate: no !important;
              translate: no !important;
            }
          `,
        }}
      />
    </>
  );
}
