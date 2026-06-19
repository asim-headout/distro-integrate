---
name: page-tour
description: Build a Tour/Experience (product) page for an experiences/tickets storefront — the detail page for a single bookable activity reached from a collection or a city page. Self-contained spec — section order, how unordered API fields get ordered/derived, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Tour / Experience (Product) Page

Build the product detail page for an experiences & tickets marketplace — the page for one bookable activity, reached from a collection or a city page. This file is the **single source of truth**: page structure, the data each section needs, how to order/derive raw API data, when to show/hide each section, the components to build, and the visual language. The **booking flow is the core**; everything else frames the decision to book. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

Default to a separate product detail page. If the partner asks to collapse product detail into the
home, city, or listing page, stop and ask for the intended information architecture before merging
the experiences.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "product get details highlights inclusions exclusions cancellation policy variants media start location operating schedules" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'product|variant|cancellation|media' /" })` and read the spec). Otherwise map each field below to your endpoints. Any field you cannot fulfil → apply the empty-state rule (omit its section).
2. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): normalize protocol-relative media URLs; customer-facing prices come from selling price fields, not `netPrice`; optional cancellation pills are derived from policy data.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
4. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Data sources (map to your endpoints)
- **Product details** (main render object, from product get): `name`, `shortSummary`/`summaryHtml`, `highlights`/`highlightsHtml`, `inclusions`/`inclusionsHtml`, `exclusions`/`exclusionsHtml`, `faqHtml`, `additionalInfo`, `ticketDeliveryInfoHtml`, `variants[]` (each with pricing, `inputFields`, duration, `inventoryType`, `pax`, `tags`), `media[]` (each `{ url, type: IMAGE | VIDEO | PDF }`), `cancellationPolicy{cancellable, cancellableUpToInMinutes}`, `reschedulePolicy{reschedulable, reschedulableUpToInMinutes}`, `startLocation`/`endLocation` (coordinates + address), `reviewsSummary{averageRating, ratingsCount}`, `operatingSchedules` (under `pois`).
  - **Not provided by the product API** (so these sections are NOT built): `descriptors[]` (badge row), `ticketValidity`, itinerary / "what to expect", and an **individual reviews list** (only the aggregate `reviewsSummary` exists — there is no review-objects feed, no per-star distribution, no review sort/filter/pager).
- **Calendar inventory** (separate call, typically client-side): available dates/times + price. Drives the booking CTA.
- **Lazy feeds:** top attractions / things-to-do for the product's city = collections list scoped to `cityCode`. (There is **no "similar products" relatedness feed and no "nearby cities" feed**, so those rails are not built.)

## Canonical section order (top → bottom)
1. Breadcrumb
2. Rating widget + Title (`name` + optional tag-derived suffix)
3. Gallery (multi vs single media — see rules)
4. `shortSummary` (rich text)
5. Variant/combo selector (combo products only)
6. Highlights
7. Inclusions
8. Exclusions
9. Summary — *only if NO highlights* (dual-position rule)
10. Cancellation policy
11. Summary — *only if highlights exist* (dual-position rule)
12. Operating hours
13. FAQ
14. My tickets (`ticketDeliveryInfoHtml`)
15. Meeting point / location (from `startLocation`/`endLocation`)
16. Additional info ("Know before you go")
17. Lazy feeds: top attractions, things-to-do
- A **persistent booking widget** (sticky bottom bar on mobile, side rail on desktop) sits alongside this content. It contains **exactly three things**: the lead price (`from {headoutSellingPrice}` / mapped selling price), a single **date-selection control** ("Select a date"), and a **"Check availability" CTA**. Nothing else. The CTA hands off to the booking flow (a separate page/app) — it does **not** select pax, variants, or time slots on this page.
- A **sticky section-anchor nav** (a horizontal tab bar of in-page links: Highlights, Inclusions, Exclusions, Cancellation policy, "Your experience"/summary, "Know before you go"/additional-info, My tickets, Location, …) appears once the page scrolls past the title/gallery. It lists **only the sections that actually rendered** (skip anchors for omitted sections), in canonical order, and highlights the active section on scroll.

## Desktop grid structure (STRICT — do not alter)
The desktop page is a **CSS grid with three areas** — `top`, `details`, `sidebar` — in two columns and two rows. There are **two layouts**, chosen by the same media rule as the gallery, and the choice changes *only* where the gallery and the sidebar sit. Mirror this exactly (ref: next-deimos `src/containers/desktop/productPage.tsx` `MainContent`).

