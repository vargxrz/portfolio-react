// Procedural Cherry-profile PBT keycap on an MX-style switch.
//
// Reconstructed with the img2threejs pipeline from a reference photo (see
// .img2threejs/object-sculpt-spec.json and image-analysis.md). This file is the
// hand-refined factory ("refine-code" passes) that replaced the generated
// blockout: the spec asked for a lofted rounded-rect frustum with a cylindrical
// dish, which the generic `extrude` primitive cannot express.
//
// World unit: 1.0 = 1u key pitch (19.05 mm). Y up, +Z toward the viewer.
import * as THREE from 'three';

export type KeycapColorway = {
  cap: string;
  legend: string;
  housingBottom: string;
  housingTop: string;
  plate: string;
};

export const CREAM_COLORWAY: KeycapColorway = {
  cap: '#E9DCC8',
  legend: '#141414',
  housingBottom: '#1C1C1E',
  housingTop: '#202325',
  plate: '#A9A395',
};

export const ACCENT_COLORWAY: KeycapColorway = {
  ...CREAM_COLORWAY,
  cap: '#E4572E',
  legend: '#FBF3E4',
};

export type KeycapOptions = {
  legend?: string;
  /** Secondary small legend under the main one (e.g. "Enter" under "↵"). */
  subLegend?: string;
  widthU?: number;
  colorway?: KeycapColorway;
  fontFamily?: string;
  withPlate?: boolean;
  textureSize?: number;
};

// Cherry R3 proportions from the spec (dimensions in u).
const PROFILE = {
  baseDepth: 0.955,
  baseInset: 0.045, // 1u - base width
  topWidthLoss: 0.32, // base width - top width (1u: 0.955 -> 0.66)
  topDepth: 0.76,
  height: 0.46,
  topShiftZ: -0.04, // rearward shift: longer, shallower front wall
  cornerBase: 0.07,
  cornerTop: 0.1,
  fillet: 0.035,
  dishDepth: 0.055,
  wallThickness: 0.05,
  innerHeight: 0.3,
};

const SWITCH = {
  bottomSize: 0.82,
  bottomLow: -0.18,
  bottomHigh: 0.1,
  topBase: 0.78,
  topTip: 0.62,
  topHigh: 0.24,
  skirtGap: 0.06,
  travel: 0.2,
};

const CORNER_SEGMENTS = 6;
const EDGE_SEGMENTS = 4;

type Ring = { points: THREE.Vector2[]; y: number };

/** Rounded rectangle perimeter, CCW from +X edge centre, fixed sample count. */
function roundedRect(w: number, d: number, r: number, cz = 0): THREE.Vector2[] {
  const hw = w / 2;
  const hd = d / 2;
  const rr = Math.min(r, hw - 1e-4, hd - 1e-4);
  const pts: THREE.Vector2[] = [];
  const corners = [
    { cx: hw - rr, cz: -hd + rr, a0: -Math.PI / 2 },
    { cx: hw - rr, cz: hd - rr, a0: 0 },
    { cx: -hw + rr, cz: hd - rr, a0: Math.PI / 2 },
    { cx: -hw + rr, cz: -hd + rr, a0: Math.PI },
  ];
  // start on +X edge centre, walk to first corner... simpler: emit corner arcs, then
  // straight-edge interior samples between consecutive corners.
  for (let c = 0; c < 4; c += 1) {
    const { cx, cz: czc, a0 } = corners[c];
    for (let i = 0; i <= CORNER_SEGMENTS; i += 1) {
      const a = a0 + (i / CORNER_SEGMENTS) * (Math.PI / 2);
      pts.push(new THREE.Vector2(cx + Math.cos(a) * rr, czc + Math.sin(a) * rr + cz));
    }
    const next = corners[(c + 1) % 4];
    const end = pts[pts.length - 1];
    const na = next.a0;
    const start = new THREE.Vector2(next.cx + Math.cos(na) * rr, next.cz + Math.sin(na) * rr + cz);
    for (let i = 1; i < EDGE_SEGMENTS; i += 1) {
      pts.push(end.clone().lerp(start, i / EDGE_SEGMENTS));
    }
  }
  return pts;
}

