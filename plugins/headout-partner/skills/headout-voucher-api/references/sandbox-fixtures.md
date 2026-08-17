# Sandbox Testing

The acceptance checks in this skill and in [account-voucher](../account-voucher/SKILL.md)
("confirm against a live sample") are only executable against a real voucher GET response. A voucher
is bound to a specific booking in **the partner's own sandbox account** — Headout cannot hand out a
universal `voucherId` the way it can for stateless catalog endpoints.

## Default: ask the partner for a sandbox `bookingId` / `voucherId`

**This is the default path for every engagement.** Ask the partner to supply a `bookingId` (or
`voucherId` directly) for a booking they have already created — or can create — in their own sandbox
account, ideally one close to `COMPLETED` with tickets issued. Resolve `voucherId` from that
`bookingId` via booking GET if only the booking id is given. Call voucher GET against it server-side
and use the real response to validate the mapping plan.

If the partner has no sandbox booking yet, walk them through creating one via their own checkout flow
against the sandbox base URL — do not fabricate a response or guess field values in its place. A
partner's first sandbox booking will usually be `SINGLE_PAGE` + `COMPLETED`; that's enough to validate
the mapping's common path even before broader coverage is available.

## Optional: Headout-supplied coverage matrix

The single partner-supplied booking above will not exercise every branch (multi-page templates,
cancelled/pending states, every `displayType`, structured-vs-legacy instructions, etc.). When broader
coverage is needed — e.g. validating `account-voucher`'s full acceptance checklist, not just one
partner's common case — request the fixtures below from Headout. IDs are intentionally not invented
or copied from production.

| Fixture | `voucherId` | Expected coverage | Status |
|---|---|---|---|
| Multi-page | Headout supplied | `voucherTemplate: MULTI_PAGE` — confirm what actually repeats across sections | Pending ID |
| Pending with tickets already issued | Headout supplied | `bookingStatus: PENDING` + non-null `ticketSection` (tickets are not gated on status) | Pending ID |
| Cancelled | Headout supplied | `bookingStatus: CANCELLED`, `ticketSection: null` | Pending ID |
| Uncaptured / timeout | Headout supplied | voucher GET returns `404` | Pending ID |
| `displayType: PDF` ticket | Headout supplied | `actionCta` present, download button | Pending ID |
| `displayType: IMAGE` ticket | Headout supplied | QR/barcode render from `url` | Pending ID |
| `displayType: TICKET_NUMBER` ticket | Headout supplied | `ticketCode` text; `HTML_URL` variant links `url` | Pending ID |
| `displayType: NONE` ticket | Headout supplied | render nothing for that ticket | Pending ID |
| Structured instructions, `ALL_ADDRESS_SPECIFIC_ORDER` | Headout supplied | numbered-step `addressGroups` render | Pending ID |
| Structured instructions, `hasLateArrivalPolicy: true` (known policy) | Headout supplied | resolve the flag's guest-facing copy before wiring it elsewhere | Pending ID |
| Legacy instructions with a meeting point | Headout supplied | both `legacy.htmlContent` and `legacy.location` render | Pending ID |
| Open-dated booking | Headout supplied | `schedule.openDated: true` → "valid until" row instead of fixed date | Pending ID |
| Callouts present (multiple) | Headout supplied | full `callouts[]` array rendered, none skipped | Pending ID |
| `pickupDropOffType: PICKUP_AND_DROPOFF` | Headout supplied | both `pickupDropoffLocation` and nested `dropoff` render | Pending ID |

## How the skill uses either source

1. Configure the partner's sandbox base URL and server-side sandbox `Headout-Auth`.
2. Resolve each fixture's (or the partner's own) `bookingId` → `voucherId` and call voucher GET.
3. Record only redacted metadata: HTTP status, `bookingStatus`, `voucherTemplate`, `displayType`
   values present, and which optional sections are populated.
4. Compare against this skill's mapping and `account-voucher`'s conditional-render rules.
5. If an ID returns `404` unexpectedly, no longer exercises the expected shape, or is production-only,
   stop and request a replacement — from the partner for their own booking, from Headout for a matrix
   fixture. Do not substitute a guessed ID or invent a response in either case.
