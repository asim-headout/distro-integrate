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
- Create Headout booking first in `UNCAPTURED`; capture/update to `PENDING` only after partner PSP
  success is confirmed.
- `customersDetails.count` must match `customers.length`.
- Exactly one primary customer when required.
- Required customer fields and `variantInputFields` must match selected product/inventory.
- Duplicate submission or network timeout must not create duplicate bookings.
- Persist enough metadata to reconcile partner order status with Headout status.
- `UNCAPTURED` does not lock inventory or price; cover capture rejection after PSP success.
- Customer selling total and Headout booking-create amount are distinct server-side values.
- A settled PSP payment with failed Headout capture must enter durable void/refund compensation.

Test cases:

- Customer count mismatch.
- Missing primary customer.
- Required customer or variant input field missing.
- Duplicate submission.
- Timeout during create/capture.
- PSP success uncertain before capture.
- PSP success followed by Headout capture failure and compensation.
- Retry after PSP success does not charge again.
- `UNCAPTURED`, `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, `CAPTURE_TIMEDOUT`.
