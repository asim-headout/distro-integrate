# Headout Edge Cases

Use this when implementing, reviewing, or generating tests.

- `PER_PERSON` vs `PER_GROUP` pricing.
- Unknown future person types beyond `ADULT`, `CHILD`, `STUDENT`, and `SENIOR`.
- `paxRange.min` and `paxRange.max`.
- `customersDetails.count` must match `customers.length`.
- Exactly one primary customer when customer details are required.
- Customer fields such as `NAME`, `EMAIL`, `PHONE`, and `CUSTOM_*`.
- Booking-level `variantInputFields` such as pickup or transportation choices.
- Inventory availability: `LIMITED`, `UNLIMITED`, `CLOSED`.
- Currency consistency from inventory fetch through booking.
- Stale price rejection and price revalidation before checkout.
- `originalPrice`, `netPrice`, `headoutSellingPrice`, and customer-facing price differences.
- Pagination via `nextUrl`, `prevUrl`, `nextOffset`, and `total`.
- Local datetime values that may not include timezone offsets.
- Booking statuses: `UNCAPTURED`, `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, `CAPTURE_TIMEDOUT`.
- Webhooks do not send `UNCAPTURED`.
- Cancellation and reschedule requests are async acknowledgements, not final states.
- Seatmap validation can return HTTP 200 with business-level errors.
- Seatmap validation has a hard ceiling of 20 seats.
- Seatmap errors include `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`, and `ADJACENCY_RULE_VIOLATION`.
