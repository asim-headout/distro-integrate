# Headout Edge Cases

Use this when implementing, reviewing, or generating tests.

- `PER_PERSON` vs `PER_GROUP` pricing.
- Unknown future person types beyond `ADULT`, `CHILD`, `STUDENT`, and `SENIOR`.
- `paxRange.min` and `paxRange.max`.
- `customersDetails.count` must match `customers.length`.
- Exactly one primary customer when customer details are required.
- Customer fields such as `NAME`, `EMAIL`, `PHONE`, and `CUSTOM_*`.
- Booking-level `variantInputFields` such as pickup or transportation choices.
- Dynamic input-field metadata: `level`, `dataType`, `required`, options, min/max, and location enum variants.
- Inventory availability: `LIMITED`, `UNLIMITED`, `CLOSED`.
- Sentinel high `remaining` values such as `1000` or `9999` should render as unlimited/no visible count.
- Currency consistency from inventory fetch through booking.
- Stale price rejection and price revalidation before checkout.
- `headoutSellingPrice` for customer display, `originalPrice` for strike-through comparison, and `netPrice` only for internal reconciliation.
- Protocol-relative image URLs (`//cdn...`) must be normalized before rendering.
- Pagination via `nextUrl`, `prevUrl`, `nextOffset`, and `total`.
- Local datetime values that may not include timezone offsets.
- Booking statuses: `UNCAPTURED`, `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, `CAPTURE_TIMEDOUT`.
- Create booking returns `UNCAPTURED`; capture/update to `PENDING` only after partner PSP success.
- Webhooks do not send `UNCAPTURED`.
- Cancellation and reschedule requests are async acknowledgements, not final states.
- Seatmap validation can return HTTP 200 with business-level errors.
- Seatmap validation has a hard ceiling of 20 seats.
- Seatmap errors include `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`, and `ADJACENCY_RULE_VIOLATION`.
