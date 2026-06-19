# Product Selection — Backend Reference

Server-side fetch + mapping that feeds `page-tour` (detail) and `book-select` (date/time/variant booking step).
Keep `Headout-Auth` and raw calls server-side.

## Endpoints
- Product detail: `/api/public/v2/products/{productId}`
- Calendar / availability / pricing: `/api/public/v2/inventory/list-by/tour`

## Server-side rules
- Fetch product detail + inventory for the selected product/tour/variant, date range, pax, and
  currency. **Treat Headout inventory pricing as the checkout source of truth** — do not recompute
  prices from cached product data.
- Model `PER_PERSON` and `PER_GROUP` pricing separately; compute customer-facing totals from
  `headoutSellingPrice` across the selected pax types and keep `currencyCode` consistent from
  inventory fetch through to booking. Keep `netPrice` internal for reconciliation only.
- Honor inventory states: `LIMITED` (respect real remaining count), `UNLIMITED`, `CLOSED` (not
  bookable). Hide sentinel-like high `remaining` values such as `1000` or `9999` in the UI.
- Re-validate price/availability before checkout if the selection can go stale.

## BFF shape (what to expose to the FE)
- Expose availability (dates/slots) and per-variant pricing as mapped customer fields:
  `sellingPrice` from `headoutSellingPrice`, optional strike `originalPrice`, and internal
  `netPrice` only when the server/order layer needs reconciliation. **Headout inventory returns no
  itemized base/tax/fee breakdown**, so derive the customer total (sum across selected pax types) and
  any "{n}% off" from selling price vs `originalPrice`. Return mapped objects, not raw Headout JSON,
  and never the auth header.

## Cross-check
`page-tour` / `book-select` own section order, derivation, and conditional render. This file owns the
fetch/mapping/pricing contract. Disagreement on a field → stale-fact call-out.
