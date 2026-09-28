import { useEffect } from 'react';
import Lenis from 'lenis';

let lenis = null;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll to a section id, through Lenis when it is running. Moves focus for keyboard users. */
export const scrollToId = (id) => {
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el, { offset: id === 'top' ? 0 : -72 });
  else if (id === 'top') window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const focusTarget = id === 'top' ? document.getElementById('main') : el;
  if (focusTarget) {
    if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
  }
};

export const useSmoothScroll = () => {
  useEffect(() => {
    // touch screens keep native momentum scrolling: smoothing there only adds lag
    if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return undefined;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (time) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
};

export default useSmoothScroll;
