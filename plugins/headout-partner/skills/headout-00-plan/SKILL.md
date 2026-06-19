---
name: headout-00-plan
description: Step 00 of the Headout partner flow. Use before implementation to classify the partner stack, decide scope, map backend/frontend responsibilities, choose Headout API v2 surfaces, and create the ordered integration plan.
argument-hint: "[goals, stack, constraints]"
---

# Headout 00 — Plan

## Outcome (what "done" looks like)
A written, ordered integration plan: the partner's stack and architecture classified, the in-scope
Headout API v2 surfaces chosen, the business flow mapped to journey steps, acceptance criteria per
step, and the next recommended skill. **Plan only — do not edit files, install packages, or run
migrations from this skill.**

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing routes, design system, types, and conventions.
  Add, don't replace. Don't introduce a new client/SDK abstraction unless the repo already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (missing field, new status, changed pricing shape) → STOP and surface it to the partner.
  Never silently code around it or guess field names.
- Emit no analytics/tracking.

## Steps
1. Inspect enough repo structure to identify stack, package manager, API boundaries, env handling, logging, UI framework, and existing tests.
2. Classify partner mode: API partner, affiliate, or unknown.
3. Classify architecture: direct server calls, API wrapper, generated client, monorepo package, serverless, or mixed.
4. Map the business flow to journey steps: discovery → product selection → checkout inputs → seatmap (if needed) → payment booking → booking management.
5. For each frontend surface, note which **page recipe** applies (see the FE recipe library below) so later steps build to a consistent spec.
6. Produce a step-by-step plan with acceptance criteria and the next recommended skill.

User context:

```text
$ARGUMENTS
```

## References (load only what's needed)
- **Business flow:** [../../references/business-flow.md](../../references/business-flow.md)
- **Backend — API facts:** [../../references/headout-api.md](../../references/headout-api.md)
- **Frontend — page recipe library:** invocable `page-*` and `book-*` skills (e.g. [../page-home/SKILL.md](../page-home/SKILL.md), [../page-city/SKILL.md](../page-city/SKILL.md), [../page-tour/SKILL.md](../page-tour/SKILL.md), [../book-select/SKILL.md](../book-select/SKILL.md)). Self-contained, branding-neutral page specs.
- **Competitor migration (Archetype C):** [../../references/competitor-adapters.md](../../references/competitor-adapters.md)
- **Sequencing:** [../../references/sequencing.md](../../references/sequencing.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
