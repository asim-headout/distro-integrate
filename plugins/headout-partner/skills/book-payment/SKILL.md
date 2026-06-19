---
name: book-payment
description: Build the booking-flow "Payment" step for an experiences/tickets storefront — the page reached at /book/{id}/payment where a guest picks a PAYMENT METHOD (card / wallets / local methods), enters or selects card details (incl. saved cards + CVV), confirms the TOTAL, and submits to create the booking, then handles 3DS/redirect, a RETRY page, and a payment-VERIFICATION poll. Self-contained spec — section order, the payment-method list, the saved-card + new-card contracts, the backend-driven gateway abstraction (the seam where a partner can run their OWN gateway), the submit/3DS/verify flow, the retry page, the CTA state machine, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Booking-Flow "Payment" Step

Build the **Payment** step of the booking flow — `/book/{id}/payment`. The guest arrives from Checkout with **pax + lead-guest details + total** resolved. Here they **choose a payment method**, supply card details (or pick a saved card / a wallet / a local method), confirm the **total**, and submit — which **creates the booking** and runs the gateway's confirmation flow (3DS challenge, redirect, or inline). The page also owns the **retry** state (payment failed → try again) and the **verification** poll (post-redirect → confirm success → go to the confirmation page). Same **two-column shell**: method/form on the left, a **sticky order-summary card** on the right whose CTA reflects the chosen method and the total. This file is the **single source of truth**: structure, the data each section needs, the gateway abstraction + **partner-handoff seam**, the submit→3DS→verify flow, the **CTA state machine**, conditional rules, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "payment gateway selection by booking, supported payment methods, saved cards tokenization, create booking, 3DS redirect, payment verification status poll" })`, then read the spec). Otherwise map each feed below to your endpoints. Any method/feed you cannot fulfil → omit/disable it.
2. **Confirm the carried-over cart.** pax + lead-guest + total must hydrate from the booking session/URL; if the cart is missing/expired, route back to `/book/{id}/checkout` rather than rendering a payment shell.
3. **Decide the gateway model.** The list of methods **and the gateway** are backend-driven (see *Gateway abstraction*). This is the seam where a partner runs their **own** gateway/credentials — keep the UI gateway-agnostic.
4. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the **OrderSummaryCard, Button, Breadcrumb, SkeletonLoader** are shared with Select/Checkout — reuse them).
5. **Assemble** in canonical order, wiring the **CTA state machine** and the submit→3DS→verify flow exactly.

## Page-level guards
- Resolve the product + carried cart (pax/lead-guest/total) first. Missing/expired cart → redirect to Checkout (not a partial shell); render a loader until the gateway + methods + total resolve.
- This step is **not indexable** — it is behind a booking intent. Emit no SEO body.
- **PCI/PII:** card data must go straight to the gateway's tokenization (hosted fields / SDK / iframe). Never put PAN/CVV in app state, the URL, logs, or your own backend. Saved cards are referenced by **token only**.
- The booking-creating submit must be **idempotent / double-submit-guarded** (disable the CTA + use a client request key) so a retry can't double-charge.

