---
name: page-subcategory
description: Build a Subcategory listing page (a narrower listing under a category, e.g. "Modern art museums in {city}") for an experiences/tickets storefront. Self-contained spec — section order, how the product list gets ordered/paginated, sibling-subcategory navigation, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Subcategory Page

Build a subcategory listing page — a narrower themed list of experiences nested under a category within a city (e.g. "Modern art museums in {city}"), reached from a category page or browse-by-theme. It is the **same skeleton as the category page** with two differences: there is **no subcategory filter** (the products are already scoped to this one subcategory) and the subcategory carousel links to **sibling subcategories** instead of acting as a filter. This file is the **single source of truth**: page structure, the data each section needs, how to order/paginate the list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "products by subcategory, sibling subcategories, collections by city, reviews, nearby cities" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'subcategory|product|collection' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (most are shared with the category page — reuse them).
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the subcategory by id/slug **and** the city context first. Unknown subcategory or unresolved city → 404 (not a partial shell).
- If the slug doesn't match the subcategory's canonical slug for the active language → 301 redirect to canonical.

## Data sources (map to your endpoints)
- **Subcategory detail:** `displayName`, parent category link, canonical `urlSlug` per language, optional `ratingsInfo.showRatings`. Drives header + redirects.
- **Products by subcategory:** server-ranked product card list; accepts a `sort` param. Returns an ordered id list → resolve each to a card.
- **Sibling subcategories:** the other subcategories under the same parent category (for the navigation carousel).
- **Collections by city / reviews / nearby cities / blogs / long-form CMS content:** supporting feeds.

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › {category} › {subcategory}`)
2. Header (subcategory title; a back-link to the parent category on mobile; optional reviews/ratings badge)
3. Sibling-subcategory carousel (links to sibling subcategories)
4. Popular collections (carousel) — only if ≥ 2 collections
5. Top experiences (product grid) — with a **sort control** (no subcategory filter; the list is already scoped)
6. Get inspired (blogs)
7. Reviews
8. Nearby cities (city cards carousel)
9. Long-form content (SEO body + FAQ)

## Ordering & derivation of raw data
- **Product list order:** server-ranked; re-fetched with the chosen `sort` (preserve returned order — no client re-sort beyond firing a new fetch). Treat non-default sort URLs as **noindex**.
- **Pagination:** initial page (~8 desktop / ~4 mobile; ~2× for crawler/bot requests) + a **"Show more"** that fetches the next offset; no client-side hard cap.
- **No subcategory filter:** products are already scoped to this subcategory; navigate to siblings via the carousel, not via a filter.
- **Popular collections:** render only if ≥ 2 collections.

## Conditional render rules
- **Header ratings badge:** show only if the subcategory exposes `showRatings`; on mobile, hide ratings for non-ticket categories and show the parent-category link for ticket categories.
- **Top experiences:** render the grid; if zero products resolve, render an empty grid (no placeholder copy). Show a skeleton during initial load and during sort re-fetch.
- **Popular collections / reviews / nearby cities / blogs:** self-hide when their feed is empty (blogs also language-gated).
- **Crawler/bot:** server-render the long-form content (HTML + FAQ blocks) and a larger initial product page for indexing; real users lazy-load below-fold sections client-side.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **RatingBadge**, **SubcategoryTabs** (sibling links), **ProductCard**, **ProductGrid**, **SortDropdown**, **CollectionCard**, **ReviewCard**, **FaqAccordion**, **CityCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder.** Reuse everything already built for the category page (**ProductGrid, SortDropdown, SubcategoryTabs, Breadcrumb, Carousel, ProductCard, CollectionCard, ReviewCard, FaqAccordion, CityCard, Box/Text/Icon/Image, SkeletonLoader**). The only behavioral difference: **SubcategoryTabs links to sibling subcategories** rather than filtering, and there is **no MultiSelectFilter** on this page.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = ~24–28px desktop / ~20px mobile; card titles ~16px; price/captions ~14px. One sans-serif family.
- **Product grid:** ~3–4 columns desktop, ~2 mobile; product image taller than wide.
- **Carousels (siblings, collections, nearby cities):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** subcategory `displayName`; parent-category back-link; ratings badge only when `showRatings`.
- **Product card:** name, image, lead price (`from {amount}`), rating.
- **Collection card:** title + image; link to the collection.
- **Loading:** skeletons sized to the final card/grid.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Subcategory + city resolved first; unknown → 404; non-canonical slug → 301 redirect.
- [ ] Sections render in canonical order; only the sections listed above are built.
- [ ] Product list server-ranked; sort dropdown re-fetches and preserves returned order; non-default sort URLs marked noindex; no subcategory filter rendered.
- [ ] Sibling-subcategory carousel navigates (not filters); popular collections only when ≥ 2.
- [ ] "Show more" pagination; larger initial page + server-rendered long-form for bots.
- [ ] Empty feeds omit their section; UI primitives reuse the category-page components.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
