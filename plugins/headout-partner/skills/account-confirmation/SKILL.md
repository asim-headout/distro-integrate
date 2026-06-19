---
name: account-confirmation
description: Build the post-payment booking-confirmation page for an experiences/tickets storefront — the page reached at /confirmation/{purchaseId} immediately after a successful payment, where the guest sees their booking status, a ticket/QR summary card (one card per booking; multiple cards for a combo), a live "tickets are being prepared" countdown that flips to "ready", and quick access to their ticket. Self-contained spec — section order, the booking-status state machine (PREPARING / DELAYED → READY with a countdown), live polling, per-booking card anatomy, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking Confirmation

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Confirmation** page — `/confirmation/{purchaseId}`. The guest lands here straight after a successful payment and needs three things fast: reassurance the booking went through, a clear **status** (are my tickets ready, or still being prepared?), and a **ticket summary card** they can act on. The page is a **hero-banner shell**: a full-bleed product image with a dark/gradient overlay, and a centered **booking card** (or a horizontal row of cards for a multi-booking/combo order) floating over it. Status updates **live** while the page is open. This file is the **single source of truth**: structure, the status state machine, polling, card anatomy, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Fetch `https://partner.headout.com/docs/llms.txt` and find the relevant endpoint sections for: booking itinerary by purchase id, booking status, ticket/QR, product details for confirmation.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the booking/summary card, status badge, and date card are reused by manage-booking and voucher — build them shared).
3. **Assemble** in canonical order, wiring the **status state machine** and **live polling** exactly.