const lerp = THREE.MathUtils.lerp;

/**
 * Keycap shell: outer skirt loft -> rim fillet -> cylindrical dish (converging to a
 * centre vertex), plus an inner skirt wall and a bottom lip so the hollow reads
 * correctly when the cap is pressed or seen from low angles.
 * UV layout: walls use v in [0, 0.5) (plain colour on the legend canvas),
 * the dish/fillet top uses a planar projection into v in [0.5, 1].
 */
function buildKeycapGeometry(widthU: number): THREE.BufferGeometry {
  const P = PROFILE;
  const baseW = widthU - P.baseInset;
  const topW = baseW - P.topWidthLoss;
  const wallTopH = P.height - P.fillet;
  const wallTopW = topW + P.fillet * 1.8;
  const wallTopD = P.topDepth + P.fillet * 1.8;
  const halfTopW = topW / 2;

  const sag = (x: number) => {
    const t = THREE.MathUtils.clamp(x / (halfTopW + P.fillet), -1, 1);
    return P.dishDepth * (1 - t * t);
  };

  const outer: Ring[] = [];
  const WALL_RINGS = 10;
  for (let k = 0; k <= WALL_RINGS; k += 1) {
    const s = k / WALL_RINGS;
    // very slight convexity: walls bow out a touch before the fillet
    const e = s + 0.02 * Math.sin(Math.PI * s);
    outer.push({
      points: roundedRect(lerp(baseW, wallTopW, e), lerp(P.baseDepth, wallTopD, e),
        lerp(P.cornerBase, P.cornerTop, s), lerp(0, P.topShiftZ, s)),
      y: s * wallTopH,
    });
  }
  const FILLET_RINGS = 5;
  for (let j = 1; j <= FILLET_RINGS; j += 1) {
    const phi = (j / FILLET_RINGS) * (Math.PI / 2);
    const inset = (1 - Math.cos(phi)) * P.fillet * 0.9;
    const ring = roundedRect(wallTopW - inset * 2, wallTopD - inset * 2, P.cornerTop, P.topShiftZ);
    outer.push({ points: ring, y: wallTopH + Math.sin(phi) * P.fillet });
  }
  const filletStart = outer.length - FILLET_RINGS;
  const DISH_RINGS = 8;
  for (let j = 1; j < DISH_RINGS; j += 1) {
    const t = j / DISH_RINGS;
    const rimW = wallTopW - P.fillet * 1.8;
    const rimD = wallTopD - P.fillet * 1.8;
    outer.push({ points: roundedRect(rimW * (1 - t), rimD * (1 - t), P.cornerTop * (1 - t), P.topShiftZ), y: P.height });
  }

  const M = outer[0].points.length;
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const topU = (x: number) => 0.5 + x / (wallTopW + 0.02);
  const topV = (z: number) => 0.5 + 0.5 * (0.5 - (z - P.topShiftZ) / (wallTopD + 0.02));

  outer.forEach((ring, ri) => {
    const isTop = ri >= filletStart;
    const topWeight = ri < filletStart ? 0 : ri < filletStart + FILLET_RINGS
      ? Math.sin(((ri - filletStart + 1) / FILLET_RINGS) * (Math.PI / 2))
      : 1;
    ring.points.forEach((p, pi) => {
      const y = ring.y - sag(p.x) * topWeight;
      positions.push(p.x, y, p.y);
      if (isTop) uvs.push(topU(p.x), topV(p.y));
      else uvs.push(pi / M, 0.02 + 0.44 * (ring.y / wallTopH));
      const ao = isTop ? 1 : lerp(0.84, 0.95, ring.y / wallTopH);
      colors.push(ao, ao, ao);
    });
  });
  // dish centre vertex
  const centreIndex = positions.length / 3;
  positions.push(0, P.height - sag(0), P.topShiftZ);
  uvs.push(topU(0), topV(P.topShiftZ));
  colors.push(1, 1, 1);

  for (let r = 0; r < outer.length - 1; r += 1) {
    for (let i = 0; i < M; i += 1) {
      const a = r * M + i;
      const b = r * M + ((i + 1) % M);
      const c = (r + 1) * M + i;
      const d = (r + 1) * M + ((i + 1) % M);
      indices.push(a, c, b, b, c, d);
    }
  }
  const lastRing = (outer.length - 1) * M;
  for (let i = 0; i < M; i += 1) {
    indices.push(lastRing + i, centreIndex, lastRing + ((i + 1) % M));
  }

  // Inner skirt wall (hollow cap) + bottom lip joining outer and inner at y = 0.
  const innerStart = positions.length / 3;
  const INNER_RINGS = 3;
  for (let k = 0; k <= INNER_RINGS; k += 1) {
    const s = k / INNER_RINGS;
    const h = s * P.innerHeight;
    const shrink = (P.topWidthLoss * (h / P.height));
    const pts = roundedRect(baseW - P.wallThickness * 2 - shrink, P.baseDepth - P.wallThickness * 2 - shrink * 0.7,
      P.cornerBase * 0.6, lerp(0, P.topShiftZ, h / P.height));
    pts.forEach((p, pi) => {
      positions.push(p.x, h, p.y);
      uvs.push(pi / M, 0.02);
      colors.push(0.55, 0.55, 0.55);
    });
  }
  for (let r = 0; r < INNER_RINGS; r += 1) {
    for (let i = 0; i < M; i += 1) {
      const a = innerStart + r * M + i;
      const b = innerStart + r * M + ((i + 1) % M);
      const c = innerStart + (r + 1) * M + i;
      const d = innerStart + (r + 1) * M + ((i + 1) % M);
      indices.push(a, b, c, b, d, c); // reversed winding: faces inward
    }
  }
  // inner ceiling
  const ceilRing = innerStart + INNER_RINGS * M;
  const ceilCentre = positions.length / 3;
  positions.push(0, P.innerHeight, lerp(0, P.topShiftZ, P.innerHeight / P.height));
  uvs.push(0.5, 0.02);
  colors.push(0.4, 0.4, 0.4);
  for (let i = 0; i < M; i += 1) indices.push(ceilRing + i, ceilRing + ((i + 1) % M), ceilCentre);
  // bottom lip — its own copy of outer ring 0 so the skirt keeps a crisp bottom edge
  const lipStart = positions.length / 3;
  for (let i = 0; i < M; i += 1) {
    positions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    uvs.push(i / M, 0.02);
    colors.push(0.8, 0.8, 0.8);
  }
  const innerLipStart = positions.length / 3;
  for (let i = 0; i < M; i += 1) {
    const k = innerStart + i;
    positions.push(positions[k * 3], positions[k * 3 + 1], positions[k * 3 + 2]);
    uvs.push(i / M, 0.02);
    colors.push(0.6, 0.6, 0.6);
  }
  for (let i = 0; i < M; i += 1) {
    const o0 = lipStart + i;
    const o1 = lipStart + ((i + 1) % M);
    const n0 = innerLipStart + i;
    const n1 = innerLipStart + ((i + 1) % M);
    indices.push(o0, o1, n0, o1, n1, n0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedBoxGeometry(w: number, h: number, d: number, r: number, taper = 1): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2 - r;
  const hd = d / 2 - r;
  shape.moveTo(-hw, -d / 2);
  shape.lineTo(hw, -d / 2);
  shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -hd);
  shape.lineTo(w / 2, hd);
  shape.quadraticCurveTo(w / 2, d / 2, hw, d / 2);
  shape.lineTo(-hw, d / 2);
  shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, hd);
  shape.lineTo(-w / 2, -hd);
  shape.quadraticCurveTo(-w / 2, -d / 2, -hw, -d / 2);
  const bevel = Math.min(r * 0.6, h * 0.25);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  if (taper !== 1) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / h, 0, 1);
      const k = lerp(1, taper, t);
      pos.setX(i, pos.getX(i) * k);
      pos.setZ(i, pos.getZ(i) * k);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

