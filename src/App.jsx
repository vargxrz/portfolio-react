import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Work from './components/Work.jsx';
import Journey from './components/Journey.jsx';
import Stack from './components/Stack.jsx';
import Contact from './components/Contact.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { I18nProvider, useI18n } from './contexts/I18nContext.jsx';
import useSmoothScroll, { scrollToId } from './hooks/useSmoothScroll.js';
import { isTypingTarget } from './lib/keyboard.js';
import './main.css';

const AppContent = () => {
  const { t } = useI18n();
  useSmoothScroll();

  // Number keys 1–4 jump between sections (shown as key hints in the nav).
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      const item = t.nav.find((n) => n.key === e.key);
      if (!item) return;
      e.preventDefault();
      scrollToId(item.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t]);

  // A mouse/touch click leaves the button focused; the next keystroke (the site is
  // meant to be typed on) would then flip it to :focus-visible and look "pressed" —
  // and Space/Enter would re-trigger it. Drop focus after pointer clicks only;
  // keyboard activation (click with detail === 0) keeps focus for Tab users.
  useEffect(() => {
    const onClick = (e) => {
      if (e.detail === 0) return;
      const el = e.target instanceof Element ? e.target.closest('button, a') : null;
      if (el && document.activeElement === el) el.blur();
    };
    // capture phase: runs before React re-renders the button (e.g. the sun/moon icon swap
    // detaches the clicked <svg>, and closest() on a detached node finds nothing)
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">{t.skip}</a>
      <ScrollProgress />
      <Header />
      <main id="main">
        <Hero />
        <Work />
        <Journey />
        <Stack />
      </main>
      <Contact />
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <I18nProvider>
      <MotionConfig reducedMotion="user">
        <AppContent />
      </MotionConfig>
    </I18nProvider>
  </ThemeProvider>
);

export default App;
