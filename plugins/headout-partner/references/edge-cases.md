# Headout Edge Cases

Use this when implementing, reviewing, or generating tests.

- `PER_PERSON` vs `PER_GROUP` pricing.
- Unknown future person types beyond `ADULT`, `CHILD`, `STUDENT`, and `SENIOR`.
- `paxRange.min` and `paxRange.max`.
- `customersDetails.count` must match `customers.length`.
- Exactly one primary customer when customer details are required.
- Customer fields such as `NAME`, `EMAIL`, `PHONE`, and `CUSTOM_*`. `CUSTOM_*` ids are always opaque
  (`CUSTOM_<numericId>`) and never identify a field's purpose — match on `name`/`description` instead.
- Booking-level `variantInputFields` such as pickup or transportation choices.
- Dynamic input-field metadata: `level`, `dataType`, `required`, options, min/max, and location enum variants.
- `validation.values` shape is endpoint-specific: a plain array (or `null`) from `/products/{id}`,
  wrapped as `{type, value}` from `/inventories/{inventoryId}/` for the same field — don't reuse one
  parser across both endpoints.
- Inventory availability: `LIMITED`, `UNLIMITED`, `CLOSED`.
- Sentinel high `remaining` values such as `1000` or `9999` should render as unlimited/no visible count.
- Currency consistency from inventory fetch through booking.
- Stale price rejection and price revalidation before checkout.
- `headoutSellingPrice` for customer display/PSP charge, `originalPrice` for strike-through, and
  `netPrice` server-side for Headout booking-create/reconciliation.
- Protocol-relative image URLs (`//cdn...`) must be normalized before rendering.
- Pagination via `nextUrl`, `prevUrl`, `nextOffset`, and `total`.
- Local datetime values that may not include timezone offsets.
- Booking statuses: `UNCAPTURED`, `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, `CAPTURE_TIMEDOUT`.
- Create returns `UNCAPTURED` without locking inventory/price; capture/update to `PENDING` only after
  partner PSP success, with void/refund compensation if settled payment precedes failed capture.
- Webhooks do not send `UNCAPTURED`.
- Cancellation and reschedule requests are async acknowledgements, not final states.
- Seatmap validation can return HTTP 200 with business-level errors.
- Seatmap validation has a hard ceiling of 20 seats.
- Seatmap errors include `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`, and `ADJACENCY_RULE_VIOLATION`.
