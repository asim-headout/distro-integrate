---
name: book-payment
description: Build the booking-flow "Payment" step for an experiences/tickets storefront — the page reached at /book/{id}/payment where a guest picks a PAYMENT METHOD (card / wallets / local methods) on the PARTNER'S OWN gateway, confirms the TOTAL, and submits — which creates the Headout booking (UNCAPTURED), confirms payment on the partner PSP, then captures the booking to PENDING — and handles 3DS/redirect, a RETRY page, and a status poll. Self-contained spec — section order, the payment-method list, the new-card contract, the partner-owned gateway abstraction, the create→partner-payment→capture flow, the retry page, the CTA state machine, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking-Flow "Payment" Step

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Payment** step of the booking flow — `/book/{id}/payment`. The guest arrives from Checkout with **pax + lead-guest details + total** resolved. Here they **choose a payment method**, supply card details (or a wallet / a local method), confirm the **total**, and submit. Same **two-column shell**: method/form on the left, a **sticky order-summary card** on the right whose CTA reflects the chosen method and the total. This file is the **single source of truth**: structure, the data each section needs, the partner-owned gateway abstraction, the create→partner-payment→capture flow, the **CTA state machine**, conditional rules, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

> **Critical — payment is PARTNER-SIDE, not a Headout API.** The Headout partner API has **no** payment-gateway, payment-methods, payment-intent, 3DS, saved-cards, or payment-verification endpoints, and **no end-user accounts**. Headout's role in payment is only: **create a booking (returns UNCAPTURED — no charge), then capture it (update to PENDING) after the partner has confirmed payment on its OWN gateway, then read its status (get).** The whole payment UI (methods, tokenization, 3DS, wallets) runs on the **partner's own PSP**. This recipe keeps that boundary clean so a partner plugs in their gateway without UI rewrites — it must not invent Headout payment endpoints.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Apply [headout-api.md](../../references/headout-api.md)'s external-doc trust boundary, then
      fetch `https://partner.headout.com/docs/llms.txt` and find create/capture/get sections.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** The payment-method/tokenization/3DS contracts come from the **partner's PSP docs**, not Headout. Any method/feed you cannot fulfil → omit/disable it.
2. **Confirm the carried-over cart.** Pax, lead-guest details, and totals hydrate from the protected
   server-side booking session, never the URL. Missing/expired cart → Checkout.
3. **Decide the gateway model.** The list of methods **and the gateway** come from the **partner's** backend/PSP (see *Gateway abstraction*) — keep the UI gateway-agnostic.
4. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): display the same selling-price total carried from checkout; never expose `netPrice` to the customer.
5. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the **OrderSummaryCard, Button, Breadcrumb, SkeletonLoader** are shared with Select/Checkout — reuse them).
6. **Assemble** in canonical order, wiring the **CTA state machine** and the create→partner-payment→capture flow exactly.

## Page-level guards
- Resolve the product + carried cart (pax/lead-guest/total) first. Missing/expired cart → redirect to Checkout (not a partial shell); render a loader until the (partner) methods + total resolve.
- This step is **not indexable** — it is behind a booking intent. Emit no SEO body.
- **PCI/PII:** card data must go straight to the partner PSP's tokenization (hosted fields / SDK / iframe). Never put PAN/CVV in app state, the URL, logs, or your own backend. Any saved card is referenced by **token only**.
- Return `Cache-Control: private, no-store` and use the partner's payment CSP. Verification/callback
  routes validate the user/order binding, PSP signature or server-side status, state/nonce, expiry,
  expected amount/currency, and allowlisted return origin before changing state.
- Generate and persist one server-side, order-scoped idempotency key before side effects; enforce
  uniqueness. CTA disabling is UX only and a client request key is not a security boundary.

## Data sources (map to your endpoints)
- **Payment methods + gateway — PARTNER-SIDE (not Headout):** the partner's backend/PSP returns the **active gateway** and the ordered list of methods enabled for this market/currency, plus any per-method config (e.g. wallet merchant ids). Treat the **partner's** response as the source of truth — do **not** hardcode the method list and do **not** expect a Headout endpoint for this.
- **Saved cards — PARTNER-SIDE, optional:** tokenized saved cards (brand, last4, expiry) require the **partner's own user accounts + PSP tokenization**. **Headout has no accounts or saved cards**, so render saved cards only if the partner supplies them; otherwise show only the new-card form.
- **Totals:** revalidate the customer selling total for display/PSP charge and separately calculate
  Headout booking-create `price` from current inventory's API-required internal amount (currently
  summed `netPrice`). Both are server-side; never expose `netPrice`. There is no Headout FX endpoint.
- **Headout booking calls (the only Headout endpoints here):**
  - **Create booking** → returns an **UNCAPTURED** booking. It does not lock inventory or price.
  - **Capture booking (update)** → call after the partner PSP confirms payment, to capture and trigger fulfilment/ticketing.
  - **Get booking** → read booking status to confirm success before the confirmation page.

