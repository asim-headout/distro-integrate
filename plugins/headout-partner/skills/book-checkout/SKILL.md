---
name: book-checkout
description: Build the booking-flow "Checkout" step for an experiences/tickets storefront — the page reached at /book/{id}/checkout where a guest sets the PAX count (how many adults/children/infants), fills LEAD GUEST details, optionally applies a PROMO code, reviews the ORDER SUMMARY, and chooses WHEN TO PAY before advancing to payment. Self-contained spec — section order, the pax-stepper rules, the guest-details form contract, the promo flow, the order-summary card, the "select when to pay" branch, the CTA state machine (button text/behaviour that changes as the form is completed), conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking-Flow "Checkout" Step

Build the **Checkout** step of the booking flow — `/book/{id}/checkout`. The guest arrives here from the Select step with **date + option/variant + time already chosen** (carried in the URL). Here they set **how many guests**, enter **lead-guest contact details**, optionally apply a **promo code**, review the **order summary**, pick **when to pay**, and hit the primary CTA to advance to payment. The page is the same **two-column shell** as Select: a left form column and a **sticky right order-summary card** whose primary CTA text changes as the form is completed. This file is the **single source of truth**: structure, the data each section needs, the pax/guest/promo contracts, the **CTA state machine**, conditional rules, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "pax types and pricing, booking flow fields, lead guest required fields, promo/discount code validation, cancellation policy, pay-later eligibility" })`, then read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Confirm the carried-over selection.** date/option/variant/time must hydrate from the URL; if any is missing, route back to `/book/{id}/select` rather than rendering a partial checkout.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the **summary card, date/selection rows, option card, Button, Breadcrumb, SkeletonLoader** are shared with Select/Payment — reuse them).
4. **Assemble** in canonical order, wiring the **CTA state machine** exactly.

## Page-level guards
- Resolve the product/tour-group + the carried selection first. Missing date/variant/time → redirect to the Select step (not a partial shell); render a loader until product + pricing resolve.
- **Source of truth = URL query** (`date`, `time`, `tourId`/option, `variantId`, and `pax.{type}=N`); hydrate pax + selection from the URL on load and reflect every pax change back into the URL so the step is shareable/restorable.
- This step is **not indexable** — it is behind a booking intent. Emit no SEO body.
- Lead-guest PII is entered here; never log it, never put it in the URL.

## Data sources (map to your endpoints)
- **Product / tour-group + carried selection:** name, banner image, cancellation policy, the chosen date/variant/time (for the summary rows).
- **Pax / guest types + pricing:** ordered list of bookable guest types — each with a label, an age descriptor, a per-unit price, and min/max constraints; recompute the total when counts change. Typical types: **Adult** (e.g. 16+), **Child** (e.g. 3–15), **Infant** (e.g. up to 2, often free).
- **Promo / discount validation:** validate a code against the current cart; return the adjusted total or an error.
- **Pay-later / when-to-pay eligibility:** whether "book now, pay later" is offered for this product+date (operator-specific — see scope).
- **Currency conversion:** the guest's display currency vs. the charge currency, for the "you'll pay {converted}" line.

## Canonical section order (top → bottom, left column)
1. Step breadcrumb in the header (`1. {product} › 2. Tickets › 3. Confirm & pay`; checkout is **step 3**).
2. **Guest count** ("How many guests?") — a **pax stepper** row per guest type (label + age descriptor + price; a `−` / count / `+` control). A min/max-clamped stepper; total recomputes live.
3. **Lead guest details** form — Full name ("Must match ID"), Phone (country-code selector + number), Email ("We'll send your tickets here"), Confirm email. Inline validation per field.
4. **Promo code** — a collapsed "Have a promo code?" affordance that expands to an input + **"APPLY"**; shows applied/error state and the discount in the summary.
5. **Select when to pay** — only when pay-later is eligible: **"Pay now"** vs **"Book now, pay later"** (radio/segmented). Default **Pay now**. *(see scope — this is operator-specific; gate it.)*
6. **Sticky order-summary card** (right column) — product banner, selection rows (date/time/variant with an **edit** affordance routing back to Select), pax breakdown, promo/discount line, **Total payable**, a "You'll pay {converted}" currency line, the cancellation-policy line, and the **state-driven primary CTA**.

## Pax-stepper rules (STRICT)
- One row per bookable guest type, in the order the feed returns them. Each row: **label** + **age descriptor** + **per-unit price**, and a `−` / **count** / `+` stepper.
- **Clamp** every count to the type's min/max; disable `−` at the min and `+` at the max. The overall booking has a min (≥1 payable guest) and may have a max group size — disable `+` across the board at the group max.
- **Infants/free types** still count toward group size but contribute 0 to the total.
- Each change **writes back to the URL** as `pax.{type}=N` and **re-fetches/recomputes** the total (show a shimmer on the total while pricing is in flight).
- If a price fetch fails, keep the last good total and surface a non-blocking retry — never let the CTA charge a stale/zero amount.

## Lead-guest form contract (STRICT)
- **Full name** — required; helper "Must match ID".
- **Phone** — required; a **country-code selector + national number** (use the design system's phone input); validate the combined number.
- **Email** — required; helper "We'll send your tickets here"; format-validated.
- **Confirm email** — required; must equal Email (inline "emails don't match" error).
- Validate on blur and on submit; the CTA's submit path must short-circuit to the **first invalid field** (scroll + focus) before any navigation.

## CTA state machine (STRICT — the heart of this page)
The sticky card's primary button (and any mirrored mobile bottom bar) is **state-driven**. Compute its label and on-click from the form state — match exactly:

| State (in priority order) | Button label | On click |
|---|---|---|
| no payable guest selected (all counts 0) | **"Add guests"** (disabled-style) | highlight the guest-count section; do not navigate |
| guests chosen, required guest fields invalid/empty | **"Confirm & pay"** | run validation; scroll+focus the **first invalid field**; show inline errors; do **not** navigate |
| guests chosen **and** form valid | **"Confirm & pay"** / **"Confirm at {total}"** | persist pax + lead guest, then **navigate to `/book/{id}/payment`** |

Show the live **{total}** on/next to the CTA. Never navigate to payment until at least one payable guest exists **and** all required lead-guest fields are valid.

## Conditional render rules
- **Pax stepper:** always render; rows come from the feed. A single fixed-pax product (no choice) renders a read-only count row, not a stepper.
- **Promo code:** render the collapsed affordance only if promo is supported for the product; on a valid code show the discount line in the summary and a "remove" affordance; on an invalid code show an inline error and leave the total unchanged.
- **Select when to pay:** render only when pay-later is eligible (else default silently to pay-now and omit the section).
- **Order summary edit affordances:** the date/time/variant rows each link back to `/book/{id}/select` (preserving the rest of the selection); pax has no separate edit (it's edited inline above).
- **Loading:** skeletons sized to the final pax rows / form / summary during initial load; a shimmer on the **total** during pax/promo re-fetch.
- **Currency line:** show "You'll pay {converted}" only when the display currency differs from the charge currency.

## UI components to build
Roles: **Box, Text, Icon, Image, Button**, **Breadcrumb/StepHeader**, **PaxStepper** (label + descriptor + price + `−`/count/`+`), **GuestDetailsForm** (TextInput, **PhoneInput**, email/confirm-email with inline errors), **PromoCode** (collapsible input + APPLY + applied/error states), **WhenToPaySelector** (RadioGroup/segmented — optional), **OrderSummaryCard** (banner + selection rows with edit affordances + pax breakdown + promo line + total + currency line + cancellation line + state CTA), **CancellationPolicyLine**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (`design-system/`, `ui/`, `components/ui/`, an exported `Box`/`Text`/`Button`/`Input`, a `panda.config.*`/`tailwind.config.*`/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.** This repo's own stack: `@headout/eevee` (Box, Text, Button, Icon, Link, Radio, **RadioGroup**, SkeletonLoader, Breadcrumb) + `@headout/aer` (**Input**, **PhoneInput**, FormElement) for the form + `@headout/onix` icons (Calendar, Clock, Ticket, Location, Tag, Pencil/Edit, Plus, Minus) + `@headout/pixie` (`css`/`cx`, Panda) + `@headout/espeon` (Conditional, Tooltip). Map to those if you are inside it.

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. Reuse the **OrderSummaryCard (≡ Select's SummaryCard), selection rows, Button, Breadcrumb, SkeletonLoader** across Select/Payment. Keep `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered ~75rem max width; **form left, sticky summary card right** (~24rem, sticky offset ~6rem). Mobile: single column with the summary collapsed into a sticky bottom bar carrying the same total + state CTA.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/inputs ~12px; the stepper `−`/`+` buttons ~999px or ~8px.
- **Type:** section titles ("How many guests?", "Lead guest details") ~20–24px; field labels ~14px; price/total emphasis ~16–18px. One sans-serif family.
- **Pax stepper:** label + age descriptor stacked left, per-unit price beside; `−` count `+` right-aligned; disabled stepper buttons visibly muted.
- **Form:** full-width inputs, label above, helper/error below; phone field shows the country-code selector inline; invalid fields outlined in the destructive color with the error text below.
- **Color:** neutral surfaces, one primary accent for the CTA / APPLY / selected when-to-pay (partner brand); muted grey secondary text; destructive color for errors; WCAG AA contrast.

