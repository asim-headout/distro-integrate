# Product Selection Advanced Reference

Relevant docs:

- Product get: https://partner.headout.com/docs/api-partner/v2/products/get.md
- Inventory: https://partner.headout.com/docs/api-partner/v2/inventory/list-by-tour.md
- Enums and errors: https://partner.headout.com/docs/guide/enums-and-error-codes.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced implementation cases:

- Product detail page renders localized content and URLs.
- Variant/tour/date selection changes inventory and price.
- Pax ranges enforce min/max and supported person types.
- `netPrice`, `headoutSellingPrice`, and `originalPrice` may need display or reconciliation handling.
- Price revalidation is required before checkout if selection can become stale.

Test cases:

- Mixed pax types.
- Pax min/max boundaries.
- `CLOSED`, `LIMITED`, and `UNLIMITED` inventory.
- Stale price before checkout.
- Currency precision and propagation.
