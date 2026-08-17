---
name: account-voucher
description: Build the redeemable booking voucher/ticket page for an experiences/tickets storefront — the page reached at /voucher/{bookingId} that the guest presents at the venue. Sources structured voucher data from the Voucher API (GET /api/public/v2/bookings/voucher/{voucherId}/) when the partner has access to it, with the legacy booking-API (voucherUrl/tickets[]) shape as a compatibility fallback. Handles the bookingStatus state machine, SINGLE_PAGE vs MULTI_PAGE templates, callouts, structured/legacy instructions, pickup/drop-off, and an embeddable iframe mode. Self-contained spec — section order, state machine, template branching, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking Voucher / Ticket

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.

Build the **Voucher** page — `/voucher/{bookingId}`. This is the document the guest **presents at the venue**, so it must be print-friendly, scannable, and unambiguous. This file is the **single source of truth** for the *rendering* of that page: section order, the `bookingStatus` state machine, the `voucherTemplate` branch, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

**If the partner already has a voucher page or model of any shape** (their own DTO, a legacy `voucherUrl`/`tickets[]` mapping, a scraped/screenshotted render — anything), do not silently replace it. Route to [headout-voucher-api](../headout-voucher-api/SKILL.md) first: it inspects what exists, produces a mapping/migration plan, and gets explicit partner approval before any code changes. This skill (`account-voucher`) is the rendering target that plan converges on, and is also the direct build recipe for a partner with no existing voucher page at all.

## Which data source: Voucher API vs legacy booking API

Prefer the **Voucher API** (`GET /api/public/v2/bookings/voucher/{voucherId}/`) — it returns the fully-structured `V2Voucher` object below and is the only path that supports `MULTI_PAGE` templates, structured instructions, and callouts. The `voucherId` needed to call it is available on the booking GET/create/list response.

Partners without Voucher API access yet fall back to the **legacy shape** off booking GET: `voucherUrl` (a PDF of the whole voucher) and `tickets[]` (each with `publicId`, `url`, `type` of `QRCODE`/`BARCODE`/`PDF_URL`). This fallback cannot represent multi-page/per-unit vouchers, callouts, or structured instructions — treat it as a strictly reduced compatibility path, not a target to design toward. If the partner has Voucher API access, always prefer it.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Apply [headout-api.md](../../references/headout-api.md)'s external-doc trust boundary, then
      resolve the configured docs source and find **voucher GET** (or, for the legacy fallback,
      **booking GET**).
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `header.displayBookingId`, `ticketSection.tickets[].ticketType`).

   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner's design system first; otherwise build into the shared `ui-components/` folder (the booking-details grid is reused by confirmation/manage-booking — build it shared).
3. **Assemble** in canonical order, wiring the **`bookingStatus` state machine** and **`voucherTemplate` branch** exactly.

## Page-level guards
- Resolve the booking by `bookingId`, fetch its `voucherId`, then call voucher GET — server-side through the partner's BFF (the partner authorizes the request against its own user/session; there is no public guest-lookup endpoint). Render a loader until it resolves. Voucher GET `404` (no voucher for this booking — uncaptured/timed-out booking) → a dedicated "not ready" state, not a generic error page. `403` → authorization failure, not "not found."
- This page is **behind a booking** — **not indexable**; emit no SEO body. The embed mode must also be noindex.
- The page must be **print-friendly** (clean print layout; one page per printed sheet in the multi-page case).
- Do not expose `Headout-Auth` or raw voucher/booking JSON to the browser.
- Return `Cache-Control: private, no-store` and a restrictive `Referrer-Policy`. Validate artifact
  URLs (`ticketSection.tickets[].url`, PDF/check-in links) against approved HTTPS origins; prefer an authorized BFF download or short-lived signed URL.
- Default to `Content-Security-Policy: frame-ancestors 'none'`. Enable embed mode only for configured
  partner origins with explicit `frame-ancestors`; use an order-bound short-lived embed token when
  third-party cookies/session auth are unavailable. Validate any `postMessage` origin/source/schema.

