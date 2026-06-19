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
- **Reviews** (separate call): reviews for the product.
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
- A **persistent booking widget / "Check availability" CTA** (sticky on mobile, side rail on desktop) drives the calendar + variant selection.

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
- **Variant/combo selector:** show only if the product has multiple available variants AND has combo variants; selecting one reveals a "Next/Continue" CTA.
- **Itinerary:** show only if itinerary sections exist and each is valid. Heading = "Routes & schedules" for hop-on-hop-off, else "Itinerary".
- **Operating hours:** show only if any point of interest has operating schedules.
- **Reviews:** show only if `reviewsDetails.showRatings`.
- **Booking CTA:** if a listing price exists AND inventory dates exist → render the booking widget; else render an "email me when available" alert.
- **Badge gates:** drop `EXTENDED_VALIDITY` for open-dated tours; show `FLEXIBLE_CANCELLATION` only if a cancellation-insurance config exists AND the product is non-cancellable; show `OPERATING_HOURS` only with point-of-interest schedules.
- **Machine-translation callout:** show if `contentMachineTranslated`.
- **Empty state:** any absent/falsy field → omit that section entirely (no placeholder copy).
- **Crawler/bot:** load lazy feeds + long-form content server-side (for SEO/indexing); real users lazy-load the below-fold feeds client-side.

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **RatingWidget**, **Gallery** (multi-media + single-media), **DescriptorBadgeRow**, **RichTextBlock**, **VariantSelector**, **Callout** (safety / machine-translation), **ReviewCard**, **InfoSection** (titled rich-text block, used for highlights/inclusions/exclusions/summary/additional-info/adhoc), **ItineraryList**, **CancellationPolicyPanel**, **TimingsPanel** (operating hours), **FaqAccordion**, **TicketDeliveryPanel**, **LocationMap**, **BookingWidget** (calendar + variant + CTA), **ProductCard**, **CityCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **RatingWidget:** `★ value (count)` summary; links/scrolls to the reviews section.
- **Gallery:** multi-media layout (hero + thumbnail grid, optional video tile) and a single-media fallback; opens a lightbox on click.
- **DescriptorBadgeRow:** horizontal row of icon + label badges (duration, age limit, cancellation, etc.).
- **VariantSelector:** selectable list of variants/combos; selecting reveals a continue CTA.
- **InfoSection:** a titled section rendering rich-text/bulleted content (highlights/inclusions/exclusions/summary/additional-info).
- **CancellationPolicyPanel:** renders the derived cancellation/reschedule copy.
- **TimingsPanel:** opening-hours layout (day → hours rows) with "open today / tomorrow / weekday / date / closed" states.
- **TicketDeliveryPanel:** how tickets are delivered (`ticketDeliveryInfo`).
- **LocationMap:** map with marker/radius, OR a plain copy block when the API says copy-only.
- **BookingWidget:** date picker + variant choice + lead price + primary CTA; collapses to a sticky bar on mobile; falls back to an "email me when available" alert when there's no inventory.
- Reuse **Breadcrumb, Carousel, ReviewCard, FaqAccordion, ProductCard, CityCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs/sheets ~12px; pills/badges ~999px.
- **Type hierarchy:** product title = large bold heading (~28–32px desktop / ~22px mobile); section titles = ~24–28px desktop / ~20px mobile; body = ~16px; price/captions = ~14px. One sans-serif family.
- **Layout:** desktop = two columns (content left, sticky booking rail right ~360px); mobile = single column with a sticky bottom booking bar.
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
- [ ] Booking widget vs email-alert chosen by inventory availability; reviews shown only when ratings are enabled.
- [ ] Empty fields omit their sections; lazy feeds load client-side for users, server-side for bots.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
