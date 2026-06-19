---
name: page-category
description: Build a Category landing/listing page ("{Category} in {city}", e.g. "Museums in Paris") for an experiences/tickets storefront. Self-contained spec — section order, how the product list gets ordered/filtered/paginated, the subcategory filter, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Category Page

Before coding, inspect the partner repo, summarize the relevant route/data boundary and intended edit scope, and leave existing dummy/stub code, bugs, and refactor opportunities untouched unless the user explicitly asks for that specific change.
Build a category listing page — a themed list of experiences for one top-level category within a city (e.g. "Museums in {city}", "Tickets in {city}"), reached from a city page or browse-by-theme. The **product list is the core**, framed by a subcategory filter and popular collections. This file is the **single source of truth**: page structure, the data each section needs, how to order/filter/paginate the list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract — MANDATORY GATE.** Before writing any field access or mapper code:
   1. Fetch `https://partner.headout.com/docs/llms.txt` and find the relevant endpoint sections for: products by city and category, subcategories, collections by city, categories.
   2. Read the linked spec sections to get exact response field paths.
   3. List the exact field paths you will use (e.g. `product.pricing.listingPrice.headoutSellingPrice`).
   
   **Do not write any mapper or field access code until step 1.3 is complete.** Map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): normalize images; ProductCard uses customer selling price (`headoutSellingPrice`), never `netPrice`, and derives optional cancellation pills from policy data.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
4. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the category by id/slug **and** resolve the city context (by `code`) first. Unknown category or unresolved city → 404 (not a partial shell).
- If the category exposes a canonical slug and it doesn't match → 301 redirect to canonical. (The cities feed has no `urlSlug`, so there is no city-slug redirect.)
- A category may be a **"ticket" category** (single-attraction style) — this flag toggles a couple of conditional sections (sticky subcategory carousel + per-subcategory section stacks); the skeleton is otherwise shared.

## Data sources (map to your endpoints)
- **Category detail:** `name` (drives the header). Canonical slug only if your catalog exposes one.
- **Products by category:** product list scoped to `cityCode` + `categoryId`, with an optional `subCategoryId` filter. The product list has **no `sort` param**, so render the API's default order. Returns an ordered id list → resolve each to a card; offset/limit pagination + a `total`.
- **Subcategories:** the list of subcategories under this category (used as the filter facet + as section headings for ticket categories).
- **Collections by city:** collections list scoped to `cityCode` (for the "popular collections" row).

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › {category}`)
2. Header (category title)
3. Subcategory carousel (tabs/pills linking to subcategory sections; sticky for ticket categories)
4. Popular collections (carousel) — only if ≥ 2 collections
5. Top experiences (product grid) — with a **subcategory filter** above it
6. Per-subcategory sections (ticket categories only — a stack of per-subcategory product carousels)

## Ordering & derivation of raw data
- **Product list order:** the API's default order — **there is no `sort` param, so do not build a sort control and do not client re-sort.** The list is re-fetched when the subcategory filter changes; preserve the returned order.
- **Pagination:** fetch an initial page (~8 desktop / ~4 mobile; ~2× for crawler/bot requests) and expose a **"Show more"** that fetches the next offset. No client-side hard cap.
- **Subcategory filter:** the product list accepts a **single** `subCategoryId`, so this is a **single-select** facet — show the first ~5 subcategories as pills (plus an "All" reset) and the rest in a dropdown (a drawer on mobile). **Hide the filter entirely if fewer than 3 subcategories exist.** Selecting a subcategory re-fetches the grid with `subCategoryId`; show a loading skeleton during the re-fetch. Reflect the active subcategory in the URL and treat a filtered URL as **noindex**.
- **Popular collections:** render only if ≥ 2 collections.
- **Per-subcategory sections:** ticket categories only; lazy-mount each subcategory's carousel; cap the initial number of sections (more for bots).

## Conditional render rules
- **Subcategory carousel:** sticky for ticket categories; standard otherwise; hide if there are no subcategories.
- **Top experiences:** render the grid; if zero products resolve, render an empty grid (no placeholder copy). Show a skeleton during initial load and during filter re-fetch.
- **Popular collections:** self-hide when the collections feed is empty (or fewer than 2).
- **Crawler/bot:** render a larger initial product page for indexing; real users lazy-load below-fold sections client-side.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **SubcategoryTabs** (pills/links, sticky variant), **ProductCard**, **ProductGrid**, **SubcategoryFilter** (single-select pills + dropdown/drawer), **CollectionCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **SubcategoryTabs:** horizontal row of subcategory pills/links; a sticky variant that anchors to per-subcategory sections.
- **ProductGrid:** responsive grid of product cards with a "Show more" pagination control beneath.
- **SubcategoryFilter:** first few subcategories as pills (+ an "All" reset) + the rest in a dropdown (drawer on mobile); single-select; reflects the active selection.
- Reuse **Breadcrumb, Carousel, ProductCard, CollectionCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.
- **ProductCard:** use the **`ui-product-card`** skill (`/ui-product-card`) for the pixel-exact spec — `17.625rem` / `17rem` fixed width, `radius.8` (8px) image corners, 3px hover lift, image carousel with dots + arrows on hover, L1 badge (top-left, 4px radius), and price block. Build into `ui-components/ProductCard/` once; reuse on every listing page.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = ~24–28px desktop / ~20px mobile; card titles ~16px; price/captions ~14px. One sans-serif family.
- **Product grid:** ~3–4 columns desktop, ~2 mobile; product image taller than wide.
- **Filter bar:** subcategory pills above the grid; active pill uses the primary accent.
- **Carousels (collections):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** category `name`.
- **Product card:** name, normalized image, lead price (`from {headoutSellingPrice}` / mapped selling price), rating, optional `originalPrice` strike-through, optional derived cancellation pill.
- **Collection card:** title + image; link to the collection.
- **Loading:** skeletons sized to the final card/grid.

## Acceptance checks
- [ ] API contract confirmed: llms.txt read, exact field paths listed before any mapper was written; any unfulfillable feed disabled.
- [ ] Category + city resolved first; unknown → 404.
- [ ] Sections render in canonical order; only the sections listed above are built.
- [ ] Product list rendered in the API's default order (no sort control, no client re-sort); subcategory filter re-fetches with `subCategoryId` and preserves the returned order; filtered URLs marked noindex.
- [ ] Subcategory filter hidden when < 3 subcategories; popular collections only when ≥ 2.
- [ ] "Show more" pagination; larger initial page for bots.
- [ ] Ticket-category sticky carousel + per-subcategory sections behave correctly; empty feeds omit their section.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
