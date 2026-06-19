# Product Selection — Backend Reference

Server-side fetch + mapping that feeds `page-tour` (detail) and `page-select` (date/time/variant).
Keep `Headout-Auth` and raw calls server-side.

## Endpoints
- Product detail: `/api/public/v2/products/{productId}`
- Calendar / availability / pricing: `/api/public/v2/inventory/list-by/tour`

## Server-side rules
- Fetch product detail + inventory for the selected product/tour/variant, date range, pax, and
  currency. **Treat Headout inventory pricing as the checkout source of truth** — do not recompute
  prices from cached product data.
- Model `PER_PERSON` and `PER_GROUP` pricing separately; compute `price.amount` across the selected
  pax types and keep `currencyCode` consistent from inventory fetch through to booking.
- Honor inventory states: `LIMITED` (respect remaining count), `UNLIMITED`, `CLOSED` (not bookable).
- Re-validate price/availability before checkout if the selection can go stale.

## BFF shape (what to expose to the FE)
- Expose availability (dates/slots) and a live price-breakdown endpoint the `page-select` step calls
  on selection — base / discounts / taxes & fees / total + currency. Return mapped objects, not raw
  Headout JSON, and never the auth header.

## Cross-check
`page-tour` / `page-select` own section order, derivation, and conditional render. This file owns the
fetch/mapping/pricing contract. Disagreement on a field → stale-fact call-out.
