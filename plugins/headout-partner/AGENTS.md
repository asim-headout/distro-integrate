# AGENTS.md — Authoring Rules for the Headout Partner Plugin

This file governs how an AI agent should read, write, and update files in this plugin.
It is not for partners. Partners read README.md.

---

## What this plugin is

A collection of SKILL.md files that Claude Code loads at inference time. These files **are** the
runtime — their quality directly affects what the model does in a partner's codebase. Treat every
edit as production code.

---

## 1. File size budgets

| File type | Hard limit | Soft target |
|---|---|---|
| Journey skill (`headout-0X/SKILL.md`) | 80 lines | 60 lines |
| Page / book / account recipe (`*/SKILL.md`) | 200 lines | 120 lines |
| Reference file (`references/*.md`) | 100 lines | 60 lines |
| README.md | 250 lines | 180 lines |

Claude loads the full file into context. Bloated files push out other useful context and increase
the chance that instructions near the end are ignored. When a skill approaches its limit, extract
content into a reference file and link it — never just keep writing.

---

## 2. Progressive disclosure — respect the load chain

Information belongs at exactly one layer. Don't collapse or skip layers.

```
Journey skill (headout-0X)
  └─ Page / book / account recipe (page-*, book-*, account-*)
       └─ references/backend.md
            └─ references/headout-api.md
```

| Layer | Holds |
|---|---|
| Journey skill | Outcome, ground rules, step sequence, links to recipes |
| Page recipe | Data sources, section order, conditional rules, visual language |
| backend.md | API endpoints, field mappings, error codes for that step |
| headout-api.md | Base URLs, auth headers, rate limits, shared contracts |

If you're writing API endpoint paths inside a journey skill, move them down.
If you're writing UI section ordering inside backend.md, move them up.

---

## 3. Fresh-eyes authoring — no incremental patches

When updating a skill, **rewrite it as if it has never existed before.** The reader (a future
Claude session) has no memory of prior versions.

- No "previously X, now Y" language — state the current truth only.
- No "updated to reflect..." footnotes — git log is the changelog, not the file.
- No accumulated exceptions piled at the bottom — integrate edge cases into the relevant step,
  or move them to `references/edge-cases.md`.
- After editing, read the file top to bottom as a cold reader. Would a fresh-context Claude follow
  it correctly? That is the acceptance criterion.

---

## 4. Single responsibility per file

Each file answers exactly one question:

- "What does the agent do in this step?" → journey skill
- "How does this page look and what data feeds it?" → page recipe
- "Which API calls and fields does this step need?" → backend reference
- "What are the hard constraints across all steps?" → README / ground rules section

When unsure where something belongs, it goes in a reference file, not the skill.

---

## 5. No duplication — extract before copying

If the same rule or pattern appears in two skills, extract it:

- Shared ground rules → README "Agent role boundary" section
- Shared API patterns → `references/headout-api.md`
- Shared UI patterns → `references/ui-data-contract.md`

Copy-paste between skills is a maintenance hazard — one copy will drift and silently contradict
the other.

---

## 6. Frontmatter hygiene

Every SKILL.md must have:

```yaml
name: headout-partner:<skill-dir-name>   # must match directory name exactly
description: <one sentence>              # Claude uses this to decide whether to load the skill
```

Page recipes must also include:

```yaml
disable-model-invocation: true           # prevents auto-firing alongside a journey skill
```

After any rename or restructure, audit all skills that link to the changed file. Broken
cross-references produce silent failures at inference time — the model proceeds without the
guidance it expected.

---

## 7. Cold-context test before merging

Before merging any skill change, run the repo-level cold-test command:

```
/cold-test-skill headout-01-discovery
```

This spawns a fresh subagent with no session history, feeds it only the target skill and its
directly linked references, and asks it to execute the skill against a minimal synthetic repo stub.
If the output is unexpected, the skill file has an ambiguity — fix the file, not the prompt.

See `.claude/commands/cold-test-skill.md` for implementation details.

---

## 8. PR discipline

| Change type | Rule |
|---|---|
| Content update (wrong fact, new field) | One PR, no restructuring |
| Structural change (split file, new layer) | Separate PR, no content changes |
| New skill | Own PR with README update |

Mixing restructuring and content changes makes cold-context test results ambiguous — you can't
tell which change caused the behavior difference.
