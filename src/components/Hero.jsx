import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowRight, Command, Download, RotateCcw } from 'lucide-react';
import KeyboardCanvas from './KeyboardCanvas.jsx';
import CommandSheet from './CommandSheet.jsx';
import { Polaroids, Shout, TestRunner } from './EggOverlays.jsx';
import useBootReady from '../hooks/useBootReady.js';
import { canonical, getFound, markFound } from '../lib/eggs.js';
import { useI18n } from '../contexts/I18nContext.jsx';
import { LINKS } from '../content.js';
import { scrollToId } from '../hooks/useSmoothScroll.js';
import { isTypingTarget, letterOf } from '../lib/keyboard.js';
import { exhaust, glitch, gravity, hearts, keycapRain } from '../lib/effects.js';
import './Hero.css';

// Longest first so a long word never loses to a shorter suffix.
// ("test" is deliberately absent: it is a prefix of "teste" and would fire twice)
const EGG_WORDS = ['gravidade', 'segredo', 'gravity', 'vargas', 'sagrav', 'secret', 'deploy', 'curbas', 'poker', 'renan', 'teste', 'junit', 'joao', 'ana', 'rgb'];

const POKER_PHOTO = '/assets/eggs/poker.webp';
const RIO_PHOTOS = ['/assets/eggs/renan.jpg', '/assets/eggs/arpoador.jpg'];

const SCRAMBLE = '!<>-_\\/[]{}—=+*^?#01';

/** Text that decodes itself from noise, left to right ("segredo"). */
const ScrambleText = ({ text }) => {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOut(text); return undefined; }
    let frame = 0;
    const total = 42;
    const id = window.setInterval(() => {
      frame += 1;
      const solved = Math.floor((frame / total) * text.length);
      setOut(text.split('').map((c, i) => (i < solved || c === ' ' ? c : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)])).join(''));
      if (frame >= total) window.clearInterval(id);
    }, 32);
    return () => window.clearInterval(id);
  }, [text]);
  return <span aria-label={text}><span aria-hidden="true">{out}</span></span>;
};

const RAIN_LABELS = [
  'Java', 'Spring Boot', 'React', 'Flutter', 'TDD', 'Figma', 'PostgreSQL', 'Docker',
  'AWS Bedrock', 'Amazon S3', 'JUnit', 'Playwright', 'Twilio', '2–3 min', 'Gaspar, SC', 'Git',
];

const NAME_KEYS = [
  { legend: 'V', match: ['v'], accent: true },
  { legend: 'A', match: ['a'] },
  { legend: 'R', match: ['r'] },
  { legend: 'G', match: ['g'] },
  { legend: 'A', match: ['a'] },
  { legend: 'S', match: ['s'] },
];

const EASE = [0.22, 1, 0.36, 1];

// entrance waits for the boot loader, so it plays in front of the visitor, not behind the curtain
const rise = (delay, booted) => ({
  initial: { opacity: 0, y: 24 },
  animate: booted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
  transition: { duration: 0.9, delay, ease: EASE },
});