// ---------------------------------------------------------------------------
// Textures: legend albedo (per key) + shared PBT grain (independent roughness/bump).
// ---------------------------------------------------------------------------

let grainTexture: THREE.CanvasTexture | null = null;
function pbtGrain(): THREE.CanvasTexture {
  if (grainTexture) return grainTexture;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  // deterministic LCG so the grain is identical across reloads
  let seed = 1337;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < size * size; i += 1) {
    // two frequency bands: fine speckle + soft blotch
    const x = i % size;
    const y = Math.floor(i / size);
    const blotch = 0.5 + 0.5 * Math.sin(x * 0.11 + Math.sin(y * 0.07) * 2.0) * Math.cos(y * 0.09);
    const v = 150 + rand() * 70 + blotch * 25;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTexture = new THREE.CanvasTexture(canvas);
  grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
  grainTexture.repeat.set(3, 3);
  grainTexture.colorSpace = THREE.NoColorSpace;
  return grainTexture;
}

function legendTexture(opts: Required<Pick<KeycapOptions, 'legend' | 'fontFamily' | 'textureSize'>> & {
  subLegend?: string; colorway: KeycapColorway; widthU: number;
}): THREE.CanvasTexture {
  const size = opts.textureSize;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size * Math.min(opts.widthU, 2));
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = opts.colorway.cap;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Top half of the canvas (v in [0.5, 1]) maps to the dish.
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.25 + canvas.height * 0.02;
  ctx.fillStyle = opts.colorway.legend;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const glyphPx = opts.legend.length > 3 ? size * (opts.widthU > 1.5 ? 0.15 : 0.11) : opts.legend.length > 1 ? size * 0.14 : size * 0.25;
  ctx.font = `700 ${glyphPx}px ${opts.fontFamily}`;
  ctx.fillText(opts.legend, cx, opts.subLegend ? cy - size * 0.03 : cy);
  if (opts.subLegend) {
    ctx.font = `600 ${size * 0.045}px ${opts.fontFamily}`;
    ctx.fillText(opts.subLegend, cx, cy + size * 0.075);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const SUIT_FONT = '"Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols 2", serif';

/**
 * "poker" legend: the dish becomes a playing card — rank in the middle, a small
 * rank + ♣ index in the top-left corner and the same index rotated in the bottom-right.
 */
export function cardLegendTexture(opts: {
  rank: string; corner?: string; colorway: KeycapColorway; fontFamily: string; textureSize?: number;
}): THREE.CanvasTexture {
  const size = opts.textureSize ?? 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = opts.colorway.cap;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = opts.colorway.legend;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // dish = canvas y in [0, size/2]; keep clear of the rim fillet
  const index = () => {
    ctx.font = `800 ${size * 0.085}px ${opts.fontFamily}`;
    ctx.fillText(opts.corner ?? opts.rank, size * 0.21, size * 0.08);
    ctx.font = `400 ${size * 0.08}px ${SUIT_FONT}`;
    ctx.fillText('♣', size * 0.21, size * 0.155);
  };
  index();
  ctx.save();
  ctx.translate(size, size * 0.5);
  ctx.rotate(Math.PI);
  index();
  ctx.restore();
  const isSuit = opts.rank === '♣';
  ctx.font = isSuit
    ? `400 ${size * 0.27}px ${SUIT_FONT}`
    : `800 ${opts.rank.length > 1 ? size * 0.15 : size * 0.19}px ${opts.fontFamily}`;
  ctx.fillText(opts.rank, size / 2, size * 0.26);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export type KeycapRuntime = {
  legend: string;
  /** Group that travels on press (cap + stem). */
  pressNode: THREE.Group;
  capMesh: THREE.Mesh;
  restY: number;
  travel: number;
  /** 0 = rest, 1 = bottomed out. Written by the animation loop. */
  press: number;
  pressTarget: number;
  velocity: number;
  baseMap: THREE.Texture;
  /** Accent caps only: legend on a white body, tinted by material.color. */
  tintMap: THREE.Texture | null;
};

const geometryCache = new Map<number, THREE.BufferGeometry>();

export function createKeycapModel(options: KeycapOptions = {}): THREE.Group {
  const widthU = options.widthU ?? 1;
  const colorway = options.colorway ?? CREAM_COLORWAY;
  const legend = options.legend ?? '';
  const root = new THREE.Group();
  root.name = `keyswitch-${legend || 'blank'}`;

  // Switch housing (static)
  const housingBottom = new THREE.Mesh(
    roundedBoxGeometry(SWITCH.bottomSize * Math.min(widthU, 1), SWITCH.bottomHigh - SWITCH.bottomLow, SWITCH.bottomSize, 0.04),
    new THREE.MeshStandardMaterial({ color: colorway.housingBottom, roughness: 0.5, metalness: 0 }),
  );
  housingBottom.name = 'switch-bottom-housing';
  housingBottom.position.y = SWITCH.bottomLow;
  root.add(housingBottom);

  const housingTop = new THREE.Mesh(
    roundedBoxGeometry(SWITCH.topBase * Math.min(widthU, 1), SWITCH.topHigh - SWITCH.bottomHigh, SWITCH.topBase, 0.05,
      SWITCH.topTip / SWITCH.topBase),
    new THREE.MeshPhysicalMaterial({
      color: colorway.housingTop, roughness: 0.55, metalness: 0, transparent: true, opacity: 0.94, envMapIntensity: 0.2,
    }),
  );
  housingTop.name = 'switch-top-housing';
  housingTop.position.y = SWITCH.bottomHigh;
  root.add(housingTop);

  // Travelling part: stem + cap
  const pressNode = new THREE.Group();
  pressNode.name = 'press-node';
  const restY = SWITCH.topHigh + SWITCH.skirtGap;
  pressNode.position.y = restY;
  root.add(pressNode);

  const stemMat = new THREE.MeshStandardMaterial({ color: colorway.housingBottom, roughness: 0.55 });
  const stemA = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.24, 0.06), stemMat);
  const stemB = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.21), stemMat);
  stemA.position.y = stemB.position.y = 0.05;
  stemA.name = 'switch-stem';
  stemB.name = 'switch-stem-cross';
  pressNode.add(stemA, stemB);

  let geometry = geometryCache.get(widthU);
  if (!geometry) {
    geometry = buildKeycapGeometry(widthU);
    geometry.userData.shared = true;
    geometryCache.set(widthU, geometry);
  }
  const grain = pbtGrain();
  const legendOpts = {
    legend, subLegend: options.subLegend, widthU,
    fontFamily: options.fontFamily ?? '"Archivo", "Helvetica Neue", Arial, sans-serif',
    textureSize: options.textureSize ?? 512,
  };
  const baseMap = legendTexture({ ...legendOpts, colorway });
  // Accent caps also get a white-body copy of their legend: tinting it via material.color
  // lets the "rgb" easter egg recolour the cap to any hue without redrawing the canvas.
  const tintMap = colorway === ACCENT_COLORWAY
    ? legendTexture({ ...legendOpts, colorway: { ...colorway, cap: '#ffffff', legend: '#1b1410' } })
    : null;
  const capMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    vertexColors: true,
    map: baseMap,
    roughness: 0.66,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.1,
    metalness: 0,
  });
  const capMesh = new THREE.Mesh(geometry, capMaterial);
  capMesh.name = 'keycap';
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  pressNode.add(capMesh);

  if (options.withPlate) {
    const plate = new THREE.Mesh(
      roundedBoxGeometry(widthU + 0.04, 0.08, 1.04, 0.02),
      new THREE.MeshStandardMaterial({ color: colorway.plate, roughness: 0.5, metalness: 0.6 }),
    );
    plate.name = 'plate';
    plate.position.y = -0.08;
    plate.receiveShadow = true;
    root.add(plate);
  }

  const runtime: KeycapRuntime = {
    legend, pressNode, capMesh, restY, travel: SWITCH.travel, press: 0, pressTarget: 0, velocity: 0,
    baseMap, tintMap,
  };
  root.userData.keycap = runtime;
  root.userData.sculptRuntime = {
    nodes: { root, pressNode, housingBottom, housingTop, stem: stemA, keycap: capMesh },
    sockets: { stemCross: pressNode },
    colliders: { keycap: { type: 'box', scale: [widthU - PROFILE.baseInset, PROFILE.height, PROFILE.baseDepth] } },
    destructionGroups: {},
    note: 'press-node translates along -Y by `travel`; drive runtime.pressTarget (0..1).',
  };
  return root;
}

