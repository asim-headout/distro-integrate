---
name: headout-05-payment-booking
description: Step 05 of the Headout partner flow. Use for partner payment handoff, checkout-to-booking transition, Headout create/capture/get booking, partnerReferenceId, order persistence, duplicate booking prevention, and booking reconciliation.
argument-hint: "[payment system, order model, sandbox policy]"
---

# Headout 05 Payment Booking

Implement booking around the partner's existing payment and order system.

Basic path:

1. Inspect payment, checkout, order persistence, error model, logging, and tests.
2. Keep Headout booking APIs server-side.
3. Use current inventory pricing and validated inputs to build booking payloads.
4. Create Headout bookings in `UNCAPTURED` state and capture by updating status to `PENDING`.
5. Store Headout `bookingId` and partner `partnerReferenceId`.
6. On uncertain failures, prefer lookup/reconciliation over duplicate booking creation.
7. Gate sandbox booking smoke tests behind credentials and explicit user approval.
8. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Payment booking details: [references/advanced.md](references/advanced.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Testing contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
