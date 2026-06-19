---
name: book-select
description: Build the booking-flow "Select" step for an experiences/tickets storefront — the page reached at /book/{id}/select where a guest picks a DATE, picks an OPTION/VARIANT (incl. combo deals), and picks a TIME slot before checkout. Self-contained spec — section order, the CTA state machine (the button text/behaviour that changes as the guest selects), the selection-mode branches (normal / single-variant / combo / seatmap / svg-zone / iframe / open-dated), conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking-Flow "Select" Step

Build the **Select** step of the booking flow — `/book/{id}/select`. The guest lands here from a product page's "Check availability" CTA and must make up to three selections — **date → option/variant → time** — before the flow advances to checkout. The page is a **two-column shell**: a left selection column and a **sticky right summary/booking card** whose primary CTA text changes as selections are made. This file is the **single source of truth**: structure, the data each section needs, the **CTA state machine**, the selection-mode branches, conditional rules, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "booking calendar pricing inventory by date, variants/options, time slots, pax types, seatmap" })`, then read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide the selection mode** for the product (see *Selection modes*) — it determines which middle section renders.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the summary card, date strip, and option card are shared with checkout/payment — reuse them).
4. **Assemble** in canonical order, wiring the **CTA state machine** exactly.

## Page-level guards
- Resolve the product/tour-group by id first. Unresolved → 404 (not a partial shell); render a loader until the core product + calendar resolve.
- **Source of truth = URL query** (`date`, `tourId`/option, `variantId`, `time`); hydrate selection state from the URL on load and reflect every selection back into the URL so the step is shareable/restorable.
- This step is **not indexable** — it is behind a booking intent. Emit no SEO body.

## Data sources (map to your endpoints)
- **Product / tour-group detail:** name (for breadcrumb + summary), flow type / selection mode, cancellation policy, open-dated flag.
- **Calendar + pricing by date range:** per-day min price and availability for the date strip; fetched for a window around the selected date and re-fetched when the date changes.
- **Options/variants:** ordered list; each has name, descriptors (duration, meeting point, language), `listingPrice`/strike price + discount %, inventory/availability, `tours[]` (a **combo** when `tours.length > 1`), and `closestAvailableDate` when sold out.
- **Time slots / inventory:** available start times for the chosen date+variant.
- **Seatmap / zones (only for seated/zoned products):** seat or zone geometry + per-seat/zone price & availability.

## Canonical section order (top → bottom, left column)
1. Step breadcrumb in the header (`1. {product} › 2. Tickets › 3. Confirm & pay`; the seat-selection modes label step 2 **"Select seats"**).
2. **Date strip** ("Select a date") — horizontal day pills with per-day price, a "More dates" button opening a month calendar. *(hidden for open-dated)*
3. **Filter/language selector** — only for filter-property or guided-tour products (e.g. "Select your language"); gates the option list until chosen.
4. **Option/variant section** ("Select your option") — the selection-mode body (see below).
5. **Time section** ("Pick a time") — appears once an option is selected; a time-slot dropdown, or a single auto-selected slot, with a "Select a time slot to continue" validation highlight.
6. **Sticky summary/booking card** (right column) — product banner, the running selection (date/time/variant rows), price, and the **state-driven primary CTA**.

## Selection modes (the middle section branches — pick ONE)
- **Normal (default/canonical):** a list/carousel of **option cards**. Each card: title, descriptors, `from {price}` (+ strike-through & "{n}% off" for deals), inclusions bullets, and a button: **"Select"** → **"Selected"** (tick) when chosen; **"Sold out"** (disabled) with a "Next available on {date}" link when unavailable. Horizontal scroll uses prev/next arrows.
- **Single variant:** no "Select your option" heading and no card list — render one expanded option block and **auto-select it on mount** (inclusions/exclusions list with a "Read more" modal past ~5 items).
- **Combo:** an option whose `tours.length > 1`; show a **"Combo deal"** badge + strike/discount. Selecting a combo routes into a **per-sub-tour** select sequence (each sub-tour gets its own date/time).
- **Seatmap (seat-by-seat, e.g. theatre):** an interactive **seat map** (SVG) where the guest picks individual seats; breadcrumb step 2 reads **"Select seats"**; proceeds to a seatmap-specific checkout. The date strip still drives which performance/showing is mapped.
- **SVG zone (general admission zones):** an SVG **zone** picker (pick a zone/section, not individual seats).
- **External seatmap (iframe):** a third-party seat picker embedded in an iframe after the date is chosen; treat the iframe as the selection surface and resume the flow on its callback.
- **Open-dated:** no date strip; date is pre-resolved to the next available; jump straight toward checkout.
- *(Transfer/point-to-point products use a bespoke form and are out of scope for this recipe.)*

## CTA state machine (STRICT — the heart of this page)
The sticky card's primary button (and any mirrored bottom bar) is **state-driven**. Compute its label and on-click from the current selections — match exactly:

| State (in priority order) | Button label | On click |
|---|---|---|
| filter/guided-tour flow & no filter/language chosen | **"Select your language"** / "Select an option" | scroll to the filter selector; show inline "select to continue" error |
| no option/variant selected | **"Select an option"** | smooth-scroll to the options section **and** show the inline "Select an option to continue" error |
| option selected, no time selected | **"Select time"** | highlight the time section + scroll it into view (do **not** navigate) |
| option selected **and** time selected | **"Next"** | persist selection to the URL and **navigate to `/book/{id}/checkout`** (or the seatmap-checkout for seat modes) |

The option **card** button has its own two states ("Select" ↔ "Selected"); selecting a card is what flips the global state from row 2 → row 3. The time picker shows **"Select a time slot to continue"** as its validation highlight until a slot is chosen. Never enable "Next" until both option and time exist.

## Conditional render rules
- **Date strip:** omit entirely when open-dated.
- **Filter/language selector:** only for filter-property/guided-tour products; the option list is gated until a value is picked.
- **"Select your option" heading + card list:** only when there is **more than one** variant; a single variant renders the expanded single-option block instead.
- **Time section:** hidden until an option is selected (or a price fetch is in progress → show a shimmer). A single available slot renders as an auto-selected read-only row, not a dropdown.
- **Sold-out option card:** render only when a `closestAvailableDate` exists (so a "Next available on {date}" link can be shown); otherwise omit the card.
- **Loading:** skeletons sized to the final date strip / option cards / time picker during initial load and on date-change re-fetch.

## UI components to build
Roles: **Box, Text, Icon, Image, Button**, **Breadcrumb/StepHeader**, **DateStrip** (+ **DatePill**, "More dates" → **Calendar**), **FilterSelector** (optional), **OptionCard** (title, descriptors, price block, inclusions, state button) + **OptionCarousel** (arrows), **SingleOptionBlock**, **ComboBadge**, **TimeSlotDropdown** / **SingleTimeSlotRow**, **SeatMap** / **ZoneMap** / **IframeSeatmap** (only for seated/zoned/iframe modes), **SummaryCard** (banner + selection rows with edit affordances + price + state CTA), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (`design-system/`, `ui/`, `components/ui/`, an exported `Box`/`Text`/`Button`, a `panda.config.*`/`tailwind.config.*`/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.** This repo's own stack: `@headout/eevee` (Box, Text, Button, Icon, Link, **DateStrip**, **Breadcrumb**, Radio, SkeletonLoader) + `@headout/onix` icons (Calendar, Clock, Ticket, Location, ChevronRight) + `@headout/pixie` (`css`/`cx`, Panda) + `@headout/espeon` (Conditional, Tooltip). Map to those if you are inside it.

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. Reuse the **SummaryCard, DateStrip, OptionCard, Button, Breadcrumb, SkeletonLoader** across checkout/payment. Keep `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered ~75rem max width; **content left, sticky summary card right** (~24rem, sticky offset ~6rem). Mobile: single column with the summary collapsed into a sticky bottom bar carrying the same state CTA.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/inputs ~12px; pills ~999px.
- **Type:** section titles ("Select a date", "Select your option", "Pick a time") ~20–24px; card titles ~16px; price/caption ~14px. One sans-serif family.
- **Date pills:** compact, two lines (weekday + date) with price; selected pill outlined in the primary accent; sold-out muted.
- **Option cards:** ~15–16rem wide in a horizontal scroller (peek next), arrows only when overflowing; price bottom-left, state button bottom.
- **Color:** neutral surfaces, one primary accent for the selected pill / CTA / "Select" buttons (partner brand); muted grey secondary text; WCAG AA contrast.

## STRICT scope — do NOT emit (operator-specific)
- No **"Headout Promise" / guarantee card**, no **Trustpilot / "trusted by N guests"** strip, no **"Supplied by {operator}"** legal text, no **cashback**, no **app-download/newsletter** strips — these are operator-brand blocks, not part of the canonical select UI.
- No **"Book now, pay later"** descriptor or program promise on the option cards (that is a downstream, operator-specific payment program).
- Keep the option card to the canonical fields above; do not add scarcity/"X people viewing" tickers unless the partner explicitly supplies that data.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable feed disables its section.
- [ ] URL is the source of truth: date/option/variant/time hydrate from query and every selection writes back to the URL.
- [ ] Sections render in canonical order; the correct **selection mode** body renders (normal / single / combo / seatmap / svg-zone / iframe / open-dated).
- [ ] **CTA state machine** matches exactly: "Select an option" → "Select time" → "Next"; the first two scroll/highlight (no nav), only "Next" navigates to checkout (or seatmap-checkout). Card button toggles "Select" ↔ "Selected"; time shows "Select a time slot to continue" until chosen.
- [ ] Date strip hidden for open-dated; option heading/list only for >1 variant; time section appears only after an option is selected; single slot auto-selects.
- [ ] Sold-out cards show "Next available on {date}" (and are omitted when no closest date); skeletons on load and date-change re-fetch.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; summary card/date strip/option card are reusable across checkout/payment.
- [ ] No operator/brand blocks (Promise, Trustpilot, "Supplied by", cashback, BNPL descriptor); rendering uses the partner's brand and content.
