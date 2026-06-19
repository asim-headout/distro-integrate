---
name: book-select
description: Build the booking-flow "Select" step for an experiences/tickets storefront — the page reached at /book/{id}/select where a guest picks a DATE, picks an OPTION/VARIANT (incl. combo deals), and picks a TIME slot before checkout. Self-contained spec — section order, the CTA state machine (the button text/behaviour that changes as the guest selects), the selection-mode branches (normal / single-variant / combo / seatmap / svg-zone / iframe / open-dated), conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking-Flow "Select" Step

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Select** step of the booking flow — `/book/{id}/select`. The guest lands here from a product page's "Check availability" CTA and must make up to three selections — **date → option/variant → time** — before the flow advances to checkout. The page is a **two-column shell**: a left selection column and a **sticky right summary/booking card** whose primary CTA text changes as selections are made. This file is the **single source of truth**: structure, the data each section needs, the **CTA state machine**, the selection-mode branches, conditional rules, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Fetch `https://partner.headout.com/docs/llms.txt` and find the relevant endpoint sections for: booking calendar pricing inventory by date, variants/options, time slots, pax types, seatmap.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): display `headoutSellingPrice` / mapped selling price, never `netPrice`; hide unlimited/sentinel high `remaining` counts.
3. **Decide the selection mode** for the product (see *Selection modes*) — it determines which middle section renders.
4. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the summary card, date strip, and option card are shared with checkout/payment — reuse them).
5. **Assemble** in canonical order, wiring the **CTA state machine** exactly.

## Page-level guards
- Resolve the product/tour-group by id first; validate the id is numeric. Unresolved/invalid → 404 (not a partial shell); render a loader until the core product + calendar resolve.
- **No inventory on any date → the experience is unavailable:** do not render the select shell; render an "unavailable / email me when available" state instead.
- **Source of truth = URL query** (`date`, `tourId`/option, `variantId`, `time`); hydrate selection state from the URL on load and reflect every selection back into the URL so the step is shareable/restorable.
- **Validate every selection in the URL** (date, option/variant, time). If a param is invalid but recoverable (e.g. an invalid date but a valid variant) → auto-correct to the first available value; if unrecoverable → surface an error and reset to the first valid step. **Changing the variant resets** the time (and any quantity) selection.
- This step is **not indexable** — it is behind a booking intent. Emit no SEO body.

## Data sources (map to your endpoints)
- **Product / tour-group detail:** name (for breadcrumb + summary), flow type / selection mode, cancellation policy, open-dated flag.
- **Calendar + pricing by date range:** per-day min `headoutSellingPrice` / mapped selling price and availability for the date strip; fetched for a window around the selected date and re-fetched when the date changes. **Dates sorted chronologically;** no-availability dates render **disabled, not removed**. **Default date = the first available date** when none is in the URL. Hide visible remaining counts for `UNLIMITED` and sentinel-like `remaining >= 1000`.
- **Options/variants:** list; each has name, descriptors (duration, meeting point, language), selling price + strike price (`headoutSellingPrice` vs `originalPrice` — derive the "{n}% off" from the two; do not expect a separate discount-% field), inventory/availability, `tours[]` (a **combo** when `tours.length > 1`). **Apply a fixed ordering:** (1) language match first (variant whose language matches the active language), (2) available before unavailable, (3) has a discount/offer before none, (4) selling price ascending, (5) start time ascending. **Default selection:** a **single-variant** product auto-selects its only variant (hide the selector); a **multi-variant** product has **no default** — the guest must pick one.
- **Time slots / inventory:** available start times for the chosen date+variant, ordered by start time ascending; a single slot auto-fills.
- **Seatmap / zones (only for seated/zoned products):** available show dates/slots first, then seat or zone geometry + per-seat/zone `headoutSellingPrice` / mapped selling price & availability for the selected slot.

