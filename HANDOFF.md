# Headout Partner Plugin — Handoff

Product direction for the Headout partner integration plugin. Written for humans and future coding
agents.

## Goal

A partner-facing Claude Code plugin that makes a partner's AI assistant behave like a careful Headout
integration engineer across arbitrary stacks — generating compliant, native (Tier-3) integration
code. Skills are ordered by the partner user journey; frontend page recipes carry the per-page spec.

> This was previously a prompt-only MCP server + plugin. The MCP surface has been removed; the
> **plugin is now the single product.** A *separate, optional* Headout API-docs MCP
> (`search_headout_api_docs`, `query_docs_filesystem_headout_api_docs`) may be present in a partner's
> environment — page recipes use it when configured and fall back to the bundled API references
> otherwise.

## Source docs (source of truth)

- `https://partner.headout.com/docs/llms.txt` (machine-readable index)
- `https://partner.headout.com/docs/specs/openapi-v2.yaml`

Default to Headout API v2; warn against v1 unless explicitly asked. Production
`https://www.headout.com`; sandbox `https://sandbox.api.dev-headout.com`; auth header
`Headout-Auth: <KEY>` (server-side only). See `plugins/headout-partner/references/headout-api.md`.

## Current shape

See `AGENTS.md` for the skill-authoring rules and the recipe→step mapping. In short: journey skills
(`headout-00`…`06`) are thin outcome spines that branch to a frontend page recipe, a per-step
`references/backend.md`, and `references/advanced.md`. Archetype-C switchers use
`references/competitor-adapters.md`.

## Code quality rules (canonical)

- Keep Headout API keys server-side only; never in client/public env vars.
- Prefer files under ~300 lines; treat >400 as a split threshold (don't add artificial abstractions
  just for line count).
- Typed request/response boundaries where the stack supports it; centralize auth/header/base-URL and
  endpoint construction.
- Map Headout errors into the partner's existing error model.
- Do not log API keys, customer PII, full request bodies, or voucher/ticket data. Use structured logs
  around endpoint, status, `bookingId`, `partnerReferenceId`, and correlation/request id.

## Critical edge cases (canonical)

Booking/inventory/pricing builds must force tests for: `PER_PERSON` vs `PER_GROUP`; `ADULT`/`CHILD`/
`STUDENT`/`SENIOR` + unknown future person types; `paxRange.min`/`max`; `customersDetails.count` ==
`customers.length`; exactly one primary customer; required customer fields + booking-level
`variantInputFields`; `LIMITED`/`UNLIMITED`/`CLOSED` inventory + remaining count; stale-price
rejection; price across multiple pax types; currency consistency fetch→booking; `price` vs
`originalPrice` vs `netPrice` vs `headoutSellingPrice`; pagination (`nextUrl`/`prevUrl`/`nextOffset`/
`total`); local datetimes without offsets; null/empty optional fields.

Booking lifecycle: `UNCAPTURED` → `PENDING` → `COMPLETED`/`CANCELLED`/`FAILED`/`CAPTURE_TIMEDOUT`.
Create returns `UNCAPTURED`; capture by updating to `PENDING` with `partnerReferenceId`; `UNCAPTURED`
can expire to `CAPTURE_TIMEDOUT` after ~1h; cancellation/reschedule responses are async
acknowledgements, not final state; webhooks never send `UNCAPTURED`.

Seatmap: `SEATMAP` vs `NORMAL` selection type; iframe vs custom; validation can return HTTP 200 with
business-level errors; validate before booking; hard ceiling of 20 seats/request; `SEAT_UNAVAILABLE`/
`SEAT_NOT_FOUND`/`ADJACENCY_RULE_VIOLATION`; use returned validated prices when creating the booking.

## Roadmap / future work

- **Page recipes for steps 03 (checkout inputs) and 06 (booking-management UI)** — current gap.
- **Expand competitor adapters** beyond Viator/GYG; confirm every Headout-side field against the spec.
- **Contract test package** partners run against their integration (mock mode first, sandbox smoke
  later) as a launch gate: `npx @headout/partner-contract-tests`.
- **Sandbox test kit:** known products, variants, pax combos, seatmap products, expected outcomes.
- **Reference integrations:** Next.js, Node/Express, Rails, Django, Laravel, Spring Boot.
- **Partner diagnostics dashboard:** sandbox/production API + webhook health, failures grouped by
  root cause with remediation, booking lifecycle view.

Ideal partner experience: the plugin helps the AI write the integration → contract tests prove it
works locally/CI → the diagnostics dashboard shows real API/webhook health in sandbox and production.
