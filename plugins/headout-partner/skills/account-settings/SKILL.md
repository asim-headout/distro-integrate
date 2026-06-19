---
name: account-settings
description: Build the account-settings page for an experiences/tickets storefront — the page reached at /profile/account-settings where a signed-in guest manages account preferences and runs destructive account actions, primarily a guarded "delete account" flow that moves through a confirmation → loading → success/error state machine in a modal. Self-contained spec — auth gating, settings section order, the delete-account modal state machine, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Account Settings

Build the **Account settings** page — `/profile/account-settings`. A signed-in guest uses it to **manage account preferences and run destructive actions**, the most important being **delete account**, which is a guarded, irreversible flow. The page is a **single-column list of settings rows** under the account shell, where the delete action opens a **modal driven by a strict state machine** (confirmation → loading → success / error). This file is the **single source of truth**: auth gating, section order, the delete-account state machine, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "current user, delete account / account closure, account preferences" })`, then read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the account header/shell and modal are reused by profile/saved-cards — build them shared).
3. **Assemble** the settings rows and wire the **delete-account state machine** exactly.

## Page-level guards
- **Auth gate:** resolve the current user first; not signed in → redirect away (do not render settings); loader while the user resolves.
- This page is **private** — **not indexable**; emit no SEO body.
- The delete action is **irreversible** — it must require an explicit in-modal confirmation before any request fires.

## Data sources (map to your endpoints)
- **Current user:** identity used to scope the account actions.
- **Delete account:** an endpoint that closes/deletes the account; returns success or an error to drive the modal state.
- *(Other preferences — e.g. communication toggles — map here if the partner exposes them; otherwise omit those rows.)*

## Canonical section order (top → bottom)
1. **Settings list** — rows for account preferences (only those the partner supports).
2. **Delete account** — a destructive-styled row/link ("Delete account") that opens the delete-account modal.

### Delete-account modal state machine (STRICT)
The modal renders exactly one view per state; transitions are one-directional except for the explicit close/cancel:

| State | Shows | Transitions |
|---|---|---|
| **(closed / initial)** | nothing (trigger row visible) | click "Delete account" → **Confirmation** |
| **Confirmation** | what deletion means + a confirm action + cancel | confirm → **Loading**; cancel/close → closed |
| **Loading** | a progress/loader, no dismiss | request resolves → **Success** or **Error** |
| **Success** | confirmation that the account is deleted + next step (sign-out/return) | proceeds to the post-delete destination |
| **Error** | a failure message + retry/close | close → closed (account intact) |

## Ordering & derivation of raw data
- **State source:** the modal holds a single view-state value; render the one matching view. The destructive request fires only on the **Confirmation → Loading** transition.
- **Result branch:** a successful response → Success view (then sign the user out / route to a delete-success destination); a failed response → Error view (account remains active).
- **Animation:** view changes may animate (cross-fade/slide); never let an animation skip a state.

## Conditional render rules
- **Unauthenticated:** redirect away; loader while user resolves.
- **Preference rows:** render only the preferences the partner actually supports; omit the rest (do not invent toggles).
- **Modal:** mounted only while a state other than closed is active.
- **Loading view:** non-dismissable while the request is in flight.

## UI components to build
Roles: **Box, Text, Icon, Button/Link**, **SettingsRow** (label + action/destructive variant), **Modal** (state-driven content host), **ConfirmationView** / **LoadingView** / **SuccessView** / **ErrorView** (the four delete states), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button/Modal, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **Modal, Button, SettingsRow** are reused by profile and saved-cards — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add (the delete trigger, modal, and each state view want stable hooks for QA).

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered single column under the account shell, content max width ~48–55rem.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** rows/modal ~12px.
- **Type:** row labels ~15–16px; modal title ~18px medium; body ~14–15px.
- **Color:** neutral surfaces; the delete action uses a **destructive** treatment (red text/border); one primary brand accent elsewhere; muted grey secondary text; WCAG AA contrast.
- **Modal:** centered dialog (or bottom sheet on mobile), focus-trapped, with a clear primary/secondary action pairing per state.

## Field mappings & fallbacks
- supported preferences → SettingsRows; none → only the delete row renders.
- delete request success → Success view → sign out / delete-success destination.
- delete request error → Error view (retry/close), account intact.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable feed disables its section.
- [ ] **Auth gate** correct: unauthenticated → redirect; loader while user resolves; page private/not indexable.
- [ ] **Delete-account state machine** correct: trigger → Confirmation → (confirm) Loading → Success/Error; request fires only on confirm; Loading is non-dismissable; Error leaves the account intact; Success routes to sign-out/delete-success.
- [ ] Only partner-supported preference rows render; the delete row uses a destructive treatment.
- [ ] Modal is focus-trapped with clear primary/secondary actions per state; transitions never skip a state.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; Modal/Button/SettingsRow reusable across profile and saved-cards.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
