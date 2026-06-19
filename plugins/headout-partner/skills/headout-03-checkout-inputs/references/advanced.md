# Checkout Inputs Advanced Reference

Relevant docs:

- Create booking: https://partner.headout.com/docs/api-partner/v2/bookings/create.md
- Inventory: https://partner.headout.com/docs/api-partner/v2/inventory/list-by-tour.md
- Enums and errors: https://partner.headout.com/docs/guide/enums-and-error-codes.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced implementation cases:

- Customer fields can include `NAME`, `EMAIL`, `PHONE`, and `CUSTOM_*`.
- Booking-level `variantInputFields` can include pickup, transportation, or product-specific choices.
- Passenger/customer count must stay aligned with selected pax and booking payload construction.
- Exactly one primary customer may be required.
- Partner payment should remain decoupled from Headout field collection except for order/checkout state needed for booking.

Test cases:

- Missing required field.
- Unknown future field type.
- Optional vs required field rendering.
- Passenger count changes after fields are entered.
- Primary customer selection.
- Variant input field persistence through payment and booking.
