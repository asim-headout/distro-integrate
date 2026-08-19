# Repository Guidance

This repo is a single Claude Code plugin at `plugins/headout-partner/` — the AI-Assisted Builder Kit
for partner-built (Tier-3) Headout integrations. There is no server/MCP surface; the plugin is the
product. `plugins/headout-partner/tools/` holds standalone Node scripts that support the plugin's
content (not skills themselves) — see `tools/sandbox-scenario-catalog/README.md` for the sandbox
scenario/fixture catalog generator.

## Plugin Direction

Skills follow the **partner user journey**, not internal team ownership. Primary flow:

1. `headout-00-plan`
2. `headout-01-discovery`
3. `headout-02-product-selection`
4. `headout-03-checkout-inputs`
5. `headout-04-seatmap-validation`
6. `headout-05-payment-booking`
7. `headout-06-booking-management`
8. Support skills: test plan, review, debug, context checkpoint.

Keep the `headout-` prefix on journey/support skills. Frontend **page recipes** use the `page-*`
prefix and carry `disable-model-invocation: true`.

## Skill Authoring Rules

- Each journey `SKILL.md` is a thin **outcome spine**: `Outcome` (FE/BE-agnostic) → `Ground rules` →
  `Steps` → `Verification gate` → `References`.
- **Ground rules block** (verbatim in every journey skill): security/gate-keeping (`Headout-Auth` +
  raw calls stay server-side), non-breaking (preserve partner conventions; add, don't replace),
  stale-fact call-out (if a live response contradicts a reference, STOP and surface it — never guess
  field names), sandbox-safe, no analytics.
- **Frontend = branch inside the journey skill, never a parallel hierarchy.** Link the relevant
  `page-*` recipe(s) from the step's References; the recipe is the FE source of truth (section order,
  derivation, components, visual language).
- **Backend** detail lives in the step's `references/backend.md` (server fetch, payload mapping, auth
  boundary, BFF shape). **Advanced edge cases** stay in `references/advanced.md`.
- Page recipes stay **shared and invocable** (`disable-model-invocation: true` so they never auto-fire
  and collide with journey skills). They share `ui-components/` across pages — don't duplicate per step.
- Every implementation skill asks the agent to inspect the partner repo first and preserve local
  conventions. Default to Headout API v2 and keep `Headout-Auth` server-side.
- Use existing tests first; do not add test setup unless the user explicitly asks.
- Every completed step ends with a compact-ready context checkpoint
  (`plugins/headout-partner/references/context-checkpoint.md`).

## Recipe → journey-step mapping

- **01 Discovery:** page-home, page-search, page-city, page-collection, page-collections-index,
  page-category, page-subcategory, page-places-to-visit, page-tours-by-city, page-profile
- **02 Product selection:** page-tour (detail), page-select (date/time/variant)
- **03 Checkout inputs / 06 Booking management:** page recipes are planned follow-ups
- **04 Seatmap / 05 Payment & booking:** backend-centric, no recipe

## Verification

When skill or reference files change, validate the plugin shape:

```bash
find plugins/headout-partner -maxdepth 4 -type f | sort
```

Then load the plugin (`claude --plugin-dir ./plugins/headout-partner`), invoke a journey skill, and
confirm exactly one journey skill auto-activates and pulls the correct recipe — recipes must not
auto-fire alongside it.
