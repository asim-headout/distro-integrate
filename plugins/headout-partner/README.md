# Headout Partner Claude Plugin

Claude Code plugin that packages Headout partner integration workflows as focused Agent Skills.
Partners install one plugin; Claude loads only the skill that matches the task. Skills are ordered by
the partner user journey, not by internal engineering ownership.

```text
/headout-partner:headout-01-discovery
/headout-partner:headout-02-product-selection
/headout-partner:page-tour
```

## How a journey skill is shaped

Each `headout-0X` skill is a thin **outcome spine**:

1. **Outcome** — what "done" looks like, FE/BE-agnostic.
2. **Ground rules** — auth stays server-side; non-breaking changes; stale-fact call-out (stop and ask
   the partner if a live response contradicts a reference); no analytics.
3. **Steps** — inspect repo → resolve API contract → build FE to the page recipe → wire the BE →
   harden edge cases → checkpoint.
4. **References** — frontend (page recipe), backend (`references/backend.md` + `headout-api.md`),
   advanced (`references/advanced.md`).

Frontend and backend are **branches inside** the journey skill, not a parallel hierarchy.

## Journey skills

- `headout-00-plan`: classify stack, scope, architecture, map the journey, plan.
- `headout-01-discovery`: home, search, city, collections, categories, product list/detail.
- `headout-02-product-selection`: product page, variant/date/pax selection, inventory, pricing.
- `headout-03-checkout-inputs`: customer/passenger + variant input fields, validation.
- `headout-04-seatmap-validation`: iframe or custom seatmap selection + validation.
- `headout-05-payment-booking`: partner payment handoff, create/capture/get booking, reconciliation.
- `headout-06-booking-management`: webhooks, cancellation, reschedule, status updates.

## Frontend page recipes (`page-*`)

Self-contained, branding-neutral specs for each storefront page — section order, data derivation,
conditional rules, components, and visual language. They carry `disable-model-invocation: true` (so
they never auto-fire and collide with a journey skill) and are linked from the relevant step. They
share a `ui-components/` library across pages.

`page-home`, `page-search`, `page-city`, `page-collection`, `page-collections-index`, `page-category`,
`page-subcategory`, `page-places-to-visit`, `page-tours-by-city`, `page-profile`, `page-tour`,
`page-select`.

## Support skills

- `headout-90-test-plan`, `headout-91-review`, `headout-92-debug`, `headout-99-context-checkpoint`

Every completed step ends with a compact-ready context checkpoint.

## Shared references

`references/`: `business-flow.md`, `headout-api.md`, `sequencing.md`, `existing-test-contract.md`,
`context-checkpoint.md`, `edge-cases.md`, `competitor-adapters.md` (Archetype-C switchers).

## Local testing

```bash
claude --plugin-dir ./plugins/headout-partner
```

Run `/reload-plugins` after editing plugin files, then test with an explicit invocation.
