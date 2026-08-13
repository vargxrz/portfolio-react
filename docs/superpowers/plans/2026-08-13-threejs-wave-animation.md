# Three.js Wave Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop Hero SVG blob background with an interactive Three.js wave animation that responds to mouse and scroll, with zero changes to the existing Hero layout.

**Architecture:** A single React component (`ThreeBackground`) manages a Three.js scene with a `PlaneGeometry` deformed by a custom ShaderMaterial. GLSL shaders live in a separate module. Mouse/scroll listeners update shader uniforms each animation frame. Component only mounts on desktop; mobile keeps existing behavior.

**Tech Stack:** React 19, Three.js, GLSL shaders (inline value-noise + fBm, no external noise library), existing `ThemeContext`.

**Spec:** `docs/superpowers/specs/2026-08-13-threejs-wave-animation-design.md`

---

## File Structure

```
src/components/
  ThreeBackground.jsx          ← new: React component wrapper for Three.js scene
  ThreeBackground.css          ← new: absolute positioning for canvas container
  shaders/
    waveShaders.js             ← new: exports vertexShader and fragmentShader strings
  Hero.jsx                     ← modify: swap InteractiveCanvas for ThreeBackground on desktop

package.json                   ← modify: add three dependency
```

**Design decisions:**
- Shaders in a separate module — GLSL is long and reads better isolated from JS.
- `useRef` for the container div; Three.js manages its own canvas inside it.
- Theme changes handled via a ref inside the RAF loop (no scene recreation on theme toggle).
- `ResizeObserver` on the container, not `window` — more reliable for the actual canvas dimensions.

---

## Task 1: Install three dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install three**

Run from the project root:

```bash
npm install three
```

Expected: `package.json` now lists `three` under `dependencies`. `package-lock.json` updated.

- [ ] **Step 2: Verify install**

Run:

```bash
node -e "console.log(require('three').REVISION)"
```

Expected: prints a revision number (e.g. `168` or higher). Confirms `three` resolves.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add three.js dependency for wave background"
```

---

## Task 2: Create shader module

**Files:**
- Create: `src/components/shaders/waveShaders.js`

The vertex shader displaces plane Y (world Z after rotation) using 4-octave fBm value noise, plus a mouse-driven ripple. The fragment shader colors line vertices with intensity based on wave height and fades near the plane edges so the canvas doesn't have hard rectangular borders.

- [ ] **Step 1: Create shaders directory and file**

Create the directory:

```bash
mkdir -p src/components/shaders
```

- [ ] **Step 2: Write the shader module**

Create `src/components/shaders/waveShaders.js` with the following content:

```javascript
export const vertexShader = /* glsl */ `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uAmplitude;

    varying float vHeight;
    varying vec2 vUv;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
        float v = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
            v += amp * noise(p);
            p = p * 2.1 + vec2(1.7, 9.2);
            amp *= 0.5;
        }
        return v;
    }

    void main() {
        vUv = uv;
        vec3 pos = position;

        vec2 flow1 = pos.xy * 0.8 + uTime * 0.15;
        vec2 flow2 = pos.xy * 0.6 - uTime * 0.12 + vec2(5.2, 1.3);
        float height = (fbm(flow1) + fbm(flow2) * 0.5 - 0.7) * uAmplitude;

        float dist = length(pos.xy - uMouse * 2.5);
        float ripple = sin(dist * 8.0 - uTime * 3.0) * exp(-dist * 2.5) * 0.15;
        height += ripple;

        vHeight = height;
        pos.z = height;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

export const fragmentShader = /* glsl */ `
    precision mediump float;

    uniform vec3 uColor;
    uniform float uOpacity;

    varying float vHeight;
    varying vec2 vUv;

    void main() {
        float edge = min(min(vUv.x, vUv.y), min(1.0 - vUv.x, 1.0 - vUv.y));
        float edgeFade = smoothstep(0.0, 0.2, edge);

        float intensity = clamp(0.4 + vHeight * 1.5, 0.15, 1.0);

        float alpha = intensity * edgeFade * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
    }
`;
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/waveShaders.js
git commit -m "feat: add wave vertex and fragment shaders"
```

---

## Task 3: Create ThreeBackground CSS

**Files:**
- Create: `src/components/ThreeBackground.css`

- [ ] **Step 1: Write CSS file**

Create `src/components/ThreeBackground.css`:

```css
.three-background {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
}

.three-background canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
}
```

`pointer-events: none` ensures Hero buttons and links stay clickable. `!important` on canvas dimensions overrides Three.js's inline sizing when the ResizeObserver drives layout.

- [ ] **Step 2: Commit**

```bash
git add src/components/ThreeBackground.css
git commit -m "feat: add ThreeBackground CSS"
```

---

## Task 4: Create ThreeBackground component with basic scene

