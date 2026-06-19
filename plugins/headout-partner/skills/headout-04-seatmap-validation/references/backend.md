# Seatmap — Backend Reference

Server-side seatmap fetch + validation. Keep `Headout-Auth` and raw calls server-side.

## Endpoints
- Seatmap availability / inventory, validate, SVG, and iframe endpoints (see headout-api.md →
  per-endpoint doc pages: `seatmap/inventory.md`, `seatmap/validate.md`, `seatmap/iframe.md`).

## Server-side rules
- **iframe mode:** the server obtains and hands the FE a Headout-hosted iframe URL/token; Headout
  owns rendering and selection. Minimal FE work.
- **custom mode:** the server fetches seatmap inventory + SVG, then **validates the selection
  server-side before booking**. Enforce the hard ceiling of **20 seats per validation request**.
- Seatmap validation can return **HTTP 200 with business-level validation errors** — inspect the body,
  do not rely on status code alone. Handle `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`,
  `ADJACENCY_RULE_VIOLATION`, and adjacent-seat / table constraints.
- Carry the **validated** `inventorySeatIds` and the **returned validated prices** into booking — do
  not re-derive prices client-side.

## BFF shape (what to expose to the FE)
- For custom mode, expose a validate endpoint that returns a normalized result (ok / per-seat errors)
  + the validated price; never proxy auth or raw responses.

## Cross-check
No page recipe for seatmap. Field/error-code disagreement with a reference → stale-fact call-out.
