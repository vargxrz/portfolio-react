import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Check } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext.jsx';
import { canonical } from '../lib/eggs.js';
import './CommandSheet.css';

const EASE = [0.22, 1, 0.36, 1];

/**
 * Phones: the easter-egg commands as a bottom sheet, so nobody has to type them.
 * Drag it down by the handle/header, tap the backdrop or press Esc to close it.
 * Only the grab area drags: the list keeps native touch scrolling.
 */
const CommandSheet = ({ open, found, onClose, onPick }) => {
  const { t } = useI18n();
  const c = t.commands;
  const h = t.hero;
  const count = c.list.filter((cmd) => found.has(canonical(cmd.word))).length;
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="cmd-sheet__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            key="sheet"
            className="cmd-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={c.title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.28, ease: EASE } }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 500) onClose(); }}
          >
            <div className="cmd-sheet__grab" onPointerDown={(e) => drag.start(e)}>
              <span className="cmd-sheet__handle" aria-hidden="true" />
              <header className="cmd-sheet__head">
                <div>
                  <p className="cmd-sheet__title">{h.cmdTitle}</p>
                  <p className="cmd-sheet__hint">{h.cmdHint}</p>
                </div>
                <p className="mono cmd-sheet__count">
                  <span className="cmd-sheet__num"><strong>{count}</strong>/{c.list.length}</span>
                  <span>{c.found}</span>
                </p>
              </header>
            </div>
            <div className="cmd-sheet__body">
              <ul className="cmd-sheet__grid">
                {c.list.map((cmd, i) => {
                  const isFound = found.has(canonical(cmd.word));
                  return (
                    <motion.li
                      key={cmd.word}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.06 + i * 0.025, ease: EASE }}
                    >
                      <button
                        type="button"
                        className={`cmd-card${isFound ? ' is-found' : ''}`}
                        onClick={() => onPick(cmd.word)}
                      >
                        <span className="cap cmd-card__word">{cmd.word}</span>
                        {isFound && (
                          <span className="cmd-card__check" aria-label={c.found}>
                            <Check size={12} strokeWidth={2.8} />
                          </span>
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CommandSheet;
