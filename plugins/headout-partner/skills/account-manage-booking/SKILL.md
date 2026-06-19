---
name: account-manage-booking
description: Build the post-booking "Manage your booking" page for an experiences/tickets storefront — the self-service page reached at /manage-booking/{bookingId} (or via a guest lookup link with an email + secure ref) where a guest reviews a single booking, reads plan-your-visit info (pickup/meeting point, validity, redemption, what to carry), sets or edits a pickup location, and takes self-service actions (cancel, reschedule, contact support) when the booking's policy windows allow. Self-contained spec — access modes (authed vs guest-lookup link), section order, the action-eligibility rules, the pickup-location editor, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Manage Your Booking

Build the **Manage booking** page — `/manage-booking/{bookingId}`. A guest reaches it from a confirmation/email link or their bookings list, and uses it to **review one booking, understand how to use it, and act on it** (cancel / reschedule / edit pickup / get help). The page is a **single-column detail shell** under the site header: a booking hero, the visit details, plan-your-visit content, and a manage-actions area. Access is either **authenticated** (the booking belongs to the logged-in user) or via a **guest-lookup link** that carries an email + a secure booking reference in the URL. This file is the **single source of truth**: access modes, section order, the action-eligibility rules, the pickup-location editor, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "booking detail by id, manage booking, cancellation/reschedule eligibility, update pickup location, refund summary" })`, then read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the booking/experience card, status badge, and accordion are reused by confirmation and voucher — build them shared).
3. **Assemble** in canonical order, wiring the **access modes** and **action-eligibility rules** exactly.

## Page-level guards
- **Access modes:** read identity from the URL — `bookingId` for an authed user, **or** an `email` + `secureBookingId` pair for a guest-lookup link. If neither resolves (no logged-in user **and** no guest-lookup pair) → route the guest to the **help/support** page rather than rendering an empty shell.
- Resolve the booking detail before rendering the body; show a loader until it resolves; unresolved id → support/help.
- This page is **behind a booking** — **not indexable**; emit no SEO body.
- On a small viewport, show a back/title bar ("Booking details") that becomes opaque on scroll.

## Data sources (map to your endpoints)
- **Booking detail by id (or by email + secure ref):** product name + image, booking reference, date/time, guest count, seat/variant, meeting/pickup point, status.
- **Plan-your-visit content:** redemption instructions, validity, what to carry, how-to-reach, cancellation policy — typically rich text/HTML blocks per booking.
- **Action eligibility:** per-booking flags/windows for whether **cancel** and **reschedule** are allowed (often time-bounded relative to the experience date) and the resulting refund terms.
- **Pickup location (only for transfer/pickup products):** current pickup point + the ability to set/update it; an editable address/location field.
- **Refund / payment summary:** amount paid, refundable amount, refund status (when a cancellation has been requested).

## Canonical section order (top → bottom)
1. **Header / back bar** (mobile: title "Booking details", transparent → opaque on scroll).
2. **Booking hero / experience card** — product image, product name, booking reference, and a **status badge**.
3. **Visit summary** — date, time, guests, seat/variant, meeting/pickup point as icon rows.
4. **Pickup-location editor** — *(transfer/pickup products only)* the current pickup point with an edit affordance that opens a location field and saves it.
5. **Plan your visit** — a stack of **accordions** for redemption / validity / what to carry / how to reach / cancellation policy (rendered from the content blocks).
6. **Manage actions** — buttons for **Cancel booking**, **Reschedule**, **Contact support**; each gated by its eligibility rule.
7. **Refund / payment summary** — shown once a cancellation is in progress or completed.

## Ordering & derivation of raw data
- **Action gating:** render **Cancel** / **Reschedule** as active only when their eligibility flag/window is true; otherwise present them disabled with a short reason ("Cancellation window has passed") or omit them and surface **Contact support** as the fallback action.
- **Status badge:** derive a single status label + treatment from the booking status (e.g. confirmed / cancelled / refunded / pending).
- **Pickup editor:** only render when the product is a transfer/pickup type that exposes an editable pickup; persist the chosen location via the update endpoint and reflect it back into the summary.
- **Plan-your-visit:** order the accordions as redemption → validity → what to carry → how to reach → policy; omit any block with no content.
- **Refund summary:** derive refundable amount + refund status; show only after a cancellation request exists.

## Conditional render rules
- **Guest-lookup vs authed:** the body is identical; only the identity source differs. No login prompt when a valid guest-lookup pair is present.
- **Pickup editor:** transfer/pickup products only.
- **Cancel / Reschedule buttons:** only when eligible; otherwise disabled-with-reason or replaced by Contact support.
- **Refund summary:** only when a cancellation has been initiated/completed.
- **Loading:** skeletons sized to the hero card + accordions during initial load.

## UI components to build
Roles: **Box, Text, Icon, Image, Button/Link**, **HeaderBar** (mobile back/title, scroll-aware), **ExperienceCard** (image + name + reference + status badge), **StatusBadge**, **InfoRow** (icon + value), **PickupLocationField** (display + edit + save), **Accordion** (plan-your-visit blocks; renders rich-text content safely), **ActionButton** (active / disabled-with-reason), **RefundSummary** (amount + status rows), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **ExperienceCard, StatusBadge, InfoRow, Accordion, Button** are reused by confirmation and voucher — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add; preserve literal class hooks that external rich-text content targets.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered single column, content max width ~55rem. Mobile: full-width with a sticky title bar.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/accordions ~12–20px; status pill ~999px.
- **Type:** product name ~18px medium; section/accordion titles ~16–18px medium; body/info rows ~14–15px; muted secondary grey.
- **Plan-your-visit rich text:** constrain width (~55rem), comfortable line-height (~1.5), styled headings/lists/links consistent with the partner's body typography.
- **Color:** neutral surfaces; one primary brand accent for primary actions/links; destructive treatment for Cancel; status badge tinted by state; WCAG AA contrast.

## Field mappings & fallbacks
- `bookingId`/secure ref → reference row; missing → omit.
- `status` → StatusBadge label + treatment.
- `date`/`time`/`guests`/`seat|variant`/`pickup` → InfoRows; omit any missing.
- plan-your-visit blocks → accordions; empty block → omit.
- cancel/reschedule eligibility → active vs disabled-with-reason vs Contact-support fallback.
- refund amount/status → RefundSummary; absent → omit.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable feed disables its section.
- [ ] **Access modes** correct: authed via `bookingId` OR guest-lookup via `email` + secure ref; neither resolvable → route to help/support (no empty shell); loader until detail resolves; not indexable.
- [ ] Sections render in canonical order: hero/experience card → visit summary → pickup editor (transfer only) → plan-your-visit accordions → manage actions → refund summary.
- [ ] **Action gating** correct: Cancel/Reschedule active only when eligible, else disabled-with-reason or replaced by Contact support; refund summary appears only after a cancellation exists.
- [ ] Pickup-location editor renders only for transfer/pickup products and persists the chosen location back into the summary.
- [ ] Plan-your-visit accordions render the content blocks in order and omit empty ones; rich text is width-constrained and styled.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; ExperienceCard/StatusBadge/Accordion reusable across confirmation and voucher.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