## Canonical section order (top → bottom, left column)
1. Step breadcrumb in the header (`1. {product} › 2. Tickets › 3. Confirm & pay`; the seat-selection modes label step 2 **"Select seats"**).
2. **Date strip** ("Select a date") — horizontal day pills with per-day selling price, a "More dates" button opening the modal calendar. *(hidden for open-dated)*
3. **Filter/language selector** — only for filter-property or guided-tour products (e.g. "Select your language"); gates the option list until chosen.
4. **Option/variant section** ("Select your option") — the selection-mode body (see below).
5. **Time section** ("Pick a time") — appears once an option is selected; a time-slot dropdown, or a single auto-selected slot, with a "Select a time slot to continue" validation highlight.
6. **Sticky summary/booking card** (right column) — product banner, the running selection (date/time/variant rows), price, and the **state-driven primary CTA**.

## Selection modes (the middle section branches — pick ONE)
- **Normal (default/canonical):** a list/carousel of **option cards**. Each card: title, descriptors, `from {price}` (+ strike-through & "{n}% off" derived from the strike vs selling price), inclusions bullets, and a button: **"Select"** → **"Selected"** (tick) when chosen; **"Sold out"** (disabled) when unavailable — the inventory feed returns no next-available date, so show no "next available" link. Horizontal scroll uses prev/next arrows.
- **Single variant:** no "Select your option" heading and no card list — render one expanded option block and **auto-select it on mount** (inclusions/exclusions list with a "Read more" modal past ~5 items).
- **Combo:** an option whose `tours.length > 1`; show a **"Combo deal"** badge + strike/discount. Selecting a combo routes into a **per-sub-tour** select sequence (each sub-tour gets its own date/time).
- **Seatmap (seat-by-seat, e.g. theatre):** a slot-first flow. The guest picks date/show slot, then an interactive **seat map** (SVG) where the guest picks individual seats for that slot; breadcrumb step 2 reads **"Select seats"**; proceeds to a seatmap-specific checkout. Carry `variantId`, `inventoryId`, selected `seatCode`/`inventorySeatIds`, and validated prices.
- **SVG zone / section-based:** a section or zone picker after date/show slot selection. The guest picks a section/zone; the backend validates and books selected/assigned seats from that section. Use this when a full seat-level UI is not required.
- **External seatmap (iframe):** a Headout-hosted iframe embedded after the date/show slot is chosen; treat the iframe as the selection surface and resume the flow on its callback with `seatCode`, `inventoryId`, and price data. If exact Headout visual fidelity is required for custom mode, ask for the UI reference instead of inventing it.
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
- **Sold-out option:** render the card disabled; do **not** show a "next available" date (the inventory feed does not provide one).
- **Remaining counts:** never show counts for `UNLIMITED` inventory or sentinel-like high values such as `1000`/`9999`; show a count only for genuinely limited low remaining inventory.
- **Loading:** skeletons sized to the final date strip / option cards / time picker during initial load and on date-change re-fetch.

## Calendar modal (STRICT)
- The "More dates" control opens a modal/sheet calendar, not a native date input, unless the partner's existing design system already mandates a native picker.
- Show **two months at a time on desktop** with previous/next month controls. Mobile may show one month per viewport inside the same modal/sheet pattern.
- Each day cell shows availability state and, when available, the starting selling price. Unavailable dates are visible but disabled.
- Selecting a date closes the modal, updates the URL query, and refreshes option/time inventory.
- Keep keyboard focus trapped in the modal; Escape/closes; arrow/tab navigation must be accessible.

