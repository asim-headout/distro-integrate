---
name: headout-03-checkout-inputs
description: Step 03 of the Headout partner flow. Use for checkout form fields, passenger/customer details, primary customer, required fields from Headout API responses, variant input fields, pickup or transportation choices, and validation before payment.
argument-hint: "[checkout fields or form scope]"
---

# Headout 03 — Checkout Inputs

## Outcome (what "done" looks like — FE/BE agnostic)
A checkout form collects the customer/passenger details, the primary customer, and the
booking/variant input fields required by the *current* Headout API responses — validated and
preserved through payment and booking. Field requirements are sourced live, not hardcoded to one
product.

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing routes, design system, types, and conventions.
  Add, don't replace. Don't introduce a new client/SDK abstraction unless the repo already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (missing field, new field type, changed requirement) → STOP and surface it to the
  partner. Never silently code around it or guess field names.
- **Sandbox-safe:** never call production for tests; gate sandbox calls behind credentials.
- Emit no analytics/tracking.

## Steps
1. Inspect existing checkout, form validation, cart/order state, and payment handoff.
2. Source field requirements from current Headout API responses (Backend reference); do not hardcode a single product's fields.
3. Build the frontend form. *(No dedicated page recipe yet — follow the partner's design system and the field metadata; a checkout-inputs page recipe is a planned follow-up.)*
4. Render only safe field metadata on the frontend; keep raw API calls server-side.
5. Preserve customer/passenger fields, primary customer rules, pax counts, and variant input fields through payment and booking.
6. Validate before constructing the booking payload.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** required fields render from live metadata, validation blocks an incomplete form, and exactly one primary customer is captured. Get this green before hardening.
- **Advanced pass:** only then handle unknown future field types, pax-count changes after entry, and variant-input persistence (Advanced reference).

## References (load only what's needed)
- **Frontend — look & structure:** *(checkout-inputs page recipe — planned follow-up; until then reuse the partner design system and `ui-components/` from earlier recipes)*
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md), [../../references/edge-cases.md](../../references/edge-cases.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
