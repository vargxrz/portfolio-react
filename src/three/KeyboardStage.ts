// Real-time stage for the reconstructed keycaps: renderer, camera, lights, pointer
// + keyboard press interaction, intro "seating" animation and theme colourways.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createKeycapModel,
  createKeycapLights,
  stepKeycap,
  cardLegendTexture,
  CREAM_COLORWAY,
  ACCENT_COLORWAY,
  type KeycapColorway,
  type KeycapRuntime,
} from './keycap/createKeycapModel';

export type StageTheme = 'dark' | 'light';

export type KeySpec = {
  legend: string;
  /** Character(s) on the physical keyboard that press this key (lower-case). */
  match: string[];
  subLegend?: string;
  widthU?: number;
  accent?: boolean;
};

export type StageLayout = 'hero' | 'enter';

export type KeyboardStageOptions = {
  container: HTMLElement;
  keys: KeySpec[];
  layout: StageLayout;
  theme: StageTheme;
  fontFamily: string;
  reducedMotion: boolean;
  /** Keep the caps hovering until playIntro() (the boot loader is still covering the page). */
  holdIntro?: boolean;
  /** Fired on pointer click / tap of a key. */
  onActivate?: (index: number) => void;
  onHoverChange?: (index: number | null) => void;
};

const GRAPHITE_COLORWAY: KeycapColorway = {
  cap: '#323B3C',
  legend: '#EDE4D3',
  housingBottom: '#151718',
  housingTop: '#202325',
  plate: '#A9A395',
};

const CASE_COLORS: Record<StageTheme, string> = { dark: '#2A3435', light: '#D8CDB8' };

function colorwayFor(theme: StageTheme, accent?: boolean): KeycapColorway {
  if (accent) return ACCENT_COLORWAY;
  return theme === 'dark' ? CREAM_COLORWAY : GRAPHITE_COLORWAY;
}

type KeyEntry = {
  spec: KeySpec;
  object: THREE.Group;
  runtime: KeycapRuntime;
  home: THREE.Vector3;
  /** Intro: extra height above rest while the cap is being "seated". */
  drop: number;
  dropVelocity: number;
  dropDelay: number;
  held: Set<string>;
  /** "deploy" easter egg: cap is in flight and spins until it lands. */
  launching: boolean;
  /** "segredo" easter egg: per-part explode vectors (built from the img2threejs part hierarchy). */
  parts: { obj: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3; spin: THREE.Vector3 }[];
  capDir: THREE.Vector3;
  capSpin: THREE.Vector3;
  rgbLight: THREE.PointLight | null;
  /** "teste": 1 → 0 green glow after the key's test passes. */
  flash: number;
  /** "poker": card legend for this key (built on first use). */
  pokerMap: THREE.Texture | null;
  /** "poker": seconds into the flip animation (negative = waiting), null = idle. */
  flip: number | null;
};