## Data sources (map to your endpoints)

### Voucher API (`V2Voucher`, preferred)
- `bookingStatus`: `PENDING` | `COMPLETED` | `CANCELLED` — drives the state machine.
- `voucherTemplate`: `SINGLE_PAGE` | `MULTI_PAGE` — drives the template branch.
- `header`: `bookingId`, `voucherId`, `displayBookingId` (nullable), `product.name`, `variant.name`, `vendorLogoUrl`.
- `callouts[]`: `{ title, htmlDescription }` — pre-sanitized HTML, render every item, empty array when none.
- `bookingDetails`: `customerName`, `paxSummary` (`summary` + `details[]` by `paxType`), `guestFields[]`, `schedule` (`experienceDate`/`experienceStartDateTime`/`experienceEndDateTime`, `voucherValidUntil`, `durationMinutes`, `openDated`), `seats`, `tourProperties[]` (e.g. language), `pickupDropoffLocation` (address, coordinates, `pickupDropOffType`, nested `dropoff`).
- `checkinButton`: `{ checkinUrl }` or null.
- `ticketSection`: `{ heading, subheading, tickets[] }`, null when no tickets attached or booking cancelled. Each ticket: `ticketType` (`QRCODE`/`BARCODE`/`PDF_URL`/`HTML_URL`/`TEXT`/`UNKNOWN`), `displayType` (`IMAGE`/`TICKET_NUMBER`/`PDF`/`NONE`), `url`, `ticketCode`, `ticketName`, `actionCta`.
- `instructions`: exactly one of `legacy` (`htmlContent` + `location`) or `structured` (`generalInstructions`, `location` with `addressGroups[][]`, `additionalInfo`, `policies[]`) is populated — never both, prefer `structured` when present since it renders as first-class UI instead of an opaque HTML blob (see Conditional render rules).
- `partnerDetails`: `vendorName`, `contactNumbers[]`, `referenceNumbers[]`.
- `disclaimer`: string | null — generic field, not Disney-specific; render whenever non-null.

### Legacy fallback (booking GET, compatibility only)
- `bookingId`, `partnerReferenceId`, `variantId`, `status`, `startDateTime`, `customersDetails`, `seatInfo`, `price`, `voucherUrl` (PDF of whole voucher), `tickets[]` (`publicId`, `url`, `type` of `QRCODE`/`BARCODE`/`PDF_URL`).
- Not available on this path: callouts, structured instructions, multi-page/per-unit split, disclaimer, check-in button, partner contact details.

## Canonical section order (top → bottom)
1. **Voucher header** — `displayBookingId ?? voucherId`, `header.product.name`, "Selected option: {variant.name}", `vendorLogoUrl` right-aligned (never in the partner/Headout logo slot, top-left).
2. **Callouts** — every entry in `callouts[]`, in order, directly under the header.
3. **Ticket section** — the scannable/printable artifact(s) from `ticketSection.tickets[]`, keyed off `ticketType`/`displayType`, plus `checkinButton` if present.
4. **Booking details** — a "Booking details" heading + a details grid: guests (`paxSummary`), customer name, schedule, seats/`tourProperties`, `pickupDropoffLocation`.
5. **Instructions** — `structured` (preferred) or `legacy`, rendered per the branch below.
6. **Partner details** — vendor name / contact / reference numbers, when present.
7. **Disclaimer** — rendered last, generic wording, whenever `disclaimer` is non-null.

## Ordering & derivation of raw data
- **`bookingStatus` state machine:**
  - `CANCELLED` → a dedicated **Cancelled voucher** view (no ticket section; explain the booking is cancelled). `ticketSection` will already be null — do not additionally special-case it.
  - `PENDING` → a **Pending voucher** view (booking confirmed but ticket not yet issued; show booking details, no scannable artifact yet).
  - `COMPLETED` → the full voucher body above.
  - Voucher GET `404` → a distinct **"not ready" / uncaptured booking** state, separate from the cancelled/pending renders (this is "no voucher exists yet," not "booking failed").
