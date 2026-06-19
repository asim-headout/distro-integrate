---
name: page-tour
description: Build a Tour/Experience (product) page for an experiences/tickets storefront — the detail page for a single bookable activity reached from a collection, search, or city page. Self-contained spec — section order, how unordered API fields get ordered/derived, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Tour / Experience (Product) Page

Build the product detail page for an experiences & tickets marketplace — the page for one bookable activity, reached from a collection, a search result, or a city page. This file is the **single source of truth**: page structure, the data each section needs, how to order/derive raw API data, when to show/hide each section, the components to build, and the visual language. The **booking flow is the core**; everything else frames the decision to book. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "tour group product details highlights inclusions exclusions cancellation policy variants reviews meeting point" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'tour-group|product|reviews|meeting' /" })` and read the spec). Otherwise map each field below to your endpoints. Any field you cannot fulfil → apply the empty-state rule (omit its section).
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the product by id; validate the id is numeric. Unknown/invalid → 404 (not a partial shell).
- A geo-restricted product → render an "experience not available in your region" state instead of the page.
- If the core product object is still loading → show a loader; never render a partial page shell.

## Data sources (map to your endpoints)
- **Product details** (main render object): `name`, `summary`, `shortSummary`, `highlights`, `inclusions`, `exclusions`, `additionalInfo`, `faq`, `adhoc`, `descriptors[]`, `variants[]`, `imageUploads[]`, `experienceVideo`, `cancellationPolicyV2{cancellable,cancellableUpTo}`, `reschedulePolicy{reschedulable,reschedulableUpTo}`, `ticketValidity{type,validUptoDays}`, `reviewsDetails{showRatings}`, `ticketDeliveryInfo`, `startLocation`, `operatingScheduleInfo`, `contentMachineTranslated`.
- **Meeting point** (separate call): `{ displayConfig:{showSection,type}, location:{coordinates,address,radius,placeId}, localisedCopy }`.
- **Reviews** (separate call): the product's reviews, the average + total count, per-star distribution counts, and support for sort + filter (with-images / rating buckets) + paging.
- **Itinerary sections** (separate call): ordered stops / "what to expect".
- **Calendar inventory** (separate call, typically client-side): available dates/times. Drives the booking CTA.
- **Lazy feeds:** similar products, top attractions, things-to-do, nearby cities for the product's city.

## Canonical section order (top → bottom)
1. Breadcrumb
2. Rating widget + Title (`name` + optional tag-derived suffix)
3. Gallery (multi vs single media — see rules)
4. Descriptor badge row
5. `shortSummary` (rich text)
6. Variant/combo selector (combo products only)
7. Sanitary/safety alert (if present)
8. Machine-translation callout (if `contentMachineTranslated`)
9. Pinned reviews
10. Highlights
11. Inclusions
12. Exclusions
13. Summary — *only if NO highlights* (dual-position rule)
14. Itinerary / "What to expect"
15. Cancellation policy
16. Reviews
17. Ticket validity
18. Summary — *only if highlights exist* (dual-position rule)
19. Operating hours
20. FAQ
21. My tickets (`ticketDeliveryInfo`)
22. Meeting point / location
23. Additional info
24. Adhoc
25. Lazy feeds: similar products, top attractions, things-to-do, nearby cities
- A **persistent booking widget** (sticky bottom bar on mobile, side rail on desktop) sits alongside this content. It contains **exactly three things**: the lead price (`from {amount}`), a single **date-selection control** ("Select a date"), and a **"Check availability" CTA**. Nothing else. The CTA hands off to the booking flow (a separate page/app) — it does **not** select pax, variants, or time slots on this page.
- A **sticky section-anchor nav** (a horizontal tab bar of in-page links: Highlights, Inclusions, Exclusions, Cancellation policy, Reviews, "Your experience"/summary, "Know before you go"/additional-info, My tickets, Location, …) appears once the page scrolls past the title/gallery. It lists **only the sections that actually rendered** (skip anchors for omitted sections), in canonical order, and highlights the active section on scroll.

