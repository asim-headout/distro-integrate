---
name: page-collections-index
description: Build a Collections Index ("browse all collections") page for an experiences/tickets storefront — a paginated, alphabetically-filtered directory of every curated collection. Self-contained spec — section order, how the collection list gets ordered/filtered/paginated, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Collections Index Page

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build the browse-all-collections directory — the page reached from a "View all collections" link, listing every curated collection across the site with a simple alphabetical filter and pagination. The **collection grid is the whole page**. This file is the **single source of truth**: page structure, the data it needs, how to order/filter/paginate the list, when to show/hide each part, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Fetch `https://partner.headout.com/docs/llms.txt` and find the relevant endpoint sections for: collections list, visual sitemap, collections by filter.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** Map the feed below to your endpoint.
2. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): normalize collection images and preserve server/editorial order before any explicit alphabetical filter view.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
4. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- The page has a default view (all/top collections) and an optional **filter** segment in the URL (alphabetical range).
- If a filter resolves to **zero collections** → 404 (not an empty shell).
- Emit SEO metadata: title, description, canonical, hreflang, and pagination `rel=next`/`rel=prev` links when paginated.

## Data sources (map to your endpoints)
- **Collections list:** a server-ordered list of collections for the current filter; each resolves to a card (title, image, link). The order is editorial/server-ranked.

## Canonical section order (top → bottom)
1. Page header (an h1 like "Discover top things to do worldwide")
2. Filter tabs (a fixed set: a "Top" tab plus alphabetical ranges, e.g. A–E, F–K, L–P, Q–U, V–Z)
3. Collection grid (responsive grid of collection cards)
4. Pagination control — shown only when a filter is active AND there is more than one page

## Ordering & derivation of raw data
- **List order:** server-ranked; **preserve the returned order** — no client re-sort, no sort dropdown.
- **Filter tabs:** a fixed, hardcoded set (a default "Top" tab + alphabetical ranges). Each tab navigates via the URL filter segment and re-fetches the scoped list server-side.
- **Pagination:** the default/"Top" view shows everything on one page (no paginator). A filtered view paginates with a fixed page size (~100 per page); show the paginator only when the filtered result spans more than one page.

## Conditional render rules
- **Empty result:** a filter with no collections → 404 (no placeholder copy).
- **Pagination:** render the paginator only when `filter active && totalPages > 1`.
- **Loading:** show a single page-level loader while the view mounts; no per-section skeletons are required for this simple grid.
- **Empty state:** any feed that returns empty → 404 for a filtered view; the default view always has content.

## UI components to build
Roles: **Box, Text, Icon, Image**, **SectionHeader** (h1), **FilterTabs** (link tabs), **CollectionCard**, **CollectionGrid**, **Paginator**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reuse anything already built):
- **FilterTabs:** a horizontal row of link tabs (default + alphabetical ranges); the active tab uses the primary accent; each tab is an anchor that changes the URL.
- **CollectionGrid:** responsive grid of collection cards.
- **Paginator:** prev/next + numbered page navigation; renders only when needed.
- Reuse **CollectionCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes (e.g. the collection card from the home/city recipes).

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
- **Radius:** cards ~12px; tabs ~999px.
- **Type hierarchy:** page title = ~24–28px desktop / ~20px mobile; card titles ~16px. One sans-serif family.
- **Grid:** ~3–4 columns desktop, ~2 mobile; collection image landscape (~4:3).
- **Filter tabs:** a single scrollable row; active tab in the primary accent.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Collection card:** title + image; link to the collection page.
- **Loading:** a page-level loader sized to the grid.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] Default view loads all/top collections; filter segment scopes the list; zero results → 404.
- [ ] List preserves server order (no client re-sort, no sort dropdown).
- [ ] Fixed filter tabs (default + alphabetical ranges) navigate via URL and re-fetch server-side.
- [ ] Paginator shown only when a filter is active and there's more than one page; SEO rel=next/prev emitted when paginated.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
