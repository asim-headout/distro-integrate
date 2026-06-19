---
name: headout-92-debug
description: Support skill for the Headout partner flow. Use to debug failing Headout API calls, discovery issues, inventory/pricing mismatches, checkout input bugs, seatmap validation errors, booking failures, webhook issues, auth, or sandbox/production confusion.
argument-hint: "[symptom, endpoint, step]"
---

# Headout 92 Debug

Debug safely. Ask the user to redact `Headout-Auth`, customer PII, voucher data, payment details, and full raw payloads before sharing logs.

Role boundary: debug the requested Headout symptom narrowly. If existing partner bugs, dummy/stub
content, TODOs, or refactor opportunities are discovered, report them as observations and leave the
code untouched unless the user explicitly asks for that specific fix.

Basic path:

1. Identify the failing business-flow step.
2. Classify the issue: auth, base URL, request shape, discovery, inventory/pricing, checkout inputs, seatmap, booking, webhook, cancellation, or reschedule.
3. Compare request/response shape against Headout docs and OpenAPI v2.
4. Check sandbox vs production configuration.
5. Prefer narrow diagnostic tests or minimal redacted logs.
6. Recommend a regression test once the root cause is identified if the repo has tests; add it only
   when it is directly tied to the requested Headout fix and does not require restructuring test
   setup.
7. End with a context checkpoint.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
