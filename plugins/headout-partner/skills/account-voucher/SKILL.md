---
name: account-voucher
description: Build the redeemable booking voucher/ticket page for an experiences/tickets storefront — the page reached at /voucher/{bookingId} that the guest presents at the venue. It shows the booking header, the redemption artifact (voucher PDF + per-ticket QR / barcode / PDF), and core booking details (variant, date/time, guests, seats). Handles voucher states (active / pending / cancelled), a multi-ticket split (one printable voucher per ticket), and an embeddable iframe mode. Self-contained spec — section order, the voucher-state machine, the redemption-artifact branches, multi-ticket split, embed mode, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking Voucher / Ticket

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Voucher** page — `/voucher/{bookingId}`. This is the document the guest **presents at the venue**, so it must be print-friendly, scannable, and unambiguous. The page is a **single-column document shell**: a booking header, the **redemption artifact** (the voucher PDF and per-ticket QR / barcode / PDF), and the core booking details below. It renders differently for **active**, **pending**, and **cancelled** bookings, splits into **one voucher per ticket** for multi-ticket orders, and also runs inside an **embeddable iframe**. This file is the **single source of truth**: structure, the voucher-state machine, the redemption-artifact branches, the multi-ticket split, embed mode, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Resolve the Headout API docs (the configured API-docs MCP server, or `https://partner.headout.com/docs/llms.txt`) and find the **booking GET** and **product GET** sections.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `booking.tickets[].type`, `booking.voucherUrl`).

   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner's design system first; otherwise build into the shared `ui-components/` folder (the booking-details grid is reused by confirmation/manage-booking — build it shared).
3. **Assemble** in canonical order, wiring the **voucher-state machine** and **redemption-artifact branch** exactly.

## Page-level guards
- Resolve the booking by `bookingId` via **booking GET**, server-side through the partner's BFF (the partner authorizes the request against its own user/session; there is no public guest-lookup endpoint). Render a loader until it resolves; unresolved → 404.
- This page is **behind a booking** — **not indexable**; emit no SEO body. The embed mode must also be noindex.
- The page must be **print-friendly** (clean print layout; one ticket per printed page in the multi-ticket case).
- Do not expose `Headout-Auth` or raw booking JSON to the browser.

