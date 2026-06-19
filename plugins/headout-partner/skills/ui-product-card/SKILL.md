---
name: ui-product-card
description: Build the experiences/activities product card — the standard card used in every listing surface (city, category, collection, search, home). Pixel-exact spec for the card shell, image carousel with hover activation, L1 badge overlay, content area (rating, title, descriptor, price block), hover lift animation, press shrink, and the 4-column grid that hosts the cards. Includes strict measurements, eevee/Panda token values, and interaction rules derived directly from the Headout production component.
disable-model-invocation: true
---

# Component Spec: Product Card

The **ProductCard** is the atomic unit of every listing surface. It shows a product image (with a hover-activated carousel), optional badge, star rating, title, and price. This spec is **pixel-exact**: every dimension, radius, animation duration, and interaction rule below must be reproduced faithfully. Build once into `ui-components/ProductCard/`; reuse across every listing page.

## How to use this skill
1. **Resolve image data.** The card needs an ordered image array (minimum 3 to enable the carousel), a product name (for alt text), a URL, and badge/price/rating props.
2. **Decide UI primitives.** Map the partner design system's Button, Text, and Image to the roles below; otherwise build fresh per the measurements here.
3. **Assemble** in the exact order: shell → image area → content area → hook up interactions.

---

## Card shell

- **Width (fixed, not %):**
  - Desktop: `17.625rem` (282px)
  - Mobile: `17rem` (272px)
  - Full-width override: `calc(100vw - 2.5rem)` / `100%`
- **Outer border-radius (standard card):** none — the card shell has no border, no shadow, no background.
- **Highlighted/pinned variant only:** `border-radius: 0.75rem`; `border: 1px solid` accent-purple 20% opacity; white-grey background; `padding: 0.75rem`.
- **Cursor:** `pointer`.
- **Position:** `relative` (needed for hover lift via `top`).

---

## Image area

- **Container class:** `overflow: hidden; isolation: isolate; position: relative;`
- **Border-radius:** `radius.8` = **8px** (applied to the image container, not the outer card).
- **Min-height:** `11rem` (176px) desktop; `10.5rem` (168px) mobile.
- **Width:** matches the card shell width.
- **Aspect ratio of image:** intrinsic `327 × 204` (≈ 1.6 : 1). The image fills the container via `object-fit: cover`.
- **Image skeleton:** a subtle linear-gradient placeholder (`249deg, #e6e5e5 25%, rgba(249,247,247,0.55) 97%`) while the image loads.

---

## L1 badge overlay (on image)

Rendered **only** when a booster label exists (`"Free cancellation"`, `"Selling out fast"`, etc.).

- **Position:** `absolute; top: 0.5rem; left: 0.5rem; z-index: 10`
- **Background:** white
- **Border-radius:** `radius.4` = **4px**
- **Padding:** `0.125rem 0.375rem 0.25rem`
- **Typography:** 12px / 500 weight
- **Color:** `#444` (grey)
- No badge on the right side; no full-bleed banner; no bottom overlay badges.

---

## Image carousel — STRICT

### Activation
- **Desktop:** activates on `mouseenter`, deactivates on `mouseleave`. When active → load all images, show dots + arrow controls.
- **Mobile:** activates via `IntersectionObserver` when the card is **100% in view** (`threshold: 1`). When active → autoplay at 3000ms per slide (15000ms if the first slide is a video).
- **Minimum images:** carousel is **disabled** when the product has ≤ 2 images. A single image renders with no dots and no arrows.
- **Loop:** enabled.

### Pagination dots
| Property | Value |
|---|---|
| Shape | Circle, `6 × 6px` |
| Color | White |
| Inactive opacity | 40% |
| Active opacity | 100% |
| Gap between dots | `4px` |
| Position | `absolute; bottom: 0.75rem`; horizontally centered |
| Behind-dots gradient | `linear-gradient(180deg, rgba(0,0,0,0) 86%, rgba(0,0,0,0.6) 100%)` full-width at image bottom |
| Visibility | Only when card is **active**; hidden at rest |

### Desktop arrow controls
| Property | Value |
|---|---|
| Size | `1.5rem × 1.5rem` (24px) circle |
| Background | White |
| Shadow | `0 2px 5px 0 rgba(0,0,0,0.15)` |
| Reveal animation | `opacity 0 → 1`, duration **0.3s**, `forwards` |
| Position | Left arrow: `left: 0.8rem`; Right arrow: `right: 0.8rem`; vertically centered |
| Edge gradient overlays | Left and right 10%-width strips `rgba(34,34,34,0.2) → transparent`, animate in over `0.3s ease-in-out` alongside arrows |
| Desktop swipe | **Disabled** — arrow click only |
| Visibility | Only when `isDesktop && cardIsActive` |

---

## Hover & interaction states — STRICT

