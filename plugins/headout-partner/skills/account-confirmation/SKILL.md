---
name: account-confirmation
description: Build the post-payment booking-confirmation page for an experiences/tickets storefront — the page reached right after a successful booking, where the guest sees their booking status, a ticket/voucher summary card (one card per booking; multiple cards for a combo/multi-booking order), and quick access to their ticket (QR/barcode/PDF). Self-contained spec — section order, the booking-status mapping, status polling, per-booking card anatomy, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking Confirmation

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Confirmation** page the guest lands on straight after a successful booking. They need three things fast: reassurance the booking went through, a clear **status**, and a **ticket/voucher summary card** they can act on. The page is a **hero-banner shell**: a full-bleed product image with a dark/gradient overlay, and a centered **booking card** (or a horizontal row of cards for a multi-booking/combo order) floating over it. Status can update **live** while the page is open. This file is the **single source of truth**: structure, the status mapping, polling, card anatomy, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Resolve the Headout API docs (the configured API-docs MCP server, or `https://partner.headout.com/docs/llms.txt`) and find the **booking GET** and **product GET** sections.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `booking.tickets[].url`, `booking.status`).

   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner's design system first; otherwise build into the shared `ui-components/` folder (the booking/summary card, status badge, and date card are reused by manage-booking and voucher — build them shared).
3. **Assemble** in canonical order, wiring the **status mapping** and **polling** exactly.

## Page-level guards
- This page belongs to the partner's own order/checkout (it is **not** a Headout route). The partner keys it by **its own order/purchase reference**, which maps to **one or more Headout `bookingId`s** (the partner stored this mapping at booking time). Fetch each booking via **booking GET**, server-side through the partner's BFF.
- Unresolved/invalid order reference → 404 (not a partial shell); render a loader until the booking(s) + product detail resolve.
- This page is **behind a completed purchase** — it is **not indexable**; emit no SEO body.
- Do not expose `Headout-Auth` or raw booking JSON to the browser; the BFF returns a mapped, partner-safe view.

