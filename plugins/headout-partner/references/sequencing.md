# Headout Integration Sequencing

Recommended default order:

1. `headout-00-plan`
2. `headout-01-discovery`
3. `headout-02-product-selection`
4. `headout-03-checkout-inputs`
5. `headout-04-seatmap-validation`, when needed
6. `headout-05-payment-booking`
7. `headout-06-booking-management`
8. `headout-90-test-plan`
9. `headout-91-review`
10. `headout-92-debug`
11. `headout-99-context-checkpoint`

Resume-state fields to reconstruct from conversation and repo evidence:

- Partner mode: `api_partner`, `affiliate`, or unknown.
- Tech stack and runtime boundaries.
- Architecture shape: wrapper, direct server calls, generated client, monorepo package, or serverless.
- Completed steps: planning, discovery, inventory, booking, webhooks, seatmap.
- Open decisions: currency, locale, sandbox policy, order model, checkout shape, and whether seatmap is required.

If a user starts in the middle, reconstruct state first. If prerequisites are missing, strongly recommend planning or ask only for the missing state needed to continue safely.

Execution strategy:

- Default to one journey step at a time for implementation. This keeps repo changes reviewable and
  avoids coupling discovery, checkout, payment, and webhook decisions too early.
- Suggest a bounded batch only when the steps share the same files and have clear acceptance
  criteria, for example product detail plus select-page wiring.
- Suggest Claude workflows/subagents for separable read-only work: repo discovery, API-doc lookup,
  route inventory, UI-system inventory, existing-test inventory, or independent review passes.
- Do not run broad parallel code edits across dependent journey steps unless the user explicitly
  chooses that execution mode.
