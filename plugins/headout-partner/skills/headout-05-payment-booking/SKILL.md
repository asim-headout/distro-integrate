---
name: headout-05-payment-booking
description: Step 05 of the Headout partner flow. Use for partner payment handoff, checkout-to-booking transition, Headout create/capture/get booking, partnerReferenceId, order persistence, duplicate booking prevention, and booking reconciliation.
argument-hint: "[payment system, order model, sandbox policy]"
---

# Headout 05 — Payment & Booking

## Outcome (what "done" looks like — FE/BE agnostic)
The partner's own payment completes, then a Headout booking is created (`UNCAPTURED`) and captured
(updated to `PENDING`) server-side from current inventory pricing + validated inputs, with the Headout
`bookingId` and partner `partnerReferenceId` persisted and reconciled. This step is **backend-centric**
— the partner owns payment (and therefore Merchant-of-Record); Headout is the booking engine.

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing payment, order, error, and logging conventions.
  Add, don't replace. Don't introduce a new client/SDK abstraction unless the repo already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (new status, changed capture semantics, changed payload shape) → STOP and surface it to
  the partner. Never silently code around it or guess field names.
- **Sandbox-safe:** never call production for tests; gate sandbox booking smoke tests behind
  credentials **and** explicit user approval; do not create sandbox bookings unless allowed.
- Emit no analytics/tracking.

## Steps
1. Inspect payment, checkout, order persistence, error model, logging, and tests.
2. Resolve the booking API contract (Backend reference + headout-api.md) before coding.
3. Build booking payloads from current inventory pricing and validated inputs.
4. Create Headout bookings in `UNCAPTURED` state and capture by updating status to `PENDING`.
5. Store Headout `bookingId` and partner `partnerReferenceId`.
6. On uncertain failures, prefer lookup/reconciliation over duplicate booking creation.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** one happy-path booking creates and captures in sandbox (with approval), `bookingId` + `partnerReferenceId` persist, and `customersDetails.count` matches `customers.length` with exactly one primary customer. Get this green before hardening.
- **Advanced pass:** only then handle duplicate submission, timeout during create/capture, and the full status lifecycle (Advanced reference).

## References (load only what's needed)
- **Frontend — look & structure:** minimal — payment UI is the partner's own; this step is server-side.
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md), [../../references/edge-cases.md](../../references/edge-cases.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