## Data sources (map to your endpoints)
- **Booking GET (per `bookingId`):** `status`, `bookingId`, `partnerReferenceId`, `variantId`, `startDateTime`, `customersDetails` (count + customers), `price`, `seatInfo`, **`tickets[]`** (`publicId`/`url`/`type`: QRCODE|BARCODE|PDF_URL), **`voucherUrl`** (PDF), `creationTimestamp`. The partner's order maps to one or more of these.
- **Product GET:** product `name`, hero image, city/location (for the banner + card). (Variant name comes from the product's variant for `variantId`.)
- **Not in the booking API** (so these rows are NOT built): meeting/pickup address, language, a `validUntil`/flexible-validity date, and any "tickets are being prepared" ETA/countdown. Map readiness from `status` + whether `tickets[]`/`voucherUrl` are populated — do not invent a timer.

## Canonical section order (top → bottom)
1. **Hero banner** — full-bleed product image with a dark overlay + a bottom gradient that fades the image into the page background.
2. **Booking card(s)** floating over the banner — one card per booking. A single booking renders one centered card; **two or more bookings (combo/multi) render a horizontal row** that scrolls, with prev/next arrows on desktop when it overflows and equal-height cards.
3. **Ticket/QR access** — for a single booking on a wide viewport, a ticket/voucher box sits beside the card; otherwise the ticket is reached from the card's "View booking details".

### Per-booking card anatomy (top → bottom inside each card)
- **Status banner** — a tinted strip with an icon + status text, derived from the booking `status` (see mapping). Confirmed uses a success tint; pending uses a neutral/processing tint; cancelled/failed uses an error tint.
- **Booking-id row** — "Booking ID {bookingId}" (or the partner reference) with a copy affordance; for combo, prefix with "{index}/{total}".
- **Product name.**
- **Booking details grid** — a date card (day / month / weekday from `startDateTime`) beside stacked info rows, each an icon + value: seats (`seatInfo`) **or** variant name; time; guest count (`customersDetails.count`).
- **"View booking details"** — an expandable CTA (chevron) that reveals the ticket/voucher access for that booking.

## Ordering & derivation of raw data
- **Status → display:** map the Headout booking `status` enum: `COMPLETED` → confirmed (success treatment, tickets available); `PENDING` → "confirming your booking" (processing treatment); `CANCELLED`/`FAILED`/`CAPTURE_TIMEDOUT` → error treatment. Do not invent "preparing/delayed/ready" sub-states the API doesn't expose.
- **Ticket readiness:** show the ticket/voucher box when `tickets[]` or `voucherUrl` is populated; otherwise show the status only (no ticket box yet).
- **Live polling:** while the page is open and any booking is still `PENDING` (no tickets yet), re-fetch booking GET on an interval and swap in the updated booking; stop once it reaches a terminal status (`COMPLETED`/`CANCELLED`/`FAILED`) or tickets appear.
- **Seat vs variant:** if `seatInfo` exists, render seats (section-prefixed); else render the variant name.

## Conditional render rules
- **Single vs multi card:** one booking → single centered card; ≥2 → horizontal scroller; arrows show on desktop only when content overflows.
- **Ticket/voucher box beside the card:** only for a single booking on a wide viewport; otherwise reached via "View booking details".
- **Seats vs guest count:** show guest count only when there is no `seatInfo`.
- **Ticket box:** only when `tickets[]`/`voucherUrl` is present.
- **Status banner:** always present; tint follows the status mapping.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **HeroBanner** (image + dark overlay + bottom fade gradient), **BookingCard** (status banner + booking-id row + product name + details grid + expandable CTA) and **BookingCardRow** (scroller + prev/next arrows + equal-height), **StatusBadge/StatusBanner**, **DateCard** (day/month/weekday) + **PlaceholderDateCard**, **InfoRow** (icon + value), **TicketQRBox** (QR/barcode/PDF access from `tickets[]`/`voucherUrl`), **SkeletonLoader**.

**Step A — reuse the partner's design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **BookingCard, StatusBadge, DateCard, InfoRow, Button** are reused by manage-booking and voucher — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
The partner's design system wins; the values below are only a fallback when none exists.
- **Shell:** full-bleed hero image, centered content; the booking card(s) overlap the lower third of the image. Mobile: single column, card stacks under the banner.
- **Spacing/radius:** a consistent spacing scale; cards rounded; the status banner follows the card's top radius; copy/pill chips pill-shaped.
- **Type:** product name prominent/heavy; status text heavy; info rows regular; booking-id small.
- **Color:** neutral card surface over the dark image; a success accent for confirmed, a neutral/processing accent for pending, an error accent for cancelled/failed; one primary brand accent for CTAs/links; keep text on the card (not on the image) for contrast.
- **Hero overlay:** dark scrim + a bottom gradient so the image dissolves into the page; size the fade to the card's height so the card rests on a solid surface.

## Field mappings & fallbacks
- `bookingId` → "Booking ID {ref}" (+ copy). Missing → omit the row.
- `status` → status treatment + text per the mapping above.
- `startDateTime` → DateCard + time row; missing → PlaceholderDateCard.
- `seatInfo` → "{Section}: {seats}"; else variant name; neither → omit the seats/variant row.
- `customersDetails.count` → guest count (when no seat info).
- `tickets[]`/`voucherUrl` absent (still pending) → show the status, no ticket box yet.

## Acceptance checks
- [ ] API contract confirmed: booking GET + product GET fields resolved and exact paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] Keyed by the partner's own order reference → one or more `bookingId`s via booking GET (server-side BFF); invalid reference → 404; loader until resolved; no SEO body (not indexable).
- [ ] Sections render in canonical order; single booking = one centered card, ≥2 = horizontal scroller with equal-height cards and desktop overflow arrows.
- [ ] **Status** derived from the real booking enum (COMPLETED/PENDING/CANCELLED/FAILED); **no invented preparing/ready countdown**; polling re-fetches while PENDING and stops at a terminal status or once tickets appear.
- [ ] Card anatomy correct: status banner → booking-id (copy) → product name → date card + info rows (seats/variant, time, guest count) → expandable "View booking details" revealing ticket/QR from `tickets[]`/`voucherUrl`. No meeting-point, language, or valid-until rows (not in the booking API).
- [ ] UI primitives map to the partner design system OR are built into `ui-components/`; BookingCard/StatusBadge/DateCard reusable across manage-booking and voucher.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
