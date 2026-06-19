# Contributing to the Headout Partner Plugin

## Authoring rules

All authoring rules — file size budgets, layer discipline, fresh-eyes rewriting, frontmatter
requirements — live in **[AGENTS.md](./AGENTS.md)**. Read that first. It applies to both human
and AI contributors.

## PR workflow

- **Content update** (wrong fact, new API field, clarified step): one focused PR.
- **Structural change** (split file, new reference layer, rename): separate PR with no content changes.
- **New skill**: own PR that also updates README.md's skill table.

## Testing a skill change

Use the cold-test command before merging. From the repo root:

```
/cold-test-skill <skill-name>
```

Example: `/cold-test-skill headout-01-discovery`

This simulates what Claude sees in a fresh session with no prior context. Details in
`.claude/commands/cold-test-skill.md`.

## What NOT to put here

Partner-facing documentation belongs in README.md. This file and AGENTS.md are internal —
they are not distributed as part of the plugin install.
