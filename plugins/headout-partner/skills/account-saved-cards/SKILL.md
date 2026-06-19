---
name: account-saved-cards
description: Build the saved payment cards page for an experiences/tickets storefront — the page reached at /profile/saved-cards where a signed-in guest reviews the cards stored on their account and removes one via a confirm-delete modal. Self-contained spec — auth gating, section order, the load → empty / list render branch, the delete-card confirm flow, conditional-render rules, UI components, and a visual language so output is consistent. No raw card numbers are ever stored or shown — only network + last-4 + expiry come from the tokenized source. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Saved Cards

Build the **Saved cards** page — `/profile/saved-cards`. A signed-in guest uses it to **see the payment cards stored on their account and remove one**. The page is a **single-column list shell** under the account shell: a header with a count, then either a **loading skeleton**, an **empty state**, or a **list of card rows** — each removable through a **confirm-delete modal**. Card data is **tokenized**: only the network, masked last-4, and expiry are ever shown; no raw PAN/CVV is stored or displayed. This file is the **single source of truth**: auth gating, section order, the render branch, the delete flow, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "saved payment methods / saved cards list, delete saved card, card network last4 expiry token" })`, then read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the account shell, card row, and modal are reused by profile/settings — build them shared).
3. **Assemble** the header + render branch and wire the **delete-card confirm flow** exactly.

## Page-level guards
- **Auth gate:** resolve the current user first; not signed in → redirect away; loader while the user resolves.
- This page is **private** — **not indexable**; emit no SEO body.
- **PCI:** never store or render a full card number or CVV. Only display tokenized metadata (network, last-4, expiry). Deletion operates on the card token/id, not card data.

## Data sources (map to your endpoints)
- **Saved cards list:** an array of tokenized cards — each with an id/token, network/brand, masked last-4, and expiry; plus an `isLoading` and a `noSavedCards` (empty) signal.
- **Delete saved card:** an endpoint that removes a card by its id/token; returns success/error to confirm the removal.

## Canonical section order (top → bottom)
1. **Header** — title + a **saved-cards count**.
2. **Render branch** (exactly one):
   - **Loading** → a skeleton list.
   - **Empty** (`noSavedCards`) → an empty state ("No saved cards") with a short note.
   - **List** → one **card row** per saved card.
3. **Delete-card flow** — each row exposes a remove affordance that opens a **confirm-delete modal** (a bottom sheet on mobile); confirm removes the card and updates the list.

### Card row anatomy
- Network/brand icon, masked number ("•••• {last4}"), expiry ("Exp {mm/yy}"), and a remove affordance.

## Ordering & derivation of raw data
- **Render branch:** if loading → skeleton; else if `noSavedCards` → empty state; else → the list. Never render an empty list with no message.
- **Delete flow:** opening the modal does not delete; the request fires only on explicit confirm. On success, remove the row (with an optional exit animation) and decrement the count; reaching zero cards swaps to the empty state. On error, keep the card and surface a retry/close.

## Conditional render rules
- **Unauthenticated:** redirect away; loader while user resolves.
- **Exactly one** of loading / empty / list renders at a time.
- **Confirm-delete modal:** mounted only while a deletion is being confirmed; mobile uses a bottom sheet, desktop a centered dialog.

## UI components to build
Roles: **Box, Text, Icon, Button/Link**, **SavedCardsHeader** (title + count), **CardRow** (brand icon + masked last-4 + expiry + remove), **CardList**, **EmptyState** ("no saved cards"), **DeleteCardModal** / **DeleteCardSheet** (confirm + cancel), **SkeletonLoader** (card-row skeleton).

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button/Modal, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **Modal/Sheet, Button, EmptyState, SkeletonLoader** are reused by profile and settings — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered single column under the account shell, content max width ~48–55rem.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** card rows ~12px.
- **Type:** header title ~18px medium; count ~14px muted; masked number ~15–16px; expiry ~13–14px muted.
- **Color:** neutral surfaces; brand network icon in its own color; the remove action in a destructive treatment; one primary brand accent elsewhere; WCAG AA contrast.
- **Empty/loading:** centered empty state with icon + message; skeleton rows match the card-row height; deletion may animate the row out.

## Field mappings & fallbacks
- card `network`/`last4`/`expiry` → CardRow; missing brand → generic card icon.
- `isLoading` → skeleton; `noSavedCards` → empty state; else → list.
- delete success → remove row + update count (→ empty at zero); delete error → keep row + retry/close.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable feed disables its section.
- [ ] **Auth gate** correct: unauthenticated → redirect; loader while user resolves; page private/not indexable.
- [ ] **PCI** respected: only tokenized network + last-4 + expiry shown; deletion operates on the token/id; no full PAN/CVV anywhere.
- [ ] **Render branch** correct: exactly one of loading skeleton / empty state / card list renders; no empty list without a message.
- [ ] **Delete flow** correct: confirm-delete modal/sheet; request fires only on confirm; success removes the row + updates count (→ empty at zero); error keeps the card with retry/close.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; Modal/Button/EmptyState reusable across profile and settings.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
