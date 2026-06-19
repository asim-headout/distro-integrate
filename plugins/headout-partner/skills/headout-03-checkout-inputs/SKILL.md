---
name: headout-03-checkout-inputs
description: Step 03 of the Headout partner flow. Use for checkout form fields, passenger/customer details, primary customer, required fields from Headout API responses, variant input fields, pickup or transportation choices, and validation before payment.
argument-hint: "[checkout fields or form scope]"
---

# Headout 03 Checkout Inputs

Implement checkout field collection before payment and booking.

Basic path:

1. Inspect existing checkout, form validation, cart/order state, and payment handoff.
2. Source field requirements from current Headout API responses; do not hardcode a single product's fields.
3. Keep Headout auth and raw API calls server-side.
4. Render only safe field metadata on the frontend.
5. Preserve customer/passenger fields, primary customer rules, pax counts, and variant input fields through payment and booking.
6. Validate before constructing the booking payload.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Checkout input details: [references/advanced.md](references/advanced.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
