# Context Checkpoint

At the end of every Headout step, produce a concise checkpoint:

- Current step and skill.
- Completed decisions and implementation changes.
- Files touched or inspected.
- Tests added or run, including failures.
- Open decisions and blockers.
- Next recommended Headout skill.
- Resume summary that can be pasted into the next step.

Offer compaction when the step is complete and the conversation has accumulated implementation detail. Use this wording:

```text
This is a good checkpoint to compact context. Resume with:
<one-paragraph summary of state, completed step, key files, tests, open decisions, and next skill>
```

Do not offer compaction in the middle of a failing edit/test/debug loop unless the next agent can continue from a precise failure summary.
