# Headout Partner Integration Plugin

A Claude Code plugin that helps partners build a **partner-built (native) Headout integration** —
the AI-Assisted Builder Kit for the Tier-3 path. Partners point a coding agent at it; Claude loads
only the skill relevant to the current task and generates compliant integration code in their own
stack (Next.js, Rails, Django, Laravel, Spring, serverless, monorepo, etc.).

This repo is **plugin-only**. The plugin lives at [`plugins/headout-partner`](plugins/headout-partner).

## What it provides

- **Journey skills** (`headout-00`…`headout-06`) ordered by the partner user journey: plan →
  discovery → product selection → checkout inputs → seatmap (if needed) → payment/booking →
  booking management.
- **A frontend page-recipe library** (`page-*` skills): self-contained, branding-neutral specs for
  each storefront page (section order, data derivation, conditional rules, components, visual
  language). These are explicitly invocable and are linked from the relevant journey step.
- **Support skills:** test plan, review, debug, and context checkpoint.
- **Shared + per-step references** so context loads progressively (frontend recipe / backend API
  mapping / advanced edge cases / competitor adapters).

## How a skill is shaped

Each journey skill is a thin **outcome spine** with four layers hung off it:

1. **Outcome** — what "done" looks like, FE/BE-agnostic.
2. **Ground rules** — security/gate-keeping (auth stays server-side), non-breaking changes,
   stale-fact call-out (stop and ask the partner if a live response contradicts a reference), no
   analytics.
3. **Steps** — inspect repo → resolve API contract → build FE to the page recipe → wire the BE →
   harden edge cases → checkpoint.
4. **References** — FE (page recipe), BE (`backend.md` + `headout-api.md`), advanced edge cases.

Frontend and backend are **branches inside the journey skill**, not a parallel skill hierarchy. The
page recipes carry `disable-model-invocation: true` so they never auto-fire alongside a journey skill.

## Skills

Journey:

- `headout-00-plan`, `headout-01-discovery`, `headout-02-product-selection`,
  `headout-03-checkout-inputs`, `headout-04-seatmap-validation`, `headout-05-payment-booking`,
  `headout-06-booking-management`

Frontend page recipes:

- `page-home`, `page-search`, `page-city`, `page-collection`, `page-collections-index`,
  `page-category`, `page-subcategory`, `page-places-to-visit`, `page-tours-by-city`, `page-profile`,
  `page-tour` (product detail), `page-select` (date/time/variant)

Support:

- `headout-90-test-plan`, `headout-91-review`, `headout-92-debug`, `headout-99-context-checkpoint`

## Local testing

```bash
claude --plugin-dir ./plugins/headout-partner
```

Inside Claude Code, run `/reload-plugins` after editing plugin files, then test with an explicit
invocation, e.g. `/headout-partner:headout-02-product-selection` or `/headout-partner:page-tour`.

## Headout docs

- LLM docs index: https://partner.headout.com/docs/llms.txt
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml
- API Partner OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2-api-partner.yaml
- Affiliate OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2-affiliate.yaml

## DX principles

- Behave like a Headout integration architect, not a docs search bot.
- Adapt to the partner repo instead of imposing a framework; preserve existing conventions.
- Use the repo's existing test workflow; never add test setup unless the user explicitly asks.
- Keep `Headout-Auth` server-side; sandbox calls are explicit, credential-gated, and non-destructive
  unless approved.