## Data sources (map to your endpoints)
- **Booking GET (by `bookingId`):** `bookingId`, `partnerReferenceId`, `variantId`, `status`, `startDateTime`, `customersDetails` (count + customers: name via `inputFields`), `seatInfo`, `price`, **`voucherUrl`** (PDF of the whole voucher), **`tickets[]`** — each with `publicId`, `url`, and `type` (`QRCODE` | `BARCODE` | `PDF_URL`).
- **Product GET:** product/tour-group `name` (heading) and the variant name for `variantId`.
- **Not in the booking API** (so these are NOT built): redemption instructions / reporting time / ID requirements, pickup/drop-off & meeting point, language, operator/vendor image & details, and pay-later/amount-due. (An optional cancellation-policy line may be derived from product GET's `cancellationPolicy` if you want one — it is not on the booking.)

## Canonical section order (top → bottom)
1. **Voucher header** — booking reference, product/tour-group heading, "Selected option: {variant}".
2. **Redemption artifact** — the scannable/printable artifact(s) for this voucher: the per-ticket QR/barcode/PDF from `tickets[]` and/or the voucher PDF (`voucherUrl`), with a short "how to redeem" callout.
3. **Booking details** — a "Booking details" heading + a details grid: guests (`customersDetails.count`), customer name, date/time, seats (`seatInfo`) or variant.

## Ordering & derivation of raw data
- **Voucher-state machine:** derive one of three renders from `status` —
  - **cancelled** (`CANCELLED` / `FAILED` / `CAPTURE_TIMEDOUT`) → a dedicated **Cancelled voucher** view (no redemption artifact; explain the booking is cancelled).
  - **pending** (`PENDING`, or no `tickets[]`/`voucherUrl` yet) → a **Pending voucher** view (booking confirmed but ticket not yet issued; show details, no scannable artifact yet).
  - **active** (`COMPLETED` with artifacts) → the full voucher body above.
- **Multi-ticket split:** when `tickets[]` has more than one entry, render **one voucher body per ticket** (each "page {n}/{total}"), separated by a page break so each prints on its own page.
- **Redemption-artifact branch (by `tickets[].type`):** `QRCODE` → render the QR from `url`; `BARCODE` → render the barcode from `url`; `PDF_URL` → a "view/download PDF" affordance. Also expose `voucherUrl` as a "download voucher (PDF)" action. Do not invent text-code / exchange / escorted / guided redemption methods — the API does not expose them.

## Conditional render rules
- **Cancelled / pending states** short-circuit the body (render their dedicated views).
- **"Selected option" row:** only when a variant/option name exists.
- **Seats vs guests:** show seats when `seatInfo` exists; otherwise show the guest count.
- **Embed mode:** when rendered in the iframe/embed entrypoint, render the voucher body only — no site header/footer — and keep it noindex.
- **Loading:** skeleton sized to the header + redemption artifact + details grid.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **VoucherHeader** (reference + heading + option), **RedemptionArtifact** (QR / Barcode / PdfLink variants, from `tickets[].type` + `voucherUrl`), **CalloutBanner** (how-to-redeem callout), **DetailsGrid** (guests / customer / date-time / seats rows), **PageBreak** (multi-ticket separator), **CancelledVoucherView**, **PendingVoucherView**, **SkeletonLoader**.

**Step A — reuse the partner's design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **DetailsGrid, CalloutBanner, Button** are reused by confirmation and manage-booking — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
The partner's design system wins; the values below are only a fallback when none exists.
- **Shell:** centered single column on a plain surface so it prints cleanly. Mobile: full-width.
- **Spacing/radius:** a consistent spacing scale; the redemption artifact sits in a bordered/elevated box.
- **Type:** booking reference small/caption; product heading prominent; section headings medium; body regular.
- **Redemption artifact:** centered, generously padded, high-contrast on a light surface so a scanner reads it; QR/barcode at a print-safe size.
- **Color:** neutral surfaces; one primary brand accent for CTAs/links; muted grey secondary text; cancelled state in a muted/neutral treatment. Print styles: hide non-essential chrome, force page breaks between tickets.

## Field mappings & fallbacks
- `bookingId` → "Booking ID {ref}".
- `status` → active / pending / cancelled render branch.
- `tickets[].type` + `url` → RedemptionArtifact variant; `voucherUrl` → download-voucher-PDF action; no artifact on an active voucher → show the how-to-redeem callout only.
- `tickets[]` length > 1 → one voucher body per ticket with page breaks; else single body.
- variant/option → "Selected option: {name}"; missing → omit.
- `customersDetails.count` → guests; `seatInfo` → seats (when present).

## Acceptance checks
- [ ] API contract confirmed: booking GET + product GET fields resolved and exact paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] Resolved by `bookingId` via booking GET (server-side BFF); unresolved → 404; loader until resolved; page (and embed) emit no SEO body and are noindex.
- [ ] **Voucher-state machine** correct: cancelled/failed → Cancelled view; pending/no-artifact → Pending view; completed-with-artifacts → full body.
- [ ] **Multi-ticket split** correct: `tickets[]` length > 1 → one voucher per ticket with page breaks and "page n/total"; prints one ticket per page.
- [ ] **Redemption-artifact branch** renders by `tickets[].type` (QR / barcode / PDF) plus the `voucherUrl` PDF; no invented text-code / exchange / escorted / guided methods.
- [ ] Sections render in canonical order: header → redemption artifact → booking details grid. No redemption-instructions, pickup/meeting, language, operator, or pay-now sections (not in the booking API).
- [ ] Embed mode renders the body only (no site chrome) and stays noindex.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/`; DetailsGrid/CalloutBanner reusable across confirmation and manage-booking.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
