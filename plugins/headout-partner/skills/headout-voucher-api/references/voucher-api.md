# Voucher API — Backend Reference

## Endpoint

```text
GET /api/public/v2/bookings/voucher/{voucherId}/
```

Sandbox: `https://www.sandbox-headout.com/...`. Production: `https://www.headout.com/...`. Auth via
`Headout-Auth`, server-side only.

`voucherId` comes from the booking response (create, list, or get) — it is a distinct field from
`bookingId`. Do not treat `voucherId` and `bookingId` as interchangeable path params.

| Code | Meaning |
|---|---|
| 200 | Voucher available — `V2Voucher` body below |
| 401 | Missing/invalid `Headout-Auth` |
| 403 | Partner not active / not an API partner / no booking under this key for the given `voucherId` |
| 404 | No voucher available for this booking yet (uncaptured, timed out, or not yet issued) |

## Response — `V2Voucher`

```text
bookingStatus: "PENDING" | "COMPLETED" | "CANCELLED"
voucherTemplate: "SINGLE_PAGE" | "MULTI_PAGE"
header: V2VoucherHeader
callouts: V2VoucherCallout[]              // [] when none, always render every item
bookingDetails: V2VoucherBookingDetails | null
checkinButton: { checkinUrl: string } | null
ticketSection: V2VoucherTicketSection | null   // null on cancelled or no tickets attached
instructions: V2VoucherInstructions | null
partnerDetails: V2VoucherPartnerDetails | null
disclaimer: string | null                 // generic field, not vertical-specific
```

### `header`
- `bookingId: number`, `voucherId: number`
- `displayBookingId: string | null` — prefer this over `voucherId` for the guest-facing label; falls
  back to `voucherId` when null.
- `product: { productId, name }`, `variant: { variantId, name } | null`
- `vendorLogoUrl: string | null` — renders on the right; distinct slot from the partner/Headout logo
  (top-left) — never swap these.

### `callouts[]`
`{ title: string, htmlDescription: string }` — pre-sanitized HTML. Driven by ticket redemption type
(escorted entry, exchange for ticket) or vendor-defined; direct entry has none. Render the full array
in order; never truncate to the first item.

### `bookingDetails`
- `customerName: string`, `purchaseDateTime: string` (`yyyy-MM-dd'T'HH:mm:ss`, **no timezone
  offset** — same for the `schedule` datetimes below; do not assume UTC or browser-local without
  confirming the intended zone against a live sample, since this is a document a guest presents at a
  specific time)
- `paxSummary: { summary, details: [{ paxType, displayName, count, totalPrice: { amount, currencyCode } | null }] } | null`
- `guestFields: [{ guestNumber, name, email, phone, customFields: [{ label, value }] | null }] | null`
- `schedule: { openDated, experienceDate, voucherValidUntil, experienceStartDateTime, experienceEndDateTime, durationMinutes, inventoryType }`
  - `voucherValidUntil` is the voucher's redemption deadline — the relevant expiry for open-dated
    bookings, `null` when the voucher has no deadline. Render it as-is, do not recompute from
    per-ticket data or any other derivation.
- `seats: { summary, details: [{ sectionName, seats: [{ row, seatNumber, seatCode, description }] }] } | null`
- `tourProperties: [{ type, values: string[] }] | null` — e.g. `type: "Language"`.
- `pickupDropoffLocation: V2VoucherLocation | null` — see `pickupDropOffType` below.

### `V2VoucherLocation` (used by `pickupDropoffLocation` and `instructions.legacy.location`)
- `address`, `directionsUrl`, `coordinates: { latitude, longitude }`
- `pickupTime`, `importantNotes: string[] | null`
- `pickupDropOffType: "PICKUP" | "PICKUP_AND_DROPOFF" | "PICKUP_SAME_AS_DROPOFF" | null` — 3-way
  render branch: pickup-only fields; both pickup and the nested `dropoff` object; or a single
  location labeled as both.
- `dropoff: { address, directionsUrl, coordinates, importantNotes } | null` — only populated for
  `PICKUP_AND_DROPOFF`.

### `ticketSection`
- `heading: string`, `subheading: string | null`
- `tickets: Ticket[]`, each:
  - `ticketType: "PDF_URL" | "HTML_URL" | "QRCODE" | "BARCODE" | "TEXT" | "UNKNOWN"` — secondary
    metadata (e.g. QR vs barcode alt text); **do not branch rendering on this field**, branch on
    `displayType` below.
  - `displayType: "IMAGE" | "TICKET_NUMBER" | "PDF" | "NONE"` — the actual render-branch key:
    - `PDF` → download button, label from `actionCta`, link from `url`. `actionCta` is **always
      present** for this displayType.
    - `IMAGE` → render `url` as a QR/barcode image (use `ticketType` to decide QR vs barcode
      styling). `actionCta` is null.
    - `TICKET_NUMBER` → display `ticketCode` as a text confirmation code; when `ticketType` is
      `HTML_URL`, `url` links to an HTML view. `actionCta` is null.
    - `NONE` → **do not render this ticket** (unrecognized format) — no placeholder box, no
      broken-image state. `actionCta` is null.
  - `url: string | null`, `ticketCode: string | null`, `ticketName: string | null`
  - `actionCta: string | null` — button label, present only for `displayType: "PDF"`.
