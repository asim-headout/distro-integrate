# Seatmap — Backend Reference

Server-side seatmap fetch + validation. Keep `Headout-Auth` and raw calls server-side.

## Endpoints
- Seatmap availability / inventory, validate, SVG, and iframe endpoints (see headout-api.md →
  per-endpoint doc pages: `seatmap/inventory.md`, `seatmap/validate.md`, `seatmap/iframe.md`).

## Server-side rules
- **Slot-first flow:** fetch seatmap availability by product/variant, let the FE choose date/show
  slot, then carry `variantId`, `date`, `startTime`, `inventoryId`, and currency into iframe/custom
  seat selection.
- **iframe mode:** the server obtains and hands the FE a Headout-hosted iframe URL/token; Headout
  owns rendering and selection. Listen for the iframe selection payload and carry `seatCode`,
  `inventoryId`, and price data into validation/booking. Minimal FE work.
- Allowlist the exact Headout iframe HTTPS origin and product-path shape. Send `postMessage` only to
  that explicit target origin. On receipt, require exact `event.origin`, expected
  `event.source === iframe.contentWindow`, JSON parse success, an allowed event type, and a strict
  payload schema/size before using data. Ignore iframe `log` events and never persist them.
- **full custom mode:** the server fetches seatmap inventory + SVG, then **validates the selection
  server-side before booking**. Enforce the hard ceiling of **20 seats per validation request**.
- **section-based mode:** the server fetches seat inventory grouped by section; the FE lets the
  customer choose a section/zone, and the server selects available seats from that section before
  validation/booking. Do not pretend the customer picked exact seats.
- Seatmap validation can return **HTTP 200 with business-level validation errors** — inspect the body,
  do not rely on status code alone. Handle `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`,
  `ADJACENCY_RULE_VIOLATION`, and adjacent-seat / table constraints.
- Carry the **validated** `inventorySeatIds` and the **returned validated prices** into booking — do
  not re-derive prices client-side.

## BFF shape (what to expose to the FE)
- For custom/section-based mode, expose a validate endpoint that returns a normalized result
  (ok / per-seat errors) + the validated price; never proxy auth or raw responses.
- For iframe mode, expose only the safe initialization data and normalize the iframe callback payload
  after origin/source/type/schema validation before it enters checkout state. Revalidate all selected
  seats and returned prices server-side; a valid message is not trusted booking input.

## Cross-check
No page recipe for seatmap. Field/error-code disagreement with a reference → stale-fact call-out.
