---
name: headout-00-plan
description: Step 00 of the Headout partner flow. Use before implementation to classify the partner stack, decide scope, map backend/frontend responsibilities, choose Headout API v2 surfaces, and create the ordered integration plan.
argument-hint: "[goals, stack, constraints]"
---

# Headout 00 Plan

Plan only. Do not edit files, install packages, or run migrations from this skill.

Basic path:

1. Inspect enough repo structure to identify stack, package manager, API boundaries, env handling, logging, UI framework, and existing tests.
2. Classify partner mode: API partner, affiliate, or unknown.
3. Classify architecture: direct server calls, API wrapper, generated client, monorepo package, serverless, or mixed.
4. Map the business flow: discovery -> product selection -> checkout inputs -> seatmap if needed -> payment booking -> booking management.
5. Produce a step-by-step plan with acceptance criteria and the next recommended skill.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Business flow: [../../references/business-flow.md](../../references/business-flow.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Sequencing: [../../references/sequencing.md](../../references/sequencing.md)
- Testing contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
