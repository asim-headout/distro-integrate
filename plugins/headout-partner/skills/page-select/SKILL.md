---
name: page-select
description: Build the Select step of a booking flow for an experiences/tickets storefront — the page where a user picks a date, time slot, and variant/ticket-type for one experience before proceeding to checkout. Self-contained spec — section order, how inventory/variants get ordered/filtered, default-selection rules, conditional-render rules, CTA enablement, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Select (Date / Time / Variant) Step

Build the first step of the booking flow — the user has chosen an experience and now picks a **date**, a **time slot**, and a **variant/ticket-type**, sees a live price, and proceeds to checkout. This file is the **single source of truth**: page structure, the data each part needs, how to order/filter inventory and variants, default-selection rules, when to show/hide each step, when the continue CTA is enabled, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "calendar inventory dates timeslots variants tour group pricing booking" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'inventory|calendar|variant|pricing' /" })` and read the spec). Otherwise map each feed below to your endpoints.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the ordering, default-selection, and conditional rules.

## Page-level guards
- Resolve the experience by id; validate it's numeric. Unknown/invalid → 404.
- If the experience has **no inventory on any date** → it is unavailable; do not render the select page (render an "unavailable / email me" state).
- **Validate every selection in the URL** (date, time, variant). If a param is invalid but recoverable (e.g. invalid date but valid variant) → auto-correct to the first available; if unrecoverable → surface an error message and reset to the first valid step.
- **Changing the variant resets** the time and quantity selections.

## Data sources (map to your endpoints)
- **Experience summary:** `name`, image, rating, `openDated` flag, `livePricingSupported` flag. Drives the header/summary card.
- **Calendar inventory:** available dates + per-date, per-variant time slots with availability and price. The core feed; drives date picker, time list, and pricing.
- **Variants / ticket-types:** list of bookable options for the experience, each with `listingPrice`, optional offer/discount, optional `languageCode`, and availability.
- **Price breakdown** (on selection / at checkout): line items — base, discounts, taxes/fees — plus currency.

## Canonical section order (top → bottom)
1. Header / summary (experience name, image, rating)
2. Date picker (a horizontal date strip; **skipped entirely for open-dated experiences**)
3. Variant / ticket-type selector ("Select your option")
4. Time-slot picker (rendered under the selected variant)
5. Price summary / booking card (lead price → live breakdown; sticky)
6. Continue / "Next" CTA
7. Info / instructions (cancellation, validity, what's next)
- **Desktop:** two columns — selections on the left, a **sticky booking/summary card on the right** holding price + the continue CTA. **Mobile:** single column with a **sticky bottom CTA bar** whose label adapts to the next required step.

## Ordering & derivation of raw data
- **Dates:** from calendar inventory, **sorted chronologically**. Render all dates; mark dates with no availability as disabled (do not remove them). **Default date** = the first available date when none is in the URL.
- **Time slots:** for the selected date + variant, **ordered by start time ascending**. A **single** slot auto-fills (no selection UI). Multiple slots render as a selectable list; unavailable slots show disabled, not removed.
- **Variants — fixed ordering:** sort by, in priority: (1) **language match** first (a variant whose language matches the active language), (2) **available before unavailable**, (3) **has a discount/offer before none**, (4) **price ascending**, (5) **start time ascending** as tiebreaker. Keep unavailable variants in the list (disabled), showing their next-available date + "from {amount}".
- **Default variant selection:** a **single-variant** experience auto-selects that variant (hide the selector, reflect it in the summary). A **multi-variant** experience has **no default** — the user must pick one; clicking continue without a selection shows "Select an option to continue".
- **Price:** show the variant's lead price (`from {amount}`) with a discount tag when an offer exists; on selection, fetch and show the live breakdown (base, discounts, taxes/fees, total) in the summary card. Use the displayed currency from the inventory/pricing feed; if the billable currency differs, surface a small note.

## Conditional render rules
- **Date step:** always shown, **except** open-dated experiences (skip it).
- **Variant step:** shown for multi-variant experiences; hidden (auto-selected) for single-variant.
- **Time step:** hidden until a variant is selected; a single slot auto-fills; multiple slots render as a list.
- **Empty / unavailable:** no dates anywhere → unavailable state (no select page). No slots for a chosen date → date disabled + "pick the closest available" prompt. No variants → 404.
- **Loading:** show a shimmer in the time/price area while inventory or price is fetching; show an initial loader while the calendar loads.
- **Continue CTA enablement:** enabled only when a **variant AND a time slot** are both selected (a single auto-filled slot counts). Until then, the CTA label points the user at the next required step ("Select option" → "Select time" → "Next").

## UI components to build
Roles: **Box, Text, Icon, Image**, **ExperienceSummaryCard**, **DateStrip**, **VariantCard** (selectable option with price + discount + availability), **TimeSlotList** (+ single-slot display), **QuantityStepper** (if you collect pax here rather than at checkout), **PriceSummaryCard** (sticky; lead price → breakdown), **PrimaryCTA** (sticky bottom bar on mobile / in-card on desktop), **InfoSection**, **SkeletonLoader/Shimmer**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **DateStrip:** horizontal, scrollable row of date pills; disabled state for no-availability dates; selected pill uses the primary accent.
- **VariantCard:** title + lead price (`from {amount}`) + optional discount tag; available vs disabled (shows next-available date when disabled); selectable, with selection state.
- **TimeSlotList:** list/dropdown of start times for the selected date+variant; single-slot variant renders as a static "only slot" line; optional scarcity badge.
- **PriceSummaryCard:** sticky card showing the selected option, the live price breakdown (base / discounts / taxes & fees / total), and the continue CTA on desktop.
- **PrimaryCTA:** sticky bottom bar on mobile whose label adapts to the next required step; disabled until variant + time are chosen.
- Reuse **Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
- **Radius:** cards/inputs ~12px; date/time pills ~999px.
- **Type hierarchy:** experience title = ~24–28px desktop / ~20px mobile; option titles ~16px; price ~16–18px bold; captions ~14px. One sans-serif family.
- **Layout:** desktop = selections left + sticky summary card right (~360px); mobile = single column + sticky bottom CTA bar.
- **Selection states:** selected date/variant/time uses the primary accent border/fill; disabled uses muted grey with reduced opacity.
- **Color:** neutral surfaces, one primary accent for CTAs/selection (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** experience `name` + image + rating.
- **Variant card:** title, `from {amount}`, discount tag when an offer exists; disabled variants show next-available date.
- **Price summary:** line items from the breakdown feed; fall back to the variant lead price before the breakdown resolves.
- **Loading:** shimmer sized to the time/price block; initial calendar loader.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Numeric-id guard; no-inventory experience → unavailable state (no select page); URL selections validated and auto-corrected/reset.
- [ ] Sections render in canonical order; date step skipped for open-dated; variant step hidden for single-variant.
- [ ] Dates sorted chronologically (no-availability disabled, not removed); default date = first available.
- [ ] Time slots ordered by start time; single slot auto-fills; variant change resets time/quantity.
- [ ] Variants sorted by the fixed priority (language → availability → discount → price → start time); single-variant auto-selected, multi-variant requires a pick.
- [ ] Continue CTA enabled only when variant + time are selected; CTA label adapts to the next required step.
- [ ] Loading shimmers shown; empty/sold-out states handled per the rules.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