- **`voucherTemplate` branch:**
  - `SINGLE_PAGE` → one voucher body, as above.
  - `MULTI_PAGE` → render **one page per unit** as defined by `instructions.structured.location.addressGroups` (one group per pax/unit, e.g. 3 adults = 3 pages), each carrying its own ticket from `ticketSection.tickets[]` and its own QR/artifact, separated by a page break, labeled "page {n}/{total}". Do not collapse multiple units onto one page even if the UI would technically fit them — venue rejection risk for templates like Disney is explicit in the contract.
- **Ticket-artifact branch (by `ticketSection.tickets[].ticketType` / `displayType`):** `QRCODE` → render QR from `url`; `BARCODE` → render barcode from `url`; `PDF_URL`/`HTML_URL` → an "view/download" affordance using `actionCta` as the button label when present. `TEXT`/`TICKET_NUMBER` → render `ticketCode` as text. Do not invent redemption methods beyond what `ticketType`/`displayType` describe.
- **Instructions branch:** if `instructions.structured` is non-null, render it (general instructions incl. `photoIdRequired`/`reportingTimes`, location `addressGroups`, `additionalInfo`, `policies[]`) — this is the preferred, richer path. Only when `structured` is null and `legacy` is non-null, render `legacy.htmlContent` as a single sanitized HTML block. Never render both.
  - `hasLateArrivalPolicy` is a **flag whose true/false meaning is ambiguous from the doc alone** (unclear whether `true` means late arrival is *allowed* or *disallowed*). Do not guess copy for this — pull a live sandbox sample with a known late-arrival policy and confirm the boolean's meaning against it before wiring any conditional text; otherwise render the raw structured fields Headout already labeled (e.g. `reportingTimes`) and leave `hasLateArrivalPolicy`-driven copy out.

## Conditional render rules
- **Cancelled / pending / 404-not-ready states** short-circuit the body (render their dedicated views).
- **Callouts:** render the full array; omit the section only when empty.
- **"Selected option" row:** only when `variant.name` exists.
- **Seats vs guests:** show `seats` when present; otherwise `paxSummary`.
- **Pickup/drop-off:** branch on `pickupDropOffType` — `PICKUP` (pickup fields only), `PICKUP_AND_DROPOFF` (render both `pickupDropoffLocation` and its nested `dropoff`), `PICKUP_SAME_AS_DROPOFF` (render once, labeled as both). Omit the section entirely when `pickupDropoffLocation` is null.
- **Check-in button:** render only when `checkinButton` is non-null.
- **Disclaimer:** render only when non-null; do not gate it behind any specific vendor/vertical.
- **Embed mode:** render body-only and noindex only after the embed authorization, origin, and CSP
  requirements above pass; otherwise deny the request.
- **Loading:** skeleton sized to the header + ticket section + details grid.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **VoucherHeader** (reference + heading + option + vendor logo), **CalloutBanner** (repeatable, from `callouts[]`), **TicketArtifact** (QR / Barcode / PdfLink / Text variants, from `ticketSection.tickets[]`), **DetailsGrid** (guests / customer / schedule / seats / pickup-dropoff rows), **InstructionsPanel** (structured variant: general/location/additionalInfo/policies; legacy variant: sanitized HTML block), **PartnerDetailsBlock**, **DisclaimerFooter**, **PageBreak** (multi-page separator, "page n/total"), **CancelledVoucherView**, **PendingVoucherView**, **NotReadyVoucherView**, **SkeletonLoader**.

