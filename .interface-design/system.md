# Simplefit — Interface Design System

## Direction & Feel

**Product:** Fitness management app targeting motivated athletes who want clarity over complexity.
**Feel:** Precise, powerful, uncomplicated. Athletic compression. No decoration for decoration's sake.
**Depth strategy:** Borders-only — no decorative shadows. Technical and focused like a training log.

---

## Token Architecture

```css
/* Brand */
--brand:        #e8175d;
--brand-hover:  #c4134f;

/* Foreground hierarchy */
--ink-1: #f2f2f2;   /* primary text   */
--ink-2: #999999;   /* secondary text */
--ink-3: #555555;   /* labels / meta  */

/* Surface elevation */
--canvas:    #0a0a0a;   /* page base    */
--surface-1: #111111;   /* cards / bars */

/* Border progression */
--border-soft:   rgba(255, 255, 255, 0.06);
--border-std:    rgba(255, 255, 255, 0.10);
--border-strong: rgba(255, 255, 255, 0.20);

/* Nav */
--nav-bg: rgba(10, 10, 10, 0.88);
--nav-h:  68px;

/* Spacing (8-base) */
--sp-1:  8px;
--sp-2: 16px;
--sp-3: 24px;
--sp-4: 32px;
--sp-6: 48px;

/* Typography */
--font: 'Inter', 'Segoe UI', system-ui, sans-serif;
```

---

## Signature Elements

1. **Eyebrow dot** — 5×5px `--brand` circle before eyebrow text. Never use text alone.
2. **Compressed headlines** — `line-height: 0.92`, `font-weight: 900`, `letter-spacing: -0.03em`. Athletic, stacked.
3. **Ghost logomark** — Logo at `opacity: 0.04`, bottom-right, `filter: invert(1)`. Anchors the hero.
4. **Left-asymmetric hero** — Text left-aligned with overlay `108deg` linear gradient; image visible on the right.
5. **Stats as design elements** — Numbers `font-weight: 900`, `letter-spacing: -0.025em`. Data is design.

---

## Typography Scale

| Role       | Size                          | Weight | Tracking     | Line-height |
|------------|-------------------------------|--------|--------------|-------------|
| Hero H1    | `clamp(3.8rem, 8.5vw, 7.5rem)`| 900    | `-0.03em`    | `0.92`      |
| Section H2 | `clamp(2rem, 4vw, 3.5rem)`    | 800    | `-0.02em`    | `1`         |
| Body       | `clamp(0.95rem, 1.4vw, 1.05rem)` | 400 | `0`          | `1.7`       |
| Label/eyebrow | `0.75rem`                  | 600    | `0.22em`     | —           |
| Nav link   | `0.78rem`                     | 500    | `0.1em`      | —           |
| Stat value | `clamp(1.8rem, 2.8vw, 2.6rem)`| 900    | `-0.025em`   | `1`         |
| Stat label | `0.7rem`                      | 600    | `0.18em`     | —           |

All nav links and buttons: `text-transform: uppercase`.

---

## Spacing

Base unit: `8px`. Use only multiples: `8, 16, 24, 32, 48`.
Avoid arbitrary values — if something needs `12px`, use `8px` or `16px`.

---

## Component Patterns

### Navbar
- Fixed, `height: 68px`, `backdrop-filter: blur(14px)`, `border-bottom: 1px solid --border-soft`
- Logo + name (uppercase, weight 800) on the left
- Links (`--ink-3` → `--ink-1` on hover) in the center
- Primary CTA button on the right (`--brand`, `border-radius: 4px`)
- Same background as canvas — no color shift

### Hero
- `min-height: 100svh`, left-aligned content (`max-width: 680px`)
- Background image with `108deg` linear gradient overlay (heavy left, fades right)
- Structure: eyebrow dot → H1 (3 lines, compressed) → sub copy → two buttons
- Ghost logomark: `position: absolute`, `right: -80px`, `bottom: -80px`, `opacity: 0.04`

### Stats Strip
- 4-column grid, `background: --surface-1`, `border-top: 1px solid --border-soft`
- Each cell: `border-right: 1px solid --border-soft`, last child no border
- Value large + heavy, label tiny + spaced + uppercase

### Buttons
- **Primary:** `background: --brand`, `border-radius: 4px`, `padding: 0.9rem 2.5rem`
- **Secondary:** `border: 1px solid --border-std`, transparent background, `--ink-2` text
- Hover: color/border shift only — no transform, no shadow
- All: `font-weight: 700`, `letter-spacing: 0.14em`, `text-transform: uppercase`

---

## Rules

- Dark surfaces: same hue shifted in lightness only, never different hues
- Color communicates — brand red only for actions and accents, never decoration
- Borders-only depth — no `box-shadow` on layout components
- One accent color (`--brand`), used with intention
- `border-radius: 4px` on all interactive controls — sharp, technical
