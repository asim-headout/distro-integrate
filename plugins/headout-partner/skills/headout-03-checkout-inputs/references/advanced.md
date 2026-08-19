# Checkout Inputs Advanced Reference

Relevant docs:

- Create booking: https://partner.headout.com/docs/api-partner/v2/bookings/create.md
- Inventory: https://partner.headout.com/docs/api-partner/v2/inventory/list-by-tour.md
- Enums and errors: https://partner.headout.com/docs/guide/enums-and-error-codes.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced implementation cases:

- Customer fields can include `NAME`, `EMAIL`, `PHONE` (semantic ids) and `CUSTOM_*` fields.
  `CUSTOM_*` is only a routing/lookup key — it never identifies what the field is for (passport,
  weight, DOB, ...); that only comes from the field's `name`/`description`. Do not treat `CUSTOM_*`
  as an identification category alongside `NAME`/`EMAIL`/`PHONE`.
- Booking-level `variantInputFields` can include pickup, transportation, or product-specific choices.
- Passenger/customer count must stay aligned with selected pax and booking payload construction.
- Exactly one primary customer may be required.
- Partner payment should remain decoupled from Headout field collection except for order/checkout state needed for booking.
- `validation.values` is a plain array (or `null`) from this skill's `/products/{id}` path, but the
  same field is wrapped as `{type, value}` if fetched via
  [headout-93-inventory-input-fields](../../headout-93-inventory-input-fields/SKILL.md)'s
  `/inventories/{inventoryId}/` — don't share one `values` parser across both.

Test cases:

- Missing required field.
- Unknown future field type.
- Optional vs required field rendering.
- Passenger count changes after fields are entered.
- Primary customer selection.
- Variant input field persistence through payment and booking.
- Field-semantics lookup by `name`/`description` when `id` is a `CUSTOM_*` value, not by `id` pattern.
- `validation.values` parsed correctly whether it came from the Products API (array) or Inventory
  Details API (`{type, value}` wrapper).
