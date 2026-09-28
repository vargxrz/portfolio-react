/** True when a key event should be left alone because the user is typing in a field. */
export const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

/** Single printable letter a–z (with accents folded), or null. */
export const letterOf = (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return null;
  const k = e.key.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return /^[a-z]$/.test(k) ? k : null;
};

/** Font stack used both by CSS and by the canvas legends on the 3D keys. */
export const LEGEND_FONT = '"Archivo", "Helvetica Neue", Arial, sans-serif';

/** Resolve once the legend font is ready (or after a short timeout on slow networks). */
export const legendFontReady = () =>
  Promise.race([
    document.fonts?.load(`700 64px ${LEGEND_FONT}`).catch(() => null) ?? Promise.resolve(),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
