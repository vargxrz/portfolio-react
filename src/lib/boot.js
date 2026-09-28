// Boot sequence: the loader in index.html stays up until fonts are in, both 3D stages
// exist and their shaders/textures are on the GPU — so nothing compiles mid-interaction.

const TASKS = ['fonts', 'stage:hero', 'stage:enter'];
const MIN_MS = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 400 : 1100;
const MAX_MS = 9000;

const done = new Set();
let resolveReady;
export const ready = new Promise((r) => { resolveReady = r; });
let finished = false;

const loader = () => window.__loader;

function finish() {
  if (finished) return;
  finished = true;
  const wait = Math.max(0, MIN_MS - performance.now());
  window.setTimeout(() => {
    Promise.resolve(loader()?.done()).then(() => resolveReady());
  }, wait);
}

/** Mark a boot task complete. Unknown or repeated names are ignored. */
export function complete(name) {
  if (!TASKS.includes(name) || done.has(name)) return;
  done.add(name);
  const next = TASKS.find((t) => !done.has(t));
  loader()?.progress(done.size / TASKS.length, next);
  if (done.size === TASKS.length) finish();
}

// Fonts: display + mono in the weights the first screen uses.
Promise.race([
  Promise.all([
    document.fonts?.load('800 64px Archivo'),
    document.fonts?.load('400 16px Archivo'),
    document.fonts?.load('700 64px Archivo'),
    document.fonts?.load('400 13px "JetBrains Mono"'),
  ]),
  new Promise((r) => setTimeout(r, 4000)),
]).finally(() => complete('fonts'));

// Never trap a visitor behind the loader (slow GPU, blocked WebGL, flaky network).
window.setTimeout(() => TASKS.forEach(complete), MAX_MS);