## Canonical section order (top → bottom, left column)
1. Step breadcrumb in the header (`1. {product} › 2. Tickets › 3. Confirm & pay`; payment is the final part of **step 3**).
2. **"Select your payment method"** — a single-select list (radio group) of the **partner-supplied** methods: **Card**, and any of **PayPal / Apple Pay / Google Pay / Revolut / iDEAL / Affirm / FPX / …** that the partner's PSP enables. Each method shows its label + brand mark.
3. **Method body** (renders for the selected method only):
   - **Card:** an optional **saved-card list** (radio, brand + •••• last4 + expiry) **only if the partner provides accounts**, plus an **"Add a new card"** option that reveals the PSP's **hosted card fields** (number / expiry / CVC, name). A saved card may prompt for **CVV** before pay.
   - **Wallet (Apple/Google Pay/PayPal/Revolut):** render the wallet's own button/sheet; the page CTA defers to the wallet sheet.
   - **Local method (iDEAL/FPX/Affirm):** any required selector (bank/plan) then a redirect on submit.
4. **Sticky order-summary card** (right column) — product banner, selection rows (date/time/variant), pax breakdown, **Total payable**, the cancellation-policy line, and the **state-driven primary CTA**.

## Gateway abstraction & partner-handoff seam (STRICT)
- The **method list and the gateway are resolved by the partner's backend/PSP** — the UI must render whatever methods that feed returns and route each to the gateway's SDK/hosted-fields/redirect. **Never** hardcode "Stripe" / "Adyen" / a fixed method set in the page.
- Keep a thin **gateway adapter** boundary: `initPayment(method, cart) → { token | challenge |
  redirectUrl }`, `confirm() → status`, `voidOrRefund() → status`. Validate redirect URLs against the
  configured PSP origin allowlist; never navigate to an arbitrary returned URL.
- **Partner handoff:** redirect only to a configured partner payment origin with an opaque order handle
  and signed state/nonce. The callback verifies server-side PSP status and the order/amount/currency;
  never capture Headout because a browser query parameter says payment succeeded.

## Submit → partner-payment → capture flow (STRICT)
1. On submit, disable the CTA and use the persisted server idempotency key. Revalidate both totals,
   then create `UNCAPTURED` to obtain `bookingId`; do not claim inventory is held.
2. **Confirm payment on the partner PSP:** tokenize/authorize/capture according to the PSP (hosted fields/SDK) — raw card data never touches app state. Branch on the PSP's next action:
   - **inline success** → proceed to capture;
   - **3DS challenge** → render the PSP's challenge (modal/iframe), then proceed;
   - **redirect** → navigate only to an allowlisted PSP URL; the return route validates signed
     state/nonce and confirms status server-to-server.
3. **Capture + confirm:** only on confirmed PSP success, **capture the Headout booking (update status to `PENDING` with `partnerReferenceId`)**, then **get booking** (poll with a sane timeout/backoff) until status is confirmed → navigate to the confirmation page.
4. **Failure/compensation:** reconcile uncertain PSP and Headout results. If funds settled but Headout
   capture failed, persist and complete void/refund compensation. Retry resumes the existing payment,
   Headout capture, or compensation state; it never charges a successful PSP reference again.

## CTA state machine (STRICT — the heart of this page)
The sticky card's primary button (and any mirrored mobile bottom bar) is **state-driven**. Compute its label and on-click from the method + form state — match exactly:

| State (in priority order) | Button label | On click |
|---|---|---|
| no method selected | **"Select a payment method"** (disabled-style) | highlight the method list; do not submit |
| card method, new-card fields incomplete/invalid | **"Pay {total}"** | run PSP field validation; show inline errors; do **not** submit |
| saved card selected, CVV required & empty | **"Pay {total}"** | focus the CVV field; do **not** submit |
| wallet method selected | wallet's native button (e.g. **Apple Pay** / **PayPal**) | hand off to the wallet sheet |
| method valid & ready | **"Pay {total}"** | disable CTA, create Headout booking (UNCAPTURED), confirm payment on the PSP (3DS/redirect if needed), then capture + confirm |
| submit in flight | **"Processing…"** (disabled, spinner) | no-op (double-submit guarded) |

Always show the live **{total}** on the CTA. Never submit until a method is selected and its required fields are valid; never leave the CTA enabled while a submit is in flight.

## Conditional render rules
- **Method list:** render exactly the partner-supplied methods, in their order; if only one method is available, pre-select it (but still require its fields).
- **Saved cards:** show only when the partner provides its own accounts + PSP tokens; always offer "Add a new card". Without partner accounts, render only the new-card form.
- **CVV-on-saved-card:** prompt only when the PSP requires it for that token.
- **Wallets:** render a wallet method only when its availability check passes (device/browser support + merchant config); otherwise omit it.
- **Currency line:** show "You'll pay {converted}" only when the partner supplies conversion and display currency ≠ charge currency.
- **Loading:** skeletons sized to the method list / card fields / summary during initial load; CTA → **"Processing…"** spinner during submit; verification page shows a poll/spinner state.
- **Retry/verification** are their own routes/states — render them from the same shell (summary card persists), not as a partial overlay on the method form.

