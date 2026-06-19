---
name: headout-99-context-checkpoint
description: Support skill for the Headout partner flow. Use after completing any Headout step to summarize state, capture files/tests/open decisions, recommend the next flow skill, and offer a compact-ready resume summary.
argument-hint: "[current step and recent work]"
---

# Headout 99 Context Checkpoint

Create a compact-ready checkpoint for the Headout integration.

Use the user context plus conversation/repo evidence:

```text
$ARGUMENTS
```

Output:

1. Current Headout step and skill.
2. Completed decisions and implementation changes.
3. Files touched or inspected.
4. Tests added or run, including failures.
5. Open decisions or blockers.
6. Next recommended Headout skill.
7. One-paragraph resume summary.

Use this final sentence when the current step is complete:

```text
This is a good checkpoint to compact context. Resume with: <summary>
```

Reference:

- Context checkpoint format: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
