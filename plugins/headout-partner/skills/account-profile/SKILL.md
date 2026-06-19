---
name: account-profile
description: Build the logged-in account/profile hub for an experiences/tickets storefront — the page reached at /profile (and /profile/{tab}) where a signed-in guest sees their bookings list, account credits/wallet, and account-management entry points (settings, saved cards, reset password, sign out). Self-contained spec — auth gating + redirect, the tabbed section model (bookings / credits / reset-password), the account header (avatar + name + email + menu), bookings empty/loading states, conditional-render rules, UI components, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Account / Profile Hub

Build the **Profile** hub — `/profile` and `/profile/{tab}`. A signed-in guest uses it to **see their bookings, view their credits/wallet, and reach account management** (settings, saved cards, reset password, sign out). The page is a **two-area shell**: an account header/menu (identity + navigation) and a **tab-driven content area** whose body switches with the URL tab. It is **auth-gated** — an unauthenticated visitor is redirected away. This file is the **single source of truth**: auth gating, the tab model, the account header, the bookings/credits bodies, empty/loading states, conditional rules, the components to build, and the visual language. Render under **your own brand and content**.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "current user profile, my bookings list, account credits/wallet balance, sign out" })`, then read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit/disable its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the account header, menu, and booking-list card are reused by settings/saved-cards — build them shared).
3. **Assemble** the header + tab area, wiring **auth gating** and the **tab model** exactly.

## Page-level guards
- **Auth gate:** resolve the current user first. If not signed in, **redirect to the home page** (do not render an empty profile). Show a brand loader while the user resolves.
- **Tab resolution:** the active tab comes from the URL (`/profile/{tab}`). An unknown/missing tab → normalize to the default **bookings** tab (replace the URL so it is canonical).
- This page is **private** — **not indexable**; emit no SEO body.

## Data sources (map to your endpoints)
- **Current user:** display name, email, avatar/initials, sign-in state.
- **My bookings:** the guest's bookings list (upcoming/past), each linking to its manage-booking/voucher view; includes an **empty** state and a **loading** state.
- **Credits / wallet:** balance + ledger entries (when the program exists); a non-logged-in/empty note when there are none.
- **Account actions:** sign out; entry points to settings, saved cards, and reset password.

## Canonical section order (top → bottom)
1. **Account header** — avatar/initials + name + email, and the account menu (Bookings, Credits, Saved cards, Settings, Sign out).
2. **Tab content area** — switches by active tab:
   - **Bookings (default):** the bookings list (with loading + empty states).
   - **Credits:** the credits/wallet balance + entries (or an empty/not-eligible note).
   - **Reset password:** the password-reset form (when the account type supports it).
3. **Sign out** — available from the menu; clears the session and returns to home.

## Ordering & derivation of raw data
- **Tab → body:** render the body for the active tab only; default to bookings when the tab is unknown.
- **Bookings list:** order upcoming first, then past; each row/card shows product, date, status, and links into manage-booking/voucher. No bookings → empty state with a "browse experiences" CTA.
- **Credits:** show balance + entries; not eligible / none → a muted note.
- **Menu active state:** highlight the menu item matching the active tab.

## Conditional render rules
- **Unauthenticated:** redirect to home (no profile shell). Loader while the user resolves.
- **Credits tab:** only when the wallet/credits program exists for this partner; otherwise omit the menu item.
- **Reset-password tab:** only for account types that allow password reset.
- **Empty / loading:** bookings and credits each render explicit skeleton (loading) and empty states.

## UI components to build
Roles: **Box, Text, Icon, Image/Avatar, Button/Link**, **AccountHeader** (avatar + name + email), **AccountMenu** (nav items with active state), **BookingListCard** (product + date + status + link) + **BookingList** (with empty + loading states), **CreditsPanel** (balance + entries + empty note), **ResetPasswordForm**, **SignOutAction**, **SkeletonLoader**, **EmptyState** (icon + message + CTA).

**Step A — reuse an existing design system first.** Search the partner repo for one (a `design-system/` or `ui/` folder, an exported Box/Text/Button, a Panda/Tailwind/theme-tokens file). If found, **map each role to the partner's component and tokens — build no new primitives.**

**Step B — otherwise build into the shared `ui-components/` folder** per the visual language. The **AccountHeader, AccountMenu, Button, EmptyState, SkeletonLoader** are reused by settings and saved-cards — build them shared. Keep any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Shell:** centered, content max width ~55–75rem. Desktop: header/menu on the left or top, content beside/below; mobile: header + menu stacked above the content.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. **Radius:** cards ~12px; avatar circular.
- **Type:** name ~18–20px medium; email ~14px muted; section/menu labels ~14–16px; booking card titles ~16px.
- **Color:** neutral surfaces; one primary brand accent for the active menu item / links / CTAs; muted grey secondary text; status badge tinted by state; WCAG AA contrast.
- **Empty/loading:** centered empty state with an icon + message + primary CTA; skeleton rows sized to the booking cards.

## Field mappings & fallbacks
- user `name`/`email`/`avatar` → AccountHeader; no avatar → initials.
- bookings list → BookingList; empty → EmptyState; loading → skeleton.
- credits balance/entries → CreditsPanel; none/not-eligible → muted note (or omit the tab).
- active tab from URL → AccountMenu active item + body; unknown → bookings.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds; any unfulfillable feed disables its section.
- [ ] **Auth gate** correct: unauthenticated → redirect to home (no empty shell); brand loader while user resolves; page is private/not indexable.
- [ ] **Tab model** correct: active tab from `/profile/{tab}`; unknown tab normalized to bookings (URL replaced); menu highlights the active item.
- [ ] Bookings list renders with explicit loading (skeleton) and empty (CTA) states; rows link into manage-booking/voucher; upcoming ordered before past.
- [ ] Credits tab only when the program exists; reset-password tab only when supported; sign out clears session and returns home.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language; AccountHeader/AccountMenu/EmptyState reusable across settings and saved-cards.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
