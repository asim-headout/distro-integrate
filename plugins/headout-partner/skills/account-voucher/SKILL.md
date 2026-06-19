---
name: account-voucher
description: Build the redeemable booking voucher/ticket page for an experiences/tickets storefront — the page reached at /voucher/{bookingId} that the guest presents at the venue. It shows the booking header, the redemption method (QR / barcode / PDF / text code), booking details (pax, pickup/meeting point, language), redemption instructions, location, cancellation policy, and operator/support details. Handles voucher states (active / pending / cancelled-or-refunded) and a multi-ticket split (one printable voucher per ticket), plus an embeddable iframe mode. Self-contained spec — section order, the voucher-state machine, the redemption-method branches, multi-page split, embed mode, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking Voucher / Ticket

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Voucher** page — `/voucher/{bookingId}`. This is the document the guest **presents at the venue** to gain entry, so it must be print-friendly, scannable, and unambiguous. The page is a **single-column document shell**: a booking header, the **redemption artifact** (QR / barcode / PDF / text code), the booking details, and the instructions/location/policy/operator blocks below. It renders differently for **active**, **pending**, and **cancelled/refunded** bookings, splits into **one voucher per ticket** for multi-ticket orders, and also runs inside an **embeddable iframe**. This file is the **single source of truth**: structure, the voucher-state machine, the redemption-method branches, the multi-page split, embed mode, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Fetch `https://partner.headout.com/docs/llms.txt` and find the relevant endpoint sections for: voucher / booking ticket by id, redemption method QR barcode pdf, redemption instructions, pickup location, cancellation policy, ticket list.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the booking-details grid and instructions accordion are reused by confirmation/manage-booking — build them shared).
3. **Assemble** in canonical order, wiring the **voucher-state machine** and **redemption-method branch** exactly.

## Page-level guards
- Resolve the voucher/booking by `bookingId` first; render a loader until it resolves; unresolved → 404.
- This page is **behind a booking** — **not indexable**; emit no SEO body. The embed mode must also be noindex.
- Set the page's localized-content language from the voucher's own language (the venue copy must match the ticket).
- The page must be **print-friendly** (clean print layout; one ticket per printed page in the multi-ticket case).

## Data sources (map to your endpoints)
- **Voucher / booking detail by id:** booking reference, product/tour-group heading, selected option/variant, date/time, status, language, an optional vendor/operator image.
- **Redemption method + artifact:** the method (scan QR / scan barcode / show PDF / show text code / exchange-for-ticket / escorted entry / guided / live) and the artifact data (QR/barcode payload, PDF link(s), or code text).
- **Tickets list:** one or more tickets; a `multiplePage` flag indicating each ticket should render as its own voucher.
- **Booking details:** pax/guest breakdown, customer name, pickup/drop-off location (+ "add pickup details" when missing), meeting point (address + coordinates), guided-tour language, filter/variant property values.
- **Redemption instructions:** general instructions, reporting time, photo-ID / late-arrival requirements, location details, cancellation policy — typically structured + rich text.
- **Pay-now (only for reserve-now-pay-later bookings):** amount due + charge date/time + a pay link.
- **Operator / support details:** operator name/contact and a support/help affordance.

## Canonical section order (top → bottom)
1. **Voucher header** — booking reference, product/tour-group heading, "Selected option: {variant}", optional operator/vendor image.
2. **Pay-now block** — *(reserve-now-pay-later only)* amount due + charge date + Pay-now CTA.
3. **Redemption method** — the scannable artifact for this voucher (see branches) with a short "how to redeem" callout.
4. **Booking details** — a "Booking details" heading + a details grid: pax/guests, customer name, pickup/drop-off (or "Add pickup details"), meeting point, language.
5. **Redemption instructions** — general instructions, reporting time, what to carry (photo-ID), how-to-reach/location, then the **cancellation policy**.
6. **Operator / support** — operator details + a contact/support affordance.

## Ordering & derivation of raw data
- **Voucher-state machine:** derive one of three renders from status —
  - **cancelled/refunded/uncaptured** → a dedicated **Cancelled voucher** view (no redemption artifact; explain the booking is cancelled/refunded).
  - **pending** → a **Pending voucher** view (booking confirmed but ticket not yet issued; show details, no scannable artifact yet).
  - **active** (default) → the full voucher body above.
