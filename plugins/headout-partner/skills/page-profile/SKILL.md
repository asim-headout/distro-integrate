---
name: page-profile
description: Build the user Profile / Account page for an experiences/tickets storefront — an auth-gated account menu (greeting, reservations, locale/currency, wallet, saved cards, account settings, help & legal, sign out) plus its sub-routes. Self-contained spec — section order, the logged-in vs logged-out states, auth guard, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Profile / Account Page

Build the account page — the hub a signed-in user reaches from the header avatar. It is a **settings/account menu** (not a dashboard): a greeting, links to reservations and preferences, wallet balance, saved cards, account settings, help & legal, and sign-out. When signed out it becomes an inline **login surface**. This file is the **single source of truth**: page structure, the data each item needs, the auth guard, when to show/hide each item, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "current user profile, wallet credits balance, saved cards, bookings list, account deletion" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'user|profile|card|booking|wallet' /" })` and read the spec). Otherwise map each feed below to your endpoints.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the auth guard and conditional rules.

## Page-level guards
- **Auth state** is determined from a signed-in cookie/flag plus the resolved current-user object.
- **Signed out:** on a compact/mobile layout, render the account menu's **logged-out state** with an inline login surface (OAuth + email); on a wide/desktop layout, **redirect to home** (or your login route) rather than rendering a shell.
- **While the user object is loading:** render a loading indicator in the header (do not flash the logged-out state).
- **Removed/unavailable sub-pages:** any account sub-route you don't implement → redirect to home.

## Data sources (map to your endpoints)
- **Current user:** `firstName`, `email`, avatar, wallet/credits balance, preferred currency/language. Drives the header + menu values.
- **Saved cards:** the user's stored payment methods (+ count).
- **Reservations / bookings:** the user's bookings list (upcoming + past), if you support a bookings view.
- **Locale options:** supported languages + currencies for the picker.

## Canonical section order (top → bottom)
1. Header — **signed in:** avatar + first name + email; **signed out:** a welcome/login banner with inline login (OAuth + email); **loading:** a spinner.
2. Section label ("My account" when signed in / "Settings" when signed out)
3. Account items (signed-in):
   - Reservations (link to the bookings list)
   - City / location picker
   - Language selector (shows current language)
   - Currency selector (shows current currency)
   - Wallet / credits (shows formatted balance)
   - Saved cards (shows a count; compact layout)
   - Account settings (compact layout)
4. Help (chat + FAQ links)
5. Legal (privacy policy + terms of use)
6. Sign out (signed-in) / brand + social footer (signed-out)

### Sub-routes
- `/profile/saved-cards` — saved payment methods (loading skeleton → list, or an empty state).
- `/profile/account-settings` — account management, including a confirm-modal account-deletion flow that signs the user out and routes to a success page.
- `/profile/reset-password` (or equivalent) — old / new / confirm-new password form.
- `/profile/reservations` (if supported) — bookings list (see ordering below).

## Ordering & derivation of raw data
- **Account items:** render in the fixed order above. **Wallet, saved cards, and account settings items appear only when signed in.**
- **Locale pickers:** language/currency open a modal/sheet listing supported options; reflect the active value on the menu row. Skip a language option that isn't in the supported list.
- **Saved cards:** show the count on the menu row; the sub-page shows a skeleton while loading, then the list, or an empty state when there are none.
- **Reservations (if supported):** order **most recent first**, optionally split **upcoming vs past**; each booking card shows experience name, date/time, status, and a ticket-access affordance; paginate long lists.

## Conditional render rules
- **Signed in:** show the full account menu + sign-out; hide the login banner.
- **Signed out:** show the login banner + inline login; hide reservations, wallet, saved cards, account settings, and sign-out; show the brand/social footer.
- **Loading:** header spinner while the user object resolves.
- **Currency row:** if there's no resolved location/currency context, omit the currency row (language row may still render).
- **Empty states:** saved cards empty → "no saved cards" message; reservations empty → an empty-bookings message.
- **Sub-route guards:** unimplemented account sub-routes → redirect to home.

## UI components to build
Roles: **Box, Text, Icon, Image**, **AvatarGreeting** (avatar + name + email), **LoginPanel** (OAuth + email buttons), **SectionLabel**, **AccountMenuItem** (label + right value/count/chevron, link wrapper), **WalletBalance**, **LocalePickerModal** (language + currency tabs), **SavedCardsList** (+ empty state), **BookingCard** (if reservations supported), **PasswordForm**, **ConfirmModal/BottomSheet** (account deletion), **EmptyState**, **SkeletonLoader/Spinner**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reuse anything already built):
- **AvatarGreeting:** circular avatar + first name + email; falls back to initials when there's no image.
- **LoginPanel:** OAuth provider buttons + an email login entry; inline (no full-page redirect).
- **AccountMenuItem:** a row with a left label, an optional right value/count, and a trailing chevron; the whole row is a link.
- **LocalePickerModal:** a modal/sheet with language and currency tabs; selecting updates the active value.
- **PasswordForm:** old / new / confirm-new fields with required + match validation and inline errors.
- **ConfirmModal/BottomSheet:** a destructive-action confirmation (e.g. account deletion) with cancel/confirm.
- Reuse **Box/Text/Icon/Image, SkeletonLoader, EmptyState** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
- **Radius:** cards/inputs/sheets ~12px; avatar fully round.
- **Type hierarchy:** name = ~18–20px bold; section labels = ~14px uppercase/muted; menu labels ~16px; values/captions ~14px. One sans-serif family.
- **Layout:** compact/mobile = a single-column menu list with full-width rows; wide/desktop = a focused content panel (e.g. password form) with an optional side rail.
- **Menu rows:** left label + right value/chevron; subtle divider between rows; touch-friendly height.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; a destructive accent for delete actions; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** `firstName` + `email` + avatar; initials fallback when no avatar.
- **Wallet row:** formatted balance in the user's currency; omit/zero-state when no balance.
- **Saved cards row:** count; "no saved cards" empty state on the sub-page.
- **Booking card (if supported):** experience name, date/time, status, ticket access.
- **Loading:** header spinner; skeletons sized to the final list/row.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Auth state from cookie/flag + user object; signed-out = inline login (compact) / redirect (wide); loading = header spinner (no logged-out flash).
- [ ] Sections render in canonical order; wallet/saved-cards/account-settings/sign-out appear only when signed in.
- [ ] Locale pickers reflect and update the active language/currency; currency row omitted with no context.
- [ ] Sub-routes (saved cards, account settings + deletion, password reset, reservations) behave with loading/empty/guard states; unimplemented sub-routes redirect home.
- [ ] Reservations (if supported) most-recent-first with upcoming/past split and paginated; empty states handled.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
