---
name: headout-93-inventory-input-fields
description: Support skill for upgrading a partner checkout to fetch and render inventory-specific Headout input fields. Invoke explicitly when implementing, testing, or reviewing GET /api/public/v2/inventories/{inventoryId}/; do not use as a replacement for the headout-03-checkout-inputs journey step.
---

# Headout 93 — Inventory Input Fields

## Outcome

The partner checkout fetches the selected inventory's current `inputFields` before rendering the
form, exposes only safe metadata to the browser, and submits the returned numeric-string field IDs
correctly to booking creation. Partners that have not enabled this workflow retain their existing
product-derived path.

## Ground rules

- Keep `Headout-Auth` and raw calls server-side; apply the agent/BFF/untrusted-data rules in
  [headout-api.md](../../references/headout-api.md) and expose only safe field metadata.
- Preserve partner routes, conventions, types, and existing product/variant fallback behavior. Add,
  don't replace; leave unrelated bugs, stubs, and refactors untouched.
- Use Headout API v2 and the sandbox by default. Never call production while building.
- If a live response contradicts the references, STOP and surface the mismatch; never guess field
  names, types, levels, or submission shapes.
- Emit no analytics or tracking, and redact auth, PII, payment data, and full raw responses in logs.

## Steps

1. Inspect the partner repo first. Locate checkout rendering, selected `inventoryId` state, current
   product/variant `inputFields` mapping, BFF/server routes, booking payload construction, and tests.
2. Present a short orientation and implementation plan. Include the detected stack, data boundary,
   intended additive edits, assumptions, and existing observations left untouched. Stop for explicit
   approval before editing partner code.
3. Resolve the live contract from the documentation index and [backend reference](references/backend.md).
   Confirm the exact inventory ID source and response field paths before writing mapper code.
4. Add the server-side inventory-details request before checkout fields render. Return a minimal safe
   metadata DTO containing labels, descriptions when present, `level`, `dataType`, `required`,
   constraints, enum values, and predefined locations.
5. Render controls from metadata. Route fields by `PRIMARY_CUSTOMER`, `ALL_CUSTOMER`, or `BOOKING`;
   validate string, enum, bool, integer, float, and location values. Unknown types or shapes block
   the change and require partner clarification.
6. Preserve values through payment and booking. Use each returned field's `id` as the booking
   `inputFields` key and revalidate server-side immediately before booking creation.
7. Run existing focused tests, then broader relevant tests. Do not add test infrastructure. Run the
   curated sandbox smoke matrix only when a sandbox key is configured and the partner permits it.
8. Record the result using [context-checkpoint.md](../../references/context-checkpoint.md) and name
   the next journey/support skill.

## Verification gate

- Basic: the inventory request is server-only, loading/error states are safe, fields render from the
  selected inventory, required validation works, and existing product-derived bookings still work.
- Contract: field IDs, levels, data types, constraints, enum/location options, and booking placement
  match the live response.
- Failure: `401`, `403`, `404`, timeout, malformed metadata, and unknown future fields fail visibly
  without exposing secrets or silently flattening fields into text inputs.
- Sandbox: execute the relevant fixtures from [references/fixtures/](references/fixtures/README.md)
  and record unavailable fixtures for replacement. If a required fixture is confirmed absent in
  sandbox (see the relevant `fixtures/*.md` file), do not block the integration on it — implement per
  the documented contract and flag it to the partner as untestable pending Headout sandbox data.

## References

- API and BFF mapping: [references/backend.md](references/backend.md)
- Sandbox fixtures (split by topic): [references/fixtures/README.md](references/fixtures/README.md)
- Journey owner: [headout-03-checkout-inputs](../headout-03-checkout-inputs/SKILL.md)
- Shared API facts: [headout-api.md](../../references/headout-api.md)
- Testing contract: [existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [context-checkpoint.md](../../references/context-checkpoint.md)
