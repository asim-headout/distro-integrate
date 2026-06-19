---
name: page-search
description: Build a Search results page for an experiences/tickets storefront — results for a free-text query, optionally scoped to a city. Self-contained spec — result-zone order, how results get ranked/filtered/paginated, city/subcategory filters, the empty/loading states, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Search Results Page

Build the search results page — what a user sees after submitting a query (optionally scoped to a city via a context param). Results are organized into **zones**: in-context products (with filters), then worldwide products, then matching collections. This file is the **single source of truth**: page structure, the data each zone needs, how to rank/filter/paginate results, when to show/hide each zone, the components to build, and the visual language. Render under **your own brand and content**. Build only what is listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "search products by query, search filters city subcategory, search collections" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'search|product|collection|filter' /" })` and read the spec). Otherwise map each feed below to your endpoints.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the ranking and conditional rules.

## Page-level guards
- Read the query from `?q=` and an optional context city from `?c=`. **Empty/missing query → render the empty-results state** (not a 404).
- **Search mode is auto-detected:** if a valid context city is provided AND it returns results → mode = **city**; otherwise mode = **worldwide** (which surfaces the worldwide product carousel). An invalid context city → treat as worldwide.
- Search is **client-driven**: re-run on query change, filter change, or language change.

## Data sources (map to your endpoints)
- **Search products:** ranked product card list for the query (+ context city / filters). Returns a pre-ranked id list → resolve each to a card.
- **Search filters:** available **city** and **subcategory** facets for the current query (each facet's option list).
- **Search collections:** collections matching the query.

## Canonical section order (top → bottom)
1. Prefilled search bar (shows the current query, with a clear control; on mobile this is at the top of the page)
2. Heading ("Showing top results", city-contextual when a context city is set)
3. Filter bar (city + subcategory filters) — shown when there are enough results OR a filter is active
4. Product results grid (the main zone) — with a **"Show more"** pagination control
5. Worldwide products (carousel) — only when mode ≠ city and results exist
6. Matching collections (carousel) — only when collections exist

## Ordering & derivation of raw data
- **Result ranking:** results come back **pre-ranked by relevance** — preserve that order. **No sort dropdown and no client re-sort.**
- **Pagination:** load an initial page (~20 products) and expose a **"Show more"** that expands by another page; applies to the main product grid.
- **Filters:** sourced from the search response's facet lists (city + subcategory). **Hide a facet that has no options.** Selecting filters re-fires the main product zone only (not the carousels), and syncs the selection to the URL. Provide a **reset** that clears all active filters.
- **City filter:** show the city facet when there is no context city, or when mode = worldwide.

## Conditional render rules
- **Initial load:** show a brand loader while the search mode is still being determined (first fetch in flight).
- **Filter bar:** render when results are plentiful (≈ ≥ 10) OR a filter is active.
- **Worldwide carousel:** render only when mode ≠ city and it has results.
- **Collections carousel:** render only when it has results.
- **No results:** when all zones have loaded empty → render a dedicated **"no results found"** state.
- **Error:** on a search API failure → render an error state (device-appropriate).
- **Empty state per zone:** any zone that returns empty → omit that zone (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **SearchInput** (prefilled, clearable), **ProductCard**, **ProductGrid**, **FilterBar** (city + subcategory facets + reset), **CollectionCard**, **EmptyState** ("no results"), **ErrorState**, **SkeletonLoader/BrandLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reuse anything already built):
- **SearchInput:** prominent rounded input prefilled with the active query, a clear control, and a search icon; submitting re-runs the search.
- **FilterBar:** city + subcategory facets (pills/dropdowns), multi-select, with a reset; hides facets that have no options.
- **EmptyState:** a centered "no results found" message with a prompt to adjust the query/filters.
- **ErrorState:** a centered error message with a retry affordance.
- **ProductCard:** use the **`ui-product-card`** skill (`/ui-product-card`) for the pixel-exact spec — `17.625rem` / `17rem` fixed width, `radius.8` (8px) image corners, 3px hover lift, image carousel with dots + arrows on hover, L1 badge (top-left, 4px radius), and price block. Build into `ui-components/ProductCard/` once; reuse on every listing page.
- Reuse **Carousel, ProductGrid, CollectionCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px.
- **Radius:** cards/inputs ~12px; pills/filters ~999px.
- **Type hierarchy:** heading = ~24–28px desktop / ~20px mobile; card titles ~16px; price/captions ~14px. One sans-serif family.
- **Search bar:** prominent and full-width; clear affordance visible when there's a query.
- **Product grid:** ~3–4 columns desktop, ~2 mobile; product image taller than wide.
- **Carousels (worldwide, collections):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Heading:** "Showing top results" (+ city name when a context city is set).
- **Product card:** name, image, lead price (`from {amount}`), city, rating.
- **Collection card:** title + image; link to the collection.
- **Loading:** brand loader during mode detection; skeletons sized to the final card afterwards.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Query read from the URL; empty query → empty-results state (not 404); mode auto-detected (city vs worldwide).
- [ ] Zones render in canonical order; results preserve relevance ranking (no sort dropdown, no client re-sort).
- [ ] Filter bar shown when results are plentiful or a filter is active; facets with no options hidden; reset clears filters; filter change re-fires the main zone only.
- [ ] "Show more" pagination on the main grid; worldwide carousel only when mode ≠ city; collections carousel only when non-empty.
- [ ] Brand loader during initial fetch; dedicated no-results and error states.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
