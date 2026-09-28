// Full-screen 2D particle effects for the hero easter eggs. Each call mounts a
// fixed, click-through canvas, runs until its particles die, then removes itself.

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function runOverlay(setup, { maxMs = 6000 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '90' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const step = setup({ w: () => window.innerWidth, h: () => window.innerHeight });
  const start = performance.now();
  let last = start;
  const loop = (now) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const alive = step(ctx, dt, (now - start) / 1000);
    if (alive && now - start < maxMs) requestAnimationFrame(loop);
    else {
      window.removeEventListener('resize', resize);
      canvas.remove();
    }
  };
  requestAnimationFrame(loop);
}

const rand = (a, b) => a + Math.random() * (b - a);

/** "ana": hearts floating up with a gentle sway. */
export function hearts() {
  const palette = ['#f06a3b', '#ff4d6d', '#ff8fa3', '#e63946', cssVar('--ink') || '#ede4d3'];
  runOverlay(({ w, h }) => {
    const list = [];
    return (ctx, dt, t) => {
      if (t < 2.2) {
        for (let i = 0; i < 3; i += 1) {
          list.push({
            x: rand(0, 1) * w(), y: h() + 30, s: rand(10, 30), vy: rand(-230, -120), sway: rand(0.8, 2),
            phase: rand(0, 6), rot: rand(-0.4, 0.4), color: palette[Math.floor(rand(0, palette.length))], life: 0,
          });
        }
      }
      for (const p of list) {
        p.life += dt;
        p.y += p.vy * dt;
        const x = p.x + Math.sin(p.life * p.sway + p.phase) * 28;
        const fade = Math.min(1, p.life * 3) * Math.min(1, Math.max(0, (p.y + 40) / (h() * 0.35)));
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(x, p.y);
        ctx.rotate(p.rot + Math.sin(p.life * 2 + p.phase) * 0.15);
        heartPath(ctx, p.s);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
      for (let i = list.length - 1; i >= 0; i -= 1) if (list[i].y < -60) list.splice(i, 1);
      return t < 2.2 || list.length > 0;
    };
  }, { maxMs: 9000 });
}

/** "joao": a shower of keycaps labelled with his stack, bouncing off the bottom edge. */
export function keycapRain(labels) {
  const top = cssVar('--cap-top') || '#efe6d4';
  const shade = cssVar('--cap-shade') || '#9f927b';
  const legend = cssVar('--cap-legend') || '#151515';
  runOverlay(({ w, h }) => {
    const caps = [];
    let spawned = 0;
    const total = Math.min(46, labels.length * 2);
    return (ctx, dt, t) => {
      ctx.font = '650 14px Archivo, Arial, sans-serif';
      while (spawned < total && spawned < t * 22) {
        const label = labels[spawned % labels.length];
        caps.push({
          label, width: Math.max(36, ctx.measureText(label).width + 22),
          x: rand(0.05, 0.95) * w(), y: rand(-120, -40), vx: rand(-60, 60), vy: rand(0, 80),
          rot: rand(-0.6, 0.6), vr: rand(-2.5, 2.5), accent: label === 'TDD' || label === '2–3 min', bounces: 0,
        });
        spawned += 1;
      }
      for (const c of caps) {
        c.vy += 1400 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt;
        const floor = h() - 24;
        if (c.y > floor && c.bounces < 2) {
          c.y = floor;
          c.vy *= -0.42;
          c.vr *= 0.6;
          c.bounces += 1;
        }
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        roundRect(ctx, -c.width / 2, -11, c.width, 30, 7);
        ctx.fillStyle = c.accent ? '#9c3a19' : shade;
        ctx.fill();
        roundRect(ctx, -c.width / 2, -15, c.width, 30, 7);
        ctx.fillStyle = c.accent ? '#f06a3b' : top;
        ctx.fill();
        ctx.fillStyle = c.accent ? '#1b1410' : legend;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.label, 0, 1);
        ctx.restore();
      }
      for (let i = caps.length - 1; i >= 0; i -= 1) if (caps[i].y > h() + 80) caps.splice(i, 1);
      return spawned < total || caps.length > 0;
    };
  }, { maxMs: 8000 });
}

/** "segredo": short RGB-split glitch on the hero title (CSS lives in main.css). */
export function glitch(ms = 650) {
  const root = document.documentElement;
  root.classList.remove('is-glitch');
  // force restart of the animation when triggered twice in a row
  void root.offsetWidth;
  root.classList.add('is-glitch');
  window.setTimeout(() => root.classList.remove('is-glitch'), ms);
}

