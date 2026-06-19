# Payment & Booking — Backend Reference

Server-side booking lifecycle around the partner's own payment. All Headout booking calls are
server-to-server; `Headout-Auth` never reaches the client.

## Endpoints
- Create: `/api/public/v2/bookings` → returns `UNCAPTURED`
- Capture: update `/api/public/v2/bookings/{bookingId}` → status `PENDING` (+ `partnerReferenceId`)
- Get: `/api/public/v2/bookings/{bookingId}`
- Cancel / reschedule: see per-endpoint doc pages in headout-api.md

## Flow
1. Reconfirm current inventory pricing + validated inputs immediately before submit.
2. Create the Headout booking (`UNCAPTURED`) to obtain `bookingId`.
3. Complete payment in the partner's own PSP/system (partner is Merchant-of-Record).
4. After PSP success, capture the Headout booking by updating status to `PENDING` with the partner's
   `partnerReferenceId`.
5. Get/poll the booking as needed and persist the Headout `bookingId` ↔ `partnerReferenceId` mapping.

## Server-side rules
- `customersDetails.count` must equal `customers.length`; exactly one primary customer when required;
  required customer fields + `variantInputFields` must match the selected product/inventory.
- **Idempotency / no duplicates:** dedupe on `partnerReferenceId`. On a network timeout or uncertain
  failure during create/capture, **GET/lookup first** and reconcile before retrying — never blindly
  re-create.
- `UNCAPTURED` can expire to `CAPTURE_TIMEDOUT` after ~1 hour; handle that as a recoverable state.
- Never update Headout to `PENDING` before partner payment success. If PSP success is uncertain, do
  not capture; reconcile the PSP/order state first.
- Resolve persistence/migration ownership before coding. If this repo owns schema changes, add the
  minimal migration in the repo's existing style; if another repo/service owns persistence, produce a
  schema handoff and keep this repo inside its boundary.
- Persist enough metadata to reconcile partner order status with Headout status: local order id,
  `bookingId`, `partnerReferenceId`, PSP/payment reference, payment status, capture status, Headout
  status, selected inventory/variant/date/time/currency, and idempotency key. Log `bookingId`,
  `partnerReferenceId`, status, and a correlation id — never PII-heavy payloads.

## Cross-check
This step is backend-centric (no page recipe). Status/semantics or persistence ownership
disagreement with a reference → stale-fact call-out. See
[../../../references/persistence-and-migrations.md](../../../references/persistence-and-migrations.md).
