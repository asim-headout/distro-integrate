---
name: page-places-to-visit
description: Build a "Places to Visit in {city}" page for an experiences/tickets storefront — a simple, server-ordered directory of the city's curated collections (landmarks, neighborhoods, attractions worth visiting). Self-contained spec — section order, how the collection list gets ordered/capped, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Places to Visit Page

Build the "Places to Visit in {city}" page — a lightweight directory of the curated collections for one city, reached from a city page or footer link. It is the **simplest listing page**: a header and a single grid of collection cards, with no filter, no sort, and no pagination. The **collection grid is the whole page**. This file is the **single source of truth**: page structure, the data it needs, how to order/cap the list, when to show/hide each part, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "collections by city, city detail, places to visit" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'collection|city' /" })` and read the spec). Otherwise map the feed below to your endpoint.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (the collection card is shared with the home/city recipes — reuse it).
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the city context first (by `code`). Unresolved city → 404 (not a partial shell). (The cities feed has no `urlSlug`, so there is no canonical-slug redirect.)
- Emit SEO metadata: title, description, canonical, hreflang.

## Data sources (map to your endpoints)
- **City detail:** `code`, `name`. Drives the header.
- **Collections by city:** a server-ordered list of the city's collections; each resolves to a card (title, image, link). The order is editorial/server-ranked.

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › Places to visit in {city}`)
2. Page header (an h1 like "Places to visit in {city}")
3. Collection grid (responsive grid of collection cards)

## Ordering & derivation of raw data
- **List order:** server-ranked; **preserve the returned order** — no client re-sort, no sort dropdown, no filter.
- **Cap:** request up to a fixed maximum (~100 collections) and render them all on one page; no paginator.

## Conditional render rules
- **Empty result:** city resolves but has zero collections → render an empty grid (no placeholder copy); the page itself still renders its header.
- **Loading:** show a single page-level loader (or grid skeleton) while the view mounts; no per-section skeletons needed for this simple grid.

## UI components to build
Roles: **Box, Text, Icon, Image**, **Breadcrumb**, **SectionHeader** (h1), **CollectionCard**, **CollectionGrid**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reuse anything already built):
- **CollectionGrid:** responsive grid of collection cards.
- Reuse **CollectionCard, Breadcrumb, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes (e.g. the collection card from the home/city recipes).

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
- **Radius:** cards ~12px.
- **Type hierarchy:** page title = ~24–28px desktop / ~20px mobile; card titles ~16px. One sans-serif family.
- **Grid:** ~3–4 columns desktop, ~2 mobile; collection image landscape (~4:3).
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** "Places to visit in {city}" using the city `name`.
- **Collection card:** title + image; link to the collection page.
- **Loading:** a page-level loader sized to the grid.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feed.
- [ ] City resolved first; unknown → 404.
- [ ] Sections render in canonical order; header + single collection grid, no filter/sort/pagination.
- [ ] List preserves server order (no client re-sort); capped at the fixed maximum.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
