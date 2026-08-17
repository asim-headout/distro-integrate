# Payment & Booking — Backend Reference

Server-side booking lifecycle around the partner's own payment. All Headout booking calls are
server-to-server; `Headout-Auth` never reaches the client.

## Endpoints
- Create: `/api/public/v2/bookings` → returns `UNCAPTURED`
- Capture: update `/api/public/v2/bookings/{bookingId}` → status `PENDING` (+ `partnerReferenceId`)
- Get: `/api/public/v2/bookings/{bookingId}`
- Cancel / reschedule: see per-endpoint doc pages in headout-api.md

## Flow
1. Reconfirm current inventory pricing + validated inputs immediately before submit. Compute the
   customer PSP charge from selling prices and Headout booking-create `price` from the API-required
   internal amount (currently summed `netPrice`); keep them separate and server-side.
2. Create the Headout booking (`UNCAPTURED`) to obtain `bookingId`.
3. Complete payment in the partner's own PSP/system (partner is Merchant-of-Record).
4. After PSP success, capture the Headout booking by updating status to `PENDING` with the partner's
   `partnerReferenceId`.
5. Get/poll the booking as needed and persist the Headout `bookingId` ↔ `partnerReferenceId` mapping.

## Server-side rules
- `customersDetails.count` must equal `customers.length`; exactly one primary customer when required;
  required customer fields + `variantInputFields` must match the selected product/inventory.
- `UNCAPTURED` does **not** lock inventory or price. Revalidate immediately before create/capture and
  handle capture rejection after PSP success as a compensated failure, not a successful reservation.
- **Idempotency / no duplicates:** generate one opaque, order-scoped key on the server, persist it
  before side effects, and enforce database uniqueness for the idempotency key, `bookingId`,
  `partnerReferenceId`, and PSP reference where supported. Do not trust a client key by itself. On an
  uncertain create/capture/payment result, reconcile both systems before retrying.
- `UNCAPTURED` can expire to `CAPTURE_TIMEDOUT` after ~1 hour; handle that as a recoverable state.
- Never update Headout to `PENDING` before partner payment success. If PSP success is uncertain, do
  not capture; reconcile the PSP/order state first.
- If the PSP settles funds before Headout capture, persist and execute a void/refund compensation when
  Headout capture fails. A retry with an already successful PSP reference must resume capture or
  compensation; it must never charge again.
- Resolve persistence/migration ownership before coding. If this repo owns schema changes, add the
  minimal migration in the repo's existing style; if another repo/service owns persistence, produce a
  schema handoff and keep this repo inside its boundary.
- Persist enough metadata to reconcile partner order status with Headout status: local order id,
  `bookingId`, `partnerReferenceId`, PSP/payment reference, payment status, capture status, Headout
  status, compensation status, both pricing totals/currencies, selected inventory/variant/date/time,
  and idempotency key. Log `bookingId`,
  `partnerReferenceId`, status, and a correlation id — never PII-heavy payloads.

## Cross-check
This step is backend-centric (no page recipe). Status/semantics or persistence ownership
disagreement with a reference → stale-fact call-out. See
[../../../references/persistence-and-migrations.md](../../../references/persistence-and-migrations.md).