Sets up the scene, camera, geometry, material, renderer, resize handling, and RAF loop with only the time-driven wave — no mouse, no scroll, no theme reactivity yet.

**Files:**
- Create: `src/components/ThreeBackground.jsx`

- [ ] **Step 1: Write initial component**

Create `src/components/ThreeBackground.jsx`:

```jsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders/waveShaders';
import './ThreeBackground.css';

const DEFAULT_COLOR = new THREE.Color(0xA855F7);

const ThreeBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(5, 5, 80, 80);

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uAmplitude: { value: 0.25 },
            uColor: { value: DEFAULT_COLOR.clone() },
            uOpacity: { value: 1.0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            wireframe: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 6;
        scene.add(mesh);

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = container;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        const clock = new THREE.Clock();
        let rafId;

        const render = () => {
            uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="three-background" />;
};

export default ThreeBackground;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThreeBackground.jsx
git commit -m "feat: add ThreeBackground component with time-driven wave"
```

---

## Task 5: Add mouse ripple interaction

**Files:**
- Modify: `src/components/ThreeBackground.jsx`

Attach a `mousemove` listener on `window`, convert screen coords to normalized `-1..1` range, and lerp toward it inside the RAF loop for smooth follow.

- [ ] **Step 1: Update ThreeBackground.jsx**

Replace the entire `useEffect` body with the version below (adds `targetMouse`, listener, and lerp inside `render`):

```jsx
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(5, 5, 80, 80);

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uAmplitude: { value: 0.25 },
            uColor: { value: DEFAULT_COLOR.clone() },
            uOpacity: { value: 1.0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            wireframe: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 6;
        scene.add(mesh);

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = container;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        const targetMouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('mousemove', handleMouseMove);

        const clock = new THREE.Clock();
        let rafId;

        const render = () => {
            uniforms.uTime.value = clock.getElapsedTime();

            uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.05;
            uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.05;

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
            resizeObserver.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThreeBackground.jsx
git commit -m "feat: add mouse ripple to wave background"
```

---

## Task 6: Add scroll-driven transforms

**Files:**
- Modify: `src/components/ThreeBackground.jsx`

