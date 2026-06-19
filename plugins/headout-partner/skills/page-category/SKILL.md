---
name: page-category
description: Build a Category landing/listing page ("{Category} in {city}", e.g. "Museums in Paris") for an experiences/tickets storefront. Self-contained spec — section order, how the product list gets ordered/filtered/paginated, the subcategory filter + sort controls, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Category Page

Build a category listing page — a themed list of experiences for one top-level category within a city (e.g. "Museums in {city}", "Tickets in {city}"), reached from a city page or browse-by-theme. The **product list is the core**, framed by a subcategory filter, popular collections, and supporting content. This file is the **single source of truth**: page structure, the data each section needs, how to order/filter/paginate the list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "products by category, subcategory filters, collections by city, categories, reviews, nearby cities" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'category|product|collection|filter' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the category by id/slug **and** resolve the city context first. Unknown category or unresolved city → 404 (not a partial shell).
- If the slug doesn't match the category's canonical slug for the active language → 301 redirect to canonical.
- A category may be a **"ticket" category** (single-attraction style) — this flag toggles a couple of conditional sections (sticky subcategory carousel + per-subcategory section stacks); the skeleton is otherwise shared.

## Data sources (map to your endpoints)
- **Category detail:** `displayName`, canonical `urlSlug` per language, optional `ratingsInfo.showRatings`. Drives header + redirects.
- **Products by category:** server-ranked product card list for the category; accepts `sort` and `subCategoryIds` params. Returns an ordered id list → resolve each to a card.
- **Subcategory filters:** the list of subcategories under this category (used as the filter facet + as section headings for ticket categories).
- **Collections by city:** popular collections list (for the "popular collections" row).
- **Reviews / nearby cities / blog posts / long-form CMS content:** supporting feeds for the city/category.

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › {category}`)
2. Header (category title; optional reviews/ratings badge)
3. Subcategory carousel (tabs/pills linking to subcategory sections; sticky for ticket categories)
4. Popular collections (carousel) — only if ≥ 2 collections
5. Top experiences (product grid) — with a **sort control** + **subcategory multi-select filter** above it
6. Per-subcategory sections (ticket categories only — a stack of per-subcategory product carousels)
7. Get inspired (blogs)
8. Reviews
9. Nearby cities (city cards carousel)
10. Long-form content (SEO body + FAQ)

## Ordering & derivation of raw data
- **Product list order:** server-ranked. The list is re-fetched with the chosen `sort` and `subCategoryIds`; **preserve the returned order** (do not client re-sort beyond firing a new fetch with the sort param).
- **Sort control:** a dropdown of server-supported sorts (e.g. popularity, rating). Changing it re-fetches; reflect the active sort in the URL. Treat non-default sort/filter URLs as **noindex**.
- **Pagination:** fetch an initial page (~8 desktop / ~4 mobile; ~2× for crawler/bot requests) and expose a **"Show more"** that fetches the next offset. No client-side hard cap.
- **Subcategory filter:** show the first ~5 subcategories as pills and the rest in a dropdown (a drawer on mobile). **Hide the filter entirely if fewer than 3 subcategories exist.** Selecting subcategories re-fetches the grid with `subCategoryIds`; show a loading skeleton during the re-fetch.
- **Popular collections:** render only if ≥ 2 collections.
- **Per-subcategory sections:** ticket categories only; lazy-mount each subcategory's carousel; cap the initial number of sections (more for bots).

## Conditional render rules
- **Header ratings badge:** show only if the category exposes `showRatings`.
- **Subcategory carousel:** sticky for ticket categories; standard otherwise; hide if there are no subcategories.
- **Top experiences:** render the grid; if zero products resolve, render an empty grid (no placeholder copy). Show a skeleton during initial load and during filter/sort re-fetch.
- **Popular collections / reviews / nearby cities / blogs:** self-hide when their feed is empty (blogs also language-gated).
- **Crawler/bot:** server-render the long-form content (HTML + FAQ blocks) and a larger initial product page for indexing; real users lazy-load below-fold sections client-side.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **RatingBadge**, **SubcategoryTabs** (pills/links, sticky variant), **ProductCard**, **ProductGrid**, **SortDropdown**, **MultiSelectFilter** (pills + dropdown/drawer), **CollectionCard**, **PoiInfoSection**, **ReviewCard**, **FaqAccordion**, **CityCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **SubcategoryTabs:** horizontal row of subcategory pills/links; a sticky variant that anchors to per-subcategory sections.
- **ProductGrid:** responsive grid of product cards with a "Show more" pagination control beneath.
- **SortDropdown:** a small dropdown of server-supported sort options; selecting re-fetches.
- **MultiSelectFilter:** first few facets as pills + the rest in a dropdown (drawer on mobile); multi-select; reflects active count.
- Reuse **Breadcrumb, Carousel, ProductCard, CollectionCard, ReviewCard, FaqAccordion, CityCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = ~24–28px desktop / ~20px mobile; card titles ~16px; price/captions ~14px. One sans-serif family.
- **Product grid:** ~3–4 columns desktop, ~2 mobile; product image taller than wide.
- **Filter/sort bar:** pills + a sort dropdown above the grid; active pill uses the primary accent.
- **Carousels (collections, nearby cities):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** category `displayName`; ratings badge only when `showRatings`.
- **Product card:** name, image, lead price (`from {amount}`), rating.
- **Collection card:** title + image; link to the collection.
- **Review card:** reviewer name, rating, date, text; media thumbnails only when present.
- **Loading:** skeletons sized to the final card/grid.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Category + city resolved first; unknown → 404; non-canonical slug → 301 redirect.
- [ ] Sections render in canonical order; only the sections listed above are built.
- [ ] Product list server-ranked; sort dropdown + subcategory multi-select re-fetch and preserve returned order; non-default sort/filter URLs marked noindex.
- [ ] Subcategory filter hidden when < 3 subcategories; popular collections only when ≥ 2.
- [ ] "Show more" pagination; larger initial page + server-rendered long-form for bots.
- [ ] Ticket-category sticky carousel + per-subcategory sections behave correctly; empty feeds omit their section.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
