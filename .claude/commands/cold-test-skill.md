# cold-test-skill

Simulate a cold-context execution of any headout-partner skill. Spawns a fresh subagent with no
session history to verify the skill is self-contained and unambiguous.

**Usage:** `/cold-test-skill <skill-name>`
**Example:** `/cold-test-skill headout-01-discovery`

---

## What this does

1. Reads the named skill's `SKILL.md` from `plugins/headout-partner/skills/<skill-name>/`
2. Reads all files directly linked from that skill (backend.md, advanced.md, etc.)
3. Spawns a fresh Agent with:
   - The skill content as its only context
   - A minimal synthetic partner repo stub (Next.js App Router, stub `/experience/[slug]` route,
     no Headout integration yet)
   - The instruction: "You are starting a fresh session. Execute this skill against the repo below."
4. Reports back:
   - **Orientation output** — did the agent describe the detected stack, scope, and assumptions?
   - **First action** — did it ask the right preflight questions or start the correct step?
   - **Hallucinations** — any file paths, API endpoints, or field names not present in the skill?

If the output is unexpected, the skill file has an ambiguity or buried instruction. Fix the file,
not the prompt.

---

## Steps

Read the skill file:

```
plugins/headout-partner/skills/$ARGUMENTS/SKILL.md
```

Collect linked references by grepping the skill for markdown links to `references/` files and
reading each one.

Then spawn the subagent:

```
Agent(
  description="Cold-context test: $ARGUMENTS",
  prompt="""
You are starting a completely fresh session. You have no prior conversation history.
You have been given one skill to execute and one repo to execute it against.

== SKILL ==
<contents of SKILL.md>

== LINKED REFERENCES ==
<contents of each linked reference file>

== SYNTHETIC REPO STUB ==
Framework: Next.js 14 App Router, TypeScript
Structure:
  app/
    layout.tsx        (bare shell, no Headout integration)
    page.tsx          (homepage stub, renders "Welcome")
    experience/
      [slug]/
        page.tsx      (stub, renders slug only)
  lib/
    (empty)
  package.json        (next, react, typescript only)

No Headout API keys, no existing integration, no partner-specific conventions.

== TASK ==
Execute the skill. Begin with your orientation message, then describe the first action you
would take. Do not actually edit files — describe what you would do and why.
""",
)
```

After the subagent responds, evaluate:

- Orientation present? (stack, scope, assumptions, edit boundary)
- First action matches expected step for this skill?
- Any invented file paths, endpoints, or field names?

Report findings to the user with a pass/fail summary and quotes from the subagent output.
