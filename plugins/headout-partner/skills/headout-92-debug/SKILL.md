---
name: headout-92-debug
description: Support skill for the Headout partner flow. Use to debug failing Headout API calls, discovery issues, inventory/pricing mismatches, checkout input bugs, seatmap validation errors, booking failures, webhook issues, auth, or sandbox/production confusion.
argument-hint: "[symptom, endpoint, step]"
---

# Headout 92 Debug

Debug safely. Ask the user to redact `Headout-Auth`, customer PII, voucher data, payment details, and full raw payloads before sharing logs.

Basic path:

1. Identify the failing business-flow step.
2. Classify the issue: auth, base URL, request shape, discovery, inventory/pricing, checkout inputs, seatmap, booking, webhook, cancellation, or reschedule.
3. Compare request/response shape against Headout docs and OpenAPI v2.
4. Check sandbox vs production configuration.
5. Prefer narrow diagnostic tests or minimal redacted logs.
6. Add a regression test once the root cause is identified if the repo has tests.
7. End with a context checkpoint.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
