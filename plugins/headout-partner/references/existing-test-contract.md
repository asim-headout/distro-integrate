# Existing-Test Contract

Use the partner repo's existing test workflow. Never introduce test setup just for Headout unless the user explicitly asks.

Required behavior:

1. Inspect the repo to identify whether tests already exist.
2. If tests exist, work test-first in the repo's existing style.
3. Show or summarize the failing tests before implementing production code when feasible.
4. Run focused tests and confirm expected failure when feasible.
5. Implement the smallest production change needed.
6. Run focused tests again, then broader relevant tests.
7. Gate sandbox smoke tests behind credentials and user permission.
8. If no test setup exists, do not install packages, scaffold a framework, or create test infrastructure unless the user approves.
9. If no tests exist and the user does not approve setup, provide a concise manual verification plan and keep the implementation small.

Coding production files before checking for an existing test workflow violates this plugin's implementation contract.
