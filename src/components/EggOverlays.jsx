import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './EggOverlays.css';

const EASE = [0.22, 1, 0.36, 1];

/**
 * "teste": JUnit-style runner. `run` = { className, tests: [{ name, ms, status }], done, summary }.
 * Portalled to <body> so the upside-down egg (which rotates sections) never traps it.
 */
export const TestRunner = ({ run }) => createPortal(
  <AnimatePresence>
    {run && (
      <motion.div
        className="test-runner mono"
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <p className="test-runner__head">
          <span className="test-runner__run" aria-hidden="true">▶</span>
          {run.className}
        </p>
        <ol className="test-runner__list">
          {run.tests.map((test) => (
            <motion.li
              key={test.name}
              className={`is-${test.status}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: test.status === 'queued' ? 0.4 : 1, x: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <span className="test-runner__icon" aria-hidden="true">
                {test.status === 'passed' ? '✓' : test.status === 'running' ? '●' : '○'}
              </span>
              <span className="test-runner__name">{test.name}()</span>
              {test.status === 'passed' && <span className="test-runner__ms">{test.ms} ms</span>}
            </motion.li>
          ))}
        </ol>
        <AnimatePresence>
          {run.done && (
            <motion.p
              className="test-runner__summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <span>{run.summary}</span>
              <strong>BUILD SUCCESS</strong>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    )}
  </AnimatePresence>,
  document.body,
);

/** "poker": the winning photo as a polaroid dropped onto the page. Click or Esc closes it. */
export const Polaroid = ({ open, src, alt, caption, onClose }) => createPortal(
  <AnimatePresence>
    {open && (
      <motion.figure
        className="polaroid"
        role="dialog"
        aria-label={alt}
        onClick={onClose}
        initial={{ opacity: 0, y: 320, rotate: 14 }}
        animate={{ opacity: 1, y: 0, rotate: -5 }}
        exit={{ opacity: 0, y: 40, rotate: 12, transition: { duration: 0.35, ease: EASE } }}
        transition={{ type: 'spring', stiffness: 140, damping: 16, mass: 0.9 }}
      >
        <span className="polaroid__tape" aria-hidden="true" />
        <img src={src} alt={alt} width="900" height="1150" />
        <figcaption>{caption}</figcaption>
      </motion.figure>
    )}
  </AnimatePresence>,
  document.body,
);

/** "curbas": a full-screen shout set in the hero's display type. */
export const Shout = ({ text }) => {
  const words = text ? text.replace(/\.$/, '').split(' ') : [];
  return createPortal(
    <AnimatePresence>
      {text && (
        <motion.div
          className="shout"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE } }}
          transition={{ duration: 0.3 }}
        >
          <p className="shout__text display">
            {words.map((word, wi) => (
              <span key={wi} className="shout__line">
                {word.split('').map((ch, ci) => (
                  <motion.span
                    key={ci}
                    className="shout__char"
                    initial={{ y: '110%', rotate: 6 }}
                    animate={{ y: '0%', rotate: 0 }}
                    transition={{ duration: 0.7, delay: 0.12 + wi * 0.18 + ci * 0.035, ease: EASE }}
                  >
                    {ch}
                  </motion.span>
                ))}
                {wi === words.length - 1 && (
                  <motion.span
                    className="shout__dot"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.25 + wi * 0.18 + word.length * 0.035, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    .
                  </motion.span>
                )}
              </span>
            ))}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