const POKER_RANKS = ['♣', '10', 'J', 'Q', 'K', 'A'];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class KeyboardStage {
  private opts: KeyboardStageOptions;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private rig = new THREE.Group();
  private keys: KeyEntry[] = [];
  private caseMesh: THREE.Mesh | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(9, 9);
  private pointerTarget = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private hovered: number | null = null;
  private pressedByPointer: number | null = null;
  private clock = new THREE.Clock();
  private raf = 0;
  private visible = false;
  private disposed = false;
  private scroll = 0;
  private waveTime = -1;
  private explodeTime = -1;
  /** "poker": caps show playing-card legends (♣ 10 J Q K A) instead of letters */
  private pokerOn = false;
  private rgbOn = false;
  private observer: IntersectionObserver;
  private resizeObserver: ResizeObserver;
  private compact = false;
  private envTexture: THREE.Texture;

  constructor(opts: KeyboardStageOptions) {
    this.opts = opts;
    const { container } = opts;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(opts.layout === 'hero' ? 26 : 30, 1, 0.1, 60);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 0.22;
    this.scene.add(createKeycapLights());
    this.scene.add(this.rig);

    this.buildKeys();
    this.resize();

    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.start();
    }, { rootMargin: '120px' });
    this.observer.observe(container);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);

    const el = this.renderer.domElement;
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerleave', this.onPointerLeave);
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointermove', this.onWindowPointer, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  // ------------------------------------------------------------------ build

  private buildKeys() {
    for (const k of this.keys) {
      this.rig.remove(k.object);
      disposeObject(k.object);
      k.pokerMap?.dispose();
    }
    this.keys = [];
    if (this.caseMesh) {
      this.rig.remove(this.caseMesh);
      disposeObject(this.caseMesh);
      this.caseMesh = null;
    }

    const { keys, theme, fontFamily, reducedMotion, layout } = this.opts;
    const positions = this.layoutPositions();
    keys.forEach((spec, i) => {
      const object = createKeycapModel({
        legend: spec.legend,
        subLegend: spec.subLegend,
        widthU: spec.widthU ?? 1,
        colorway: colorwayFor(theme, spec.accent),
        fontFamily,
      });
      object.position.copy(positions[i]);
      object.userData.keyIndex = i;
      this.rig.add(object);
      const runtime = object.userData.keycap as KeycapRuntime;
      const intro = layout === 'hero' && !reducedMotion;
      // exploded view: parts separate straight up the switch axis, like an assembly drawing
      const parts = ['switch-top-housing', 'switch-bottom-housing'].map((name, pi) => {
        const obj = object.getObjectByName(name)!;
        return {
          obj,
          base: obj.position.clone(),
          dir: new THREE.Vector3(0, pi === 0 ? 0.24 : 0.06, 0),
          spin: new THREE.Vector3(0, pi === 0 ? rnd(-0.25, 0.25) : 0, 0),
        };
      });
      const entry: KeyEntry = {
        spec, object, runtime, home: positions[i].clone(),
        drop: intro ? 3.2 + i * 0.15 : 0,
        dropVelocity: 0,
        dropDelay: intro ? (this.opts.holdIntro ? Infinity : 0.35 + i * 0.11) : 0,
        held: new Set(),
        launching: false,
        parts,
        capDir: new THREE.Vector3(0, 0.62, 0),
        capSpin: new THREE.Vector3(-0.18, rnd(-0.35, 0.35), 0),
        rgbLight: null,
        flash: 0,
        pokerMap: null,
        flip: null,
      };
      runtime.pressNode.position.y = runtime.restY + entry.drop;
      this.keys.push(entry);
    });

    // Case / plate under the keys
    const box = new THREE.Box3();
    positions.forEach((p, i) => {
      const w = (keys[i].widthU ?? 1) / 2;
      box.expandByPoint(new THREE.Vector3(p.x - w, 0, p.z - 0.5));
      box.expandByPoint(new THREE.Vector3(p.x + w, 0, p.z + 0.5));
    });
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const pad = 0.28;
    const caseGeo = roundedSlab(size.x + pad * 2, 0.34, size.z + pad * 2, 0.16);
    this.caseMesh = new THREE.Mesh(caseGeo, new THREE.MeshStandardMaterial({
      color: CASE_COLORS[theme], roughness: 0.55, metalness: 0.35,
    }));
    this.caseMesh.position.set(centre.x, -0.42, centre.z);
    this.caseMesh.receiveShadow = true;
    this.rig.add(this.caseMesh);
    // theme rebuild while "poker" is on: new caps come up as cards straight away
    if (this.pokerOn) {
      this.keys.forEach((k, i) => {
        this.ensurePokerMap(k, i);
        (k.runtime.capMesh.material as THREE.MeshPhysicalMaterial).map = k.pokerMap;
      });
    }

    // RGB lights exist from the start at zero intensity: toggling "rgb" later never adds
    // lights to the scene, so no shader recompile (that was the hitch when switching on).
    if (layout === 'hero') {
      for (const k of this.keys) {
        k.rgbLight = new THREE.PointLight('#ff0000', 0, 1.6, 2);
        k.rgbLight.position.set(0, 0.2, 0.15);
        k.object.add(k.rgbLight);
      }
    }
  }

  /** 0 → 1 while switching RGB on, 1 → 0 while switching off. */
  private rgbLevel = 0;

  private layoutPositions(): THREE.Vector3[] {
    const n = this.opts.keys.length;
    if (this.opts.layout === 'hero' && this.compact && n === 6) {
      // phone: VAR / GAS on two rows, 1u pitch
      return this.opts.keys.map((_, i) => new THREE.Vector3((i % 3) - 1, 0, i < 3 ? -0.52 : 0.52));
    }
    let x = 0;
    const widths = this.opts.keys.map((k) => k.widthU ?? 1);
    const total = widths.reduce((a, b) => a + b, 0);
    return widths.map((w) => {
      const p = new THREE.Vector3(x + w / 2 - total / 2, 0, 0);
      x += w;
      return p;
    });
  }

  // ------------------------------------------------------------------ public API

  setTheme(theme: StageTheme) {
    if (theme === this.opts.theme) return;
    this.opts.theme = theme;
    this.buildKeys();
    // theme swap is instant: no intro replay
    for (const k of this.keys) {
      k.drop = 0;
      k.dropDelay = 0;
      k.runtime.pressNode.position.y = k.runtime.restY;
    }
    this.requestFrame();
  }

  setScrollProgress(p: number) {
    this.scroll = THREE.MathUtils.clamp(p, 0, 1);
    this.requestFrame();
  }

  /** Physical key down. Returns true when at least one 3D key matched. */
  keyDown(code: string): boolean {
    let hit = false;
    for (const k of this.keys) {
      if (k.spec.match.includes(code)) {
        k.held.add(code);
        k.runtime.pressTarget = 1;
        hit = true;
      }
    }
    if (hit) this.requestFrame();
    return hit;
  }

  keyUp(code: string) {
    for (const k of this.keys) {
      if (k.held.delete(code) && k.held.size === 0 && this.pressedByPointer !== k.object.userData.keyIndex) {
        k.runtime.pressTarget = this.hovered === k.object.userData.keyIndex ? 0.12 : 0;
      }
    }
    this.requestFrame();
  }

  /** Mexican wave across the row (easter egg / success feedback). */
  wave() {
    this.waveTime = 0;
    this.requestFrame();
  }

  /**
   * "poker": every cap spins a full turn (in a wave) and lands as a playing card —
   * ♣ on the accent key, then 10 J Q K A of clubs: a royal flush across the row.
   * Calling it with false spins them back to V A R G A S.
   */
  setPoker(on: boolean) {
    this.pokerOn = on;
    this.keys.forEach((k, i) => {
      this.ensurePokerMap(k, i);
      k.flip = -i * 0.09;
    });
    this.requestFrame();
  }

  private ensurePokerMap(k: KeyEntry, i: number) {
    if (k.pokerMap) return;
    const rank = POKER_RANKS[i % POKER_RANKS.length];
    k.pokerMap = cardLegendTexture({
      rank,
      corner: rank === '♣' ? 'V' : undefined,
      colorway: colorwayFor(this.opts.theme, k.spec.accent),
      fontFamily: this.opts.fontFamily,
    });
    this.renderer.initTexture(k.pokerMap); // upload now, not mid-spin
  }

  /** Release a held intro: caps drop onto their switches one after another. */
  playIntro() {
    this.opts.holdIntro = false;
    this.keys.forEach((k, i) => {
      if (k.dropDelay === Infinity) k.dropDelay = 0.15 + i * 0.11;
    });
    this.requestFrame();
  }

  /**
   * Compile every shader and upload every texture now, while the loader is up,
   * so the first real frame (and the first RGB/test glow) never stalls.
   */
  async warmup() {
    const r = this.renderer;
    try {
      await r.compileAsync(this.scene, this.camera);
    } catch {
      r.compile(this.scene, this.camera);
    }
    const textures = new Set<THREE.Texture>();
    this.scene.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
      if (!mat) return;
      [mat.map, mat.roughnessMap, mat.bumpMap].forEach((t) => t && textures.add(t));
    });
    this.keys.forEach((k) => k.runtime.tintMap && textures.add(k.runtime.tintMap));
    textures.forEach((t) => r.initTexture(t));
    r.render(this.scene, this.camera);
  }

  /** "segredo": every switch comes apart into its parts, hangs, then reassembles. */
  explode() {
    this.explodeTime = 0;
    this.requestFrame();
  }

  /** "deploy": caps take off from their switches and fall back into place. */
  launch() {
    this.keys.forEach((k, i) => {
      k.launching = true;
      k.drop = Math.max(k.drop, 0.001);
      k.dropVelocity = 12.5 + i * 0.25;
      k.dropDelay = i * 0.09;
    });
    this.requestFrame();
  }

  /** "teste": green "test passed" glow under one key, fading out. */
  flash(index: number) {
    const k = this.keys[index];
    if (!k) return;
    k.flash = 1;
    this.requestFrame();
  }

  /** "rgb": per-switch coloured lights in a rainbow wave. */
  setRgb(on: boolean) {
    this.rgbOn = on;
    this.requestFrame();
  }

  /** Screen position (CSS px) of each cap's underside, for 2D effects like exhaust trails. */
  keyScreenPoints(): { x: number; y: number; flying: boolean }[] {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector3();
    return this.keys.map((k) => {
      k.runtime.pressNode.getWorldPosition(v);
      v.project(this.camera);
      return {
        x: rect.left + ((v.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - v.y) / 2) * rect.height,
        flying: k.launching && k.dropVelocity > 0 && k.drop > 0.05,
      };
    });
  }

  tap(index: number) {
    const k = this.keys[index];
    if (!k) return;
    k.runtime.pressTarget = 1;
    window.setTimeout(() => { if (!k.held.size) k.runtime.pressTarget = 0; }, 140);
    this.requestFrame();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.resizeObserver.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerleave', this.onPointerLeave);
    el.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointermove', this.onWindowPointer);
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const k of this.keys) { disposeObject(k.object); k.pokerMap?.dispose(); }
    if (this.caseMesh) disposeObject(this.caseMesh);
    this.envTexture.dispose();
    this.renderer.dispose();
    el.remove();
  }

  // ------------------------------------------------------------------ events

  private onVisibility = () => {
    if (document.visibilityState === 'visible') this.start();
  };

  private onWindowPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    this.pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    // "sagrav" easter egg rotates the section 180°: mirror the pointer so hover/click still hit the right key
    if (document.documentElement.classList.contains('is-flipped')) this.pointer.multiplyScalar(-1);
    this.updateHover();
  };

  private onPointerLeave = () => {
    this.pointer.set(9, 9);
    this.updateHover();
  };

  private onPointerDown = (e: PointerEvent) => {
    this.onPointerMove(e);
    if (this.hovered === null) return;
    this.pressedByPointer = this.hovered;
    this.keys[this.hovered].runtime.pressTarget = 1;
    this.opts.onActivate?.(this.hovered);
    this.requestFrame();
  };

  private onPointerUp = () => {
    if (this.pressedByPointer === null) return;
    const k = this.keys[this.pressedByPointer];
    if (k && !k.held.size) k.runtime.pressTarget = this.hovered === this.pressedByPointer ? 0.12 : 0;
    this.pressedByPointer = null;
    this.requestFrame();
  };

  private updateHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const caps = this.keys.map((k) => k.runtime.capMesh);
    const hit = this.raycaster.intersectObjects(caps, false)[0];
    const index = hit ? this.keys.findIndex((k) => k.runtime.capMesh === hit.object) : -1;
    const next = index >= 0 ? index : null;
    if (next === this.hovered) return;
    if (this.hovered !== null) {
      const prev = this.keys[this.hovered];
      if (prev && !prev.held.size && this.pressedByPointer !== this.hovered) prev.runtime.pressTarget = 0;
    }
    this.hovered = next;
    if (next !== null) {
      const k = this.keys[next];
      if (!k.held.size && this.pressedByPointer !== next) k.runtime.pressTarget = 0.12;
    }
    this.renderer.domElement.style.cursor = next !== null ? 'pointer' : '';
    this.opts.onHoverChange?.(next);
    this.requestFrame();
  }

  // ------------------------------------------------------------------ loop

  private resize() {
    const { container, layout } = this.opts;
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const wasCompact = this.compact;
    this.compact = layout === 'hero' && (w < 620 || w / h < 1.1);
    if (wasCompact !== this.compact) {
      const positions = this.layoutPositions();
      this.keys.forEach((k, i) => { k.home.copy(positions[i]); k.object.position.copy(positions[i]); });
      this.buildCaseOnly();
    }
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.frameCamera();
    this.requestFrame();
  }

  private buildCaseOnly() {
    // Rebuild everything but keep intro state; cheap enough for a breakpoint flip.
    const drops = this.keys.map((k) => [k.drop, k.dropDelay, k.dropVelocity]);
    this.buildKeys();
    this.keys.forEach((k, i) => {
      if (!drops[i]) return;
      [k.drop, k.dropDelay, k.dropVelocity] = drops[i];
      k.runtime.pressNode.position.y = k.runtime.restY + k.drop;
    });
  }

  private frameCamera() {
    const { layout } = this.opts;
    const box = new THREE.Box3();
    this.keys.forEach((k) => {
      const w = (k.spec.widthU ?? 1) / 2 + 0.3;
      box.expandByPoint(new THREE.Vector3(k.home.x - w, -0.5, k.home.z - 0.8));
      box.expandByPoint(new THREE.Vector3(k.home.x + w, 0.9, k.home.z + 0.8));
    });
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const elevation = THREE.MathUtils.degToRad(layout === 'hero' ? (this.compact ? 52 : 38) : 42);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitW = size.x / 2 / Math.tan(fov / 2) / this.camera.aspect;
    const fitH = Math.max(size.z, size.y) / 2 / Math.tan(fov / 2);
    const margin = layout === 'hero' ? (this.compact ? 1.2 : 1.12) : 1.35;
    const dist = Math.max(fitW, fitH) * margin + 1.2;
    this.camera.position.set(centre.x, centre.y + Math.sin(elevation) * dist, centre.z + Math.cos(elevation) * dist);
    this.camera.lookAt(centre.x, centre.y - 0.05, centre.z);
    this.camera.updateProjectionMatrix();
  }

  private requestFrame() {
    if (!this.raf && this.visible && !this.disposed) this.start();
  }

  private start() {
    if (this.raf || this.disposed) return;
    this.clock.getDelta();
    const loop = () => {
      this.raf = 0;
      if (this.disposed || !this.visible || document.visibilityState !== 'visible') return;
      const busy = this.tick(Math.min(this.clock.getDelta(), 1 / 30));
      this.renderer.render(this.scene, this.camera);
      if (busy) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Advances animation; returns true while anything still moves. */
  private tick(dt: number): boolean {
    const { reducedMotion, layout } = this.opts;
    let busy = false;
    const t = this.clock.elapsedTime;

    // pointer parallax (mouse only), eased
    this.pointerSmooth.lerp(this.pointerTarget, reducedMotion ? 1 : Math.min(1, dt * 4));
    if (this.pointerSmooth.distanceTo(this.pointerTarget) > 0.001) busy = true;
    const tiltY = reducedMotion ? 0 : this.pointerSmooth.x * 0.1;
    const tiltX = reducedMotion ? 0 : this.pointerSmooth.y * 0.05;
    const idle = reducedMotion || layout !== 'hero' ? 0 : Math.sin(t * 0.6) * 0.012;
    this.rig.rotation.set(tiltX + this.scroll * 0.35, tiltY + idle, 0);
    this.rig.position.y = this.scroll * 0.9;
    if (!reducedMotion && layout === 'hero') busy = true; // idle breathing

    // wave easter egg
    if (this.waveTime >= 0) {
      this.waveTime += dt;
      this.keys.forEach((k, i) => {
        const local = this.waveTime - i * 0.08;
        if (!k.held.size) k.runtime.pressTarget = local > 0 && local < 0.14 ? 1 : 0;
      });
      if (this.waveTime > this.keys.length * 0.08 + 0.3) this.waveTime = -1;
      busy = true;
    }

    for (const k of this.keys) {
      // intro: cap falls onto the stem, then the switch spring takes over
      if (k.drop > 0 || k.dropVelocity !== 0) {
        if (k.dropDelay > 0) {
          k.dropDelay -= dt;
        } else {
          k.dropVelocity -= 22 * dt;
          k.drop += k.dropVelocity * dt;
          if (k.drop <= 0) {
            k.drop = 0;
            // landing: transfer impact into the switch (bottom-out click)
            k.runtime.velocity = Math.min(-k.dropVelocity * 1.6, 9);
            k.dropVelocity = 0;
            k.launching = false;
          }
        }
        busy = true;
      }
      stepKeycap(k.object, dt);
      const node = k.runtime.pressNode;
      node.position.y += k.drop;
      node.position.x = 0;
      node.position.z = 0;
      // in flight ("deploy") the cap spins like a thrown coin and settles square on landing
      node.rotation.set(0, k.launching ? k.drop * 0.55 : 0, 0);
      if (Math.abs(k.runtime.press - k.runtime.pressTarget) > 0.002 || Math.abs(k.runtime.velocity) > 0.01) busy = true;
    }

    // "segredo": exploded view — each switch separates in a wave, holds, and reassembles
    if (this.explodeTime >= 0) {
      this.explodeTime += dt;
      const END = 2.6;
      this.keys.forEach((k, i) => {
        const et = this.explodeTime - i * 0.07;
        const e = et <= 0 ? 0 : et < 0.55 ? easeInOut(et / 0.55) : et < 1.35 ? 1 : et < 2.05 ? 1 - easeInOut((et - 1.35) / 0.7) : 0;
        const node = k.runtime.pressNode;
        node.position.addScaledVector(k.capDir, e);
        node.rotation.set(k.capSpin.x * e, node.rotation.y + k.capSpin.y * e, 0);
        for (const p of k.parts) {
          p.obj.position.copy(p.base).addScaledVector(p.dir, e);
          p.obj.rotation.set(0, p.spin.y * e, 0);
        }
      });
      if (this.explodeTime >= END) {
        this.explodeTime = -1;
        for (const k of this.keys) for (const p of k.parts) { p.obj.position.copy(p.base); p.obj.rotation.set(0, 0, 0); }
      }
      busy = true;
    }

    // "rgb" page mode (html.is-rgb, set by the hero): accent caps (V, Enter) follow the
    // same 6 s hue cycle as the CSS accent. Checked here so the contact stage follows too.
    const pageRgb = document.documentElement.classList.contains('is-rgb');
    for (const k of this.keys) {
      const { tintMap, baseMap, capMesh } = k.runtime;
      if (!tintMap || k.flip !== null) continue;
      const mat = capMesh.material as THREE.MeshPhysicalMaterial;
      const rest = this.pokerOn && k.pokerMap ? k.pokerMap : baseMap;
      if (pageRgb && !this.pokerOn) {
        if (mat.map !== tintMap) mat.map = tintMap;
        const hue = (((performance.now() / 6000) * 360 + 18) % 360) / 360;
        mat.color.setHSL(hue, 0.95, this.opts.theme === 'dark' ? 0.5 : 0.42);
        busy = true;
      } else if (mat.map !== rest) {
        mat.map = rest;
        mat.color.set('#ffffff');
      }
    }

    // "rgb": rainbow wave travelling along the row, faded in/out smoothly
    const target = this.rgbOn ? 1 : 0;
    if (this.rgbLevel !== target || this.rgbOn) {
      this.rgbLevel = THREE.MathUtils.clamp(this.rgbLevel + Math.sign(target - this.rgbLevel) * dt * 2.5, 0, 1);
      const level = easeInOut(this.rgbLevel);
      this.keys.forEach((k, i) => {
        if (!k.rgbLight) return;
        const hue = (t * 0.18 + i / this.keys.length) % 1;
        k.rgbLight.color.setHSL(hue, 1, 0.55);
        k.rgbLight.intensity = 2.4 * level;
        const top = k.object.getObjectByName('switch-top-housing') as THREE.Mesh | undefined;
        const mat = top?.material as THREE.MeshPhysicalMaterial | undefined;
        if (mat) {
          mat.emissive.setHSL(hue, 1, 0.45 * level);
          mat.opacity = 0.94 - 0.19 * level;
        }
      });
      busy = true;
    }

    // "poker": each cap spins one full turn around X; the legend swaps while it faces away
    for (const k of this.keys) {
      if (k.flip === null) continue;
      k.flip += dt;
      const p = THREE.MathUtils.clamp(k.flip / 0.6, 0, 1);
      if (p > 0) {
        const node = k.runtime.pressNode;
        node.rotation.x += easeInOut(p) * Math.PI * 2;
        node.position.y += Math.sin(Math.PI * p) * 0.32;
        if (p >= 0.5) {
          const mat = k.runtime.capMesh.material as THREE.MeshPhysicalMaterial;
          const want = this.pokerOn && k.pokerMap ? k.pokerMap : k.runtime.baseMap;
          if (mat.map !== want) { mat.map = want; mat.color.set('#ffffff'); }
        }
      }
      if (p >= 1) { k.flip = null; this.tap(this.keys.indexOf(k)); }
      busy = true;
    }

    // "teste": green pass glow overrides whatever the light was doing, then fades back
    for (const k of this.keys) {
      if (k.flash <= 0 || !k.rgbLight) continue;
      k.flash = Math.max(0, k.flash - dt * 0.9);
      const f = easeInOut(k.flash);
      k.rgbLight.color.lerp(PASS_GREEN, f);
      k.rgbLight.intensity = Math.max(k.rgbLight.intensity, 3 * f);
      const top = k.object.getObjectByName('switch-top-housing') as THREE.Mesh | undefined;
      const mat = top?.material as THREE.MeshPhysicalMaterial | undefined;
      if (mat) mat.emissive.copy(PASS_GREEN).multiplyScalar(0.55 * f);
      if (k.flash === 0 && !this.rgbOn) {
        k.rgbLight.intensity = 0;
        mat?.emissive.setRGB(0, 0, 0);
      }
      busy = true;
    }
    return busy;
  }
}

const PASS_GREEN = new THREE.Color('#3ddc84');

function roundedSlab(w: number, h: number, d: number, r: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hd = d / 2;
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
  const bevel = 0.05;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bevel, 0);
  return geo;
}

function disposeObject(obj: THREE.Object3D) {
  const rt = obj.userData.keycap as KeycapRuntime | undefined;
  rt?.baseMap.dispose();
  rt?.tintMap?.dispose();
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!mesh.geometry.userData.shared) mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const std = m as THREE.MeshStandardMaterial;
      // legend textures are per key; the grain texture is shared and kept
      if (std.map) std.map.dispose();
      m.dispose();
    }
  });
}
