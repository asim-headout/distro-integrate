---
name: headout-02-product-selection
description: Step 02 of the Headout partner flow. Use for product page, tour or variant selection, date/time selection, pax selection, inventory lookup, price display, availability state, and checkout entry.
argument-hint: "[product page, variant/date/pax/inventory scope]"
---

# Headout 02 Product Selection

Implement product selection after discovery is available or intentionally stubbed.

Basic path:

1. Inspect existing product detail, state management, cart/checkout entry, pricing, and tests.
2. Fetch or consume inventory for selected product/tour/variant, date range, pax, and currency.
3. Treat Headout inventory pricing as the checkout source of truth.
4. Model `PER_PERSON` and `PER_GROUP` separately.
5. Handle `LIMITED`, `UNLIMITED`, and `CLOSED` inventory states.
6. Preserve selected product, variant/tour, date/time, pax, currency, and language into checkout.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Product selection details: [references/advanced.md](references/advanced.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Testing contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
