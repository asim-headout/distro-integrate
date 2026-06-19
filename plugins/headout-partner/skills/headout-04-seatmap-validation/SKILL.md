---
name: headout-04-seatmap-validation
description: Step 04 of the Headout partner flow. Use when the selected product uses seatmap inventory or the user asks for seat selection, iframe seatmap, custom seatmap rendering, inventorySeatIds, seat validation, adjacency errors, or seat price changes.
argument-hint: "[iframe, custom, or both]"
---

# Headout 04 Seatmap Validation

Use this only when seatmap is required by the product or explicitly requested.

Basic path:

1. Confirm mode: iframe, custom, or both.
2. Keep auth and validation server-side where required.
3. Use iframe mode for Headout-hosted seat selection.
4. Use custom mode only when the partner needs to render seats and validation.
5. Validate selected seats before booking.
6. Preserve validated `inventorySeatIds` and returned prices into booking.
7. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Seatmap details: [references/advanced.md](references/advanced.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Testing contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