## Page-level guards
- Resolve the booking itinerary by `purchaseId` first. Unresolved/invalid id → 404 (not a partial shell); render a loader until the itinerary + product detail resolve.
- This page is **behind a completed purchase** — it is **not indexable**; emit no SEO body.
- The `purchaseId` from the URL is the only identity input; do not require login to view (the link is the guest's proof of purchase).

## Data sources (map to your endpoints)
- **Booking itinerary by purchase id:** the order — one or more `bookings[]`; each booking has a `status`, `bookingId` (human-readable ref), product/variant name, date, time, guest count, seat info, language (if guided), pickup/meeting address, and a `validUntil` (for open/flexible tickets).
- **Per-booking fulfilment + status:** status enum (preparing / delayed / ready) and a fulfilment type that tells you whether tickets arrive quickly (so a short countdown is meaningful) or are issued ahead of the experience date.
- **Product detail:** product name, hero image, city/location (for the banner + card).
- **Ticket / QR access:** the ticket artifact (QR, barcode, or PDF link) once status is ready.

## Canonical section order (top → bottom)
1. **Hero banner** — full-bleed product image with a dark overlay + a bottom white gradient that fades the image into the page background.
2. **Booking card(s)** floating over the banner — one card per booking. A single booking renders one centered card; **two or more bookings (combo/multi) render a horizontal row** that scrolls, with prev/next arrows on desktop when it overflows and equal-height cards.
3. **Ticket/QR access** — for a single non-combo booking on a wide viewport, a ticket/QR box sits beside the card; otherwise the ticket is reached from the card's "View booking details".

### Per-booking card anatomy (top → bottom inside each card)
- **Status banner** — a tinted strip with an icon + status text. Two visual states cross-fade: a **pending** tint while preparing/delayed, a **ready** tint when ready. When a countdown is active the text reads as a label + a bold live timer (e.g. "Preparing your tickets · {mm:ss}").
- **Booking-id row** — "Booking ID {ref}" with a copy affordance; for combo, prefix with "{index}/{total}".
- **Product name.**
- **Booking details grid** — a date card (day / month / weekday) beside stacked info rows, each an icon + value: seats **or** variant; language (guided only); meeting/pickup address; time; guest count; "Valid until {date}" (flexible tickets).
- **"View booking details"** — an expandable CTA (chevron) that reveals the ticket/QR access for that booking.

## Ordering & derivation of raw data
- **Status → display:** map the raw status to one of `preparing` / `delayed` / `ready`. `ready` uses the success (green) treatment; `preparing`/`delayed` use the warning (amber) treatment.
- **Countdown:** when status is preparing/delayed (or a quick-fulfilment ready booking on its first view), run a countdown from an estimated-prepare duration. Persist the countdown start per `bookingId` (client storage) so it survives reloads and resumes rather than restarting; clear it once the booking is ready. When it expires, flip the status text to ready.
- **Live polling:** while the page is open and any booking is not yet ready, re-fetch the itinerary on an interval and swap in the updated bookings; stop once all are ready.
- **Combo countdown skip:** if any booking in a combo is issued ahead of the experience date (not quick-fulfilment), suppress the per-card countdown and show a plain "preparing" message instead of a timer.
- **Seat vs variant:** if seat info exists, render seats (section-prefixed); else render the variant name.

## Conditional render rules
- **Single vs multi card:** one booking → single centered card; ≥2 → horizontal scroller; arrows show on desktop only when content overflows.
- **Ticket/QR box beside the card:** only for a single non-combo booking on a wide viewport; otherwise reached via "View booking details".
- **Guided-tour language row:** only when the product is a guided tour and a language exists.
- **Seats vs guest count:** show guest count only when there is no seat info.
- **Valid-until row:** only for flexible/open-dated tickets that expose a `validUntil`.
- **Status banner:** always present; the pending/ready tints cross-fade on transition.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **HeroBanner** (image + dark overlay + bottom fade gradient), **BookingCard** (status banner + booking-id row + product name + details grid + expandable CTA) and **BookingCardRow** (scroller + prev/next arrows + equal-height), **StatusBadge/StatusBanner** (pending ↔ ready cross-fade), **CountdownTimer** (live mm:ss, persisted), **DateCard** (day/month/weekday) + **PlaceholderDateCard**, **InfoRow** (icon + value), **TicketQRBox** (QR/barcode/PDF access), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **BookingCard, StatusBadge, DateCard, InfoRow, Button** are reused by manage-booking and voucher — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** full-bleed hero image (max ~400px tall), centered content max width ~75rem; the booking card(s) overlap the lower third of the image. Mobile: single column, card stacks under the banner.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards ~12–16px; the status banner follows the card's top radius; copy/pill chips ~999px.
- **Type:** product name ~18–20px heavy; status text ~14–16px heavy; info rows ~14px; booking-id ~12–14px.
- **Color:** neutral white card surface over the dark image; **green** accent for ready, **amber** accent for preparing/delayed; one primary brand accent for CTAs/links; muted grey secondary text; WCAG AA contrast (the card sits on a darkened image — keep text on the white card, not on the image).
- **Hero overlay:** dark scrim + a bottom white gradient so the image dissolves into the page; recompute the fade to the card's height so the card always rests on white.

## Field mappings & fallbacks
- `bookingId` → "Booking ID {ref}" (+ copy). Missing → omit the row.
- `status` → pending/ready treatment + status text; with countdown when applicable.
- `date` → DateCard; missing date → PlaceholderDateCard.
- `seatInfo[]` → "{Section}: {seats}"; else `variantName`; neither → omit the seats/variant row.
- `validUntil` → "Valid until {date}"; missing → omit.
- ticket artifact absent (still preparing) → show the status/countdown, no ticket box yet.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] Invalid/unresolved `purchaseId` → 404; loader until itinerary + product resolve; page emits no SEO body (not indexable).
- [ ] Sections render in canonical order; single booking = one centered card, ≥2 = horizontal scroller with equal-height cards and desktop overflow arrows.
- [ ] **Status state machine** correct: pending/ready tints cross-fade; countdown runs for preparing/delayed (and quick-fulfilment first view), persists per booking across reloads, and flips to ready on expiry; combo with ahead-of-date fulfilment suppresses the timer.
- [ ] **Live polling** re-fetches while any booking is not ready and stops once all are ready.
- [ ] Card anatomy correct: status banner → booking-id (copy) → product name → date card + info rows (seats/variant, language if guided, address, time, guest count, valid-until) → expandable "View booking details" revealing ticket/QR.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; BookingCard/StatusBadge/DateCard reusable across manage-booking and voucher.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