## Desktop grid structure (STRICT — do not alter)
The desktop page is a **CSS grid with three areas** — `top`, `details`, `sidebar` — in two columns and two rows. There are **two layouts**, chosen by the same media rule as the gallery, and the choice changes *only* where the gallery and the sidebar sit. Mirror this exactly (ref: next-deimos `src/containers/desktop/productPage.tsx` `MainContent`).

**Column sizing (do this, not the literal next-deimos values):** make the **content column flexible and the sidebar column a fixed ~24rem** — `grid-template-columns: minmax(0, 1fr) 24rem`. next-deimos hard-codes `49.5rem auto` because its container is always wide enough; do **not** copy that. A `minmax(0,49.5rem) auto` sidebar track will **balloon** (the full-width gallery's intrinsic image width feeds the `auto` track, starving the content column to a sliver) — pin the sidebar track instead.

- **`top` area** = Rating widget + Title + Gallery.
- **`details` area** = everything else in canonical order **starting at the Descriptor badge row** (descriptors, shortSummary, all content sections). Descriptors and content live **below** the gallery in the left column — **never** in the `top` area.
- **`sidebar` area** = the booking widget, in a **sticky** wrapper (`position: sticky`, offset ~9.75rem), right-aligned (`justify-self: end`), width ~24rem.

**Multi-media layout** (`(experienceVideo.url && imageUploads.length > 1) || imageUploads.length >= 2`):
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
The canonical order is the **superset** of everything a product page *can* contain. Any individual product renders a **subset** — every section below is gated by the conditional render rules, and an absent/empty field omits its section entirely (see the per-section presence table). For example, the Alton Towers reference page shows no itinerary, no operating-hours panel, no FAQ, no safety alert, no machine-translation callout, no pinned reviews and no ticket-validity block because those fields are empty for that product — that is correct behaviour, not a missing component.

## Ordering & derivation of raw data
- **Highlights / inclusions / exclusions / faq / additionalInfo / adhoc:** API returns each as a **pre-formatted rich-text/HTML string** in its own field. Do NOT merge or re-split. Render `inclusions` and `exclusions` as **separate lists** (tick vs cross bullets are styling only).
- **Descriptor badges:** API returns `descriptors[]` unordered. **Re-sort by this fixed ranking**, then drop unknown codes: `FLEXIBLE_CANCELLATION, DURATION, AGE_LIMIT, OPERATING_HOURS, DEX_AUDIO_GUIDE, FLEXIBLE_DURATION, FREE_CANCELLATION, BOOK_NOW_PAY_LATER, EXTENDED_VALIDITY, AUDIO_GUIDE, GUIDED_TOUR, TRANSFERS, HOTEL_PICKUP, MEALS_INCLUDED`.
- **Cancellation-policy text is DERIVED** (not a field) from `cancellationPolicyV2`, `reschedulePolicy`, `ticketValidity`:
  - `!cancellable && !reschedulable` → branch on ticket-validity type: `UNTIL_DATE` / `UNTIL_DAYS_FROM_PURCHASE` → months if ≥ 60 days else days; `EXTENDABLE_BUT_UNKNOWN`; else "non-cancellable, non-reschedulable".
  - `!cancellable && reschedulable` → "reschedulable up to X hours".
  - `cancellable` → `cancellableUpTo === 0` → "anytime"; `< 72h` → show hours; else show days.
- **Ticket validity copy:** null if no validity type or `NOT_EXTENDABLE`; months if `validUptoDays ≥ 60`, else days.
- **Variants:** keep only variants with a `listingPrice`; a **combo** = a variant whose `tours.length > 1`. **Preserve API order** (no sort).
- **Title suffix:** append a tag-derived suffix to `name` (only for the default/English locale).
- **Summary dual-position:** render the summary block at position 13 when there are NO highlights, otherwise at position 18. Suppress entirely for hop-on-hop-off itineraries.

## Conditional render rules
- **Gallery:** multi-media layout when `(experienceVideo.url && imageUploads.length > 1) || imageUploads.length >= 2`; else single-media.
- **Meeting point / location:** render only if `displayConfig.showSection`. Branch on `displayConfig.type`: `MAP_WITH_RADIUS` / `MAP_WITH_LOCATION` → render a map (radius/marker from `coordinates`, `placeId`); `COPY_MESSAGE` → render the `localisedCopy` text only (no map).
- **Variant/combo selector:** show **only** if the product has multiple available variants AND has combo variants; selecting one reveals a "Next/Continue" CTA into the booking flow. This is the **only** in-page selection control on this page — single-variant products show **no** variant selector at all. It is not a pax/quantity/time picker.
- **Itinerary:** show only if itinerary sections exist and each is valid. Heading = "Routes & schedules" for hop-on-hop-off, else "Itinerary".
- **Operating hours:** show only if any point of interest has operating schedules.
- **Reviews:** show only if `reviewsDetails.showRatings`. When shown, the section contains: a summary (`★ average (count)`), a **rating-distribution bar chart** (5→1 star counts) only if per-star counts exist, a **"What our guests say"** list of review cards, and — only if the total review count exceeds the first page — a **sort control** ("Most relevant" default), **filter pills** (with-images / 4+ stars / 3 stars / <3 stars), and a **"Show more reviews"** pager. With few reviews, render just the summary + cards (no sort/filter/pager). Sorting/filtering re-queries the reviews feed; preserve returned order.
- **Section-anchor nav:** render the sticky tab bar only when **≥ 2** anchorable content sections rendered; it contains a link **only** for each section that actually rendered, in canonical order. If a section is omitted, omit its anchor. On a product with one/zero content sections, render no nav.
- **Booking widget (STRICT contents):** if a listing price exists AND inventory dates exist → render the booking widget with **only** lead price + date-selection control + "Check availability" CTA; else render an "email me when available" alert. **Never** add a pax/guest count selector, a quantity stepper, a time-slot picker, or a variant/ticket-type selector to this widget — those belong to the downstream booking flow, not this page. Clicking the date control may open a date calendar; the CTA then routes to the booking flow.
- **Badge gates:** drop `EXTENDED_VALIDITY` for open-dated tours; show `FLEXIBLE_CANCELLATION` only if a cancellation-insurance config exists AND the product is non-cancellable; show `OPERATING_HOURS` only with point-of-interest schedules.
- **Machine-translation callout:** show if `contentMachineTranslated`.
- **Empty state:** any absent/falsy field → omit that section entirely (no placeholder copy).
- **Crawler/bot:** load lazy feeds + long-form content server-side (for SEO/indexing); real users lazy-load the below-fold feeds client-side.

## Per-section presence conditions (when each section appears)
Every section is conditional. Render it **only** when its rule below holds; otherwise omit it entirely (no placeholder). This is why two products look different.

| Section | Renders when |
|---|---|
| Breadcrumb | always (built from city/collection trail) |
| Rating widget | `reviewsDetails.showRatings` AND a review count exists |
| Title | always |
| Gallery | always (≥ 1 media); multi vs single per the gallery rule |
| Descriptor row | `descriptors[]` has ≥ 1 known code after re-sort/gating |
| `shortSummary` | field non-empty |
| Variant/combo selector | multiple variants AND combo variants exist |
| Safety alert | sanitary/safety field present |
| Machine-translation callout | `contentMachineTranslated` true |
| Pinned reviews | curated/pinned reviews exist |
| Highlights | `highlights` non-empty |
| Inclusions / Exclusions | each field non-empty (rendered as separate lists; rich-text may include sub-headings like "Additional paid upgrades" — render as-is) |
| Summary | `summary` non-empty (position 13 if no highlights, else 18; suppressed for hop-on-hop-off) |
| Itinerary | itinerary sections exist and are valid |
| Cancellation policy | always derivable from `cancellationPolicyV2`/`reschedulePolicy`/`ticketValidity` (text is derived, never blank) |
| Reviews | `reviewsDetails.showRatings` |
| Ticket validity | validity type present and not `NOT_EXTENDABLE` |
| Operating hours | a point-of-interest has operating schedules |
| FAQ | `faq` non-empty |
| My tickets | `ticketDeliveryInfo` present |
| Meeting point / Location | `meetingPoint.displayConfig.showSection` true (map vs copy per `displayConfig.type`) |
| Additional info ("Know before you go") | `additionalInfo` non-empty |
| Adhoc | `adhoc` non-empty |
| Section-anchor nav | ≥ 2 anchorable sections rendered |
| Lazy feeds (similar/attractions/things-to-do/nearby cities) | each feed returns ≥ 1 item (independently) |

## STRICT component scope — do NOT invent or import these
This page renders **only** the sections in the canonical order above and **only** the components in the list below. Treat the list as exhaustive — if a component is not named here, do not add it. In particular, **never** add any of the following:
- **On the booking widget:** a pax/guest count selector, a quantity stepper, a "how many tickets" control, a time-slot picker, or a variant/ticket-type dropdown. The widget is price + date selection + CTA only; everything else happens in the downstream booking flow.
- **Operator/brand-specific blocks** carried over from the source (Headout) that are not generic product information: e.g. a **"Headout Promise"** / trust-badge panel, **operator payment-program descriptors** ("Book now, pay later" / "Reserve now & pay later" / a free-cancellation *guarantee* badge), Headout-branded promotional banners, app-download banners, loyalty/credits banners, newsletter/email-capture strips, cross-sell "Headout picks" rails, or any block naming or styled after the source operator. These are out of scope — the partner supplies its own brand, payment terms, and trust content.
- **Speculative UI** the API does not back: wishlist/heart buttons, share bars, currency/language switchers, live-chat widgets, countdown/urgency timers, or "X people viewing" social-proof tickers — unless an explicit data field for them appears in Data sources above.
If a partner wants any of the above, it is added deliberately by the partner outside this recipe — this skill must not scaffold them.

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **RatingWidget**, **Gallery** (multi-media + single-media), **DescriptorBadgeRow**, **SectionNav** (sticky in-page anchor tabs), **RichTextBlock**, **VariantSelector**, **Callout** (safety / machine-translation), **ReviewsSection** (summary + distribution + sort/filter + pager), **ReviewCard**, **InfoSection** (titled rich-text block, used for highlights/inclusions/exclusions/summary/additional-info/adhoc), **ItineraryList**, **CancellationPolicyPanel**, **TimingsPanel** (operating hours), **FaqAccordion**, **TicketDeliveryPanel**, **LocationMap**, **BookingWidget** (price + date-selection + "Check availability" CTA only), **ProductCard**, **CityCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **RatingWidget:** `★ value (count)` summary; links/scrolls to the reviews section.
- **Gallery:** multi-media layout = one large hero on the left + a 2×2 grid of four thumbnails on the right, with a "View all images" button overlaid on the last thumbnail (opens a lightbox); single-media fallback when fewer images. The hero column and the thumbnail block are equal height.
- **DescriptorBadgeRow:** row of descriptor items — each is an icon + a short label, and (when the API provides a description) a second line of supporting copy (e.g. "Explore at your pace — choose your entry time"; "Instant mobile ticket — skip the box office"). Render as compact pills when there is no description, or as labelled cards when there is. Render only descriptors that describe the *product/experience*. **Drop any operator payment-program descriptor** — e.g. "Book now, pay later", "Reserve now & pay later", a free-cancellation *guarantee* badge — these are operator-specific (Headout) commerce promises, not product attributes. Do not invent descriptors not in `descriptors[]`.
- **SectionNav:** a horizontal, sticky anchor-tab bar listing one link per rendered content section (in canonical order); clicking scrolls to that section and the active section is highlighted on scroll. Renders only when ≥ 2 anchorable sections exist. No counts/badges, no operator branding.
- **ReviewsSection:** header summary (`★ average`, total count) + a rating-distribution bar chart (per-star counts) + a "What our guests say" list of **ReviewCard**s + (only past the first page) a sort control, filter pills (with-images / 4+ / 3 / <3 stars) and a "Show more reviews" pager. Sort/filter re-query the reviews feed.
- **VariantSelector:** selectable list of variants/combos; selecting reveals a continue CTA.
- **InfoSection:** a titled section rendering rich-text/bulleted content (highlights/inclusions/exclusions/summary/additional-info).
- **CancellationPolicyPanel:** renders the derived cancellation/reschedule copy.
- **TimingsPanel:** opening-hours layout (day → hours rows) with "open today / tomorrow / weekday / date / closed" states.
- **TicketDeliveryPanel:** how tickets are delivered (`ticketDeliveryInfo`).
- **LocationMap:** map with marker/radius, OR a plain copy block when the API says copy-only.
- **BookingWidget:** lead price (`from {amount}`) + a single date-selection control ("Select a date", which may open a date calendar) + a "Check availability" CTA that routes to the booking flow. **Exactly these three elements — no pax/guest counter, no quantity stepper, no time-slot picker, no variant/ticket-type selector.** Collapses to a sticky bottom bar on mobile; falls back to an "email me when available" alert when there's no inventory.
- Reuse **Breadcrumb, Carousel, ReviewCard, FaqAccordion, ProductCard, CityCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs/sheets ~12px; pills/badges ~999px.
- **Type hierarchy:** product title = large bold heading (~28–32px desktop / ~22px mobile); section titles = ~24–28px desktop / ~20px mobile; body = ~16px; price/captions = ~14px. One sans-serif family.
- **Layout:** desktop = the three-area grid in **Desktop grid structure** above (`top` / `details` / `sidebar`); sticky booking rail ~24rem right-aligned; multi-media → gallery full-width on top + sidebar below-right, single-media → gallery top-left + sidebar spanning both rows. Mobile = single column with a sticky bottom booking bar.
- **Gallery:** hero image ~16:9 (or taller on desktop); thumbnail grid beneath; lightbox on click.
- **Badges/lists:** descriptor badges in a wrapping row; inclusions ticks / exclusions crosses are colour-coded (positive accent vs muted).
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Title:** `name` + optional tag-derived suffix (default locale only).
- **Address string:** join `startLocation.{addressLine1, addressLine2, cityName}` with ", ", skipping empties.
- **Descriptor icon/label:** prefer an API-provided icon/label/description; fall back to your own asset/label when absent.
- **Operating-hours formatting:** OPEN → "Open today" + open–close; opens within 24h → "tomorrow"; within 7d → weekday name; else date; CLOSED → closed.
- **Flexible-cancellation subtext:** deadline ≥ 3 days → show days, else hours.
- **Loading:** skeletons sized to the final section/card.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Numeric-id guard; unknown → 404; geo-restricted → not-available state; missing core object → loader (no partial shell).
- [ ] Sections render in canonical order, including the summary dual-position rule.
- [ ] Descriptors re-sorted by the fixed ranking (unknown codes dropped); cancellation-policy text derived (not read from a field).
- [ ] Inclusions and exclusions rendered as separate lists; variants filtered to those with a listing price, order preserved.
- [ ] Gallery multi vs single chosen per the media rule; meeting point honours `displayConfig.type` (map vs copy).
- [ ] Desktop grid uses the three-area (`top`/`details`/`sidebar`) structure: multi-media → gallery full-width on top + booking sidebar below-right; single-media → gallery top-left + sidebar spanning both rows. Descriptors/content live in the `details` column below the gallery, never in `top`. Sidebar is sticky and right-aligned (~24rem).
- [ ] Booking widget vs email-alert chosen by inventory availability; reviews shown only when ratings are enabled.
- [ ] Booking widget contains ONLY price + date selection + "Check availability" CTA — no pax/guest counter, quantity stepper, time-slot picker, or variant dropdown (those live in the downstream booking flow).
- [ ] No operator/brand-specific blocks emitted (no "Headout Promise", source-branded banners, app-download/loyalty/newsletter strips, or "X people viewing" tickers); only the canonical sections and listed components render.
- [ ] Empty fields omit their sections per the presence table; the rendered page is a data-driven subset of the canonical order (fewer sections is correct, not a bug).
- [ ] Section-anchor nav renders only with ≥ 2 sections and links only to sections that actually rendered.
- [ ] Reviews section renders distribution bars / sort / filter pills / "Show more" only when the data and review count justify them; few reviews → summary + cards only.
- [ ] Lazy feeds load client-side for users, server-side for bots.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