## Data sources (map to your endpoints)
- **Payment gateway + supported methods (by booking):** backend returns the **active gateway** and the ordered list of methods enabled for this booking/market/currency, plus any per-method config (e.g. wallet merchant ids). Treat this as the source of truth — do **not** hardcode the method list.
- **Saved cards (auth'd users):** tokenized saved cards (brand, last4, expiry) for one-tap reuse; new CVV may still be required per card.
- **Total payable + currency conversion:** the charge amount + currency, and the guest's display currency for the "you'll pay {converted}" line. Re-confirm the total at render (don't trust a stale checkout total).
- **Create-booking + payment-intent:** the call that creates the booking and returns the next action (inline success, 3DS challenge, or redirect URL + a verification handle).
- **Payment verification / status:** a pollable status endpoint used after a redirect/challenge to resolve success/failure.

## Canonical section order (top → bottom, left column)
1. Step breadcrumb in the header (`1. {product} › 2. Tickets › 3. Confirm & pay`; payment is the final part of **step 3**).
2. **"Select your payment method"** — a single-select list (radio group) of the backend-supplied methods: **Card**, and any of **PayPal / Apple Pay / Google Pay / Revolut / iDEAL / Affirm / FPX / …** that the feed enables. Each method shows its label + brand mark.
3. **Method body** (renders for the selected method only):
   - **Card:** **saved-card list** (radio, brand + •••• last4 + expiry) when present, plus an **"Add a new card"** option that reveals the gateway's **hosted card fields** (number / expiry / CVC, name). A saved card may prompt for **CVV** before pay.
   - **Wallet (Apple/Google Pay/PayPal/Revolut):** render the wallet's own button/sheet; the page CTA defers to the wallet sheet.
   - **Local method (iDEAL/FPX/Affirm):** any required selector (bank/plan) then a redirect on submit.
4. **Sticky order-summary card** (right column) — product banner, selection rows (date/time/variant), pax breakdown, promo/discount line, **Total payable**, "You'll pay {converted}" currency line, the cancellation-policy line, and the **state-driven primary CTA**.

## Gateway abstraction & partner-handoff seam (STRICT)
- The **method list and the gateway are resolved by the backend per booking** — the UI must render whatever methods the feed returns and route each to the gateway's SDK/hosted-fields/redirect. **Never** hardcode "Stripe" / "Adyen" / a fixed method set in the page.
- Keep a thin **gateway adapter** boundary: `initPayment(method, cart) → { token | challenge | redirectUrl }`, `confirm() → status`. The page talks to the adapter, not to a specific PSP SDK.
- **Partner handoff:** because the gateway + credentials come from the backend response, a partner can plug in **their own gateway/merchant credentials** there without UI changes. If a partner instead wants to **own the entire payment step**, treat payment as a **handoff**: after Checkout, redirect to the partner's payment URL with the cart/booking handle, and resume on their success/verify callback. The skill's job is to keep the boundary clean — do not bake Headout PSP specifics into shared components.

## Submit → 3DS → verify flow (STRICT)
1. On CTA submit: **disable the CTA**, attach a client request key, tokenize via the gateway (hosted fields/SDK) — raw card data never touches app state.
2. Call create-booking + payment-intent. Branch on the returned next action:
   - **inline success** → go straight to verification/confirmation;
   - **3DS challenge** → render the gateway's challenge (modal/iframe), then verify;
   - **redirect** → navigate to the gateway URL; on return land on the **verification** route.
3. **Verification:** poll the status endpoint (with a sane timeout/backoff). On **success** → navigate to the confirmation page. On **failure/timeout** → route to the **retry** page.
4. **Retry page:** show a clear failure reason (declined / expired / cancelled), preserve the cart, and offer **"Try again"** (back to method selection) — never silently re-charge; re-run the idempotent submit.

## CTA state machine (STRICT — the heart of this page)
The sticky card's primary button (and any mirrored mobile bottom bar) is **state-driven**. Compute its label and on-click from the method + form state — match exactly:

| State (in priority order) | Button label | On click |
|---|---|---|
| no method selected | **"Select a payment method"** (disabled-style) | highlight the method list; do not submit |
| card method, new-card fields incomplete/invalid | **"Pay {total}"** | run gateway field validation; show inline errors; do **not** submit |
| saved card selected, CVV required & empty | **"Pay {total}"** | focus the CVV field; do **not** submit |
| wallet method selected | wallet's native button (e.g. **Apple Pay** / **PayPal**) | hand off to the wallet sheet |
| method valid & ready | **"Pay {total}"** | disable CTA, tokenize, create booking, run 3DS/redirect/verify |
| submit in flight | **"Processing…"** (disabled, spinner) | no-op (double-submit guarded) |

Always show the live **{total}** on the CTA. Never submit until a method is selected and its required fields are valid; never leave the CTA enabled while a submit is in flight.

## Conditional render rules
- **Method list:** render exactly the backend-supplied methods, in their order; if only one method is available, pre-select it (but still require its fields).
- **Saved cards:** show only for authenticated users with tokens; always offer "Add a new card". Guests see only the new-card form.
- **CVV-on-saved-card:** prompt only when the gateway requires it for that token.
- **Wallets:** render a wallet method only when its availability check passes (device/browser support + merchant config); otherwise omit it.
- **Currency line:** show "You'll pay {converted}" only when display currency ≠ charge currency.
- **Loading:** skeletons sized to the method list / card fields / summary during initial load; CTA → **"Processing…"** spinner during submit; verification page shows a poll/spinner state.
- **Retry/verification** are their own routes/states — render them from the same shell (summary card persists), not as a partial overlay on the method form.

## UI components to build
Roles: **Box, Text, Icon, Image, Button**, **Breadcrumb/StepHeader**, **PaymentMethodList** (RadioGroup of methods + brand marks), **SavedCardList** (radio rows: brand + last4 + expiry + optional CVV), **NewCardForm** (gateway hosted-fields wrapper — number/expiry/CVC/name), **WalletButton** (Apple/Google Pay/PayPal/Revolut), **LocalMethodSelector** (bank/plan, optional), **OrderSummaryCard** (≡ Checkout's, banner + selection rows + pax + promo + total + currency line + cancellation line + state CTA), **ProcessingState** / **VerificationPoll**, **RetryPanel** (failure reason + "Try again"), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (`design-system/`, `ui/`, `components/ui/`, an exported `Box`/`Text`/`Button`/`Radio`, a `panda.config.*`/`tailwind.config.*`/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.** This repo's own stack: `@headout/eevee` (Box, Text, Button, Icon, Link, **Radio**, **RadioGroup**, SkeletonLoader, Breadcrumb) + `@headout/aer` (Input/FormElement for any non-PCI fields) + `@headout/onix` icons (Card, Lock, Check, ChevronRight, brand marks) + `@headout/pixie` (`css`/`cx`, Panda) + `@headout/espeon` (Conditional, Tooltip). The actual card fields come from the **gateway's** hosted-fields/SDK, not from your own inputs. Map to those if you are inside it.

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. Reuse the **OrderSummaryCard, Button, Breadcrumb, SkeletonLoader** across Select/Checkout. Keep `data-qa-marker`/`data-testid` hooks you add. Never build your own raw PAN/CVV inputs — always wrap the gateway's hosted fields.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered ~75rem max width; **method/form left, sticky summary card right** (~24rem, sticky offset ~6rem). Mobile: single column with the summary collapsed into a sticky bottom bar carrying the total + state CTA.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards/inputs ~12px; method rows ~12px.
- **Type:** section title ("Select your payment method") ~20–24px; method labels ~16px; field labels ~14px; total emphasis ~16–18px. One sans-serif family.
- **Method rows:** radio + label + brand mark; selected row outlined in the primary accent; the selected method's body expands beneath it.
- **Card fields:** the gateway's hosted fields styled to match (label above, error below); a small **lock/secure** affordance near the CTA is acceptable (generic, not operator-branded).
- **Color:** neutral surfaces, one primary accent for selected method / CTA (partner brand); muted grey secondary text; destructive color for errors; WCAG AA contrast.

## STRICT scope — do NOT emit (operator-specific)
- No **"Headout Promise" / guarantee card**, no **Trustpilot / "trusted by N guests"** strip, no **"Supplied by {operator}"** legal text, no **cashback**, no **app-download/newsletter** strips — operator-brand blocks, not part of the canonical payment UI.
- **Do not hardcode a specific PSP** (Stripe/Adyen/etc.) or a fixed method set in the page — the gateway + methods are backend-driven so a partner can run their own.
- No upsells / "complete your trip" cross-sell, no loyalty/credits/referral banners, no "book now pay later" promo here (when-to-pay was decided at Checkout) unless the partner explicitly supplies that data/eligibility.
- Never store or log raw card data; never expose gateway secret keys client-side. Keep the summary card to the canonical rows.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable method/feed is omitted.
- [ ] Carried cart (pax/lead-guest/total) hydrates; missing/expired cart routes back to Checkout, not a partial shell; total re-confirmed at render.
- [ ] Method list + gateway are **backend-driven** (no hardcoded PSP/method set); the page routes each method through a thin gateway adapter (`initPayment`/`confirm`).
- [ ] **Partner-handoff seam** documented in code: gateway + credentials come from the backend response (partner can plug in their own), and a full payment handoff (redirect to partner URL + resume on callback) is supported without UI rewrites.
- [ ] Card data goes only to the gateway's tokenization (hosted fields/SDK); no PAN/CVV in app state, URL, or logs; saved cards referenced by token; CVV prompted only when required.
- [ ] **CTA state machine** matches exactly: "Select a payment method" → "Pay {total}" (validate first) → "Processing…"; wallets defer to their native button; submit is idempotent/double-submit-guarded; live total on the CTA.
- [ ] Submit → 3DS/redirect/inline branch handled; verification polls status with timeout; success → confirmation, failure/timeout → retry page that preserves the cart and offers "Try again".
- [ ] Wallets render only when their availability check passes; saved cards only for auth'd users; "You'll pay {converted}" only on currency mismatch.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; OrderSummaryCard/Button/Breadcrumb reusable across Select/Checkout; no self-built PAN/CVV inputs.
- [ ] No operator/brand blocks (Promise, Trustpilot, "Supplied by", cashback, app-download), no hardcoded PSP, no upsell/loyalty rails; rendering uses the partner's brand and content.
