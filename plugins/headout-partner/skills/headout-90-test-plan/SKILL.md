---
name: headout-90-test-plan
description: "Support skill for the Headout partner flow. Use to generate a test plan across completed steps: discovery, product selection, checkout inputs, seatmap, payment booking, booking management, negative cases, sandbox smoke tests, and launch readiness."
argument-hint: "[completed or planned steps]"
---

# Headout 90 Test Plan

Create a practical test plan for the Headout steps already implemented or planned.

Basic path:

1. Inspect existing tests and test runner first.
2. Do not add test infrastructure unless the user explicitly asks.
3. Cover unit tests for request builders, mappers, validators, and error translation.
4. Cover contract tests with mocked Headout v2 responses.
5. Gate sandbox smoke tests behind env vars and explicit permission.
6. Include launch-readiness, rollback, and reconciliation checks.
7. End with a context checkpoint.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Existing-test contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
