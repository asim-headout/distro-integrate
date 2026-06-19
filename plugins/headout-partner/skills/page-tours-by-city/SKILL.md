---
name: page-tours-by-city
description: Build an "All experiences in {city}" page for an experiences/tickets storefront — the full, sortable catalog of every product in a city (the "see all tours/experiences" listing). Self-contained spec — section order, how the product list gets ordered/sorted/paginated, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Tours-by-City (All Experiences) Page

Build the "All experiences in {city}" page — the complete product catalog for one city, reached from a "See all experiences" link on the city page. The **product grid is the core**, with a sort control and a count, framed by popular attractions and supporting content. It is a **city-wide list with no category/subcategory scoping and no facet filter** — just sort + "Show more". This file is the **single source of truth**: page structure, the data each section needs, how to order/sort/paginate the list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "products by city, collections by city, blogs, things to do, long-form content" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'product|collection|city' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (most are shared with the category page — reuse them).
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the city context first (by slug/id). Unresolved city → 404 (not a partial shell).
- If the slug doesn't match the city's canonical slug for the active language → 301 redirect to canonical.
- Treat any **non-default sort URL as noindex**.

## Data sources (map to your endpoints)
- **City detail:** `displayName`, canonical `urlSlug` per language. Drives the header + redirects.
- **Products by city:** server-ranked product card list for the whole city; accepts a `sort` param. Returns an ordered id list → resolve each to a card. Exposes a total count.
- **Collections by city:** popular attractions/collections list (for the "popular attractions" row).
- **Blogs / things-to-do / long-form CMS content:** supporting feeds.

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › All experiences in {city}`)
2. Header (an h1 like "All experiences in {city}")
3. Popular attractions (carousel) — only if ≥ 3 collections
4. Sort + count bar (a result count + a sort control) directly above the grid
5. Product grid — with a **"Show more"** pagination control; a dedicated empty state when zero products resolve
6. Get inspired (blogs)
7. Things to do (supporting links)
8. Long-form content (SEO body + FAQ)

## Ordering & derivation of raw data
- **Product list order:** server-ranked. Re-fetched with the chosen `sort`; **preserve the returned order** (no client re-sort beyond firing a new fetch).
- **Sort control:** a dropdown of server-supported sorts — a default "recommended" plus options like popularity, price low→high, price high→low. The default sort is the canonical/indexable view; reflect the active sort in the URL and mark non-default sort URLs **noindex**.
- **Pagination:** fetch an initial page (~12 products; ~2× for crawler/bot requests) and expose a **"Show more"** that fetches the next offset. No client-side hard cap.
- **Popular attractions:** render only if ≥ 3 collections.
- **No facet filter and no subcategory carousel** on this page — the list is the entire city catalog, scoped only by sort.

## Conditional render rules
- **Popular attractions:** self-hide when fewer than 3 collections.
- **Product grid:** render the grid; if zero products resolve, render a dedicated **"no experiences found"** empty state. Show a skeleton during initial load and during sort re-fetch.
- **Blogs:** self-hide when empty; also language-gated (omit when not supported for the active language).
- **Things to do / long-form:** self-hide when their feed is empty.
- **Crawler/bot:** server-render the long-form content (HTML + FAQ blocks) and a larger initial product page for indexing; real users lazy-load below-fold sections client-side.
- **Empty state:** any supporting feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **CollectionCard**, **ProductCard**, **ProductGrid**, **SortDropdown**, **ResultCount**, **EmptyState** ("no experiences found"), **FaqAccordion**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder.** Reuse everything already built for the category page (**ProductGrid, SortDropdown, Breadcrumb, Carousel, ProductCard, CollectionCard, FaqAccordion, EmptyState, Box/Text/Icon/Image, SkeletonLoader**). The only additions here: a **ResultCount** label beside the sort control, and there is **no MultiSelectFilter and no SubcategoryTabs** on this page.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = ~24–28px desktop / ~20px mobile; card titles ~16px; price/captions ~14px. One sans-serif family.
- **Product grid:** ~3–4 columns desktop, ~2 mobile; product image taller than wide.
- **Sort + count bar:** count on the left, sort dropdown on the right, above the grid.
- **Carousel (popular attractions):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** "All experiences in {city}" using the city `displayName`.
- **Product card:** name, image, lead price (`from {amount}`), rating.
- **Collection card:** title + image; link to the collection.
- **Count:** total products for the city (e.g. "{n} experiences").
- **Loading:** skeletons sized to the final card/grid.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] City resolved first; unknown → 404; non-canonical slug → 301 redirect.
- [ ] Sections render in canonical order; only the sections listed above are built (no facet filter, no subcategory carousel).
- [ ] Product list server-ranked; sort dropdown re-fetches and preserves returned order; non-default sort URLs marked noindex.
- [ ] "Show more" pagination (larger initial page for bots); popular attractions only when ≥ 3 collections.
- [ ] Zero products → dedicated empty state; empty supporting feeds omit their section; blogs language-gated.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