- **Multi-page split:** when `multiplePage` is true and there is more than one ticket, render **one voucher body per ticket** (each with "page {n}/{total}"), separated by a page break so each prints on its own page.
- **Redemption-method branch (pick by method):** **QR** → a QR image; **barcode** → a barcode image; **PDF** → a "view/download PDF" affordance (handle multiple PDFs); **text code** → the code in large monospace; **exchange/escorted/guided/live/HOHO** → an instruction callout instead of a scannable artifact.
- **Pickup details:** when a pickup is required but missing, show an "Add pickup details" link to the manage-booking flow; when present, show the pickup/drop-off/meeting point.
- **Reporting/ID requirements:** surface late-arrival policy, photo-ID-required, and reporting time when the structured instruction flags them.

## Conditional render rules
- **Cancelled / pending states** short-circuit the body (render their dedicated views).
- **Pay-now block:** reserve-now-pay-later bookings only.
- **Operator/vendor image:** only when supplied.
- **"Selected option" row:** only when a variant/option name exists.
- **Pickup/meeting blocks:** only for products that have them; "Add pickup details" only when required-but-missing.
- **Embed mode:** when rendered in the iframe/embed entrypoint, render the voucher body only — no site header/footer — and keep it noindex.
- **Loading:** skeleton sized to the header + redemption artifact + details grid.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **VoucherHeader** (reference + heading + option + operator image), **RedemptionArtifact** (QR / Barcode / PdfLink / CodeText variants), **CalloutBanner** (how-to-redeem / instruction callouts, renders rich text safely), **DetailsGrid** (pax / customer / pickup / meeting / language rows), **InstructionsBlock** (general / reporting time / ID / location / policy), **PageBreak** (multi-ticket separator), **PayNowBlock**, **CancelledVoucherView**, **PendingVoucherView**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **DetailsGrid, CalloutBanner/Accordion, Button** are reused by confirmation and manage-booking — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add; preserve literal class hooks that external rich-text content targets.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered single column, document max width ~48–55rem on a plain white surface (so it prints cleanly). Mobile: full-width.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/blocks ~12px; the redemption artifact sits in a bordered/elevated box.
- **Type:** booking reference ~12px caption; product heading ~16–21px medium; section headings ~16–18px; body ~14–15px; the text code in a large monospaced style.
- **Redemption artifact:** centered, generously padded, high-contrast on white so a scanner reads it; QR/barcode at a print-safe size.
- **Color:** neutral white surfaces; one primary brand accent for CTAs/links; muted grey secondary text; cancelled state in a muted/neutral treatment; WCAG AA contrast. Print styles: hide non-essential chrome, force page breaks between tickets.

## Field mappings & fallbacks
- `bookingId` → "Booking ID {ref}".
- `status` → active / pending / cancelled render branch.
- redemption `method` + artifact → RedemptionArtifact variant; missing artifact on an active voucher → show instructions callout only.
- `tickets[]` + `multiplePage` → one voucher body per ticket with page breaks; else single body.
- `variant`/option → "Selected option: {name}"; missing → omit.
- pickup/meeting fields → DetailsGrid rows; required-but-missing pickup → "Add pickup details" link.
- pay-now fields → PayNowBlock; absent → omit.
- operator image/details → header image + operator block; absent → omit.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] Unresolved `bookingId` → 404; loader until resolved; page (and embed) emit no SEO body and are noindex; content language follows the voucher language.
- [ ] **Voucher-state machine** correct: cancelled/refunded/uncaptured → Cancelled view; pending → Pending view; active → full body.
- [ ] **Multi-ticket split** correct: `multiplePage` + >1 ticket → one voucher per ticket with page breaks and "page n/total"; prints one ticket per page.
- [ ] **Redemption-method branch** renders the right artifact (QR / barcode / PDF / text code) or an instruction callout for exchange/escorted/guided/live methods.
- [ ] Sections render in canonical order: header → pay-now (RNPL only) → redemption → booking details grid → instructions/policy → operator/support; pickup "Add details" appears only when required-but-missing.
- [ ] Embed mode renders the body only (no site chrome) and stays noindex.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; DetailsGrid/CalloutBanner reusable across confirmation and manage-booking.
- [ ] No internal/operator branding beyond the booking's own operator block; rendering uses the partner's brand and content.