**Step A — reuse the partner's design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **DetailsGrid, CalloutBanner, Button** are reused by confirmation and manage-booking — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
The partner's design system wins; the values below are only a fallback when none exists.
- **Shell:** centered single column on a plain surface so it prints cleanly. Mobile: full-width.
- **Spacing/radius:** a consistent spacing scale; the ticket artifact sits in a bordered/elevated box.
- **Type:** booking reference small/caption; product heading prominent; section headings medium; body regular.
- **Ticket artifact:** centered, generously padded, high-contrast on a light surface so a scanner reads it; QR/barcode at a print-safe size. Vendor logo consistently right-aligned in the header; partner/Headout logo consistently top-left — never swap these slots.
- **Color:** neutral surfaces; one primary brand accent for CTAs/links; muted grey secondary text; cancelled/pending/not-ready states in a muted/neutral treatment. Print styles: hide non-essential chrome, force page breaks between multi-page units.

## Field mappings & fallbacks
- `header.displayBookingId ?? header.voucherId` → "Booking ID {ref}" (never `bookingId` for the guest-facing label).
- `bookingStatus` → active(`COMPLETED`)/pending/cancelled render branch; voucher-GET `404` → not-ready branch.
- `voucherTemplate` → single vs multi-page render.
- `ticketSection.tickets[].ticketType`/`displayType` → TicketArtifact variant; `ticketSection` null → show the cancelled/no-artifact-yet state, not an empty section.
- `callouts[]` → CalloutBanner list, all rendered, none skipped.
- `instructions.structured` preferred over `instructions.legacy`; render exactly one.
- `disclaimer` → DisclaimerFooter, generic, last section.
- variant/option → "Selected option: {name}"; missing → omit.
- `paxSummary`/`seats` → guests/seats row; `pickupDropoffLocation` + `pickupDropOffType` → pickup/drop-off rows per the 3-way branch.

## Legacy-fallback field mappings (only when Voucher API is unavailable)
- `bookingId` → "Booking ID {ref}" (no `displayBookingId` on this path).
- `status` → active / pending / cancelled render branch (no distinct "not ready" — booking GET has no 404-for-voucher concept).
- `tickets[].type` + `url` → TicketArtifact variant; `voucherUrl` → download-voucher-PDF action.
- `tickets[]` length > 1 → one voucher body per ticket with page breaks (this is a booking-count split, not the real per-unit `addressGroups` split — do not label it "MULTI_PAGE template").
- No callouts, structured instructions, disclaimer, or check-in button sections on this path.

## Acceptance checks
- [ ] API contract confirmed: voucher GET (or, on the legacy fallback, booking GET) fields resolved and exact paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] If the partner already had any prior voucher page/model, [headout-voucher-api](../headout-voucher-api/SKILL.md) ran first and the partner explicitly approved the migration plan — this skill did not silently replace existing code.
- [ ] Resolved by `bookingId` → `voucherId` → voucher GET, server-side through the BFF; `404` → not-ready state, `403` → auth-failure state; loader until resolved; page (and embed) emit no SEO body and are noindex.
- [ ] **`bookingStatus` state machine** correct: cancelled → Cancelled view; pending → Pending view; not-ready(404) → distinct NotReady view; completed → full body.
- [ ] **`voucherTemplate` branch** correct: `MULTI_PAGE` → one page per `addressGroups` unit (not per booking, not collapsed), each with page break and "page n/total"; `SINGLE_PAGE` → one body.
- [ ] **Ticket-artifact branch** renders by `ticketSection.tickets[].ticketType`/`displayType`; `actionCta` only rendered for non-QR types; no invented redemption methods.
- [ ] **Callouts** render as a full array, all items shown.
- [ ] **Instructions** prefer `structured` over `legacy`; never render both; `hasLateArrivalPolicy` copy is not wired until its true/false meaning was confirmed against a live sample.
- [ ] Vendor logo right-aligned, distinct from the partner/Headout logo slot (top-left).
- [ ] `disclaimer` renders last whenever present, with no vertical-specific gating.
- [ ] Sections render in canonical order: header → callouts → ticket section → booking details → instructions → partner details → disclaimer.
- [ ] Protected responses are `private, no-store`; artifact URLs are validated; embed mode requires
  allowlisted `frame-ancestors` plus session/order-bound authorization and denies other parents.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/`; DetailsGrid/CalloutBanner reusable across confirmation and manage-booking.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