export type KeycapRowOptions = {
  legends: string[];
  colorways?: (KeycapColorway | undefined)[];
  fontFamily?: string;
  withPlate?: boolean;
  pitch?: number;
};

/** Linear array of independent key switches (spec repetitionSystems.keyRowArray). */
export function createKeycapRowModel(options: KeycapRowOptions): THREE.Group {
  const pitch = options.pitch ?? 1;
  const row = new THREE.Group();
  row.name = 'keycap-row';
  const n = options.legends.length;
  options.legends.forEach((legend, i) => {
    const key = createKeycapModel({
      legend, colorway: options.colorways?.[i], fontFamily: options.fontFamily, withPlate: false,
    });
    key.position.x = (i - (n - 1) / 2) * pitch;
    row.add(key);
  });
  if (options.withPlate) {
    const plate = new THREE.Mesh(
      roundedBoxGeometry(n * pitch + 0.1, 0.08, 1.1, 0.03),
      new THREE.MeshStandardMaterial({ color: CREAM_COLORWAY.plate, roughness: 0.5, metalness: 0.6 }),
    );
    plate.position.y = -0.08;
    plate.receiveShadow = true;
    row.add(plate);
  }
  return row;
}

/** Critically-damped-ish spring toward pressTarget. Call once per frame. */
export function stepKeycap(key: THREE.Object3D, dt: number): void {
  const rt = key.userData.keycap as KeycapRuntime | undefined;
  if (!rt) return;
  const stiffness = rt.pressTarget > rt.press ? 900 : 380;
  const damping = rt.pressTarget > rt.press ? 48 : 22;
  const force = (rt.pressTarget - rt.press) * stiffness - rt.velocity * damping;
  rt.velocity += force * dt;
  rt.press += rt.velocity * dt;
  rt.press = THREE.MathUtils.clamp(rt.press, -0.08, 1);
  rt.pressNode.position.y = rt.restY - rt.press * rt.travel;
}

/**
 * Lighting matched to the reference photo: warm key from above-front, cool bounce
 * from the slate backdrop, faint rim along the rear edge. Pair with a low-intensity
 * RoomEnvironment (scene.environmentIntensity ~0.35) and ACES tone mapping.
 */
export function createKeycapLights(): THREE.Group {
  const lights = new THREE.Group();
  lights.name = 'keycap-lights';
  const hemi = new THREE.HemisphereLight('#fff3de', '#1f2829', 0.18);
  lights.add(hemi);
  const key = new THREE.DirectionalLight('#ffeed4', 3.0);
  key.position.set(-1.0, 7.0, 0.9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  const cam = key.shadow.camera as THREE.OrthographicCamera;
  cam.left = -4.5; cam.right = 4.5; cam.top = 3; cam.bottom = -3; cam.near = 0.5; cam.far = 20;
  lights.add(key);
  const rim = new THREE.DirectionalLight('#cfe0ff', 0.7);
  rim.position.set(2.5, 3.0, -4.5);
  lights.add(rim);
  const fill = new THREE.DirectionalLight('#9fb7c2', 0.35);
  fill.position.set(5, 1.5, -0.5);
  lights.add(fill);
  return lights;
}
