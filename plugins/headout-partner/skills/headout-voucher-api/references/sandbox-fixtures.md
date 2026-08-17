# Sandbox Fixture Matrix

This skill's acceptance checks ("confirm against a live sample") are only executable against real
sandbox `voucherId`s covering each branch. IDs are intentionally not invented or copied from
production — Headout must populate the table below before distributing a fixture-dependent handoff.

| Fixture | `voucherId` | Expected coverage | Status |
|---|---|---|---|
| Single-page, completed | Headout supplied | `voucherTemplate: SINGLE_PAGE`, `bookingStatus: COMPLETED` | Pending ID |
| Multi-page | Headout supplied | `voucherTemplate: MULTI_PAGE` — confirm what actually repeats across sections | Pending ID |
| Pending with tickets already issued | Headout supplied | `bookingStatus: PENDING` + non-null `ticketSection` (tickets are not gated on status) | Pending ID |
| Cancelled | Headout supplied | `bookingStatus: CANCELLED`, `ticketSection: null` | Pending ID |
| Uncaptured / timeout | Headout supplied | voucher GET returns `404` | Pending ID |
| `displayType: PDF` ticket | Headout supplied | `actionCta` present, download button | Pending ID |
| `displayType: IMAGE` ticket | Headout supplied | QR/barcode render from `url` | Pending ID |
| `displayType: TICKET_NUMBER` ticket | Headout supplied | `ticketCode` text; `HTML_URL` variant links `url` | Pending ID |
| `displayType: NONE` ticket | Headout supplied | render nothing for that ticket | Pending ID |
| Structured instructions, `ALL_ADDRESS_SPECIFIC_ORDER` | Headout supplied | numbered-step `addressGroups` render | Pending ID |
| Structured instructions, `hasLateArrivalPolicy: true` (known policy) | Headout supplied | resolve the flag's guest-facing copy before wiring it elsewhere | Pending ID |
| Legacy instructions with a meeting point | Headout supplied | both `legacy.htmlContent` and `legacy.location` render | Pending ID |
| Open-dated booking | Headout supplied | `schedule.openDated: true` → "valid until" row instead of fixed date | Pending ID |
| Callouts present (multiple) | Headout supplied | full `callouts[]` array rendered, none skipped | Pending ID |
| `pickupDropOffType: PICKUP_AND_DROPOFF` | Headout supplied | both `pickupDropoffLocation` and nested `dropoff` render | Pending ID |

## How the skill uses the matrix

1. Configure the partner's sandbox base URL and server-side sandbox `Headout-Auth`.
2. Resolve each fixture's `bookingId` → `voucherId` and call voucher GET.
3. Record only redacted metadata: HTTP status, `bookingStatus`, `voucherTemplate`, `displayType`
   values present, and which optional sections are populated.
4. Compare against this skill's mapping and `account-voucher`'s conditional-render rules.
5. If an ID returns `404` unexpectedly, no longer exercises the expected shape, or is production-only,
   stop and request a replacement from Headout. Do not substitute a guessed ID.

For partners without the matrix, use their own sandbox `voucherId`s and compare the response against
[references/voucher-api.md](voucher-api.md); the same no-guessing and redaction rules apply.
