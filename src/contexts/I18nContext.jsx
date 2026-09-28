import React, { createContext, useContext, useEffect, useState } from 'react';
import { CONTENT } from '../content';

const I18nContext = createContext({ lang: 'pt', t: CONTENT.pt, toggleLang: () => {} });

export const useI18n = () => useContext(I18nContext);

const readLang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'pt');

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(readLang);
  const t = CONTENT[lang];

  useEffect(() => {
    document.documentElement.setAttribute('lang', t.htmlLang);
    document.title = t.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);
    try {
      localStorage.setItem('lang', lang);
    } catch {
      // storage unavailable — language still applies for this visit
    }
  }, [lang, t]);

  // Clean switch: text fades out, language swaps while invisible, text fades back in.
  const toggleLang = () => {
    const flip = () => setLang((l) => (l === 'pt' ? 'en' : 'pt'));
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('lang-anim')) {
      flip();
      return;
    }
    root.classList.add('lang-anim', 'is-lang-out');
    window.setTimeout(() => {
      flip();
      // wait for React to commit the new copy before fading it in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.remove('is-lang-out');
        window.setTimeout(() => root.classList.remove('lang-anim'), 260);
      }));
    }, 200);
  };

  return <I18nContext.Provider value={{ lang, t, toggleLang }}>{children}</I18nContext.Provider>;
};
