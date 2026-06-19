---
name: headout-06-booking-management
description: Step 06 of the Headout partner flow. Use for post-booking management, booking status webhooks, cancellation, reschedule, idempotent status updates, retries, out-of-order events, observability, and reconciliation.
argument-hint: "[webhook, cancellation, reschedule, or post-booking scope]"
---

# Headout 06 — Booking Management

## Outcome (what "done" looks like — FE/BE agnostic)
Post-booking lifecycle is handled: booking-status webhooks are ingested idempotently and resiliently
(retries, out-of-order delivery), cancellation/reschedule are wired where in scope, and local booking
state stays reconciled with Headout. Webhook ingestion is **backend-centric**; any customer-facing
status/servicing UI follows the partner's design system.

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing routes, persistence, error, and logging
  conventions. Add, don't replace. Existing dummy/stub content, placeholder routes, TODOs, bugs, and
  rough patterns are host-app context, not cleanup scope. Report better patterns or existing issues
  as observations; do not remove, fix, rewrite, rename, reorganize, or simplify existing code unless
  the user explicitly asks for that specific change. If existing code blocks the Headout integration,
  stop and ask before changing it. Don't introduce a new client/SDK abstraction unless the repo
  already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response/webhook
  contradicts a reference (new status, changed event shape) → STOP and surface it to the partner.
  Never silently code around it or guess field names.
- **Preflight orientation:** after inspecting the repo and before edits, summarize the detected
  stack, relevant routes/data boundaries, intended edit scope, assumptions, and existing
  issues/dummy code observed but left untouched. Ask only questions that block a safe integration
  decision; otherwise state assumptions and proceed.
- **Sandbox-safe:** never call production for tests; gate sandbox calls behind credentials.
- Emit no analytics/tracking.

## Steps
1. Inspect booking persistence, DB/migration ownership, public route/controller/function patterns, idempotency storage, logging, and tests.
2. Resolve the webhook + cancel/reschedule API contract (Backend reference + headout-api.md) before coding.
3. Resolve persistence changes (Persistence reference) before coding: event dedupe storage, local status fields, migration ownership, and whether schema changes belong in this repo or another repo/service.
4. Implement webhook handling using existing runtime conventions.
5. Handle `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`, and `CAPTURE_TIMEDOUT`; do not expect `UNCAPTURED` in webhooks.
6. Add cancellation and reschedule only if requested or needed by the integration scope (treat their immediate responses as async acknowledgements, not final state).
7. Make status processing idempotent and resilient to retries and out-of-order delivery; persist enough event metadata for reconciliation without storing PII-heavy payloads.
8. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** a webhook event updates local booking state, the handler is idempotent (a duplicate event is a no-op) and returns 2xx after successful processing. Get this green before hardening.
- **Advanced pass:** only then handle out-of-order updates, status regression, unknown status, missing booking, and cancellation/reschedule acknowledgement-vs-final-state (Advanced reference).

## References (load only what's needed)
- **Frontend — look & structure:** *(booking-management UI page recipe — planned follow-up; until then reuse the partner design system and `ui-components/`)*
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Persistence and migrations:** [../../references/persistence-and-migrations.md](../../references/persistence-and-migrations.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
