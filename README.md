# Headout Partner Integration Plugin

A Claude Code plugin that helps partners build a **partner-built (native) Headout integration** —
the AI-Assisted Builder Kit for the Tier-3 path. Partners point a coding agent at it; Claude loads
only the skill relevant to the current task and generates compliant integration code in their own
stack (Next.js, Rails, Django, Laravel, Spring, serverless, monorepo, etc.).

This repo is **plugin-only**. The plugin lives at [`plugins/headout-partner`](plugins/headout-partner).
It is also a Claude Code marketplace root via [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

## Install

For one session from a local checkout:

```bash
claude --plugin-dir ./plugins/headout-partner
```

To install it from this local checkout:

```bash
claude plugin marketplace add "$(pwd)" --scope user
claude plugin install headout-partner@headout-partner-marketplace --scope user
```

To install it from GitHub:

```bash
claude plugin marketplace add https://github.com/asim-headout/distro-integrate --scope user
claude plugin install headout-partner@headout-partner-marketplace --scope user
```

Use `--scope project` instead of `--scope user` when the plugin should be available only in the
current partner repo.

Validate before publishing or sharing:

```bash
claude plugin validate --strict plugins/headout-partner
claude plugin validate --strict .claude-plugin/marketplace.json
```

After installing, invoke a journey skill explicitly:

```text
/headout-partner:headout-00-plan
/headout-partner:headout-01-discovery
```

## What it provides

- **Journey skills** (`headout-00`…`headout-06`) ordered by the partner user journey: plan →
  discovery → product selection → checkout inputs → seatmap (if needed) → payment/booking →
  booking management.
- **A frontend page-recipe library** (`page-*` skills): self-contained, branding-neutral specs for
  each storefront page (section order, data derivation, conditional rules, components, visual
  language). These are explicitly invocable and are linked from the relevant journey step.
- **Support skills:** test plan, review, debug, and context checkpoint.
- **Shared + per-step references** so context loads progressively (frontend recipe / backend API
  mapping / persistence and migrations / advanced edge cases / UI data contract / competitor
  adapters).

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

- `page-home`, `page-city`, `page-collection`, `page-collections-index`, `page-category`,
  `page-subcategory`, `page-places-to-visit`, `page-tours-by-city`, `page-tour` (product detail)

Booking and account page recipes:

- `book-select`, `book-checkout`, `book-payment`
- `account-confirmation`, `account-manage-booking`, `account-voucher`, `account-profile`,
  `account-settings`, `account-saved-cards`, `account-auth`

Support:

- `headout-90-test-plan`, `headout-91-review`, `headout-92-debug`, `headout-99-context-checkpoint`

## Local Development

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