/**
 * "deploy": rocket exhaust under every cap that is currently flying.
 * `getPoints` returns screen positions from the 3D stage each frame.
 */
export function exhaust(getPoints, ms = 3200) {
  runOverlay(() => {
    const puffs = [];
    return (ctx, dt, t) => {
      if (t * 1000 < ms) {
        for (const p of getPoints()) {
          if (!p.flying) continue;
          // flame core
          const g = ctx.createRadialGradient(p.x, p.y + 6, 0, p.x, p.y + 6, 26);
          g.addColorStop(0, 'rgba(255, 236, 190, 0.95)');
          g.addColorStop(0.35, 'rgba(255, 140, 60, 0.75)');
          g.addColorStop(1, 'rgba(240, 106, 59, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 14, 14, 30, 0, 0, Math.PI * 2);
          ctx.fill();
          if (Math.random() < 0.7) {
            puffs.push({ x: p.x + rand(-6, 6), y: p.y + 20, vx: rand(-25, 25), vy: rand(60, 150), r: rand(4, 8), life: 0, max: rand(0.6, 1.1) });
          }
        }
      }
      for (const s of puffs) {
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy *= 0.97;
        s.r += 22 * dt;
        const k = s.life / s.max;
        const heat = Math.max(0, 1 - k * 2.2);
        const a = Math.max(0, 1 - k) * 0.3;
        ctx.fillStyle = `rgba(${Math.round(150 + 105 * heat)}, ${Math.round(150 - 20 * heat)}, ${Math.round(150 - 90 * heat)}, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = puffs.length - 1; i >= 0; i -= 1) if (puffs[i].life > puffs[i].max) puffs.splice(i, 1);
      return t * 1000 < ms || puffs.length > 0;
    };
  }, { maxMs: ms + 2500 });
}

const GRAVITY_SELECTOR = [
  '.brand', '.site-nav a', '.tool-btn', '.hero__status', '.hero__where', '.hero__line', '.hero__stage',
  '.hero__lede', '.hero__hint .eyebrow', '.hero__typed-key', '.hero__egg', '.btn',
  '.section-head', 'main h2', 'main h3', '.lede', '.cap', '.metric', '.flow__step', '.shipped__row',
  '.project', '.timeline__item', '.education', '.extra li', '.social', '.contact__mail', '.contact__stage',
].join(',');

/**
 * "gravidade": everything visible drops to the bottom of the screen and piles up.
 * Returns a function that floats it all back.
 */
export function gravity() {
  const vh = window.innerHeight;
  const all = [...document.querySelectorAll(GRAVITY_SELECTOR)];
  const inView = all.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh && r.width > 0;
  });
  // only outermost matches, so a card and its own title don't fall separately
  const bodies = inView
    .filter((el) => !inView.some((other) => other !== el && other.contains(el)))
    .map((el) => {
      const r = el.getBoundingClientRect();
      const fall = Math.max(0, vh - r.bottom - rand(0, 10));
      return {
        el, fall, top: r.top,
        // lower elements go first, so the page "unzips" from the bottom up
        delay: (1 - r.bottom / vh) * 0.35 + rand(0, 0.06),
        tilt: rand(-7, 7),
        dur: 0.55 + Math.sqrt(fall / vh) * 0.45,
      };
    });
  for (const b of bodies) {
    b.el.style.transition = 'none';
    b.el.style.willChange = 'transform';
  }
  // fall = accelerating ease-in, then one small damped bounce; no per-body randomness in motion
  const fallEase = (p) => {
    if (p < 0.72) { const q = p / 0.72; return q * q; }
    const q = (p - 0.72) / 0.28;
    return 1 - Math.sin(q * Math.PI) * 0.06 * (1 - q);
  };
  const start = performance.now();
  let stopped = false;
  const loop = (now) => {
    if (stopped) return;
    const t = (now - start) / 1000;
    let moving = false;
    for (const b of bodies) {
      const p = Math.min(1, Math.max(0, (t - b.delay) / b.dur));
      if (p < 1) moving = true;
      const y = b.fall * fallEase(p);
      const rot = b.tilt * Math.min(1, p * 1.4);
      b.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
    }
    if (moving) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  return () => {
    stopped = true;
    // float back top-first with a soft overshoot
    [...bodies].sort((a, b) => a.top - b.top).forEach((b, i) => {
      b.el.style.transition = `transform 0.75s cubic-bezier(0.34, 1.3, 0.64, 1) ${i * 0.018}s`;
      b.el.style.transform = '';
      window.setTimeout(() => { b.el.style.transition = ''; b.el.style.willChange = ''; }, 800 + i * 18);
    });
  };
}

function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.55, -s * 1.05, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.55, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