const Hero = () => {
  const { t } = useI18n();
  const booted = useBootReady();
  const h = t.hero;
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const inView = useRef(true);
  // typed characters, each with a stable id so deletions animate out one by one
  const [chars, setChars] = useState([]);
  const charId = useRef(0);
  const [down, setDown] = useState(() => new Set());
  const [egg, setEgg] = useState(null);
  const [touch, setTouch] = useState(false);

  // "sagrav": every section flips; layers are promoted only while the flip animates
  const [flipped, setFlipped] = useState(false);
  const flipTimer = useRef(0);
  const setFlip = (on) => {
    const root = document.documentElement;
    root.classList.add('is-flipping');
    root.classList.toggle('is-flipped', on);
    setFlipped(on);
    window.clearTimeout(flipTimer.current);
    flipTimer.current = window.setTimeout(() => root.classList.remove('is-flipping'), 1200);
  };
  useEffect(() => () => window.clearTimeout(flipTimer.current), []);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // scroll-out: tilt the keyboard away as the hero leaves
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  // (skipped on touch: a WebGL frame can't stay locked to a finger-driven scroll, it visibly lags)
  const coarse = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  useMotionValueEvent(scrollYProgress, 'change', (p) => { if (!coarse.current) stageRef.current?.setScrollProgress(p); });

  useEffect(() => {
    const el = sectionRef.current;
    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; }, { threshold: 0.25 });
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  // typed text → easter eggs (side effects live here, never inside a state updater)
  const bufferRef = useRef('');
  const rgbRef = useRef(false);
  const [rgb, setRgb] = useState(false);
  const restoreGravity = useRef(null);
  const [pipeline, setPipeline] = useState(-1);
  const deployTimers = useRef([]);

  // "deploy": build → tests → deploy checklist, then the caps lift off
  const runDeploy = () => {
    deployTimers.current.forEach(window.clearTimeout);
    const at = (ms, fn) => deployTimers.current.push(window.setTimeout(fn, ms));
    setPipeline(0);
    at(450, () => setPipeline(1));
    at(900, () => setPipeline(2));
    at(1350, () => {
      setPipeline(3);
      const stage = stageRef.current;
      if (!stage) return;
      stage.launch();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) exhaust(() => stage.keyScreenPoints());
    });
    at(4200, () => setPipeline(-1));
  };
  useEffect(() => () => deployTimers.current.forEach(window.clearTimeout), []);

  // "poker" / "renan": the caps flip to a new skin and photos drop in as polaroids
  const [photos, setPhotos] = useState(null);
  const skinRef = useRef(null);
  const photosTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(photosTimer.current), []);
  useEffect(() => {
    if (!photos) return undefined;
    const onKey = (e) => e.key === 'Escape' && setPhotos(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photos]);
  // toggles a cap skin; returns true when it was switched on
  const toggleSkin = (skin, prints) => {
    const on = skinRef.current !== skin;
    skinRef.current = on ? skin : null;
    stageRef.current?.setSkin(skinRef.current);
    window.clearTimeout(photosTimer.current);
    setPhotos(null);
    if (!on) return false;
    // preload so no polaroid ever drops in empty
    Promise.allSettled(prints.map((p) => {
      const img = new Image();
      img.src = p.src;
      return img.decode();
    })).then(() => {
      if (skinRef.current !== skin) return;
      setPhotos(prints);
      photosTimer.current = window.setTimeout(() => setPhotos(null), 8000);
    });
    return true;
  };

  // "curbas": full-screen shout
  const [shout, setShout] = useState(null);
  const shoutTimers = useRef([]);

  // "teste": a JUnit run where every key is a test case — press, pass, glow green
  const [testRun, setTestRun] = useState(null);
  const testTimers = useRef([]);
  const runTests = () => {
    testTimers.current.forEach(window.clearTimeout);
    const at = (ms, fn) => testTimers.current.push(window.setTimeout(fn, ms));
    const pt = t.htmlLang !== 'en';
    const tests = NAME_KEYS.map((k, i) => ({
      name: pt ? `tecla${k.legend}_deveAfundarEVoltar_${i + 1}` : `key${k.legend}_shouldPressAndReturn_${i + 1}`,
      ms: 3 + Math.floor(Math.random() * 14),
      status: 'queued',
    }));
    const setStatus = (i, status) => setTestRun((r) => r && {
      ...r, tests: r.tests.map((x, xi) => (xi === i ? { ...x, status } : x)),
    });
    setTestRun({ className: pt ? 'TecladoVargasTest' : 'VargasKeyboardTest', tests, done: false, summary: '' });
    const STEP = 380;
    tests.forEach((_, i) => {
      at(350 + i * STEP, () => {
        setStatus(i, 'running');
        stageRef.current?.tap(i);
      });
      at(350 + i * STEP + 220, () => {
        setStatus(i, 'passed');
        stageRef.current?.flash(i);
      });
    });
    const end = 350 + tests.length * STEP + 150;
    at(end, () => {
      const total = tests.reduce((s, x) => s + x.ms, 0);
      setTestRun((r) => r && { ...r, done: true, summary: `Tests run: ${tests.length}, Failures: 0 · ${total} ms` });
      stageRef.current?.wave();
      setEgg('teste');
    });
    at(end + 3200, () => setTestRun(null));
  };
  useEffect(() => () => {
    testTimers.current.forEach(window.clearTimeout);
    shoutTimers.current.forEach(window.clearTimeout);
  }, []);

  // "rgb": accent elements cycle hue via a CSS animation (compositor-friendly, no per-frame JS)
  useEffect(() => {
    const root = document.documentElement;
    // negative delay puts the CSS cycle in phase with performance.now(), which the 3D caps use
    root.style.animationDelay = rgb ? `-${(performance.now() % 6000) / 1000}s` : '';
    root.classList.toggle('is-rgb', rgb);
    return () => root.classList.remove('is-rgb');
  }, [rgb]);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const typeLetter = (letter) => {
    const next = (bufferRef.current + letter).slice(-14);
    bufferRef.current = next;
    const id = charId.current++;
    setChars((prev) => [...prev, { id, ch: letter }].slice(-14));
    const word = EGG_WORDS.find((w) => next.endsWith(w));
    if (!word) return;
    markFound(word);
    const stage = stageRef.current;
    switch (word) {
      case 'vargas':
        stage?.wave();
        setEgg('vargas');
        break;
      case 'segredo':
      case 'secret':
        if (!reduced()) {
          glitch();
          stage?.explode();
        }
        setEgg('segredo');
        break;
      case 'rgb': {
        rgbRef.current = !rgbRef.current;
        stage?.setRgb(rgbRef.current);
        setRgb(rgbRef.current);
        setEgg(rgbRef.current ? 'rgbOn' : 'rgbOff');
        break;
      }
      case 'gravidade':
      case 'gravity':
        if (restoreGravity.current) {
          restoreGravity.current();
          restoreGravity.current = null;
          setEgg('gravityOff');
        } else {
          setEgg('gravityOn');
          // let the message render first so it falls too
          window.setTimeout(() => {
            restoreGravity.current = reduced() ? () => {} : gravity();
            // phones have no Esc: the next tap anywhere tidies up
            if (touch) {
              const onTap = () => {
                if (!restoreGravity.current) return;
                restoreGravity.current();
                restoreGravity.current = null;
                setEgg('gravityOff');
              };
              window.setTimeout(() => window.addEventListener('pointerdown', onTap, { once: true }), 400);
            }
          }, 60);
        }
        break;
      case 'deploy':
        runDeploy();
        setEgg('deploy');
        break;
      case 'teste':
      case 'junit':
        runTests();
        setEgg('testeRunning');
        break;
      case 'poker': {
        const on = toggleSkin('poker', [{ src: POKER_PHOTO, alt: h.eggs.pokerAlt, caption: h.eggs.pokerCaption }]);
        setEgg(on ? 'poker' : 'pokerOff');
        break;
      }
      case 'renan': {
        const on = toggleSkin('rio', RIO_PHOTOS.map((src, i) => ({
          src, alt: h.eggs.renanAlts[i], caption: h.eggs.renanCaptions[i], width: 900, height: 1200,
        })));
        if (on) stage?.wave();
        setEgg(on ? 'renan' : 'renanOff');
        break;
      }
      case 'curbas':
        shoutTimers.current.forEach(window.clearTimeout);
        setShout(null);
        shoutTimers.current = [
          window.setTimeout(() => setShout('meu amigãozão.'), 30),
          window.setTimeout(() => setShout(null), 3200),
        ];
        stage?.wave();
        setEgg('curbas');
        break;
      case 'ana':
        if (!reduced()) hearts();
        setEgg('ana');
        break;
      case 'sagrav': {
        const on = !document.documentElement.classList.contains('is-flipped');
        setFlip(on);
        setEgg(on ? 'sagravOn' : 'sagravOff');
        break;
      }
      case 'joao':
        stage?.wave();
        if (!reduced()) keycapRain(RAIN_LABELS);
        setEgg('joao');
        break;
      default:
    }
  };
  const typeRef = useRef(typeLetter);
  typeRef.current = typeLetter;

  // ---- phones: pick a command from a sheet instead of typing it ------------------------
  const [cmdOpen, setCmdOpen] = useState(false);
  const closeCommands = useCallback(() => setCmdOpen(false), []);
  const [found, setFound] = useState(getFound);
  useEffect(() => {
    const onFound = () => setFound(getFound());
    window.addEventListener('eggs:found', onFound);
    return () => window.removeEventListener('eggs:found', onFound);
  }, []);

  // "types" a command on the 3D keys, letter by letter
  const typeTimers = useRef([]);
  const typeWord = (word) => {
    typeTimers.current.forEach(window.clearTimeout);
    typeTimers.current = [];
    bufferRef.current = '';
    setChars([]);
    setEgg(null);
    [...word].forEach((ch, i) => {
      typeTimers.current.push(window.setTimeout(() => {
        stageRef.current?.keyDown(ch);
        typeRef.current(ch);
      }, i * 110));
      typeTimers.current.push(window.setTimeout(() => stageRef.current?.keyUp(ch), i * 110 + 80));
    });
  };
  useEffect(() => () => typeTimers.current.forEach(window.clearTimeout), []);

  const pickCommand = (word) => {
    setCmdOpen(false);
    // once the sheet is away, bring the keys into view and type on them
    typeTimers.current.push(window.setTimeout(() => {
      const stage = sectionRef.current?.querySelector('.hero__stage');
      const top = stage?.getBoundingClientRect().top ?? 0;
      if (top < 64) window.scrollBy({ top: top - 80, behavior: reduced() ? 'auto' : 'smooth' });
      typeTimers.current.push(window.setTimeout(() => typeWord(word), top < 64 ? 350 : 0));
    }, 260));
  };

  // Commands clicked in the header notebook are "typed" for the visitor, key by key.
  const typeWordRef = useRef(typeWord);
  typeWordRef.current = typeWord;
  useEffect(() => {
    let wait = 0;
    const onRun = (e) => {
      const word = String(e.detail || '');
      window.clearTimeout(wait);
      if (window.scrollY > 40) {
        scrollToId('top');
        wait = window.setTimeout(() => typeWordRef.current(word), 900);
      } else typeWordRef.current(word);
    };
    window.addEventListener('egg:run', onRun);
    return () => {
      window.removeEventListener('egg:run', onRun);
      window.clearTimeout(wait);
    };
  }, []);

  const backspace = () => {
    const next = bufferRef.current.slice(0, -1);
    bufferRef.current = next;
    setChars((prev) => prev.slice(0, -1));
    if (!next) setEgg(null);
  };

  // Esc always undoes the eggs that change the page (upside down, gravity)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (document.documentElement.classList.contains('is-flipped')) {
        setFlip(false);
        setEgg('sagravOff');
      }
      if (restoreGravity.current) {
        restoreGravity.current();
        restoreGravity.current = null;
        setEgg('gravityOff');
      }
      if (skinRef.current) {
        setEgg(skinRef.current === 'rio' ? 'renanOff' : 'pokerOff');
        skinRef.current = null;
        stageRef.current?.setSkin(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-flipped', 'is-flipping');
    };
  }, []);

  // physical keyboard → 3D keys
  useEffect(() => {
    const onDown = (e) => {
      if (!inView.current || isTypingTarget(e.target)) return;
      if (e.key === 'Backspace' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        backspace();
        return;
      }
      const letter = letterOf(e);
      if (!letter) return;
      stageRef.current?.keyDown(letter);
      setDown((prev) => new Set(prev).add(letter));
      if (e.repeat) return;
      typeRef.current(letter);
    };
    const onUp = (e) => {
      const letter = letterOf(e) ?? e.key?.toLowerCase();
      stageRef.current?.keyUp(letter);
      setDown((prev) => {
        if (!prev.has(letter)) return prev;
        const next = new Set(prev);
        next.delete(letter);
        return next;
      });
    };
    const onBlur = () => {
      down.forEach((l) => stageRef.current?.keyUp(l));
      setDown(new Set());
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [down]);

  const onActivate = (i) => typeRef.current(NAME_KEYS[i].match[0]);

  const fallback = (
    <div className="hero-keys-fallback" aria-hidden="true">
      {NAME_KEYS.map((k, i) => (
        <span key={i} className={`cap ${k.accent ? 'cap--accent' : ''}`}>{k.legend}</span>
      ))}
    </div>
  );

  return (
    <section id="top" ref={sectionRef} className="hero" aria-labelledby="hero-title">
      <TestRunner run={testRun} />
      <Shout text={shout} />
      <Polaroids photos={photos} onClose={() => setPhotos(null)} />
      {/* phones have no Esc: a floating button (outside the flipped sections) turns it back */}
      {createPortal(
        <AnimatePresence>
          {touch && flipped && (
            <motion.button
              type="button"
              className="unflip-btn"
              onClick={() => { setFlip(false); setEgg('sagravOff'); }}
              initial={{ opacity: 0, y: 40, rotate: 180, x: '-50%' }}
              animate={{ opacity: 1, y: 0, rotate: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 40, x: '-50%', transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.5 }}
              whileTap={{ scale: 0.92 }}
            >
              <RotateCcw size={17} strokeWidth={2.2} aria-hidden="true" />
              {h.unflip}
            </motion.button>
          )}
        </AnimatePresence>,
        document.body,
      )}
      {pipeline >= 0 && (
        <ol className="pipeline mono" aria-label="Pipeline">
          {h.pipeline.map((label, i) => (
            <li key={label} className={i < pipeline ? 'is-done' : i === pipeline ? 'is-running' : ''}>
              <span className="pipeline__icon" aria-hidden="true">{i < pipeline ? '✓' : i === pipeline ? '●' : '○'}</span>
              {label}
            </li>
          ))}
        </ol>
      )}
      <div className="wrap hero__grid">
        <motion.div className="hero__meta" {...rise(0.05, booted)}>
          <p className="hero__status">
            <span className="status-dot" aria-hidden="true" />
            {h.status}
          </p>
          <p className="mono hero__where">
            <span>{h.role}</span>
            <span aria-hidden="true">/</span>
            <span>{h.location}</span>
          </p>
        </motion.div>

        <h1 id="hero-title" className="hero__title display">
          <motion.span className="hero__line" {...rise(0.12, booted)}>{h.titleA}</motion.span>{' '}
          <motion.span className="hero__line hero__line--b" {...rise(0.22, booted)}>
            {h.titleB.replace(/\.$/, '')}
            <span className="hero__dot">.</span>
          </motion.span>
        </h1>

        <KeyboardCanvas
          className="hero__stage"
          keys={NAME_KEYS}
          layout="hero"
          onStage={(s) => { stageRef.current = s; }}
          onActivate={onActivate}
          fallback={fallback}
        />

        <motion.div className="hero__bottom" {...rise(0.5, booted)}>
          <p className="hero__lede">{h.lede}</p>

          <div className="hero__side">
            <div className="hero__hint" aria-live="polite">
              <p className="eyebrow">{touch ? h.touchHint : h.typeHint}</p>
              {/* whatever the visitor types appears as keycaps, one per letter */}
              <div className="hero__typed">
                {chars.length > 0 && (
                  <span className="visually-hidden">{h.bufferLabel}: {chars.map((c) => c.ch).join('')}</span>
                )}
                <span className="hero__typed-keys" aria-hidden="true">
                  <AnimatePresence initial={false} mode="popLayout">
                    {chars.map((c) => (
                      <motion.span
                        key={c.id}
                        layout
                        className={`cap cap--sm hero__typed-key${c.ch === 'v' ? ' cap--accent' : ''}`}
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.85 }}
                        transition={{ duration: 0.2, ease: EASE }}
                      >
                        {c.ch.toUpperCase()}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <motion.span layout className="hero__caret" />
                </span>
              </div>
              {touch && (
                <button
                  type="button"
                  className="hero__cmd-btn"
                  aria-haspopup="dialog"
                  onClick={() => setCmdOpen(true)}
                >
                  <Command size={16} strokeWidth={1.8} aria-hidden="true" />
                  {h.cmdOpen}
                  <span className="mono hero__cmd-count">
                    {t.commands.list.filter((cmd) => found.has(canonical(cmd.word))).length}/{t.commands.list.length}
                  </span>
                </button>
              )}
              <CommandSheet open={cmdOpen} found={found} onClose={closeCommands} onPick={pickCommand} />
              <AnimatePresence mode="wait">
                {egg && (
                  <motion.div
                    key={egg}
                    className="hero__egg-slot"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    {egg === 'vargas' && (
                      <a className="hero__egg" href="#contato" onClick={(e) => { e.preventDefault(); scrollToId('contato'); }}>
                        {h.eggs.vargas}
                      </a>
                    )}
                    {egg === 'segredo' && (
                      <p className="hero__egg hero__egg--note hero__egg--secret"><ScrambleText text={h.eggs.segredo} /></p>
                    )}
                    {egg !== 'vargas' && egg !== 'segredo' && <p className="hero__egg hero__egg--note">{h.eggs[egg]}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hero__actions">
              <a
                href="#trabalho"
                className="btn btn--primary"
                onClick={(e) => { e.preventDefault(); scrollToId('trabalho'); }}
              >
                {h.ctaWork}
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </a>
              <a href={LINKS.cv} download="Curriculo-Joao-Vargas.pdf" className="btn btn--ghost">
                <Download size={17} strokeWidth={2} aria-hidden="true" />
                {h.ctaCv}
                <span className="mono btn__meta">{h.ctaCvMeta}</span>
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
