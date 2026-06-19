---
name: ui-product-card
description: Optional fallback reference for the experiences/activities product card used across listing surfaces (city, category, collection, home). Describes the card's structure and behavior — image (optional hover/in-view carousel), optional badge, rating, title, descriptor, price block (strike-through + discount) — and the listing grid. Reuse the partner's design system and components first; this is only a structural fallback for when none exists, with approximate, overridable values.
disable-model-invocation: true
---

# Component Reference: Product Card (optional fallback)

The **ProductCard** is the unit of every listing surface. **Reuse the partner's existing card / design-system components first** — if the partner has a product/experience card, a `Card` primitive, or design tokens, use those and ignore the measurements here. This file is a **structural/behavioral fallback** for when the partner has no equivalent; all numbers below are **approximate suggestions, not mandates**, and the partner's tokens always win.

## How to use this skill
1. **Reuse first.** Search for an existing card or design system; map the roles below to the partner's components/tokens. Build fresh only if nothing fits.
2. **Resolve data.** The card needs: an ordered image list (a carousel is only worthwhile with several images), a product name (also used for alt text), a link/URL, and rating / badge / price props.
3. **Assemble** in order: image area → content area → wire interactions. Build once into `ui-components/ProductCard/` and reuse.

## Structure (top → bottom)
- **Image area** — the product image, `object-fit: cover`, rounded corners; a low-res/skeleton placeholder while loading. Optional **carousel** across the image list (see behavior). Optional **badge overlay** (top-left) when a booster/label exists (e.g. "Free cancellation").
- **Content area** — below the image:
  1. **Rating row** — star + numeric rating (+ an optional short secondary label). Show a "New" treatment when there is no rating.
  2. **Title** — the product name, clamped to a couple of lines with ellipsis.
  3. **Descriptor** (optional) — a short attribute line (e.g. "Instant confirmation") only when the data flags it.
  4. **Price block** — a "from" lead price; an optional struck-through original price shown only when it is higher than the selling price; an optional discount tag (e.g. "Save {N}%") when the saving is non-trivial.

> Pricing: render the **customer-facing selling price** (`headoutSellingPrice` / the mapped selling price), never `netPrice`. Derive the discount % from `originalPrice` vs the selling price. (See `references/ui-data-contract.md`.)

## Behavior
- **Carousel:** enable only when there are several images (a single image renders plain). On desktop, reveal controls (dots + prev/next) on hover; on mobile, optionally autoplay when the card is fully in view. Loop is fine. Keep it keyboard- and screen-reader-accessible.
- **Hover / press affordance:** a subtle lift or elevation on hover and a slight shrink on press are nice-to-have; use the partner's interaction conventions. The whole card is a link.
- **Lazy-load** images below the fold; render the first image until the carousel activates.

## Listing grid (card host)
- **Desktop:** a responsive multi-column grid (commonly ~3–4 columns) with comfortable row/column gaps.
- **Mobile:** either a 2-column grid or a horizontal scroll row where the next card peeks to signal scrollability.

## Approximate fallback values (override with the partner's tokens)
Use only if the partner has no design system. Treat as starting points, not exact specs:
- Card width ≈ 17rem; image corners ≈ 8px radius; image aspect ≈ 1.6:1.
- Title ≈ 16–17px medium; rating/price-caption ≈ 12–14px; final price emphasized.
- Hover lift ≈ a few px; transitions ≈ 0.2–0.35s.
- Desktop grid ≈ 4 columns with ~2rem gaps; mobile cards keep a fixed width for peeking.

## Acceptance checks
- [ ] Reused the partner's card/design-system components and tokens where they exist; built fresh only as a fallback.
- [ ] Card shows image (+ carousel when several images) → rating → title (clamped) → optional descriptor → price block (from / struck-through original when higher / discount tag).
- [ ] Selling price shown (never `netPrice`); discount derived from `originalPrice` vs selling price.
- [ ] Carousel disabled for a single image; controls accessible; whole card is a link; images lazy-load.
- [ ] Listing grid is responsive (multi-column desktop, grid or horizontal-scroll mobile).
- [ ] No fixed Headout pixel values or component-library names imposed over the partner's design system; no operator/brand blocks.
