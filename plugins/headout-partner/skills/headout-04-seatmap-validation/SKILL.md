---
name: headout-04-seatmap-validation
description: Step 04 of the Headout partner flow. Use when the selected product uses seatmap inventory or the user asks for seat selection, iframe seatmap, custom seatmap rendering, inventorySeatIds, seat validation, adjacency errors, or seat price changes.
argument-hint: "[iframe, custom, or both]"
---

# Headout 04 — Seatmap Validation

## Outcome (what "done" looks like — FE/BE agnostic)
For seatmap products, the user selects seats (via Headout's iframe or a custom render), the selection
is validated server-side before booking, and the validated `inventorySeatIds` + returned prices carry
into the booking. Use this step **only** when the product uses seatmap inventory or seat selection is
explicitly requested.

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing routes, design system, types, and conventions.
  Add, don't replace. Don't introduce a new client/SDK abstraction unless the repo already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (new error code, changed validation shape, changed seat ceiling) → STOP and surface it
  to the partner. Never silently code around it or guess field names.
- **Sandbox-safe:** never call production for tests; gate sandbox calls behind credentials.
- Emit no analytics/tracking.

## Steps
1. Confirm mode: iframe, custom, or both.
2. Resolve the seatmap API contract (Backend reference + headout-api.md) before coding.
3. Use **iframe mode** for Headout-hosted seat selection; use **custom mode** only when the partner must render seats + validation themselves.
4. Validate selected seats server-side before booking.
5. Preserve validated `inventorySeatIds` and returned prices into booking.
6. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** a valid seat selection validates (HTTP 200, no business-level error) and the validated ids + prices flow into the booking payload. Get this green before hardening.
- **Advanced pass:** only then handle `SEAT_UNAVAILABLE`, `SEAT_NOT_FOUND`, `ADJACENCY_RULE_VIOLATION`, the 20-seat ceiling, and 200-with-validation-error responses (Advanced reference).

## References (load only what's needed)
- **Frontend — look & structure:** iframe embed needs little FE; for custom render, reuse the partner design system and `ui-components/`. *(No dedicated seatmap page recipe.)*
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
