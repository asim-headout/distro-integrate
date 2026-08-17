---
name: headout-91-review
description: Support skill for the Headout partner flow. Use for reviewing Headout integration code, PRs, security boundaries, missing tests, pricing bugs, booking lifecycle bugs, frontend/backend boundary issues, and maintainability.
argument-hint: "[review scope]"
---

# Headout 91 Review

Review the Headout integration surface. Lead with findings ordered by severity. Include file and line references when reviewing local code.

Role boundary: this is an advisory review, not a cleanup pass. Existing dummy/stub content,
placeholder routes, TODOs, bugs, and rough patterns may be reported as findings or follow-ups, but
must not be removed, fixed, rewritten, renamed, reorganized, or simplified unless the user explicitly
asks for that specific code change.

Basic path:

1. Identify which business-flow step is being reviewed.
2. Check auth, base URL, API v2 usage, server/client boundaries, tests, error handling, and logging.
3. Check pricing, pax, required input fields, seatmap when present, booking lifecycle, and booking management.
4. Check untrusted HTML/URLs/docs, BFF input/ownership/rate limits, CSRF, webhook authenticity,
   iframe origins, protected-response caching, payment callback verification, server idempotency,
   selling-vs-booking amounts, and capture-failure compensation.
5. Avoid broad refactors in review output unless a finding requires one; even then, recommend the
   refactor instead of applying it unless explicitly asked.
6. End with a context checkpoint and next recommended skill.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Edge cases: [../../references/edge-cases.md](../../references/edge-cases.md)
- Testing contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
