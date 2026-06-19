---
name: account-auth
description: Build the sign-in / login experience for an experiences/tickets storefront — the modal (and standalone surface) where a guest authenticates via an email magic-link flow plus optional social sign-in (Google / Apple), short-circuiting when already logged in. Self-contained spec — the login-surface section order, the email-first magic-link state machine (enter email → validate → send link → "check your email"), the config-gated social buttons, the logged-in short-circuit, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Sign In / Login

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the **Login** surface — a sign-in **modal** (and the same content as a standalone surface) that a guest reaches whenever an action needs authentication. The default path is an **email magic-link** flow (no password): enter email → validate → send a sign-in link → "check your email". Above it sit **optional social buttons** (Google / Apple) that are shown only when the partner enables them. If the guest is **already signed in**, the surface renders nothing. This file is the **single source of truth**: surface structure, the email magic-link state machine, the config-gated social buttons, the logged-in short-circuit, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Fetch `https://partner.headout.com/docs/llms.txt` and find the relevant endpoint sections for: send email login link / magic link, social login google apple, current user session.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the modal, input, and button are reused across the account flows — build them shared).
3. **Assemble** the surface and wire the **email magic-link state machine** + **config gating** exactly.

## Page-level guards
- **Logged-in short-circuit:** resolve the current user first; if already signed in, render **nothing** (the surface only exists for unauthenticated guests).
- The surface is a **modal** by default (focus-trapped, dismissable) but the same content must work as a standalone surface.
- Capture a **return destination** so the guest lands back where they started after the link is used.

## Data sources (map to your endpoints)
- **Send email login link:** accepts an email, sends a magic sign-in link; returns success (→ "check your email") or an error.
- **Social sign-in:** Google and/or Apple sign-in handlers (each gated by a partner config flag).
- **Current session/user:** to drive the logged-in short-circuit.
- **Config flags:** which social providers are enabled (`showGoogleLogin`, `showAppleLogin`) and whether the email button is shown.

## Canonical section order (top → bottom)
1. **Heading** — a short sign-in title/intro.
2. **Social buttons** — **Google** and/or **Apple**, each only when its config flag is on.
3. **Divider** — an "or" separator between social and email (only when both groups are present).
4. **Email entry** — the email-first magic-link block (the default path).

### Email magic-link state machine (STRICT)
| State | Shows | Transitions |
|---|---|---|
| **Idle** | email input + "Continue/Send link" button | valid email + submit → **Sending** |
| **Sending** | button in a loading state, input disabled | success → **Sent**; failure → **Error** |
| **Sent** | "Check your email — we sent a sign-in link to {email}" confirmation | (link is used out-of-band; offer "resend"/"use a different email") |
| **Error** | inline error + the input again | fix + resubmit → Sending |

- **Validation:** validate the email format before submit; an invalid email shows an inline field error and does **not** fire the request.

## Ordering & derivation of raw data
- **Social visibility:** render Google only when `showGoogleLogin`, Apple only when `showAppleLogin`; the divider appears only when at least one social button **and** the email block are both present.
- **Email submit:** on a valid email, call send-link and move Idle → Sending → Sent/Error. Never send for an invalid email.
- **Logged-in:** if the session resolves to a signed-in user at any point, the surface unmounts/renders nothing.

## Conditional render rules
- **Already signed in:** render nothing.
- **Social buttons:** each gated by its own config flag; both off → email-only surface (no divider).
- **Email button/block:** hidden when the partner disables it (e.g. social-only partners).
- **Divider:** only when both a social group and the email block render.
- **Sent state:** replaces the input with a confirmation; offers resend / change email.

## UI components to build
Roles: **Box, Text, Icon, Button/Link, Input**, **Modal** (focus-trapped host), **SocialButton** (Google / Apple variants), **Divider** ("or"), **EmailLoginBox** (input + submit + inline error + sent confirmation), **SkeletonLoader/Spinner** (sending state).

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button/Input/Modal, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **Modal, Button, Input** are reused across the account flows — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered modal ~24–28rem wide (bottom sheet on mobile), generous padding; standalone surface uses the same column centered on the page.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** modal ~16px; inputs/buttons ~8–12px.
- **Type:** heading ~18–20px medium; button labels ~15–16px; helper/error text ~13–14px.
- **Social buttons:** full-width, provider icon + label, neutral bordered surface; stacked with consistent gaps.
- **Color:** neutral surfaces; one primary brand accent for the email submit button; destructive/error text for validation; muted grey for the divider + helper text; WCAG AA contrast.

## Field mappings & fallbacks
- `showGoogleLogin` / `showAppleLogin` → render each social button; both false → email-only.
- email input → validate → send-link; invalid → inline error, no request.
- send success → Sent confirmation (with email echoed); failure → Error with retry.
- current user present → render nothing.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] **Logged-in short-circuit** works: a signed-in user sees nothing; a return destination is preserved for after sign-in.
- [ ] **Email magic-link state machine** correct: Idle → (valid email) Sending → Sent/Error; invalid email blocks the request with an inline error; Sent shows "check your email" with resend/change-email.
- [ ] **Config gating** correct: Google/Apple appear only when their flags are on; divider only when both social and email render; email block hidden when disabled.
- [ ] Surface works both as a focus-trapped dismissable modal and as standalone content.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; Modal/Button/Input reusable across the account flows.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
