---
name: page-collection
description: Build a Collection page (a curated themed product list, e.g. "Top things to do in {city}" / an attraction's experiences) for an experiences/tickets storefront. Self-contained spec — section order, how the product list is ordered/pinned, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Collection Page

Build a collection landing page — a curated, themed list of experiences around an attraction or topic (e.g. "Top things to do in {city}", "{Attraction} Tickets"), reached from a city page or a discovery card. The **product list is the core**; everything else frames it. This file is the **single source of truth**: page structure, the data each section needs, how to order/pin the product list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "collections list, products by collection, categories by city" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'collection|product|categories' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the collection by id/slug. Fetch **collection basic info first** (it drives the city context and which loader runs).
- The collection object carries a `canonicalUrl`/`localeSpecificUrls`; if the requested slug doesn't match → 301 redirect to canonical.

## Data sources (map to your endpoints)
- **Collection detail:** `name`, `content.subtext`/`content.description` (description), `heroImage`/`cardImage` (each `{ url, type }`), `cityCode`, `canonicalUrl`. Drives the header. **Note:** the collection object carries **no ratings** and **no POI content** (no about / fun facts / highlights / opening hours), so those sections are not built on this page.
- **Products by collection:** product list scoped to `collectionId`, initial limit ~9. The product list has **no `sortType` param**, so render the API's default order. Ordered id list → resolve each to a card; offset/limit pagination.
- **Categories** (browse by theme): categories list for the city → flat category + subcategory list.

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › … › {collection}`)
2. Header / masthead (collection title + hero image + description with "read more")
3. Product list (the core)
4. Browse by theme (category / subcategory)
- A **sticky floating "View all experiences" CTA** scrolls to the product list; show it while the product list is off-screen.

## Ordering & derivation of raw data
- **Product list order:** the API's default order — **do NOT client re-sort and do NOT add a sort dropdown** (the product list has no sort param). Initial limit ~9; "Show more" fetches the next offset.
- **Highlight pinning:** if a valid product id arrives via a query/UTM param AND it belongs to this collection, **move that product to the front** (pinned card); otherwise leave order unchanged.
- **Browse by theme:** build a `Map<parentCategory, subcategory[]>` from the flat categories feed; render nothing if it has no entries.
- **Eager vs lazy:** render the first ~2 product cards eagerly; lazy-mount the rest and the below-fold section on scroll-into-view (reserved placeholder height to avoid layout shift).

## Conditional render rules
- **Header:** always shown. Hero media = `heroImage` (fall back to `cardImage`); a VIDEO type may render on desktop. Description (`content.subtext`) truncated (~146 chars) with "read more" (a bottom sheet on mobile). **No reviews/rating badge** (collections carry no ratings).
- **Product list:** render skeletons while loading; render nothing on error or zero products.
- **Browse by theme:** self-hide when the categories feed is empty.
- **Crawler/bot:** turn product card titles into real links and render a larger initial product page for indexing; real users lazy-load the below-fold section client-side.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **CollectionMasthead** (hero image + read-more), **HorizontalProductCard**, **CategoryGrid**, **FloatingCTA**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **CollectionMasthead:** full-bleed hero media with the collection title and a truncated description with a "read more" toggle (bottom sheet on mobile).
- **HorizontalProductCard:** wide card — image left, content right: title, rating (`★ value (count)` when present), lead price (`from {amount}`). Whole card (or a "Check availability" CTA on mobile) links to the product page.
- **FloatingCTA:** sticky button that scrolls to the product list when it's off-screen.
- Reuse **Breadcrumb, Carousel, CategoryGrid, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs/sheets ~12px; pills ~999px.
- **Type hierarchy:** section titles = large bold heading (~24–28px desktop / ~20px mobile); card titles = medium label (~16px); price/captions = small label (~14px). One sans-serif family.
- **Header:** tall hero on desktop, shorter on mobile; dark gradient behind overlaid title for contrast.
- **Product list:** vertical stack of horizontal cards (full content width); on desktop the card click navigates, on mobile show an explicit "Check availability" CTA.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** `name` + `content.subtext`; hero media from `heroImage` (fall back to `cardImage`).
- **Product card:** name, image, lead price (`from {amount}`), rating (from the product's `reviewsSummary` when present).
- **Icon/label:** prefer an API-provided icon/label; fall back to your own asset when absent.
- **Loading:** skeletons sized to the final card/section.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Collection basic info loaded first; non-canonical slug → 301 redirect.
- [ ] Sections render in canonical order; only the sections listed above are built.
- [ ] Product list rendered in the API's default order (no client re-sort, no sort dropdown); initial limit ~9 with "Show more"; highlight pinned when a valid in-collection id is passed.
- [ ] No reviews/rating badge in the header (collections carry no ratings); no POI / similar-collections / nearby / blog / long-form sections.
- [ ] Browse-by-theme self-hides when empty; first ~2 product cards eager, rest lazy.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
