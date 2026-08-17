---
name: headout-05-payment-booking
description: Step 05 of the Headout partner flow. Use for partner payment handoff, checkout-to-booking transition, Headout create/capture/get booking, partnerReferenceId, order persistence, duplicate booking prevention, and booking reconciliation.
argument-hint: "[payment system, order model, sandbox policy]"
---

# Headout 05 — Payment & Booking

## Outcome (what "done" looks like — FE/BE agnostic)
The partner confirms the cart against current inventory, creates a Headout booking in `UNCAPTURED`
state, completes payment on the partner PSP, then captures the Headout booking by updating it to
`PENDING` with `partnerReferenceId`. The Headout `bookingId` and partner `partnerReferenceId` are
persisted and reconciled. This step is **backend-centric** — the partner owns payment (and therefore
Merchant-of-Record); Headout is the booking engine.

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and raw Headout calls stay server-side; apply the agent,
  BFF, authorization, logging, cache, and untrusted-data rules in
  [headout-api.md](../../references/headout-api.md).
- **Non-breaking:** preserve the partner's existing payment, order, error, and logging conventions.
  Add, don't replace. Existing dummy/stub content, placeholder routes, TODOs, bugs, and rough
  patterns are host-app context, not cleanup scope. Report better patterns or existing issues as
  observations; do not remove, fix, rewrite, rename, reorganize, or simplify existing code unless the
  user explicitly asks for that specific change. If existing code blocks the Headout integration,
  stop and ask before changing it. Don't introduce a new client/SDK abstraction unless the repo
  already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (new status, changed capture semantics, changed payload shape) → STOP and surface it to
  the partner. Never silently code around it or guess field names.
- **Preflight orientation:** after inspecting the repo and before edits, summarize the detected
  stack, relevant routes/data boundaries, intended edit scope, assumptions, and existing
  issues/dummy code observed but left untouched. Ask only questions that block a safe integration
  decision; otherwise state assumptions and proceed.
- **Sandbox-first:** default to the sandbox (sandbox endpoints + the partner's sandbox `Headout-Auth`) for all development; never call production while building — moving to production is the partner's explicit go-live decision. Gate sandbox booking smoke tests behind
  credentials **and** explicit user approval; do not create sandbox bookings unless allowed.
- Emit no analytics/tracking.

## Steps
1. Inspect payment, checkout, order persistence, DB/migration ownership, error model, logging, and tests.
2. Resolve the booking API contract (Backend reference + headout-api.md) before coding.
3. Resolve persistence changes (Persistence reference) before coding: reuse existing order/payment models, add migrations only if this repo owns them or the developer approves, or produce a schema handoff if migrations live elsewhere.
4. Revalidate two server-side amounts from current inventory: the customer selling total charged on
   the PSP, and Headout's API-required booking amount (currently summed `netPrice`). Never expose the
   latter to the browser or reuse one amount as the other.
5. Create Headout bookings in `UNCAPTURED` state to obtain `bookingId`; do not treat this as an
   inventory or price lock.
6. Complete partner PSP payment; only after verified PSP success, capture Headout to `PENDING` with
   `partnerReferenceId`. If funds settle before Headout capture, implement a durable void/refund path
   for capture failure.
7. Store `bookingId`, `partnerReferenceId`, PSP/payment/capture/compensation state, and a
   server-generated, order-scoped idempotency key protected by database uniqueness.
8. On uncertain failures, reconcile Headout and PSP state before retrying. Never re-charge a payment
   already authorized/captured. Contract or ordering disagreement → STOP and surface it.
9. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** one approved sandbox booking uses distinct selling/booking amounts, creates and
  captures, and persists ids + payment/capture/compensation state; customer counts align and exactly
  one customer is primary. Get this green before hardening.
- **Advanced pass:** only then handle duplicate submission, timeout during create/capture, and the full status lifecycle (Advanced reference).

## References (load only what's needed)
- **Frontend — look & structure:** minimal — payment UI is the partner's own; this step is server-side.
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Persistence and migrations:** [../../references/persistence-and-migrations.md](../../references/persistence-and-migrations.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md), [../../references/edge-cases.md](../../references/edge-cases.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
