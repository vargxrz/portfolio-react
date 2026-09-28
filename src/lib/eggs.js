// Easter-egg bookkeeping shared by the hero (which runs them) and the header notebook
// (which lists them): which ones the visitor already found, and a way to run one by name.

const KEY = 'eggs-found';
const CANONICAL = { secret: 'segredo', gravity: 'gravidade', junit: 'teste' };
export const canonical = (word) => CANONICAL[word] ?? word;

export const getFound = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
};

export const markFound = (word) => {
  const found = getFound();
  const w = canonical(word);
  if (found.has(w)) return;
  found.add(w);
  try {
    localStorage.setItem(KEY, JSON.stringify([...found]));
  } catch {
    // storage blocked: the tick simply won't persist between visits
  }
  window.dispatchEvent(new CustomEvent('eggs:found', { detail: w }));
};

/** Ask the hero to "type" a command, letter by letter, on the 3D keyboard. */
export const runEgg = (word) => window.dispatchEvent(new CustomEvent('egg:run', { detail: word }));
