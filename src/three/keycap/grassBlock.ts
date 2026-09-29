// "renan" easter egg skin: the cap becomes a Minecraft grass block (where the friendship
// started, 2018) with a pixel legend from the 2026 Rio trip.
//
// The keycap UVs are not square: the dish is a planar projection into the top half of
// the canvas, the skirt walls wrap the bottom half by arc length. So the pixel grid is
// sized in *world units* and converted per region, which keeps every "block pixel"
// square on the actual 1u cap.
import * as THREE from 'three';

const SIZE = 1024;
const CELL = 0.04; // world units per block pixel (≈ 17 across the top, like a 16px block)

// 1u keycap measurements (see PROFILE / buildKeycapGeometry)
const TOP_U_SPAN = 0.718; // world width covered by the whole canvas width on the dish
const TOP_V_SPAN = 0.843; // world depth covered by the top half of the canvas
const WALL_PERIMETER = 3.29; // mean skirt perimeter, wrapped once across the canvas
const WALL_SLANT = 0.445; // skirt height along its slope
const WALL_TOP_Y = 0.54 * SIZE; // canvas y where the skirt meets the fillet
const WALL_BOTTOM_Y = 0.98 * SIZE;

// pixel glyphs (1 = ink)
const GLYPHS: Record<string, string[]> = {
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
};

// tones picked by weighted noise: [colour, weight]
const GRASS: [string, number][] = [
  ['#93c25c', 0.12], ['#80b24b', 0.3], ['#72a441', 0.28], ['#63933a', 0.2], ['#517d2e', 0.1],
];
// the dish catches the key light head-on, so its greens sit a step darker
const GRASS_TOP: [string, number][] = [
  ['#7aa94a', 0.12], ['#6a9a3e', 0.3], ['#5e8c37', 0.28], ['#517d30', 0.2], ['#436a28', 0.1],
];
const DIRT: [string, number][] = [
  ['#9c7552', 0.14], ['#8a6445', 0.32], ['#79573b', 0.28], ['#654730', 0.18], ['#523924', 0.08],
];
const PEBBLE = '#a8a097';

/** Deterministic hash → [0, 1), so every block looks the same on every visit. */
function hash(x: number, y: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 144665)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function tone(pal: [string, number][], r: number) {
  let acc = 0;
  for (const [c, w] of pal) {
    acc += w;
    if (r < acc) return c;
  }
  return pal[pal.length - 1][0];
}

export function grassBlockTexture(legend: string, seed = 7): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  const cell = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x0), Math.round(y0), Math.round(x1) - Math.round(x0), Math.round(y1) - Math.round(y0));
  };

  // ---- walls: grass lip with drips, then dirt ----------------------------------------
  const wallCols = Math.round(WALL_PERIMETER / CELL);
  const wallRows = Math.round(WALL_SLANT / CELL);
  const ww = SIZE / wallCols;
  const wh = (WALL_BOTTOM_Y - WALL_TOP_Y) / wallRows;
  // pad above/below the skirt band so filtering never pulls in empty canvas
  cell(0, SIZE / 2, SIZE, WALL_TOP_Y, GRASS[2][0]);
  cell(0, WALL_BOTTOM_Y, SIZE, SIZE, DIRT[3][0]);
  for (let c = 0; c < wallCols; c += 1) {
    // lip is 3 pixels deep; drips come in short runs like the real texture
    const run = hash(Math.floor(c / 2), 0, seed);
    const drip = 3 + (run > 0.55 ? 1 : 0) + (run > 0.85 && hash(c, 1, seed) > 0.4 ? 1 : 0);
    for (let r = 0; r < wallRows; r += 1) {
      const n = hash(c, r + 50, seed);
      let c0 = r < drip ? tone(GRASS, n) : tone(DIRT, n);
      if (r >= drip && hash(c, r + 90, seed) > 0.975) c0 = PEBBLE;
      cell(c * ww, WALL_TOP_Y + r * wh, (c + 1) * ww, WALL_TOP_Y + (r + 1) * wh, c0);
    }
  }

  // ---- top (dish): grass, with the legend on the same pixel grid ---------------------
  const cw = (SIZE * CELL) / TOP_U_SPAN;
  const ch = ((SIZE / 2) * CELL) / TOP_V_SPAN;
  const glyph = GLYPHS[legend] ?? GLYPHS.R;
  const gw = glyph[0].length;
  const gh = glyph.length;
  // grid anchored so the glyph sits centred on the dish (canvas 512, 256) on whole pixels
  const gx0 = SIZE / 2 - (gw / 2) * cw;
  const gy0 = SIZE / 4 - (gh / 2) * ch;
  const colFrom = -Math.ceil(gx0 / cw);
  const colTo = Math.ceil((SIZE - gx0) / cw);
  const rowFrom = -Math.ceil(gy0 / ch);
  const rowTo = Math.ceil((SIZE / 2 - gy0) / ch);
  const ink = (c: number, r: number) => glyph[r]?.[c] === '1';
  for (let r = rowFrom; r < rowTo; r += 1) {
    for (let c = colFrom; c < colTo; c += 1) {
      const x0 = gx0 + c * cw;
      const y0 = gy0 + r * ch;
      const y1 = Math.min(y0 + ch, SIZE / 2);
      if (y1 <= y0) continue;
      let c0 = tone(GRASS_TOP, hash(c + 200, r + 200, seed));
      // Minecraft-style text: cream pixels with a hard shadow one pixel down-right
      if (ink(c, r)) c0 = '#fbf7ee';
      else if (ink(c - 1, r - 1)) c0 = '#22361a';
      cell(x0, Math.max(y0, 0), x0 + cw, y1, c0);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = 8;
  return tex;
}