**Column sizing (do this, not the literal next-deimos values):** make the **content column flexible and the sidebar column a fixed ~24rem** — `grid-template-columns: minmax(0, 1fr) 24rem`. next-deimos hard-codes `49.5rem auto` because its container is always wide enough; do **not** copy that. A `minmax(0,49.5rem) auto` sidebar track will **balloon** (the full-width gallery's intrinsic image width feeds the `auto` track, starving the content column to a sliver) — pin the sidebar track instead.

- **`top` area** = Rating widget + Title + Gallery.
- **`details` area** = everything else in canonical order **starting at `shortSummary`** (all content sections). Content lives **below** the gallery in the left column — **never** in the `top` area.
- **`sidebar` area** = the booking widget, in a **sticky** wrapper (`position: sticky`, offset ~9.75rem), right-aligned (`justify-self: end`), width ~24rem.

**Multi-media layout** (`media` has ≥ 2 images, or a VIDEO plus ≥ 1 image):
```
grid-template-areas: "top    top"
                     "details sidebar";
```
→ Gallery spans the **full width on top**; the booking sidebar sits **below the gallery, on the right**; details fill the left column below. (sidebar `margin-top` ~1.5rem)

**Single-media layout** (otherwise):
```
grid-template-areas: "top    sidebar"
                     "details sidebar";
```
→ Gallery sits **top-left** beside the booking sidebar, which **spans both rows** on the right. (sidebar `margin-top` ~0.875rem)

**Mobile:** single column, stacked `top → sidebar → details`; the booking widget collapses to a sticky bottom bar.

> The most common mistake is placing the gallery inside the left content column so the booking card top-aligns beside it. For multi-media products that is **wrong** — the gallery is full-width on top and the booking card is below-right. Match `grid-template-areas` exactly.

### Why a given product shows fewer sections than this list
The canonical order is the **superset** of everything a product page *can* contain. Any individual product renders a **subset** — every section is gated by the conditional render rules, and an absent/empty field omits its section entirely (see the per-section presence table). A product with no operating-hours panel, no FAQ, or no additional-info block simply has those fields empty — that is correct behaviour, not a missing component.

## Ordering & derivation of raw data
- **Highlights / inclusions / exclusions / faq / additionalInfo:** the API returns each as a **pre-formatted rich-text/HTML string** in its own field. Do NOT merge or re-split. Render `inclusions` and `exclusions` as **separate lists** (tick vs cross bullets are styling only).
- **Cancellation-policy text is DERIVED** (not a field) from `cancellationPolicy` + `reschedulePolicy`:
  - `!cancellable && !reschedulable` → "non-cancellable, non-reschedulable".
  - `!cancellable && reschedulable` → "reschedulable up to X hours" (from `reschedulableUpToInMinutes`).
  - `cancellable` → `cancellableUpToInMinutes === 0` → "cancel anytime"; `< 72h` → show hours; else show days (from `cancellableUpToInMinutes`).
- **Variants:** keep only variants with a listing price; a **combo** = a variant whose `tours.length > 1`. **Preserve API order** (no sort).
- **Title suffix:** append a tag-derived suffix to `name` (only for the default/English locale).
- **Summary dual-position:** render the summary block (`summaryHtml`) at position 9 when there are NO highlights, otherwise at position 11. Suppress entirely for hop-on-hop-off products.

## Conditional render rules
- **Gallery:** multi-media layout when `media` has ≥ 2 images (or a VIDEO plus ≥ 1 image); else single-media.
- **Rating widget:** show only when `reviewsSummary.ratingsCount > 0` (render `★ averageRating (ratingsCount)`). There is **no reviews list section** — the page shows only this aggregate badge.
- **Variant/combo selector:** show **only** if the product has multiple available variants AND has combo variants; selecting one reveals a "Next/Continue" CTA into the booking flow. This is the **only** in-page selection control on this page — single-variant products show **no** variant selector at all. It is not a pax/quantity/time picker.
- **Operating hours:** show only if any point of interest has `operatingSchedules`.
- **Meeting point / location:** render only if `startLocation` (or `endLocation`) has coordinates/address — render a map (marker from `coordinates`) plus the address string. If only an address (no coordinates) is present, render the address copy without a map.
- **My tickets:** show only if `ticketDeliveryInfoHtml` is present.
- **Additional info:** show only if `additionalInfo` is non-empty.
- **Section-anchor nav:** render the sticky tab bar only when **≥ 2** anchorable content sections rendered; it contains a link **only** for each section that actually rendered, in canonical order. If a section is omitted, omit its anchor.
- **Booking widget (STRICT contents):** if a listing price exists AND inventory dates exist → render the booking widget with **only** lead price + date-selection control + "Check availability" CTA; else render an "email me when available" alert. **Never** add a pax/guest count selector, a quantity stepper, a time-slot picker, or a variant/ticket-type selector to this widget — those belong to the downstream booking flow, not this page. Clicking the date control may open a date calendar; the CTA then routes to the booking flow.
- **Empty state:** any absent/falsy field → omit that section entirely (no placeholder copy).
- **Crawler/bot:** load lazy feeds server-side (for SEO/indexing); real users lazy-load the below-fold feeds client-side.

## Per-section presence conditions (when each section appears)
Every section is conditional. Render it **only** when its rule below holds; otherwise omit it entirely (no placeholder). This is why two products look different.

| Section | Renders when |
|---|---|
| Breadcrumb | always (built from city/collection trail) |
| Rating widget | `reviewsSummary.ratingsCount > 0` |
| Title | always |
| Gallery | always (≥ 1 media); multi vs single per the gallery rule |
| `shortSummary` | field non-empty |
| Variant/combo selector | multiple variants AND combo variants exist |
| Highlights | `highlights` non-empty |
| Inclusions / Exclusions | each field non-empty (rendered as separate lists; rich-text may include sub-headings — render as-is) |
| Summary | `summaryHtml` non-empty (position 9 if no highlights, else 11; suppressed for hop-on-hop-off) |
| Cancellation policy | always derivable from `cancellationPolicy`/`reschedulePolicy` (text is derived, never blank) |
| Operating hours | a point-of-interest has `operatingSchedules` |
| FAQ | `faqHtml` non-empty |
| My tickets | `ticketDeliveryInfoHtml` present |
| Meeting point / Location | `startLocation`/`endLocation` has coordinates or an address |
| Additional info ("Know before you go") | `additionalInfo` non-empty |
| Section-anchor nav | ≥ 2 anchorable sections rendered |
| Lazy feeds (top attractions / things-to-do) | the collections-by-city feed returns ≥ 1 item |

## STRICT component scope — do NOT invent or import these
This page renders **only** the sections in the canonical order above and **only** the components in the list below. Treat the list as exhaustive — if a component is not named here, do not add it. In particular, **never** add any of the following:
- **On the booking widget:** a pax/guest count selector, a quantity stepper, a "how many tickets" control, a time-slot picker, or a variant/ticket-type dropdown. The widget is price + date selection + CTA only; everything else happens in the downstream booking flow.
- **Sections the product API does not back:** a descriptor/badge row, an itinerary / "what to expect" panel, a ticket-validity block, or an individual-reviews section (review cards, rating-distribution chart, review sort/filter/pager). The product API exposes only the aggregate `reviewsSummary`, so build the rating widget and nothing more.
- **Operator/brand-specific blocks** carried over from the source (Headout) that are not generic product information: e.g. a **"Headout Promise"** / trust-badge panel, **operator payment-program promises** ("Book now, pay later" / "Reserve now & pay later" / a free-cancellation *guarantee* badge), Headout-branded promotional banners, app-download banners, loyalty/credits banners, newsletter/email-capture strips, cross-sell "Headout picks" rails, or any block naming or styled after the source operator. These are out of scope — the partner supplies its own brand, payment terms, and trust content.
- **Speculative UI** the API does not back: wishlist/heart buttons, share bars, currency/language switchers, live-chat widgets, countdown/urgency timers, or "X people viewing" social-proof tickers — unless an explicit data field for them appears in Data sources above.
If a partner wants any of the above, it is added deliberately by the partner outside this recipe — this skill must not scaffold them.

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **RatingWidget**, **Gallery** (multi-media + single-media), **SectionNav** (sticky in-page anchor tabs), **RichTextBlock**, **VariantSelector**, **InfoSection** (titled rich-text block, used for highlights/inclusions/exclusions/summary/additional-info), **CancellationPolicyPanel**, **TimingsPanel** (operating hours), **FaqAccordion**, **TicketDeliveryPanel**, **LocationMap**, **BookingWidget** (price + date-selection + "Check availability" CTA only), **ProductCard**, **CollectionCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **RatingWidget:** `★ value (count)` summary from `reviewsSummary`; static (no link to a reviews section, since there is none).
- **Gallery:** multi-media layout = one large normalized hero image on the left + a 2×2 grid of four normalized thumbnails on the right, with a "View all images" button overlaid on the last thumbnail (opens a lightbox); single-media fallback when fewer images. The hero column and the thumbnail block are equal height.
- **SectionNav:** a horizontal, sticky anchor-tab bar listing one link per rendered content section (in canonical order); clicking scrolls to that section and the active section is highlighted on scroll. Renders only when ≥ 2 anchorable sections exist. No counts/badges, no operator branding.
- **VariantSelector:** selectable list of variants/combos; selecting reveals a continue CTA.
- **InfoSection:** a titled section rendering rich-text/bulleted content (highlights/inclusions/exclusions/summary/additional-info).
- **CancellationPolicyPanel:** renders the derived cancellation/reschedule copy.
- **TimingsPanel:** opening-hours layout (day → hours rows) with "open today / tomorrow / weekday / date / closed" states.
- **TicketDeliveryPanel:** how tickets are delivered (`ticketDeliveryInfoHtml`).
- **LocationMap:** map with a marker, OR a plain address copy block when only an address (no coordinates) is present.
- **BookingWidget:** lead price (`from {headoutSellingPrice}` / mapped selling price) + a single date-selection control ("Select a date", which may open a date calendar) + a "Check availability" CTA that routes to the booking flow. **Exactly these three elements — no pax/guest counter, no quantity stepper, no time-slot picker, no variant/ticket-type selector.** Collapses to a sticky bottom bar on mobile; falls back to an "email me when available" alert when there's no inventory.
- Reuse **Breadcrumb, Carousel, ProductCard, CollectionCard, FaqAccordion, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs/sheets ~12px; pills/badges ~999px.
- **Type hierarchy:** product title = large bold heading (~28–32px desktop / ~22px mobile); section titles = ~24–28px desktop / ~20px mobile; body = ~16px; price/captions = ~14px. One sans-serif family.
- **Layout:** desktop = the three-area grid in **Desktop grid structure** above (`top` / `details` / `sidebar`); sticky booking rail ~24rem right-aligned; multi-media → gallery full-width on top + sidebar below-right, single-media → gallery top-left + sidebar spanning both rows. Mobile = single column with a sticky bottom booking bar.
- **Gallery:** hero image ~16:9 (or taller on desktop); thumbnail grid beneath; lightbox on click.
- **Lists:** inclusions ticks / exclusions crosses are colour-coded (positive accent vs muted).
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Title:** `name` + optional tag-derived suffix (default locale only).
- **Address string:** join the `startLocation` address parts (e.g. `addressLine1, addressLine2, cityName`) with ", ", skipping empties.
- **Operating-hours formatting:** OPEN → "Open today" + open–close; opens within 24h → "tomorrow"; within 7d → weekday name; else date; CLOSED → closed.
- **Loading:** skeletons sized to the final section/card.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Protocol-relative media URLs normalized before rendering; no `netPrice` is displayed to customers.
- [ ] Numeric-id guard; unknown → 404; geo-restricted → not-available state; missing core object → loader (no partial shell).
- [ ] Sections render in canonical order, including the summary dual-position rule.
- [ ] Cancellation-policy text derived from `cancellationPolicy`/`reschedulePolicy` (not read from a field); minutes converted to hours/days.
- [ ] Inclusions and exclusions rendered as separate lists; variants filtered to those with a listing price, order preserved.
- [ ] Gallery multi vs single chosen per the `media` rule; meeting point rendered from `startLocation`/`endLocation` (map when coordinates exist, else address copy).
- [ ] Desktop grid uses the three-area (`top`/`details`/`sidebar`) structure: multi-media → gallery full-width on top + booking sidebar below-right; single-media → gallery top-left + sidebar spanning both rows. Content lives in the `details` column below the gallery, never in `top`. Sidebar is sticky and right-aligned (~24rem).
- [ ] Booking widget vs email-alert chosen by inventory availability.
- [ ] Booking widget contains ONLY price + date selection + "Check availability" CTA — no pax/guest counter, quantity stepper, time-slot picker, or variant dropdown (those live in the downstream booking flow).
- [ ] Rating widget shows only the aggregate `reviewsSummary`; NO descriptor row, itinerary, ticket-validity, or individual-reviews section is built.
- [ ] No operator/brand-specific blocks emitted (no "Headout Promise", source-branded banners, app-download/loyalty/newsletter strips, or "X people viewing" tickers); only the canonical sections and listed components render.
- [ ] Empty fields omit their sections per the presence table; the rendered page is a data-driven subset of the canonical order (fewer sections is correct, not a bug).
- [ ] Section-anchor nav renders only with ≥ 2 sections and links only to sections that actually rendered.
- [ ] Lazy feeds (top attractions / things-to-do from collections-by-city) load client-side for users, server-side for bots.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