- Wallet pass is **not applicable** for API partners — no wallet-pass ticket type will appear here.
- **Tickets are not gated on `bookingStatus`.** `PENDING` ("payment captured and confirmed with the
  supplier") can still carry a populated `ticketSection` — render whenever `ticketSection` is
  non-null, regardless of status. Use `bookingStatus` only for the CANCELLED short-circuit and for
  status messaging, never to hide an already-issued ticket.

### `instructions`
Exactly one of `legacy` / `structured` is non-null.

- `legacy: { htmlContent: string | null, location: V2VoucherLocation | null }` — render `htmlContent`
  as one sanitized HTML block (a fragment, not a full document — it may include heading tags that
  need style matching; null means a meeting point exists with no written instructions) **and**
  render `location` with the same `V2VoucherLocation`/`pickupDropOffType` renderer used for
  `pickupDropoffLocation` when non-null (null means the experience has no meeting point). This is
  the older, unstructured shape — do not drop the location half.
- `structured` (preferred when present):
  - `generalInstructions: { title, hasLateArrivalPolicy: boolean, photoIdRequired: boolean, reportingTimes: [{label, value}] | null } | null`
    - `hasLateArrivalPolicy: true` → a late-arrival policy applies: latecomers may be refused entry
      and are not eligible for a refund. **Surface this as a warning banner.** `false`/absent → no
      banner. (This was previously flagged as ambiguous; it is not — render it.)
  - `location: { title, heading, addressSequenceType, voucherExchangeLocationType, addressGroups: AddressGroup[][] }`
    - `addressGroups` is a **location list, not a per-unit/per-pax split** — it has no relationship
      to pax count or ticket count. `addressSequenceType` controls the outer/inner shape, not just
      the badge wording — get this dimension right before rendering:
      - `SINGLE_ADDRESS` / `ALL_ADDRESS_ANY_ORDER` → normally **one flat outer group** holding all
        the addresses; the "Option 1/2/…" (`SINGLE_ADDRESS`) or "Location 1/2/…" (`ANY_ORDER`)
        numbering runs over the **inner** array (the addresses within that one group), not over
        `addressGroups`'s outer index. Do not badge by outer-group position for these two types.
      - `ALL_ADDRESS_SPECIFIC_ORDER` (also the default when `addressSequenceType` is `null`) →
        **one outer group per route/leg** — this is the case where outer-group position is
        meaningful ("Start Location", "Location N", "End Location"; when `null`, all groups instead
        carry badge "Address details").
    - `badgeLabel` on each address is a **required, always-populated string** — render it as
      returned. Do not re-derive a position-based badge from array index; the numbering rules above
      describe what Headout already put in `badgeLabel`, not a computation the client should repeat.
    - `voucherExchangeLocationType: "VENUE_LOCATION" | "DIFF_LOCATION" | null` — when
      `DIFF_LOCATION`, surface an explicit "exchange your voucher at a different location" callout;
      this is a real guest-facing signal, not decorative metadata.
    - `AddressGroup` items: `badgeLabel`, `addressLine1`, `addressLine2`, `city`, `country`, `zip`,
      `landmark`, `googleMapLink`, `latitude`, `longitude`, `hostDetails`, `mediaLinks`.
    - **Do not use this field to determine `voucherTemplate` paging** — see the `voucherTemplate`
      note below.
  - `additionalInfo: { title, htmlContent } | null`
  - `policies: [{ type: "BOOKING_AMENDMENT", value: string (HTML) }] | null`

### `voucherTemplate` — what actually drives page splitting
`SINGLE_PAGE` = "single screen." `MULTI_PAGE` = "longer multi-section layout" — the docs do not
define this as one page per pax/unit, and `addressGroups` (a location structure) is unrelated to pax
count. Venue staff check the voucher against the template they expect for that experience, so
**always render exactly the template returned; never override or reinterpret it.** If a per-unit
page split (e.g. one QR per adult) is genuinely required for a specific vendor, that must be derived
from `ticketSection.tickets[]` length (N tickets), not from `addressGroups`, and confirmed against a
live sample from that vendor before being encoded as a rule — do not assume it applies generally.

### `partnerDetails`
`{ vendorName, contactNumbers: string[] | null, referenceNumbers: string[] | null }` — null when the
operator supplies no contact data.

### `disclaimer`
`string | null`. Currently populated mostly for Disney-style vouchers but the field is generic —
render it whenever non-null, regardless of vendor.

## Cross-cutting rules a mapping plan must account for

- **`templateType`/`voucherTemplate` is mandatory to follow** — non-compliance risks venue rejection.
  This is the single highest-priority field in any migration plan.
- Canceled bookings return with `ticketSection: null` (no separate error) — the partner's model must
  have a "no tickets" state distinct from an actual fetch failure.
- Uncaptured/timeout bookings return `404` at the voucher-GET call itself, not a 200 with empty
  fields — the partner's error handling must distinguish "voucher endpoint failed" from "voucher not
  issued yet."
- `voucherId` is now also returned directly on the **bookings API** response — partners do not need a
  separate lookup call to get it once they have the booking.

## Legacy booking-API shape (for partners not yet migrated)

Booking GET still returns `voucherUrl` (PDF of the whole voucher) and `tickets[]` (`publicId`, `url`,
`type` of `QRCODE`/`BARCODE`/`PDF_URL`). This shape has no equivalent for `callouts`, `disclaimer`,
`checkinButton`, structured `instructions`, or the true per-unit `MULTI_PAGE` split — any partner
still on this path is capped at what it can represent, and a migration plan should call that out
rather than trying to simulate the missing fields.