Scroll progress (0..1 across the Hero's viewport height) drives amplitude, opacity, and mesh tilt.

- [ ] **Step 1: Update ThreeBackground.jsx**

Replace the entire `useEffect` body with the version below (adds `scrollProgress`, scroll listener, and scroll-driven uniform + tilt updates in `render`):

```jsx
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(5, 5, 80, 80);

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uAmplitude: { value: 0.25 },
            uColor: { value: DEFAULT_COLOR.clone() },
            uOpacity: { value: 1.0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            wireframe: true,
        });

        const BASE_TILT = -Math.PI / 6;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = BASE_TILT;
        scene.add(mesh);

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = container;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        const targetMouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('mousemove', handleMouseMove);

        let scrollProgress = 0;
        const handleScroll = () => {
            const heroHeight = window.innerHeight;
            scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        const clock = new THREE.Clock();
        let rafId;

        const render = () => {
            uniforms.uTime.value = clock.getElapsedTime();

            uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.05;
            uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.05;

            uniforms.uAmplitude.value = 0.25 + scrollProgress * 0.5;
            uniforms.uOpacity.value = 1 - scrollProgress;
            mesh.rotation.x = BASE_TILT - scrollProgress * 0.8;

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };
        rafId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThreeBackground.jsx
git commit -m "feat: add scroll-driven amplitude, opacity, and tilt to wave"
```

---

## Task 7: Add theme-aware color and prefers-reduced-motion

**Files:**
- Modify: `src/components/ThreeBackground.jsx`

Consume `ThemeContext`. Store the current theme in a ref so the RAF loop can read the latest value without re-running the effect (which would destroy and recreate the entire scene). Lerp the color uniform toward the target theme color each frame for a smooth transition. Skip the animation loop if `prefers-reduced-motion` is set — render one static frame.

- [ ] **Step 1: Update ThreeBackground.jsx**

Replace the entire file with the final version:

```jsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { vertexShader, fragmentShader } from './shaders/waveShaders';
import './ThreeBackground.css';

const LIGHT_COLOR = new THREE.Color(0xEA580C);
const DARK_COLOR = new THREE.Color(0xA855F7);

const ThreeBackground = () => {
    const containerRef = useRef(null);
    const { theme } = useTheme();
    const themeRef = useRef(theme);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 2.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(5, 5, 80, 80);

        const initialColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR;

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uAmplitude: { value: 0.25 },
            uColor: { value: initialColor.clone() },
            uOpacity: { value: 1.0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            transparent: true,
            wireframe: true,
        });

        const BASE_TILT = -Math.PI / 6;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = BASE_TILT;
        scene.add(mesh);

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = container;
            if (w === 0 || h === 0) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        const targetMouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e) => {
            targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };

        let scrollProgress = 0;
        const handleScroll = () => {
            const heroHeight = window.innerHeight;
            scrollProgress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        };

        const clock = new THREE.Clock();
        let rafId;

        const render = () => {
            uniforms.uTime.value = clock.getElapsedTime();

            uniforms.uMouse.value.x += (targetMouse.x - uniforms.uMouse.value.x) * 0.05;
            uniforms.uMouse.value.y += (targetMouse.y - uniforms.uMouse.value.y) * 0.05;

            uniforms.uAmplitude.value = 0.25 + scrollProgress * 0.5;
            uniforms.uOpacity.value = 1 - scrollProgress;
            mesh.rotation.x = BASE_TILT - scrollProgress * 0.8;

            const targetColor = themeRef.current === 'dark' ? DARK_COLOR : LIGHT_COLOR;
            uniforms.uColor.value.lerp(targetColor, 0.1);

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };

        if (prefersReduced) {
            renderer.render(scene, camera);
        } else {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('scroll', handleScroll, { passive: true });
            rafId = requestAnimationFrame(render);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="three-background" />;
};

export default ThreeBackground;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThreeBackground.jsx
git commit -m "feat: add theme-aware color and prefers-reduced-motion to wave"
```

---

## Task 8: Wire ThreeBackground into Hero

**Files:**
- Modify: `src/components/Hero.jsx` (line 5 import, line 179 conditional render)

- [ ] **Step 1: Add import**

In `src/components/Hero.jsx`, change line 5 from:

```jsx
import InteractiveCanvas from './InteractiveCanvas';
```

to:

```jsx
import InteractiveCanvas from './InteractiveCanvas';
import ThreeBackground from './ThreeBackground';
```

(Keep the `InteractiveCanvas` import — it stays available even though we swap the desktop render.)

- [ ] **Step 2: Swap the desktop background**

In `src/components/Hero.jsx`, find line 179:

```jsx
                {!isMobile && <InteractiveCanvas />}
```

Replace with:

```jsx
                {!isMobile && <ThreeBackground />}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "feat: swap Hero desktop background to Three.js wave"
```

---

## Task 9: Manual verification

**Files:** none (verification only)

Start the dev server and walk through the checklist below. Each item is a real interaction that must work.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open the printed URL in a desktop browser.

- [ ] **Step 2: Verify Hero renders correctly**

Check: Hero heading ("Designer & Developer blending creativity with code"), subtitle ("João Vargas"), "View work" button, "Download CV" link, "AVAILABLE FOR OPPORTUNITIES" label, and scroll indicator are all visually identical to before — same fonts, same positions, same colors. Only the background is different.

Expected: All text/buttons untouched. Behind them, a subtle orange (light mode) wireframe wave animates continuously.

- [ ] **Step 3: Verify mouse interaction**

Move the mouse across the Hero section.

Expected: A subtle ripple travels through the wave following the cursor with a smooth lag.

- [ ] **Step 4: Verify scroll interaction**

Slowly scroll from top to below the fold and back.

Expected: As you scroll down, the wave tilts back, its amplitude grows, and its opacity fades to zero by the end of the first viewport. Scrolling back up reverses the effect.

- [ ] **Step 5: Verify theme toggle**

Click the theme toggle in the header.

Expected: Wave color smoothly transitions from orange (#EA580C) to purple (#A855F7) or vice versa. No flash, no scene rebuild.

- [ ] **Step 6: Verify buttons still work**

Click "View work" and "Download CV".

Expected: Scroll-to-work works. CV downloads. The wave background does not block clicks.

- [ ] **Step 7: Verify mobile fallback**

In DevTools, switch to a mobile viewport (iPhone SE or similar) and reload.

Expected: No `ThreeBackground` renders. No canvas, no console errors. The existing mobile layout is unchanged.

- [ ] **Step 8: Verify prefers-reduced-motion**

In DevTools → Rendering panel, enable "Emulate CSS media feature prefers-reduced-motion: reduce". Reload.

Expected: Wave renders one static frame, no continuous animation. No performance cost.

- [ ] **Step 9: Verify performance**

In DevTools → Performance panel, record 5 seconds of the Hero with the wave animating. Check FPS.

Expected: Steady 60fps on a modern desktop GPU. No dropped frames from the wave itself.

- [ ] **Step 10: Verify no console errors**

Check DevTools console during all of the above.

Expected: No errors. No Three.js warnings about disposed materials or memory leaks after route/component unmount (test by opening/closing devtools panels or resizing rapidly).

- [ ] **Step 11: Final commit (only if fixes were needed)**

If any of steps 2–10 exposed issues that required code changes, commit those fixes with a message like:

```bash
git commit -m "fix: <specific issue>"
```

If everything passed on the first try, no commit is needed here.
