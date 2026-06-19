---
name: headout-06-booking-management
description: Step 06 of the Headout partner flow. Use for post-booking management, booking status webhooks, cancellation, reschedule, idempotent status updates, retries, out-of-order events, observability, and reconciliation.
argument-hint: "[webhook, cancellation, reschedule, or post-booking scope]"
---

# Headout 06 Booking Management

Implement post-booking management after booking persistence exists.

Basic path:

1. Inspect booking persistence, public route/controller/function patterns, idempotency storage, logging, and tests.
2. Implement webhook handling using existing runtime conventions.
3. Handle `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, and `CAPTURE_TIMEDOUT`; do not expect `UNCAPTURED` in webhooks.
4. Add cancellation and reschedule only if requested or needed by the integration scope.
5. Make status processing idempotent and resilient to retries and out-of-order delivery.
6. Persist enough event metadata for reconciliation without storing PII-heavy payloads.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Booking management details: [references/advanced.md](references/advanced.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Existing-test contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
