# Booking Management — Backend Reference

Server-side webhook ingestion + post-booking servicing. `Headout-Auth` and raw calls stay
server-side.

## Endpoints
- Webhooks: `/api/public/v2/webhooks` (register / retrieve / update — only if the integration owns setup)
- Get booking: `/api/public/v2/bookings/{bookingId}`
- Cancel / reschedule: see per-endpoint doc pages in headout-api.md

## Webhook receiver
- Accept booking-status events; expect `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`,
  `CAPTURE_TIMEDOUT`. **`UNCAPTURED` is not delivered via webhook.**
- **Idempotent upsert:** key on a stable identifier (event id, or `bookingId` + status) so a duplicate
  or retried event is a no-op. Return **2xx only after** successful processing.
- Be resilient to **out-of-order** delivery and **status regression** — never let a stale event
  overwrite a more advanced status.
- Handle unknown status and missing-booking gracefully (log + reconcile, don't crash the handler).
- Resolve persistence/migration ownership before coding. If this repo owns migrations, add the
  minimal event/status storage in the existing migration style; if another repo/service owns it,
  produce a schema handoff and keep this repo within its boundary.
- Persist event metadata for dedupe/reconciliation: event id when available, otherwise
  `bookingId + status + eventTimestamp`, received timestamp, processed timestamp, processing result,
  and redacted error metadata.

## Cancellation / reschedule
- Their immediate responses are **async acknowledgements, not final state**. Mark a pending state and
  let the subsequent booking GET / webhook confirm the final outcome.

## Observability
- Structured logs include `bookingId`, `partnerReferenceId` (when present), status, and a
  correlation/request id. Do **not** log PII-heavy payloads, vouchers, or tickets.

## Cross-check
Webhook ingestion is backend-centric; any servicing UI follows the partner design system (a UI page
recipe is a planned follow-up). Event-shape or persistence ownership disagreement with a reference →
stale-fact call-out. See
[../../../references/persistence-and-migrations.md](../../../references/persistence-and-migrations.md).