## UI components to build
Roles: **Box, Text, Icon, Image, Button**, **Breadcrumb/StepHeader**, **DateStrip** (+ **DatePill**, "More dates" → **CalendarModal**), **FilterSelector** (optional), **OptionCard** (title, descriptors, price block, inclusions, state button) + **OptionCarousel** (arrows), **SingleOptionBlock**, **ComboBadge**, **TimeSlotDropdown** / **SingleTimeSlotRow**, **SeatMap** / **ZoneMap** / **IframeSeatmap** (only for seated/zoned/iframe modes), **SummaryCard** (banner + selection rows with edit affordances + price + state CTA), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (`design-system/`, `ui/`, `components/ui/`, an exported `Box`/`Text`/`Button`, a `panda.config.*`/`tailwind.config.*`/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.** This repo's own stack: `@headout/eevee` (Box, Text, Button, Icon, Link, **DateStrip**, **Breadcrumb**, Radio, SkeletonLoader) + `@headout/onix` icons (Calendar, Clock, Ticket, Location, ChevronRight) + `@headout/pixie` (`css`/`cx`, Panda) + `@headout/espeon` (Conditional, Tooltip). Map to those if you are inside it.

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. Reuse the **SummaryCard, DateStrip, OptionCard, Button, Breadcrumb, SkeletonLoader** across checkout/payment. Keep `data-qa-marker`/`data-testid` hooks you add.
- **Calendar (CalendarModal):** use the **`ui-calendar`** skill (`/ui-calendar`) for the pixel-exact spec — dual-month grid (3.75rem × 3.75rem date cells, desktop), purple selected state, green min-price pill, grey unavailable dates, open/close animation. Build into `ui-components/Calendar/` once; wire as the CalendarModal opened by the "More dates" button on the DateStrip.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered ~75rem max width; **content left, sticky summary card right** (~24rem, sticky offset ~6rem). Mobile: single column with the summary collapsed into a sticky bottom bar carrying the same state CTA.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/inputs ~12px; pills ~999px.
- **Type:** section titles ("Select a date", "Select your option", "Pick a time") ~20–24px; card titles ~16px; price/caption ~14px. One sans-serif family.
- **Date pills:** compact, two lines (weekday + date) with price; selected pill outlined in the primary accent; sold-out muted.
- **Calendar modal:** Headout-style modal/sheet; two months visible on desktop, one month on mobile; day cells show available/disabled state and starting selling price.
- **Option cards:** ~15–16rem wide in a horizontal scroller (peek next), arrows only when overflowing; price bottom-left, state button bottom.
- **Color:** neutral surfaces, one primary accent for the selected pill / CTA / "Select" buttons (partner brand); muted grey secondary text; WCAG AA contrast.

## STRICT scope — do NOT emit (operator-specific)
- No **"Headout Promise" / guarantee card**, no **Trustpilot / "trusted by N guests"** strip, no **"Supplied by {operator}"** legal text, no **cashback**, no **app-download/newsletter** strips — these are operator-brand blocks, not part of the canonical select UI.
- No **"Book now, pay later"** descriptor or program promise on the option cards (that is a downstream, operator-specific payment program).
- Keep the option card to the canonical fields above; do not add scarcity/"X people viewing" tickers unless the partner explicitly supplies that data.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] URL is the source of truth: date/option/variant/time hydrate from query and every selection writes back to the URL.
- [ ] Sections render in canonical order; the correct **selection mode** body renders (normal / single / combo / seatmap / svg-zone / iframe / open-dated).
- [ ] **CTA state machine** matches exactly: "Select an option" → "Select time" → "Next"; the first two scroll/highlight (no nav), only "Next" navigates to checkout (or seatmap-checkout). Card button toggles "Select" ↔ "Selected"; time shows "Select a time slot to continue" until chosen.
- [ ] Numeric-id guard; no-inventory experience → unavailable/email-me state (no select shell); URL selections validated and auto-corrected/reset; variant change resets time.
- [ ] Dates sorted chronologically (no-availability disabled, not removed); default date = first available; variants follow the fixed ordering (language → availability → discount → price → start time); single-variant auto-selects, multi-variant requires a pick.
- [ ] Calendar uses the modal/sheet pattern with two visible months on desktop; no native date picker unless the partner design system requires it.
- [ ] Customer-facing prices use selling price / `headoutSellingPrice`; `netPrice` is never rendered; sentinel high remaining counts are hidden.
- [ ] Date strip hidden for open-dated; option heading/list only for >1 variant; time section appears only after an option is selected; single slot auto-selects.
- [ ] Sold-out options render disabled (no next-available link); skeletons on load and date-change re-fetch.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; summary card/date strip/option card are reusable across checkout/payment.
- [ ] No operator/brand blocks (Promise, Trustpilot, "Supplied by", cashback, BNPL descriptor); rendering uses the partner's brand and content.
