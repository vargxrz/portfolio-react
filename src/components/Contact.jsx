import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Github, Instagram, Linkedin, Mail } from 'lucide-react';
import KeyboardCanvas from './KeyboardCanvas.jsx';
import Reveal, { SectionHead } from './Reveal.jsx';
import { useI18n } from '../contexts/I18nContext.jsx';
import { LINKS } from '../content.js';
import { scrollToId } from '../hooks/useSmoothScroll.js';
import './Contact.css';

const ENTER_KEY = [{ legend: 'Enter', match: ['enter'], widthU: 2.25, accent: true }];

const SOCIAL = [
  { label: 'LinkedIn', href: LINKS.linkedin, handle: 'in/vargxrz', Icon: Linkedin },
  { label: 'GitHub', href: LINKS.github, handle: '@vargxrz', Icon: Github },
  { label: 'Instagram', href: LINKS.instagram, handle: '@vargxrz', Icon: Instagram },
];

const Contact = () => {
  const { t } = useI18n();
  const c = t.contact;
  const stageRef = useRef(null);
  const sectionRef = useRef(null);
  const inView = useRef(false);
  const [toast, setToast] = useState(null);
  const [touch, setTouch] = useState(false);
  const [enterDown, setEnterDown] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none)').matches);
    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; }, { threshold: 0.35 });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
      setToast({ ok: true, text: c.copied });
    } catch {
      setToast({ ok: false, text: c.copyFailed });
    }
  };
  const copyRef = useRef(copyEmail);
  copyRef.current = copyEmail;

  // Enter on the page (not on a focused control) presses the 3D key and copies the address.
  useEffect(() => {
    const focusIsNeutral = () => {
      const a = document.activeElement;
      return !a || a === document.body || a === sectionRef.current || a.id === 'main';
    };
    const onDown = (e) => {
      if (e.key !== 'Enter' || e.metaKey || e.ctrlKey || e.altKey || !inView.current || !focusIsNeutral()) return;
      e.preventDefault();
      stageRef.current?.keyDown('enter');
      setEnterDown(true);
      if (!e.repeat) copyRef.current();
    };
    const onUp = (e) => {
      if (e.key !== 'Enter') return;
      stageRef.current?.keyUp('enter');
      setEnterDown(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return (
    <footer id="contato" ref={sectionRef} className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <SectionHead index={c.index} label={c.label} />

        <div className="contact__grid">
          <div className="contact__text">
            <Reveal as="h2" id="contact-title" className="display contact__title">{c.title}</Reveal>
            <Reveal as="p" className="lede contact__lede" delay={0.08}>{c.lede}</Reveal>

            <Reveal className="contact__email" delay={0.12}>
              <p className="eyebrow">{c.emailLabel}</p>
              <a href={`mailto:${LINKS.email}`} className="contact__mail">
                <Mail size={22} strokeWidth={1.6} aria-hidden="true" />
                {LINKS.email}
              </a>
            </Reveal>
          </div>

          <div className="contact__key">
            <KeyboardCanvas
              className="contact__stage"
              keys={ENTER_KEY}
              layout="enter"
              onStage={(s) => { stageRef.current = s; }}
              onActivate={() => copyRef.current()}
              fallback={(
                <button type="button" className="cap cap--accent contact__fallback-key" onClick={() => copyRef.current()}>
                  Enter ↵
                </button>
              )}
            />
            <button
              type="button"
              className="contact__hint"
              onClick={() => { stageRef.current?.tap(0); copyEmail(); }}
            >
              {!touch && <span className={`cap cap--sm cap--accent${enterDown ? ' is-down' : ''}`} aria-hidden="true">Enter</span>}
              <span>{touch ? c.touchHint : c.enterHint}</span>
            </button>
          </div>
        </div>

        <Reveal className="contact__social">
          <p className="eyebrow">{c.elsewhere}</p>
          <ul>
            {SOCIAL.map(({ label, href, handle, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="social">
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                  <span className="social__label">{label}</span>
                  <span className="mono social__handle">{handle}</span>
                  <ArrowUpRight size={18} strokeWidth={1.6} className="social__go" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="colophon">
          <p className="mono">© 2026 João Vargas</p>
          <button type="button" className="colophon__top mono" onClick={() => scrollToId('top')}>
            <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
            {t.footer.top}
          </button>
        </div>
      </div>

      <div className="toast-region" aria-live="polite" role="status">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.text}
              className={`toast${toast.ok ? '' : ' toast--warn'}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
};

export default Contact;
