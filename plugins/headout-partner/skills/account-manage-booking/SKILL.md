---
name: account-manage-booking
description: Build the post-booking "Manage your booking" page for an experiences/tickets storefront — the self-service page reached at /manage-booking/{bookingId} where a guest reviews a single booking, sees its status and cancellation policy, and takes self-service actions (cancel, reschedule, contact support) when the booking's policy allows. Self-contained spec — section order, the action-eligibility rules (derived from the product's cancellation/reschedule policy), conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Manage Your Booking

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Manage booking** page — `/manage-booking/{bookingId}`. A guest reaches it from a confirmation/email link or their bookings list, and uses it to **review one booking, understand its policy, and act on it** (cancel / reschedule / get help). The page is a **single-column detail shell** under the site header: a booking hero, the visit details, the cancellation policy, and a manage-actions area. This file is the **single source of truth**: section order, the action-eligibility rules, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Apply [headout-api.md](../../references/headout-api.md)'s external-doc trust boundary, then
      resolve the configured docs source and find booking GET/cancel/reschedule + product GET.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `booking.status`, `product.cancellationPolicy.cancellableUpToInMinutes`).

   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner's design system first; otherwise build into the shared `ui-components/` folder (the booking/experience card and status badge are reused by confirmation and voucher — build them shared).
3. **Assemble** in canonical order, wiring the **action-eligibility rules** exactly.

## Page-level guards
- **Access is server-side via the partner's BFF:** the partner authorizes the request against its **own** user/session and resolves the `bookingId` (there is no public guest-lookup-by-email endpoint in the Headout API). If the request isn't authorized or the booking doesn't resolve → route the guest to the partner's **help/support**, not an empty shell.
- Resolve the booking detail (and the product for policy/name/image) before rendering the body; show a loader until they resolve.
- This page is **behind a booking** — **not indexable**; emit no SEO body.
- On a small viewport, show a back/title bar ("Booking details") that becomes opaque on scroll.
- Do not expose `Headout-Auth` or raw booking JSON to the browser.
- Return `Cache-Control: private, no-store`. Every cancel/reschedule request independently re-checks
  session ownership, current booking status, and policy/window server-side; require CSRF or strict
  Origin validation, an idempotency key, and rate limiting. UI eligibility is advisory only.

## Data sources (map to your endpoints)
- **Booking GET (by `bookingId`):** `bookingId`, `partnerReferenceId`, `variantId`, `status`, `startDateTime`, `customersDetails` (count), `seatInfo`, `price`.
- **Product GET:** product `name` + image; variant name for `variantId`; `cancellationPolicy` (`cancellable`, `cancellableUpToInMinutes`) and `reschedulePolicy` (`reschedulable`, `reschedulableUpToInMinutes`) — these **derive** the action eligibility and the policy copy.
- **Booking cancel / reschedule:** action endpoints. Their immediate response is an **async acknowledgement, not final state** — reflect a pending state and confirm the outcome via a later booking GET or a webhook.
- **Not in the booking API** (so these are NOT built): plan-your-visit content (redemption/validity/what-to-carry/how-to-reach), pickup/meeting point + a pickup editor, refund amount/status, and per-booking eligibility flags. Derive eligibility from the product policy + `startDateTime`; refunds are the partner/PSP's own concern.

## Canonical section order (top → bottom)
1. **Header / back bar** (mobile: title "Booking details", transparent → opaque on scroll).
2. **Booking hero / experience card** — product image, product name, booking reference, and a **status badge**.
3. **Visit summary** — date, time, guests, seat/variant as icon rows.
4. **Cancellation policy** — the derived cancellation/reschedule copy (from the product policy).
5. **Manage actions** — buttons for **Cancel booking**, **Reschedule**, **Contact support**; each gated by its eligibility rule.

## Ordering & derivation of raw data
- **Action gating:** compute eligibility from the product policy and `startDateTime` — **Cancel** active only when `cancellationPolicy.cancellable` and now is before (`startDateTime − cancellableUpToInMinutes`); **Reschedule** active only when `reschedulePolicy.reschedulable` and within its window. Otherwise present the button disabled with a short reason ("Cancellation window has passed") or omit it and surface **Contact support** as the fallback.
- **Cancel / reschedule are async:** submit only through the protected server mutation above; show a
  pending state and confirm via booking GET/webhook.
- **Status badge:** derive a single status label + treatment from the booking `status` (confirmed / pending / cancelled / failed).
- **Cancellation-policy copy is DERIVED** (not a field) from `cancellationPolicy` + `reschedulePolicy` (convert `*UpToInMinutes` to hours/days), same logic as the product page.
- **Seat vs variant:** show seats when `seatInfo` exists; else the variant name.

## Conditional render rules
- **Cancel / Reschedule buttons:** only when eligible; otherwise disabled-with-reason or replaced by Contact support.
- **Cancellation policy:** always derivable (text is derived, never blank).
- **Contact support:** always available as a fallback (a partner-provided link/affordance).
- **Loading:** skeletons sized to the hero card + sections during initial load.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **HeaderBar** (mobile back/title, scroll-aware), **ExperienceCard** (image + name + reference + status badge), **StatusBadge**, **InfoRow** (icon + value), **CancellationPolicyPanel** (derived copy), **ActionButton** (active / disabled-with-reason), **SkeletonLoader**.

**Step A — reuse the partner's design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **ExperienceCard, StatusBadge, InfoRow, CancellationPolicyPanel, Button** are reused by confirmation and voucher — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
The partner's design system wins; the values below are only a fallback when none exists.
- **Shell:** centered single column. Mobile: full-width with a sticky title bar.
- **Spacing/radius:** a consistent spacing scale; cards rounded; status pill pill-shaped.
- **Type:** product name prominent/medium; section titles medium; body/info rows regular; muted secondary grey.
- **Color:** neutral surfaces; one primary brand accent for primary actions/links; a destructive treatment for Cancel; status badge tinted by state; WCAG AA contrast.

## Field mappings & fallbacks
- `bookingId`/`partnerReferenceId` → reference row; missing → omit.
- `status` → StatusBadge label + treatment.
- `startDateTime` → date + time rows; `customersDetails.count` → guests; `seatInfo`/variant → seat/variant row; omit any missing.
- product policy → derived cancellation-policy copy + Cancel/Reschedule eligibility.

## Acceptance checks
- [ ] API contract confirmed: booking GET + cancel/reschedule + product GET fields resolved and exact paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] **Access is server-side** via the partner's own session → `bookingId` (no guest-lookup-by-email); unauthorized/unresolved → help/support (no empty shell); loader until detail resolves; not indexable.
- [ ] Sections render in canonical order: hero/experience card → visit summary → cancellation policy → manage actions. No plan-your-visit accordions, pickup editor, meeting-point row, or refund summary (not in the booking API).
- [ ] Cancel/Reschedule re-authorize ownership and re-check current policy/status server-side with
  CSRF/Origin, idempotency, and rate-limit protection; async outcome confirms via GET/webhook.
- [ ] Cancellation-policy copy derived from the product policy (not read from the booking).
- [ ] UI primitives map to the partner design system OR are built into `ui-components/`; ExperienceCard/StatusBadge reusable across confirmation and voucher.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
