import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, NotebookPen } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext.jsx';
import { canonical, getFound, runEgg } from '../lib/eggs.js';
import './CommandNotebook.css';

const EASE = [0.22, 1, 0.36, 1];

/** Header button + popover listing the easter-egg commands. Clicking one runs it. */
const CommandNotebook = () => {
  const { t } = useI18n();
  const c = t.commands;
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState(getFound);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const openedByKeyboard = useRef(false);
  const panelId = useId();

  useEffect(() => {
    const onFound = () => setFound(getFound());
    window.addEventListener('eggs:found', onFound);
    return () => window.removeEventListener('eggs:found', onFound);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        // return focus only to keyboard users; a mouse user would get a stuck focus ring
        if (openedByKeyboard.current) buttonRef.current?.focus();
      }
    };
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const count = c.list.filter((cmd) => found.has(canonical(cmd.word))).length;

  const run = (word) => {
    setOpen(false);
    runEgg(word);
  };

  return (
    <div className="notebook" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`tool-btn notebook__btn${open ? ' is-open' : ''}`}
        aria-label={c.open}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          openedByKeyboard.current = e.detail === 0;
          setOpen((o) => !o);
        }}
      >
        <NotebookPen size={18} strokeWidth={1.8} />
        {count < c.list.length && <span className="notebook__dot" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="notebook__panel"
            role="dialog"
            aria-label={c.title}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <header className="notebook__head">
              <p className="notebook__title">{c.title}</p>
              <p className="mono notebook__count">{count}/{c.list.length} {c.found}</p>
            </header>
            <p className="notebook__hint">{c.hint}</p>
            <ul className="notebook__list">
              {c.list.map((cmd, i) => {
                const isFound = found.has(canonical(cmd.word));
                return (
                  <motion.li
                    key={cmd.word}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: 0.03 * i, ease: EASE }}
                  >
                    <button type="button" className="notebook__cmd" onClick={() => run(cmd.word)}>
                      <span className="cap cap--sm notebook__word">{cmd.word}</span>
                      <span className="notebook__desc">{cmd.desc}</span>
                      <span className={`notebook__check${isFound ? ' is-found' : ''}`} aria-hidden="true">
                        {isFound && <Check size={14} strokeWidth={2.4} />}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandNotebook;
