# Work Section Zig-Zag Redesign

**Goal:** Redesign the Work/Projects section from the current bento-grid card layout into an editorial zig-zag layout that feels clean, modern, and eye-catching without relying on images.

**Motivation:** Current bento grid is clean but visually flat — nothing pulls the eye. The new layout uses typographic scale (large serif numbers) and alternating rhythm to create a magazine-like editorial presence.

**Non-goals:**
- No project thumbnails, screenshots, or images
- No horizontal scroll or scroll-jacking
- No content changes beyond the Finassa swap listed below

---

## Layout

**Desktop (≥768px):**
- 4 project rows stacked vertically, alternating sides ("zig-zag")
- Odd rows (1, 3): `[number-left | content-right]` — grid columns `280px 1fr`
- Even rows (2, 4): `[content-left | number-right]` — grid columns `1fr 280px`
- Gap between number and content: `40px`
- Row vertical padding: `40px 0`
- Thin bottom divider between rows (`rgba(text, 0.06)`), no divider on last row

**Mobile (<768px):**
- Rows stack single-column, number stays at top-left of each row
- Number scales down to `~96px`
- Content text-align stays left regardless of desktop side
- No alternating; all rows visually identical

---

## Row Anatomy

Each row contains:

1. **Number** — Crimson Pro, `font-weight: 200`, `font-size: 180px` (desktop), `line-height: 0.85`. Color: `rgba(text-primary, 0.12)` — ghost/faint by default. `user-select: none`.
2. **Category label** — DM Mono, `10px`, `letter-spacing: 0.16em`, uppercase. Color: `var(--color-accent)`.
3. **Title** — Crimson Pro, `font-weight: 300`, `font-size: 42px` (desktop, clamp to `clamp(1.75rem, 4vw, 2.625rem)`), `line-height: 1.05`. Split into two parts: a plain-weight leading word + an `<em>` italic accent-colored trailing word (e.g., "Virtual *Menu*", "Finassa *Finance*").
4. **Description** — sans, `14px`, `line-height: 1.6`, `color: text-secondary`, `max-width: 480px`.
5. **Tech tags** — DM Mono `10px`, `padding: 4px 12px`, `border: 1px solid rgba(text, 0.15)`, `border-radius: 100px`.
6. **Link label** — DM Mono `11px`, `letter-spacing: 0.1em`, uppercase (e.g., `VIEW LIVE →` / `VIEW CODE →`). Color: `rgba(text, 0.4)` default.

On right-side rows the content column is right-aligned (text-align + tags justified end + desc `margin-left: auto`).

---

## Hover Behavior (Desktop)

On row hover:
- **Number**: opacity 12% → 100% accent color, `scale(1.05)`, transition `0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- **Title (`<em>` accent part)**: no color change (already accent). Non-accent part shifts to `color-text-primary` — mostly imperceptible but adds slight boldening feel
- **Link label**: `rgba(text, 0.4)` → accent color, arrow slides `4px` right
- **Tags**: border transitions `rgba(text, 0.15)` → `rgba(accent, 0.4)`
- **Divider**: unchanged (kept subtle to preserve rhythm)

Whole row is a single `<a>` element pointing to `project.links.live || project.links.github`.

Reduced-motion: disable transform/scale; color transitions still fire.

---

## Data Changes

Replace project #02 (ZIP Code Finder) with:

```js
{
  number: "02",
  title: "Finassa",
  titleAccent: "Finance",              // italic accent word
  description: "Personal finance management app, mobile-first. Track spending, budgets, and financial goals with a clean interface.",
  tech: ["TypeScript", "React", "Mobile-first"],
  links: {
    live: null,
    github: "https://github.com/vargxrz/finassa"
  },
  featured: false,
  category: "Mobile App"
}
```

All 4 projects also gain a `titleAccent` field (the italic word). Suggested split:

| # | title | titleAccent |
|---|-------|-------------|
| 01 | Virtual | Menu |
| 02 | Finassa | Finance |
| 03 | Push | Notifications |
| 04 | CRUD | Spring Boot |

---

## Section Header

Unchanged — keeps existing label (`Featured Work`), heading (`Turning Ideas Into Reality`), and description paragraph. Only the grid below is rebuilt.

---

## Files Touched

- **Modify** `src/components/Work.jsx` — swap project data (Finassa in, ZIP out; add `titleAccent`), rebuild the grid render into zig-zag rows
- **Rewrite** `src/components/Work.css` — remove bento grid rules and old card styles; add zig-zag row rules + hover states + mobile stack
- No other files affected

`useIsMobile`, `useScrollAnimation`, and framer-motion stagger animations on scroll are preserved.

---

## Success Criteria

- Section reads as editorial/magazine, not as a card grid
- Number is unmistakably the visual anchor of each row
- Zig-zag rhythm is obvious on desktop; graceful stack on mobile
- Hover feels intentional and rewards interaction without being noisy
- All 4 rows navigate to their live/repo link on click
- Reduced-motion users see color changes but no transforms
- No layout shift when hovering (transforms use scale from center)
