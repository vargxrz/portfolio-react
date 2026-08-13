# Three.js Wave Animation — Design Spec

**Date:** 2026-08-13  
**Status:** Approved

## Goal

Add a memorable 3D wave animation to the Hero section background on desktop. Zero layout changes — same fonts, same positions, same colors. Only the background gains life.

## What Changes

| File | Action |
|------|--------|
| `src/components/ThreeBackground.jsx` | Create (new) |
| `src/components/ThreeBackground.css` | Create (new) |
| `src/components/Hero.jsx` | Replace `<InteractiveCanvas />` with `<ThreeBackground />` on desktop |
| `package.json` | Add `three` dependency |

**Nothing else changes.** Header, Work, Footer, all typography, all colors, all button positions — untouched.

## ThreeBackground Component

### Scene Setup

- **Renderer:** `THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })`
- **Geometry:** `THREE.PlaneGeometry(5, 5, 80, 80)` — 80×80 segments (~6500 vertices), gives smooth wave detail
- **Material:** `THREE.ShaderMaterial` with custom vertex + fragment shaders
- **Render mode:** Wireframe via `gl.LINES` (index buffer) — editorial, elegant
- **Camera:** `THREE.PerspectiveCamera(60, aspect, 0.1, 100)` positioned at `(0, 0, 2.5)`, looking at origin
- Plane rotated `rotateX(-Math.PI / 6)` at rest to show perspective

### Vertex Shader

Uses 4-octave fBm (fractional Brownian motion) via value noise (no external lib — ~30 lines of GLSL inline).

Uniforms:
- `uTime` — float, elapsed seconds, drives continuous wave flow
- `uMouse` — vec2, normalized mouse position (-1 to 1), drives local ripple
- `uAmplitude` — float, wave height scalar (increases on scroll)
- `uTiltX` — float, rotation angle (increases on scroll)

Mouse ripple: `sin(dist * 8.0 - uTime * 3.0) * exp(-dist * 2.5) * 0.15` — decays with distance.

### Fragment Shader

Colors each line vertex based on displacement height + accent color uniform.

Uniforms:
- `uColor` — vec3, accent RGB
- `uOpacity` — float, overall opacity

### Theme Awareness

Reads from `ThemeContext`. On theme change, updates:
- `uColor`: light mode `#EA580C` (orange), dark mode `#A855F7` (purple)
- Background clear color: light `#FAFAF9`, dark `#0A0A0A`

### Mouse Interaction (desktop only)

- `mousemove` listener on `window`
- Normalized to `-1..1` range
- Lerped with factor `0.05` per frame for smooth lag
- Passed as `uMouse` uniform each frame

### Scroll Interaction

- `scroll` listener on `window`
- Maps `scrollY` from `0` to `heroHeight` (viewport height)
- Progress `p` = `scrollY / heroHeight` clamped `0..1`
- Drives:
  - `uAmplitude`: `0.25 + p * 0.5` (calm → chaotic)
  - `uTiltX`: `p * 0.8` radians (plane tilts back)
  - `uOpacity`: `1 - p` (fade to invisible)

### Positioning (CSS)

```css
.three-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none; /* content above remains clickable */
}
canvas {
  width: 100%;
  height: 100%;
}
```

Hero content already has `position: relative; z-index: 1` — no changes needed.

### Performance

- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2x
- `ResizeObserver` for responsive canvas resize (not window resize, to avoid hero-height bugs)
- `cancelAnimationFrame` in `useEffect` cleanup
- Listeners removed on unmount
- Respects `prefers-reduced-motion`: if true, skips `requestAnimationFrame`, renders one static frame

### Mobile

`ThreeBackground` is never mounted on mobile. `Hero.jsx` already gates on `!isMobile`:

```jsx
{!isMobile && <ThreeBackground />}
// mobile keeps existing <InteractiveCanvas /> SVG
```

## Dependency

```bash
npm install three
```

No other new dependencies. No GSAP, no noise lib, no post-processing.

## File Structure After

```
src/components/
  ThreeBackground.jsx   ← new
  ThreeBackground.css   ← new
  InteractiveCanvas.jsx ← unchanged (mobile)
  Hero.jsx              ← 2-line change (import + replace)
```

## Success Criteria

- Wave animates at 60fps on modern desktop GPU
- Mouse causes visible ripple in the wave surface
- Scroll smoothly tilts + fades the wave as user leaves Hero
- Light/dark theme switch updates wave color instantly
- All Hero text, buttons, and layout visually identical to current
- Mobile: zero regression, SVG blob unchanged
