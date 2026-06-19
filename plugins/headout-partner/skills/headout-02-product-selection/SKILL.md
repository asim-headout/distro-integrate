---
name: headout-02-product-selection
description: Step 02 of the Headout partner flow. Use for product page, tour or variant selection, date/time selection, pax selection, inventory lookup, price display, availability state, and checkout entry.
argument-hint: "[product page, variant/date/pax/inventory scope]"
---

# Headout 02 — Product Selection

## Outcome (what "done" looks like — FE/BE agnostic)
A user lands on a product detail page, picks a variant/tour + date + time (+ pax), sees a live price,
and proceeds to checkout — backed by Headout product details + calendar inventory + pricing, with
inventory pricing treated as the checkout source of truth.

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing routes, design system, types, and conventions.
  Add, don't replace. Don't introduce a new client/SDK abstraction unless the repo already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (missing field, new status, changed pricing shape) → STOP and surface it to the partner.
  Never silently code around it or guess field names.
- **Sandbox-safe:** never call production for tests; gate sandbox calls behind credentials.
- Emit no analytics/tracking.

## Steps
1. Inspect existing product detail, state management, cart/checkout entry, pricing, and tests.
2. Resolve the API contract (Backend reference + headout-api.md) before coding.
3. Build the frontend to the **page recipes** — `page-tour` (product detail) and `book-select` (date/time/variant booking step). They are the source of truth for section order, derivation, conditional rules, components, and visual language.
4. Wire the backend: fetch/consume inventory for the selected product/tour/variant, date range, pax, and currency; map into the shape the FE consumes via the partner's BFF.
5. Treat Headout inventory pricing as the checkout source of truth; model `PER_PERSON` and `PER_GROUP` separately; handle `LIMITED`, `UNLIMITED`, and `CLOSED` inventory states.
6. Preserve selected product, variant/tour, date/time, pax, currency, and language into checkout.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** a product resolves, inventory + price render for a valid selection, and the user can proceed to checkout with the selection preserved. Get this green before hardening.
- **Advanced pass:** only then handle mixed pax, pax min/max, stale price revalidation, and currency precision (Advanced reference).

## References (load only what's needed)
- **Frontend — look & structure (page recipes):** [../page-tour/SKILL.md](../page-tour/SKILL.md) (product detail), [../book-select/SKILL.md](../book-select/SKILL.md) (date/time/variant booking step)
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md), [../../references/edge-cases.md](../../references/edge-cases.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
