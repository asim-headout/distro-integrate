# Payment & Booking — Backend Reference

Server-side booking lifecycle around the partner's own payment. All Headout booking calls are
server-to-server; `Headout-Auth` never reaches the client.

## Endpoints
- Create: `/api/public/v2/bookings` → returns `UNCAPTURED`
- Capture: update `/api/public/v2/bookings/{bookingId}` → status `PENDING` (+ `partnerReferenceId`)
- Get: `/api/public/v2/bookings/{bookingId}`
- Cancel / reschedule: see per-endpoint doc pages in headout-api.md

## Flow
1. Partner payment completes in the partner's own system (partner is Merchant-of-Record).
2. Build the booking payload from **current inventory pricing** + validated inputs.
3. Create the booking (`UNCAPTURED`), then capture by updating status to `PENDING` with the partner's
   `partnerReferenceId`.
4. Persist the Headout `bookingId` ↔ `partnerReferenceId` mapping.

## Server-side rules
- `customersDetails.count` must equal `customers.length`; exactly one primary customer when required;
  required customer fields + `variantInputFields` must match the selected product/inventory.
- **Idempotency / no duplicates:** dedupe on `partnerReferenceId`. On a network timeout or uncertain
  failure during create/capture, **GET/lookup first** and reconcile before retrying — never blindly
  re-create.
- `UNCAPTURED` can expire to `CAPTURE_TIMEDOUT` after ~1 hour; handle that as a recoverable state.
- Persist enough metadata to reconcile partner order status with Headout status; log `bookingId`,
  `partnerReferenceId`, status, and a correlation id — never PII-heavy payloads.

## Cross-check
This step is backend-centric (no page recipe). Status/semantics disagreement with a reference →
stale-fact call-out.
