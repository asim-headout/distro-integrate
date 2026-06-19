# Checkout Inputs — Backend Reference

Server-side sourcing + validation of checkout fields. Keep `Headout-Auth` and raw calls server-side.

## Endpoints
- Field requirements come from the product / inventory responses and the create-booking contract:
  `/api/public/v2/products/{productId}`, `/api/public/v2/inventory/list-by/tour`,
  `/api/public/v2/bookings` (create).

## Server-side rules
- Source required fields **live** from current API responses — never hardcode one product's fields:
  - Customer fields: `NAME`, `EMAIL`, `PHONE`, and `CUSTOM_*`.
  - Booking-level `variantInputFields` (pickup, transportation, product-specific choices).
- Enforce: `customersDetails.count` aligns with selected pax and the `customers` array length;
  exactly one primary customer when required.
- Validate server-side before constructing the booking payload — do not trust client validation alone.

## BFF shape (what to expose to the FE)
- Return field **metadata** (key, type, required, options/label) for the FE to render dynamically.
  Send only safe metadata to the browser; keep raw responses + auth server-side.
- Persist entered values + variant input fields through payment into the booking step.

## Cross-check
No page recipe yet for this step (planned follow-up). Until then the partner design system + this
field metadata drive the form. Field-name disagreement with a reference → stale-fact call-out.
