# Inventory Details — Backend Reference

## Endpoint

Use the API Partner v2 endpoint:

```text
GET /api/public/v2/inventories/{inventoryId}/?languageCode=EN
```

Use the sandbox base URL configured by the partner. Send `Headout-Auth` only from the server. The
`inventoryId` is the selected inventory listing's `id`, and `languageCode` is optional with `EN` as
the default.

## Response contract

The response is an `InventorySlotDetails` object:

- `inventoryId`: string.
- `inputFields[]`: fields whose `id` is a numeric string and must be used as the booking field key.
- Each field carries `type`, user-facing `name`, `dataType`, `validation`, and `level`.
- `validation` carries `required`, regex/length constraints, numeric bounds, and optional `values`.
- `values.type=TEXT` contains exact-match strings. `values.type=PREDEFINED_LOCATION` contains
  location objects; render a selector and submit the selected location `id` or `displayName`.

Supported `dataType` values are `STRING`, `ENUM`, `BOOL`, `INT`, `FLOAT`, and `LOCATION`. Supported
levels are `PRIMARY_CUSTOMER`, `ALL_CUSTOMER`, and `BOOKING`.

## Server and browser boundary

Fetch and normalize the response on the server. The BFF may return only the field metadata needed by
the form: `id`, `name`, safe description/helper text when present, `dataType`, `level`, `required`,
validation constraints, and safe enum/location options. Never return the auth header or unrelated raw
response data.
Render all labels, descriptions, and option values as escaped text; metadata never authorizes HTML.

Inventory metadata should be resolved after the selected inventory is known and before the checkout
form renders. Cache only within the partner's existing request/session conventions; do not introduce
a new cache or SDK abstraction solely for this feature.

## Booking mapping

- `PRIMARY_CUSTOMER`: place once in the `isPrimary: true` customer's `inputFields`.
- `ALL_CUSTOMER`: place in every customer's `inputFields`.
- `BOOKING`: place in the booking-level `variantInputFields` array.
- Preserve field values and their IDs through payment. Validate again on the server before creating
  the booking; client validation is not authoritative.

Existing product/variant `inputFields` remain a supported compatibility path for partners that have
not enabled this workflow. Once this workflow is enabled for a checkout, the inventory-details call
is blocking: do not render or submit fields until it succeeds. On failure, show a safe recoverable
error and preserve the existing product-derived implementation for an explicit rollback path; never
merge conflicting definitions or silently fall back during the same request.

## Errors and stale facts

Handle `401` as missing/invalid server credentials, `403` as authorization or partner-type failure,
and `404` as an unavailable inventory. Treat malformed responses, unknown data types/levels, or a
changed location shape as a blocking contract mismatch and surface the exact redacted response shape.