### Card lift (desktop ≥ 768px)
- Property animated: `top` (not `transform`)
- At rest: `top: 0`
- On hover: `top: -0.1875rem` (−3px upward)
- Transition: `top 0.2s ease-in-out`
- **Hover gap prevention:** a `::after` pseudo-element with `height: 0.37rem; width: 100%; position: absolute; bottom: -0.37rem` keeps the hover region contiguous so the mouse doesn't lose the hover state when the card lifts.

### Press / tap shrink
- On `mousedown` / `touchstart`: `transform: scale(0.96)`
- On `mouseup` / `touchend`: `transform: scale(1)`
- Transition: `transform 0.35s ease-in-out`

### Focus ring
- `outline: 0.2rem solid` primary brand purple; `box-shadow: none`

---

## Content area

The content area sits below the image with `grid-row-gap: 0.5rem` (8px) between the image row and the content row.

### 1 — Rating row
Left to right: star icon (`⭐ size=small`) + numeric rating value + a `·` dot separator + L2 booster label.

| Element | Size | Weight | Color |
|---|---|---|---|
| Rating value | 12px | 400 | `#444` |
| L2 booster text (e.g. venue name, "Bestseller") | 12px | 300 | `#444` muted |

Show `"New"` in place of the rating when no rating exists.

### 2 — Title
- **Font:** 17px / 500 weight / halyard-text → eevee `textStyle: 'ui.label.large.heavy'`
- **Color:** `#444`
- **Line clamp:** 3 lines (2 lines when `subText` is present)
- **Overflow:** `ellipsis`

### 3 — Descriptor (optional)
Shown only when product is flagged `instantConfirmation` and the card is not a "top picks" layout.
- SVG tick/bolt icon + `"Instant confirmation"` text
- **Font:** 14px / 300 weight
- **Color:** muted grey

### 4 — Sub-text (optional)
Shown only when `subText` prop is supplied.
- **Font:** 12px / 300 weight
- **Line clamp:** 2 lines

### 5 — Price block
Rendered as a 2-row grid: `'scratch scratch' / 'price saved'`.

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| `"from"` prefix | normal | 12px | 300 | Grey label |
| Scratch / original price | `SUBHEADING_XS` | 12px | 400 | Strikethrough; hidden when `originalPrice === finalPrice` |
| Final price | `UI_LABEL_LARGE_HEAVY` | **17px** | **500** | Brand primary |
| Discount tag | badge | — | 500 | Green badge `"Save {N}%"`; shown only when savings ≥ 3% |

---

## Grid layout (card host)

| Breakpoint | Display | Columns | Gap |
|---|---|---|---|
| Desktop (≥ 768px) | `grid` | `repeat(4, minmax(13.75rem, 1fr))` | Row `2rem` (32px) × Col `1.4375rem` (23px) |
| Mobile (< 768px) | `flex; flex-wrap: nowrap; overflow-x: auto` | horizontal scroll row | `padding: 0 0 1.5rem 1rem` |

Mobile cards keep their fixed width (`17rem`) so partial peeking of the next card signals scrollability.

---

## Visual language
- **No shadow or border on a standard card** — the hover lift alone provides depth.
- **Spacing inside content area:** `grid-row-gap: 0.5rem` only; no extra padding between fields.
- **Image fills its container** — `object-fit: cover`; never letter-box or stretch.
- **Lazy-load all images except the visible viewport**; only the first image is rendered until the carousel activates.
- **WCAG AA:** the L1 badge must maintain contrast against the white background; the price must maintain contrast against the card background.

---

## Acceptance checks
- [ ] Card shell width `17.625rem` desktop / `17rem` mobile; image border-radius **8px** (`radius.8`); standard card has **no** outer border/shadow/background.
- [ ] Image container `min-height: 11rem` desktop / `10.5rem` mobile; `overflow: hidden; isolation: isolate`.
- [ ] L1 badge: `absolute; top/left 0.5rem; z-index 10; white bg; border-radius 4px; 12px 500`.
- [ ] **Carousel activates** on `mouseenter` (desktop) / full-in-view IntersectionObserver (mobile); **disabled when ≤ 2 images**; loop enabled.
- [ ] Dots: `6×6px` white circles, 40% inactive opacity, `bottom: 0.75rem` centered, backed by `0→0.6` gradient; **hidden at rest**.
- [ ] Desktop arrows: `1.5rem` circle, white, `0 2px 5px 0 rgba(0,0,0,0.15)` shadow, fade in `0.3s`; edge gradient overlays `0.3s`; no swipe on desktop.
- [ ] **Hover lift:** `top: -0.1875rem`, `transition: top 0.2s ease-in-out`; `::after` `height: 0.37rem` prevents gap.
- [ ] **Press:** `transform: scale(0.96)`, `transition: transform 0.35s ease-in-out`.
- [ ] Content area: rating row → title (17px 500, 3-line clamp) → optional descriptor → optional sub-text → price block (`"from"` + scratch 12px strikethrough + final 17px 500 + green discount tag when ≥ 3%).
- [ ] Grid: desktop `repeat(4, minmax(13.75rem, 1fr))`, gap `2rem 1.4375rem`; mobile horizontal scroll flex.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; no operator/brand blocks.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
