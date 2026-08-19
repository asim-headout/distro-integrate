# Inventory-Level Field Overrides

## What

A specific inventory (date/time slot) can require a **different set of `inputFields`** than its
variant's default, shown on the Products API. Fields can be added or removed per inventory — this is
exactly why this skill exists as a distinct step from the product-derived path in
[headout-03-checkout-inputs](../../../headout-03-checkout-inputs/SKILL.md).

## Where

Compare `variants[].inputFields[]` (Products API) against `inputFields[]` (Inventory Details API,
`GET /v2/inventories/{inventoryId}/`) for the same variant/inventory.

## How

Once this workflow is enabled for a checkout, treat the Inventory Details response as authoritative
for the selected inventory — do not merge it with the variant-level list, and do not silently fall
back to variant-level fields if the inventory-details call fails (see [backend.md](../backend.md)'s
"Booking mapping" section for the exact failure-handling rule: fail visibly, offer explicit rollback,
never silently substitute).

When comparing field sets between the two responses, match on `name` — not on `id`. The same standard
field (e.g. "Full Name") can carry a different numeric `id`/`oldId` between the Products API and the
Inventory Details API call even when nothing about the field actually changed; `id` is a
per-request-generated key, not a stable identity across endpoints.

## Sample

Real override on tourId `1268` (productId `793`) — the variant-level default includes a "Pickup
Location" field that this specific inventory slot does **not** require, while adding no new fields
beyond the variant default in this instance:

- Variant-level fields: `Full Name`, `Email`, `Phone`, `Pickup Location`, `Additional Information`, `Weight`
- This inventory's fields: `Full Name`, `Email`, `Phone`, `Additional Information`, `Weight`

`Pickup Location` is present on the product's default contract but absent for this specific slot —
an integration that only ever calls the Products API and hardcodes its field list would render a
pickup-location control the booking doesn't actually need for this inventory (harmless), but would
also miss the inverse case: a slot that *adds* a field not present on the variant default (e.g. a
seasonal waiver), which would cause booking submission to fail validation server-side.

## Full data

- Full fixture JSON (both sides of the diff): `../../../../tools/sandbox-scenario-catalog/output/fixtures/inventory.field_override__1268.json`
- Live status: [CHECKLIST.md](../../../../tools/sandbox-scenario-catalog/output/CHECKLIST.md)
