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
- `customerName: string`, `purchaseDateTime: ISO 8601`
- `paxSummary: { summary, details: [{ paxType, displayName, count }] } | null`
- `guestFields: [{ guestNumber, name, email, phone, customFields }] | null`
- `schedule: { openDated, experienceDate, voucherValidUntil, experienceStartDateTime, experienceEndDateTime, durationMinutes, inventoryType }`
  - `voucherValidUntil` is already the **earliest expiry across all tickets** (backend computes the
    conservative value) — render it as-is, do not recompute from per-ticket data.
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
  - `ticketType: "PDF_URL" | "HTML_URL" | "QRCODE" | "BARCODE" | "TEXT" | "UNKNOWN"`
  - `displayType: "IMAGE" | "TICKET_NUMBER" | "PDF" | "NONE"`
  - `url: string | null`, `ticketCode: string | null`, `ticketName: string | null`
  - `actionCta: string | null` — button label; **only present for non-QR types** (`PDF_URL`,
    `HTML_URL`). Do not render a CTA button for `QRCODE`/`BARCODE`.
- Wallet pass is **not applicable** for API partners — no wallet-pass ticket type will appear here.

### `instructions`
Exactly one of `legacy` / `structured` is non-null.

- `legacy: { htmlContent: string | null, location: V2VoucherLocation | null }` — render `htmlContent`
  as one sanitized HTML block. This is the older, unstructured shape.
- `structured` (preferred when present):
  - `generalInstructions: { title, hasLateArrivalPolicy: boolean, photoIdRequired: boolean, reportingTimes: [{label, value}] | null } | null`
    - **`hasLateArrivalPolicy` naming is ambiguous** — it is not documented whether `true` means late
      arrival is *allowed* or *disallowed*. Confirm against a live sample with a known policy before
      wiring conditional copy to this flag; until confirmed, render only the labeled fields
      (`reportingTimes`, `photoIdRequired`) and skip flag-driven text.
  - `location: { title, heading, addressSequenceType: "SINGLE_ADDRESS" | "ALL_ADDRESS_ANY_ORDER" | "ALL_ADDRESS_SPECIFIC_ORDER" | null, voucherExchangeLocationType: "VENUE_LOCATION" | "DIFF_LOCATION" | null, addressGroups: AddressGroup[][] }`
    - `addressGroups` is the source of the **multi-page split**: for `voucherTemplate: MULTI_PAGE`,
      each top-level group is one unit/pax and renders as its own page (Disney: 3 adults →
      `addressGroups.length === 3`, each with its own QR/ticket). Do not merge groups onto one page.
  - `additionalInfo: { title, htmlContent } | null`
  - `policies: [{ type: "BOOKING_AMENDMENT", value: string (HTML) }] | null`

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
