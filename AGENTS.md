# Repository Guidance

This repo contains two related distribution surfaces:

- `src/`: prompt-only MCP server for Headout partner integrations.
- `plugins/headout-partner/`: Claude Code plugin that packages the same product guidance as Agent Skills.

## Headout Plugin Direction

The Claude plugin should follow the partner user journey, not internal team ownership. Keep the primary flow ordered as:

1. `headout-00-plan`
2. `headout-01-discovery`
3. `headout-02-product-selection`
4. `headout-03-checkout-inputs`
5. `headout-04-seatmap-validation`
6. `headout-05-payment-booking`
7. `headout-06-booking-management`
8. Support skills: test plan, review, debug, context checkpoint.

Skill names must keep the `headout-` prefix because partner environments may have many other skills installed.

## Skill Authoring Rules

- Keep `SKILL.md` as the basic workflow: trigger, intent, ordered steps, and links to references.
- Put advanced details in `references/` so context loads progressively.
- Do not create a separate competing hierarchy for frontend/backend ownership. Dedicated frontend skills should attach to a journey step, such as discovery pages, product selection, checkout inputs, seatmap, or booking management UX.
- Every implementation skill should ask the agent to inspect the partner repo first and preserve local conventions.
- Every completed step should produce a compact-ready context checkpoint using `plugins/headout-partner/references/context-checkpoint.md`.
- Default to Headout API v2 and keep `Headout-Auth` server-side.
- Use existing tests first; do not add test setup unless the user explicitly asks.

## Verification

Before committing plugin changes, run:

```bash
pnpm test
pnpm typecheck
```

Also validate plugin shape when skill files change:

```bash
find plugins/headout-partner -maxdepth 4 -type f | sort
```
