# Headout Partner Claude Plugin

Claude Code plugin that packages Headout partner integration workflows as focused Agent Skills.
Partners install one plugin; Claude loads only the skill that matches the task. Skills are ordered by
the partner user journey, not by internal engineering ownership.

```text
/headout-partner:headout-01-discovery
/headout-partner:headout-02-product-selection
/headout-partner:page-tour
/headout-partner:book-select
/headout-partner:account-confirmation
/headout-partner:ui-product-card
```

## How a journey skill is shaped

Each `headout-0X` skill is a thin **outcome spine**:

1. **Outcome** — what "done" looks like, FE/BE-agnostic.
2. **Ground rules** — auth stays server-side; **default to the Headout sandbox for all development**
   (move to production only at the partner's go-live); non-breaking changes; stale-fact call-out (stop
   and ask the partner if a live response contradicts a reference); no analytics.
3. **Steps** — inspect repo → ask the planning/preflight questions when needed → resolve API
   contract → build FE to the page recipe → wire the BE → harden edge cases → checkpoint.
4. **References** — frontend (page recipe), backend (`references/backend.md` + `headout-api.md`),
   advanced (`references/advanced.md`).

Frontend and backend are **branches inside** the journey skill, not a parallel hierarchy.

## Agent role boundary

The plugin's job is to add the requested Headout integration surface while preserving the partner
application around it. Existing partner code — including dummy/stub content, placeholder routes,
TODOs, local conventions, known bugs, and rough patterns — is host-app context, not cleanup scope.

If the agent notices a better pattern, existing bug, unused/dummy code, security issue, or refactor
opportunity, it should report it as an observation and leave the code untouched. It must not remove,
fix, rewrite, rename, reorganize, or simplify existing code unless the user explicitly asks for that
specific change. If existing code blocks the Headout integration, stop and ask before changing it.

## Preflight orientation

Implementation skills must not jump straight into edits. After inspecting the partner repo and
before changing files, the agent should give a short orientation: detected stack and route/data
boundaries, the Headout step being handled, the intended edit scope, assumptions, and any existing
issues or dummy/stub code noticed but left untouched. Ask concise questions only when the answer
blocks a safe integration decision; otherwise state assumptions and proceed.

`headout-00-plan` must ask the full planning questionnaire: experience URL prefix, DB migration
ownership, UI setup confirmation, checkout/payment route shape, scope, partner mode, Headout
environment, server-side env/secret setup (`Headout-Auth` and base URL), locale/currency defaults,
execution strategy (one-by-one, bounded batch, or workflow/subagents), PSP boundary, booking
identity, auth dependency, test commands, and rollout boundary.

## Journey skills

- `headout-00-plan`: classify stack, scope, architecture, map the journey, plan.
- `headout-01-discovery`: home, city, collections, categories, product list/detail.
- `headout-02-product-selection`: product page, variant/date/pax selection, inventory, pricing.
- `headout-03-checkout-inputs`: customer/passenger + variant/inventory input fields, validation.
- `headout-04-seatmap-validation`: iframe or custom seatmap selection + validation.
- `headout-05-payment-booking`: partner payment handoff, create/capture/get booking, reconciliation.
- `headout-06-booking-management`: webhooks, cancellation, reschedule, status updates.

## Frontend page recipes

Self-contained, branding-neutral specs for each storefront page — section order, data derivation,
conditional rules, components, and visual language. They carry `disable-model-invocation: true` (so
they never auto-fire and collide with a journey skill) and are linked from the relevant step. They
share a `ui-components/` library across pages.

### Storefront / discovery flow (`page-*`)