## STRICT scope — do NOT emit (operator-specific)
- No **"Headout Promise" / guarantee card**, no **Trustpilot / "trusted by N guests"** strip, no **"Supplied by {operator}"** legal text, no **cashback**, no **app-download/newsletter** strips — operator-brand blocks, not part of the canonical checkout UI.
- **"Book now, pay later" / RNPL is operator-specific** — render the "Select when to pay" section **only** when the partner's feed reports pay-later eligibility; otherwise default to pay-now and omit it. Do not hardcode a pay-later promise.
- No upsells / add-on cross-sell rails, no "X people are booking" scarcity tickers, no loyalty/credits banners unless the partner explicitly supplies that data.
- Keep the summary card to the canonical rows above; do not add operator-branded reassurance copy.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable feed disables its section.
- [ ] Carried selection (date/option/variant/time) hydrates from the URL; missing selection routes back to Select, not a partial shell.
- [ ] URL is the source of truth for pax: `pax.{type}=N` hydrates on load and every stepper change writes back and recomputes the total (shimmer while in flight).
- [ ] Pax steppers clamp to min/max (and group max); free/infant types count toward group size but add 0; single fixed-pax renders a read-only row.
- [ ] Lead-guest form enforces Full name / Phone / Email / Confirm-email with inline validation; submit short-circuits to the first invalid field (no navigation).
- [ ] **CTA state machine** matches exactly: "Add guests" → "Confirm & pay"/"Confirm at {total}"; only the valid state navigates to `/book/{id}/payment`; live total shown on/near the CTA.
- [ ] Promo code: collapsible "Have a promo code?" → input + APPLY; valid shows discount line + remove, invalid shows inline error + unchanged total.
- [ ] "Select when to pay" renders only when pay-later eligible; summary shows total payable + "You'll pay {converted}" only on currency mismatch + the cancellation line; edit affordances route back to Select.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; summary card/selection rows/Button reusable across Select/Payment.
- [ ] No operator/brand blocks (Promise, Trustpilot, "Supplied by", cashback, app-download), no hardcoded BNPL promise, no upsell/scarcity rails; rendering uses the partner's brand and content.
