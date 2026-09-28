import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useI18n } from '../contexts/I18nContext.jsx';
import { scrollToId } from '../hooks/useSmoothScroll.js';
import CommandNotebook from './CommandNotebook.jsx';
import LogoMark from './LogoMark.jsx';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // highlight the section currently in view
  useEffect(() => {
    const ids = t.nav.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [t]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap site-header__inner">
        <a href="#top" className="brand" onClick={(e) => go(e, 'top')} aria-label="João Vargas">
          <LogoMark />
        </a>

        <nav className="site-nav" aria-label="Principal">
          <ul>
            {t.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => go(e, item.id)}
                  className={active === item.id ? 'is-active' : undefined}
                  aria-current={active === item.id ? 'true' : undefined}
                  aria-keyshortcuts={item.key}
                >
                  <span className="cap cap--sm" aria-hidden="true">{item.key}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__tools">
          <button type="button" className="tool-btn tool-btn--lang" onClick={toggleLang} aria-label={t.langSwitch}>
            {t.langShort}
          </button>
          <CommandNotebook />
          <button
            type="button"
            className="tool-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
          >
            <ThemeIcon size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="tool-btn menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.close : t.menu}
          >
            {open ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Principal"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="wrap">
              {t.nav.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={(e) => go(e, item.id)}>
                    <span className="mono mobile-nav__index">0{i + 1}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
