# Checkout Inputs — Backend Reference

Server-side sourcing + validation of checkout fields. Keep `Headout-Auth` and raw calls server-side.

## Endpoints
- Field requirements come from the product / inventory responses and the create-booking contract:
  `/api/public/v2/products/{productId}`, `/api/public/v2/inventory/list-by/tour`, and, when the
  selected inventory requires an inventory-specific override, `/api/public/v2/inventories/{inventoryId}/`,
  `/api/public/v2/bookings` (create).

For the inventory-specific workflow, use the explicit support skill [headout-93-inventory-input-fields](../../headout-93-inventory-input-fields/SKILL.md).

## Server-side rules
- Source required fields **live** from current API responses — never hardcode one product's fields:
  - Customer fields: `NAME`, `EMAIL`, `PHONE`, and `CUSTOM_*`.
  - Booking-level `variantInputFields` (pickup, transportation, product-specific choices).
- When inventory details are fetched successfully, use that inventory's `inputFields` for the selected
  inventory while preserving the existing product-derived path for compatibility.
- Preserve each field's metadata: `id`, label/name, `level` (`BOOKING`, `PRIMARY_CUSTOMER`,
  `ALL_CUSTOMER`, etc.), `dataType`, `required`, options/allowed values, helper/description text,
  validation constraints (`min`, `max`, length/range), and any location/pickup enum variants.
- Unknown future `dataType`, `level`, or location enum values are stale-fact call-outs: stop and ask
  instead of rendering a generic text input or dropping the field.
- Enforce: `customersDetails.count` aligns with selected pax and the `customers` array length;
  exactly one primary customer when required.
- Validate server-side before constructing the booking payload — do not trust client validation alone.

## BFF shape (what to expose to the FE)
- Return field **metadata** (key/id, type/dataType, level, required, options/label, min/max, and
  location/pickup variants) for the FE to render dynamically. Send only safe metadata to the browser;
  keep raw responses + auth server-side.
- Render labels, helper text, and option values through normal framework escaping; field metadata
  never authorizes HTML. Validate submitted ids/options against the current server-side metadata.
- Persist entered values + variant input fields through payment into the booking step.

## Cross-check
No page recipe yet for this step (planned follow-up). Until then the partner design system + this
field metadata drive the form. Field-name disagreement with a reference → stale-fact call-out.
