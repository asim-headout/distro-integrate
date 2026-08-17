---
name: headout-00-plan
description: Step 00 of the Headout partner flow. Use before implementation to classify the partner stack, decide scope, map backend/frontend responsibilities, choose Headout API v2 surfaces, and create the ordered integration plan.
argument-hint: "[goals, stack, constraints]"
---

# Headout 00 — Plan

## Outcome (what "done" looks like)
A written, ordered integration plan: the partner's stack and architecture classified, required
planning questions asked, the in-scope Headout API v2 surfaces chosen, the business flow mapped to
journey steps, acceptance criteria per step, and the next recommended skill. **Plan only — do not
edit files, install packages, or run migrations from this skill.**

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and raw Headout calls stay server-side; apply the agent,
  BFF, authorization, logging, cache, and untrusted-data rules in
  [headout-api.md](../../references/headout-api.md).
- **Non-breaking:** preserve the partner's existing routes, design system, types, and conventions.
  Add, don't replace. Existing dummy/stub content, placeholder routes, TODOs, bugs, and rough
  patterns are host-app context, not cleanup scope. Report better patterns or existing issues as
  observations; do not remove, fix, rewrite, rename, reorganize, or simplify existing code unless the
  user explicitly asks for that specific change. If existing code blocks the Headout integration,
  stop and ask before changing it. Don't introduce a new client/SDK abstraction unless the repo
  already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (missing field, new status, changed pricing shape) → STOP and surface it to the partner.
  Never silently code around it or guess field names.
- **Questionnaire-first:** after inspecting the repo, ask the planning questionnaire before proposing
  implementation. Do not ask questions the repo already answers; summarize the repo evidence and ask
  only for decisions that affect routing, persistence, UI setup, checkout/payment flow, environment,
  rollout, or scope.
- Emit no analytics/tracking.

## Steps
1. Inspect enough repo structure to identify stack, package manager, API boundaries, env handling, logging, UI framework, persistence/migration ownership, and existing tests.
2. Present a short repo overview and ask the planning questionnaire ([../../references/planning-questionnaire.md](../../references/planning-questionnaire.md)): URL prefix, DB migration ownership, UI setup confirmation, checkout/payment routing, execution strategy (one-by-one, bounded batch, or workflow/subagents), scope, partner mode, Headout environment, server-side env/secret setup, locale/currency defaults, PSP boundary, booking identity, auth dependency, tests, and rollout.
3. Classify partner mode: API partner, affiliate, or unknown.
4. Classify architecture: direct server calls, API wrapper, generated client, monorepo package, serverless, or mixed.
5. Classify persistence: local DB/migrations in this repo, external order service, migrations in another repo, stateless, or unknown. If DB ownership is unclear and booking/payment/webhooks are in scope, ask the developer early whether to add migrations here, produce a schema handoff, or skip DB changes.
6. Map the business flow to journey steps: discovery → product selection → checkout inputs → seatmap (if needed) → payment booking → booking management.
7. For each frontend surface, note which **page recipe** and shared UI/data rules apply (see the FE recipe library below) so later steps build to a consistent spec.
8. Produce a step-by-step plan with acceptance criteria, an execution strategy recommendation, including persistence/migration acceptance criteria where relevant, and the next recommended skill.

User context:

```text
$ARGUMENTS
```

## References (load only what's needed)
- **Business flow:** [../../references/business-flow.md](../../references/business-flow.md)
- **Planning questionnaire:** [../../references/planning-questionnaire.md](../../references/planning-questionnaire.md)
- **Backend — API facts:** [../../references/headout-api.md](../../references/headout-api.md)
- **Persistence and migrations:** [../../references/persistence-and-migrations.md](../../references/persistence-and-migrations.md)
- **Shared UI/data contract:** [../../references/ui-data-contract.md](../../references/ui-data-contract.md)
- **Frontend — page recipe library:** invocable `page-*` and `book-*` skills (e.g. [../page-home/SKILL.md](../page-home/SKILL.md), [../page-city/SKILL.md](../page-city/SKILL.md), [../page-tour/SKILL.md](../page-tour/SKILL.md), [../book-select/SKILL.md](../book-select/SKILL.md)). Self-contained, branding-neutral page specs.
- **Competitor migration (Archetype C):** [../../references/competitor-adapters.md](../../references/competitor-adapters.md)
- **Sequencing:** [../../references/sequencing.md](../../references/sequencing.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
