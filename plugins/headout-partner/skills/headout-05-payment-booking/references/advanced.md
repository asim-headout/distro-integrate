# Payment Booking Advanced Reference

Relevant docs:

- Create booking: https://partner.headout.com/docs/api-partner/v2/bookings/create.md
- Capture booking: https://partner.headout.com/docs/api-partner/v2/bookings/update.md
- Get booking: https://partner.headout.com/docs/api-partner/v2/bookings/get.md
- Cancel: https://partner.headout.com/docs/api-partner/v2/bookings/cancel.md
- Reschedule: https://partner.headout.com/docs/api-partner/v2/bookings/reschedule.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced cases:

- Partner payment remains owned by the partner system.
- `customersDetails.count` must match `customers.length`.
- Exactly one primary customer when required.
- Required customer fields and `variantInputFields` must match selected product/inventory.
- Duplicate submission or network timeout must not create duplicate bookings.
- Persist enough metadata to reconcile partner order status with Headout status.

Test cases:

- Customer count mismatch.
- Missing primary customer.
- Required customer or variant input field missing.
- Duplicate submission.
- Timeout during create/capture.
- `UNCAPTURED`, `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, `CAPTURE_TIMEDOUT`.