The browse-and-find journey: landing and the listing/detail pages a guest moves through
before they start booking. (The Headout partner API has no search endpoint, so there is no
search-results recipe — wire any search to the partner's own backend.)

| Flow / page | Skill | Path |
|---|---|---|
| Homepage | `page-home` | `skills/page-home/SKILL.md` |
| City landing | `page-city` | `skills/page-city/SKILL.md` |
| Category listing | `page-category` | `skills/page-category/SKILL.md` |
| Subcategory listing | `page-subcategory` | `skills/page-subcategory/SKILL.md` |
| Collection | `page-collection` | `skills/page-collection/SKILL.md` |
| Collections index | `page-collections-index` | `skills/page-collections-index/SKILL.md` |
| All experiences in a city | `page-tours-by-city` | `skills/page-tours-by-city/SKILL.md` |
| Places to visit | `page-places-to-visit` | `skills/page-places-to-visit/SKILL.md` |
| Experience / product detail (PDP) | `page-tour` | `skills/page-tour/SKILL.md` |

### Booking flow (`book-*`)

The convert-and-pay journey: the three `/book/{id}/*` steps a guest moves through after picking an
experience. Each carries the selection forward in the URL and drives a strict CTA state machine.

| Flow / page | Skill | Path |
|---|---|---|
| Select — date, option/variant, time | `book-select` | `skills/book-select/SKILL.md` |
| Checkout — pax count, guest details | `book-checkout` | `skills/book-checkout/SKILL.md` |
| Payment — method, partner gateway handoff, create/capture, retry | `book-payment` | `skills/book-payment/SKILL.md` |

### Account & post-booking flow (`account-*`)

The own-your-booking journey: what a guest reaches after paying — their confirmation, voucher/ticket,
and self-service management of a booking. These are backed by the Headout booking endpoints (booking
GET + cancel/reschedule); access is server-side via the partner's BFF (the partner maps its own
user/session → `bookingId`). **Login, profile, saved cards, and account settings are the partner's
own systems — Headout exposes none of them, so this plugin ships no recipes for them.** Each page is
behind a booking, so none are indexable.

| Flow / page | Skill | Path |
|---|---|---|
| Confirmation — status, ticket/QR (`tickets[]`/`voucherUrl`), booking details | `account-confirmation` | `skills/account-confirmation/SKILL.md` |
| Manage booking — review, cancel/reschedule | `account-manage-booking` | `skills/account-manage-booking/SKILL.md` |
| Voucher / ticket — Voucher API (`V2Voucher`) preferred, legacy `tickets[]`/`voucherUrl` fallback, details, embed mode | `account-voucher` | `skills/account-voucher/SKILL.md` |

### Shared UI components (`ui-*`)

**Optional fallback references.** Reuse the partner's design system and components first — these
skills only describe the structure/behavior (and approximate, overridable fallback values) for when
the partner has no equivalent. They do not override the partner's tokens, dimensions, or libraries.

| Component | Skill | Path |
|---|---|---|
| Product / experience card (image carousel, hover, price block, grid) | `ui-product-card` | `skills/ui-product-card/SKILL.md` |
| Date-picker calendar (dual-month, price labels, selected/min-price states) | `ui-calendar` | `skills/ui-calendar/SKILL.md` |

## Support skills

- `headout-90-test-plan`, `headout-91-review`, `headout-92-debug`, `headout-93-inventory-input-fields`, `headout-voucher-api`, `headout-99-context-checkpoint`

`headout-93-inventory-input-fields` is an explicit support workflow linked from checkout inputs.
Invoke it when a selected inventory may override the product/variant `inputFields`; it does not
replace or run in parallel with the checkout journey step.

`headout-voucher-api` is an explicit support workflow for adopting or migrating to the structured
Voucher API. It inspects whatever voucher rendering the partner already has — their own model, no
model, a scraped/screenshotted render, or a partial integration — and produces a field-mapping and
migration plan for explicit partner approval before any code changes. It feeds into, but never
replaces, `account-voucher` (the rendering recipe the plan converges on).

Every completed step ends with a compact-ready context checkpoint.

## Shared references

`references/`: `business-flow.md`, `headout-api.md`, `sequencing.md`, `existing-test-contract.md`,
`context-checkpoint.md`, `edge-cases.md`, `ui-data-contract.md`,
`persistence-and-migrations.md`, `planning-questionnaire.md`, `competitor-adapters.md`
(Archetype-C switchers).

## Local testing

```bash
claude --plugin-dir ./plugins/headout-partner
```

Run `/reload-plugins` after editing plugin files, then test with an explicit invocation.

## Distribution

From the repository root, install through the bundled marketplace:

```bash
claude plugin marketplace add "$(pwd)" --scope user
claude plugin install headout-partner@headout-partner-marketplace --scope user
```

Or from GitHub:

```bash
claude plugin marketplace add https://github.com/asim-headout/distro-integrate --scope user
claude plugin install headout-partner@headout-partner-marketplace --scope user
```

Validate before sharing:

```bash
claude plugin validate --strict plugins/headout-partner
claude plugin validate --strict .claude-plugin/marketplace.json
```