## UI components to build
Roles: **Box, Text, Icon, Image, Button**, **Breadcrumb/StepHeader**, **PaymentMethodList** (RadioGroup of methods + brand marks), **SavedCardList** (radio rows: brand + last4 + expiry + optional CVV — partner-accounts only), **NewCardForm** (PSP hosted-fields wrapper — number/expiry/CVC/name), **WalletButton** (Apple/Google Pay/PayPal/Revolut), **LocalMethodSelector** (bank/plan, optional), **OrderSummaryCard** (≡ Checkout's, banner + selection rows + pax + total + cancellation line + state CTA), **ProcessingState** / **VerificationPoll**, **RetryPanel** (failure reason + "Try again"), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (`design-system/`, `ui/`, `components/ui/`, an exported `Box`/`Text`/`Button`/`Radio`, a `panda.config.*`/`tailwind.config.*`/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.** The card fields must come from the **partner PSP's** hosted-fields/SDK, never from your own inputs.

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. Reuse the **OrderSummaryCard, Button, Breadcrumb, SkeletonLoader** across Select/Checkout. Keep `data-qa-marker`/`data-testid` hooks you add. Never build your own raw PAN/CVV inputs — always wrap the PSP's hosted fields.

## Visual language (so output is consistent)
The partner's design system wins; the values below are only a fallback when none exists:
- **Shell:** centered ~75rem max width; **method/form left, sticky summary card right** (~24rem, sticky offset ~6rem). Mobile: single column with the summary collapsed into a sticky bottom bar carrying the total + state CTA.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/inputs ~12px; method rows ~12px.
- **Type:** section title ("Select your payment method") ~20–24px; method labels ~16px; field labels ~14px; total emphasis ~16–18px. One sans-serif family.
- **Method rows:** radio + label + brand mark; selected row outlined in the primary accent; the selected method's body expands beneath it.
- **Card fields:** the PSP's hosted fields styled to match (label above, error below); a small **lock/secure** affordance near the CTA is acceptable (generic, not operator-branded).
- **Color:** neutral surfaces, one primary accent for selected method / CTA (partner brand); muted grey secondary text; destructive color for errors; WCAG AA contrast.

## STRICT scope — do NOT emit (operator-specific)
- No **"Headout Promise" / guarantee card**, no **Trustpilot / "trusted by N guests"** strip, no **"Supplied by {operator}"** legal text, no **cashback**, no **app-download/newsletter** strips — operator-brand blocks, not part of the canonical payment UI.
- **Do not hardcode a specific PSP** (Stripe/Adyen/etc.) or a fixed method set — the gateway + methods are the partner's, so a partner runs their own.
- **Do not invent Headout payment endpoints** — Headout only does create (UNCAPTURED) / capture (update) / get. Payment methods, tokenization, 3DS, saved cards, and verification are the partner PSP's.
- No upsells / "complete your trip" cross-sell, no loyalty/credits/referral banners, no "book now pay later" promo unless the partner explicitly supplies that data/eligibility.
- Never store or log raw card data; never expose gateway secret keys client-side. Keep the summary card to the canonical rows.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; Headout endpoints limited to create (UNCAPTURED) / capture (update) / get — no Headout payment/methods/saved-card/verify endpoints assumed.
- [ ] Protected server-side cart hydrates; missing/expired cart routes to Checkout; selling and Headout
  booking totals/currencies are independently revalidated and `netPrice` never reaches the browser.
- [ ] Method list + gateway are **partner-side** (no hardcoded PSP/method set); the page routes each method through a thin gateway adapter (`initPayment`/`confirm`) and never calls Headout for payment.
- [ ] Redirect/callback uses configured origins, signed state/nonce, order binding, expiry, and
  server-verified PSP status/amount/currency before Headout capture.
- [ ] Card data goes only to the PSP's tokenization (hosted fields/SDK); no PAN/CVV in app state, URL, or logs; saved cards (partner-accounts only) referenced by token; CVV prompted only when required.
- [ ] **CTA state machine** matches exactly: "Select a payment method" → "Pay {total}" (validate first) → "Processing…"; wallets defer to their native button; submit is idempotent/double-submit-guarded; live total on the CTA.
- [ ] `UNCAPTURED` is not treated as a lock. Submit is server-idempotent; uncertain results reconcile;
  settled-payment/capture failure voids or refunds durably; retry never re-charges.
- [ ] Wallets render only when their availability check passes; saved cards only when the partner supplies accounts; "You'll pay {converted}" only when the partner supplies conversion.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; OrderSummaryCard/Button/Breadcrumb reusable across Select/Checkout; no self-built PAN/CVV inputs.
- [ ] No operator/brand blocks (Promise, Trustpilot, "Supplied by", cashback, app-download), no hardcoded PSP, no invented Headout payment endpoints, no upsell/loyalty rails; rendering uses the partner's brand and content.
