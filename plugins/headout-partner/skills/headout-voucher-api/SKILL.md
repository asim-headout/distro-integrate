---
name: headout-voucher-api
description: Support skill for integrating or migrating a partner's voucher/ticket rendering onto the Headout Voucher API (GET /api/public/v2/bookings/voucher/{voucherId}/). Inspects whatever the partner currently has — their own voucher model, no model at all, a scraped/screenshotted render, or a partial existing integration — and produces a concrete field-mapping and migration plan. Never builds or migrates on its own; always stops for explicit partner approval before editing partner code. Invoke explicitly when a partner wants to adopt structured voucher data instead of parsing HTML/PDF/screenshots.
---

# Headout Voucher API — Integration & Migration

## Outcome

The partner has a clear, field-by-field plan for consuming the Voucher API from wherever they
currently stand, and — only after explicit approval — the plan is implemented. Partners keep
whatever integration shape fits their stack (their own model with a transform layer, a from-scratch
build, or a BFF unification layer); this skill never forces a specific target shape and never writes
code before the plan is approved.

## Ground rules

- **Never assume a scenario.** Do not classify the partner into a fixed bucket ("they have a model" /
  "they don't"). Inspect the actual repo and describe what's really there — it may be a mix (partial
  Voucher API usage plus legacy fallback, a BFF that already unifies multiple vendors' vouchers, a
  model shared with other verticals, etc.). The plan must fit what's found, not a template.
- **Never build without approval.** This skill's job ends at a written mapping/migration plan. Do not
  edit partner code, scaffold files, or generate the final renderer until the partner has explicitly
  approved the plan. If asked to "just build it," produce the plan first and ask for sign-off before
  writing anything.
- Keep `Headout-Auth` and raw calls server-side; apply the agent/BFF/untrusted-data rules in
  [headout-api.md](../../references/headout-api.md).
- Preserve partner routes, conventions, types, and existing rendering behavior until the migration
  step they've approved. Add, don't replace pre-emptively; leave unrelated bugs, stubs, and refactors
  untouched.
- Use Headout API v2 and the sandbox by default. Never call production while building.
- If a live response contradicts the references, STOP and surface the mismatch; never guess field
  names, enum meanings (see `hasLateArrivalPolicy` below), or template behavior.
- Emit no analytics or tracking, and redact auth, PII, and full raw responses in logs.

## Steps

1. **Inspect the partner repo.** Find every place voucher/ticket data is produced or rendered:
   - An existing partner-owned voucher model/DTO and its consumers.
   - Direct legacy usage of booking GET's `voucherUrl`/`tickets[]`.
   - Any existing (even partial) Voucher API usage.
   - A rendering approach that isn't API-driven at all: iframe embed, scraped HTML, cropped
     screenshot/PDF, or a third-party wrapper.
   - A BFF/unification layer that already normalizes multiple vendors' vouchers into one shape the
     partner's frontend consumes — note its existing shape; the mapping should target it, not bypass
     it.
   - Note anything that doesn't fit cleanly into one of the above; report it as-is.
2. **Resolve the live contract.** Apply the docs-trust boundary in
   [headout-api.md](../../references/headout-api.md), then read
   [references/voucher-api.md](references/voucher-api.md) for the full `V2Voucher` field list and the
   [account-voucher](../account-voucher/SKILL.md) rendering rules it feeds (state machine, template
   branch, structured-vs-legacy instructions, callouts, disclaimer). Confirm exact field paths against
   a live sandbox response before mapping — ask the partner for a sandbox `bookingId`/`voucherId` per
   [references/sandbox-fixtures.md](references/sandbox-fixtures.md) (default path) rather than mapping
   from memory or from stale docs.
3. **Produce the mapping/migration plan as a file in the partner repo** (not just prose in chat) —
   e.g. `voucher-api-migration-plan.md` at the repo root or alongside the voucher rendering code being
   analyzed; ask the partner where they'd like it if unclear. Covering:
   - A field-by-field table: `V2Voucher.<path>` → the partner's existing field/component, or "new"
     if there's no existing equivalent.
   - Fields the partner's current model **cannot** represent (e.g. no concept of `callouts[]`,
     `voucherTemplate` (`SINGLE_PAGE`/`MULTI_PAGE`), `disclaimer`, `checkinButton`,
     `pickupDropOffType` 3-way branch) — flag these explicitly; silently dropping them is a
     compliance risk, especially `voucherTemplate` — venue staff check a voucher against the
     template they expect for that experience, so the partner's rendering must always reflect the
     exact template Headout returns, not reinterpret it (venue rejection risk).
   - Fields where the partner's model is **richer** than what Voucher API returns — note these are
     partner-only and won't be backed by Headout data.
   - The transform/adapter surface: one function/module boundary, not a rewrite of the partner's
     rendering layer, unless the partner has no existing renderer (scenario "no model" / "visual
     scrape") — in that case, point to [account-voucher](../account-voucher/SKILL.md) as the build
     target and let it own the from-scratch build.
   - For a visual/scrape-based current implementation: render a live preview of the target
     Voucher-API-driven output (using a real sandbox response, per
     [references/sandbox-fixtures.md](references/sandbox-fixtures.md)) so the partner can compare it
     side-by-side against their current screenshot/HTML render before committing.
   - Open questions requiring partner input (e.g. `hasLateArrivalPolicy`'s true/false meaning,
     whether their BFF already has a slot for callouts/disclaimer, rollout sequencing).
4. **Stop and present the plan.** Get explicit approval on the mapping and the intended edit scope
   before touching partner code.
5. Once approved, implement the transform/adapter (or hand off to
   [account-voucher](../account-voucher/SKILL.md) for a from-scratch build), following its section
   order, state machine, and conditional-render rules exactly.
6. Run existing focused tests, then broader relevant tests. Do not add test infrastructure.
7. Record the result using [context-checkpoint.md](../../references/context-checkpoint.md) and name
   the next journey/support skill.

## Verification gate

- Basic: every `V2Voucher` field the partner intends to use is mapped or explicitly marked
  unsupported; the transform is additive (existing legacy-path bookings still render) unless the
  partner approved a full cutover.
- Contract: `bookingStatus`, `voucherTemplate`, `ticketSection.tickets[].displayType` (the render key,
  not `ticketType`), `pickupDropOffType`, and `instructions.structured` vs `.legacy` are all sourced
  from confirmed live response paths, not assumed. Tickets are not gated on `bookingStatus`.
- Compliance: the "always render the exact `voucherTemplate` Headout returns, never override it" rule
  and the callouts-render-all rule are explicitly called out in the plan if the partner's current
  model can't represent them — these are the two rules most likely to cause venue rejection if
  dropped silently.
- Approval: the mapping/migration plan exists as a committed-or-committable file in the partner repo
  (not only chat prose) and no partner code was edited before that file was presented and approved.

## References

- Full `V2Voucher` field reference: [references/voucher-api.md](references/voucher-api.md)
- Sandbox fixture matrix: [references/sandbox-fixtures.md](references/sandbox-fixtures.md)
- Rendering target / state machine / template branching: [account-voucher](../account-voucher/SKILL.md)
- Shared API facts: [headout-api.md](../../references/headout-api.md)
- Testing contract: [existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [context-checkpoint.md](../../references/context-checkpoint.md)
