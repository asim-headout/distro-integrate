---
name: page-tours-by-city
description: Build an "All experiences in {city}" page for an experiences/tickets storefront — the full catalog of every product in a city (the "see all tours/experiences" listing). Self-contained spec — section order, how the product list gets ordered/paginated, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Tours-by-City (All Experiences) Page

Build the "All experiences in {city}" page — the complete product catalog for one city, reached from a "See all experiences" link on the city page. The **product grid is the core**, with a result count, framed by popular attractions. It is a **city-wide list with no category/subcategory scoping and no facet filter** — just the grid + "Show more". This file is the **single source of truth**: page structure, the data each section needs, how to order/paginate the list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "products by city, collections by city" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'product|collection|city' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): normalize images; ProductCard uses customer selling price (`headoutSellingPrice`), never `netPrice`, and derives optional cancellation pills from policy data.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (most are shared with the category page — reuse them).
4. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the city context first (by `code`). Unresolved city → 404 (not a partial shell). (The cities feed has no `urlSlug`, so there is no canonical-slug redirect.)

## Data sources (map to your endpoints)
- **City detail:** `name`. Drives the header.
- **Products by city:** product list scoped to `cityCode` for the whole city. The product list has **no `sort` param**, so render the API's default order. Returns an ordered id list → resolve each to a card; offset/limit pagination; exposes a `total` count.
- **Collections by city:** collections list scoped to `cityCode` (for the "popular attractions" row).

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › All experiences in {city}`)
2. Header (an h1 like "All experiences in {city}")
3. Popular attractions (carousel) — only if ≥ 3 collections
4. Count bar (a result count) directly above the grid
5. Product grid — with a **"Show more"** pagination control; a dedicated empty state when zero products resolve

## Ordering & derivation of raw data
- **Product list order:** the API's default order — **there is no `sort` param, so do not build a sort control and do not client re-sort.**
- **Pagination:** fetch an initial page (~12 products; ~2× for crawler/bot requests) and expose a **"Show more"** that fetches the next offset. No client-side hard cap.
- **Popular attractions:** render only if ≥ 3 collections.
- **No facet filter and no subcategory carousel** on this page — the list is the entire city catalog.

## Conditional render rules
- **Popular attractions:** self-hide when fewer than 3 collections.
- **Product grid:** render the grid; if zero products resolve, render a dedicated **"no experiences found"** empty state. Show a skeleton during initial load.
- **Crawler/bot:** render a larger initial product page for indexing; real users lazy-load below-fold sections client-side.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **CollectionCard**, **ProductCard**, **ProductGrid**, **ResultCount**, **EmptyState** ("no experiences found"), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder.** Reuse everything already built for the category page (**ProductGrid, Breadcrumb, Carousel, ProductCard, CollectionCard, EmptyState, Box/Text/Icon/Image, SkeletonLoader**). The only addition here: a **ResultCount** label above the grid. There is **no SortDropdown, no SubcategoryFilter, and no SubcategoryTabs** on this page.
- **ProductCard:** use the **`ui-product-card`** skill (`/ui-product-card`) for the pixel-exact spec — `17.625rem` / `17rem` fixed width, `radius.8` (8px) image corners, 3px hover lift, image carousel with dots + arrows on hover, L1 badge (top-left, 4px radius), and price block. Build into `ui-components/ProductCard/` once; reuse on every listing page.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = ~24–28px desktop / ~20px mobile; card titles ~16px; price/captions ~14px. One sans-serif family.
- **Product grid:** ~3–4 columns desktop, ~2 mobile; product image taller than wide.
- **Count bar:** result count above the grid.
- **Carousel (popular attractions):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** "All experiences in {city}" using the city `name`.
- **Product card:** name, normalized image, lead price (`from {headoutSellingPrice}` / mapped selling price), rating, optional `originalPrice` strike-through, optional derived cancellation pill.
- **Collection card:** title + image; link to the collection.
- **Count:** total products for the city (e.g. "{n} experiences"), from the product list `total`.
- **Loading:** skeletons sized to the final card/grid.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] City resolved first; unknown → 404.
- [ ] Sections render in canonical order; only the sections listed above are built (no facet filter, no subcategory carousel, no sort control).
- [ ] Product list rendered in the API's default order (no sort control, no client re-sort).
- [ ] "Show more" pagination (larger initial page for bots); popular attractions only when ≥ 3 collections.
- [ ] Zero products → dedicated empty state; empty feeds omit their section.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
