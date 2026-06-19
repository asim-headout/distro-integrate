# Seatmap Validation Advanced Reference

Relevant docs:

- Seatmap iframe: https://partner.headout.com/docs/api-partner/v2/seatmap/iframe.md
- Seatmap inventory: https://partner.headout.com/docs/api-partner/v2/seatmap/inventory.md
- Seatmap validate: https://partner.headout.com/docs/api-partner/v2/seatmap/validate.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced cases:

- `inventorySelectionType: SEATMAP` vs `NORMAL`.
- Validation can return HTTP 200 with business-level errors.
- Hard ceiling of 20 seats per validation request.
- `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`, and `ADJACENCY_RULE_VIOLATION`.
- Adjacent-seat and table-selection constraints.
- Seat price changes after selection.

Test cases:

- Stale selected seats.
- Invalid seat IDs.
- Adjacency violations.
- Mixed seat price types.
- Validated prices used in booking payload.
