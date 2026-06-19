---
name: page-city
description: Build a City/Destination landing page ("Things to do in {city}") for an experiences/tickets storefront. Self-contained spec — section order, how unordered API feeds get ordered/grouped/filtered, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: City / Destination Page

Build the destination landing page for an experiences & tickets marketplace — the "Things to do in {city}" page a user reaches from a destination card. This file is the **single source of truth**: page structure, the data each section needs, how to order/group raw API data, when to show/hide each section, the components to build, and the visual language. Render it under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields before coding (`search_headout_api_docs({ query: "city detail, product list by city, product list by category, collections by city, categories" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'city|product|collections|categories' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (see "UI components to build").
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- The route resolves a city by `code`. Fetch the **city detail** first; if the city is unknown → render a 404 (not a partial shell).
- The cities feed returns only `code`, `name`, and `image` — **no `description` and no `urlSlug`**. So the hero shows the city name over its image (no hero description), and there is **no canonical-slug redirect**.
- Load city detail before anything else (it drives the hero + the 404 guard).

## Data sources (map to your endpoints)
- **City detail:** `code`, `name`, `image`. Drives the hero + the 404 guard.
- **Top experiences:** product list scoped to this `cityCode`. The product list has **no `sortType`/"recommended" param**, so render the API's default order. Returns an ordered productId list → resolve each to a card; offset/limit pagination + a `total`.
- **Per-category experiences:** for each category, the product list scoped to `cityCode` + `categoryId` (this is how the per-category carousels are built — there is no separate "city sections" feed).
- **Categories** (tabs + browse by theme): categories list → flat category + subcategory list.
- **Collections** (top attractions): collections list scoped to `cityCode` (cap ~15).
- **Recently viewed:** local client history (no API).

## Canonical section order (top → bottom)
1. Breadcrumb (`Home → Things to do in {city}`)
2. Hero header (city name over the hero image; optional search entry — overlaid on the hero on mobile, standalone on desktop)
3. Recently viewed (omit when history empty)
4. Top experiences (product carousel)
5. Top attractions / points of interest (collection cards)
6. Category tab navigation (sticky)
7. Per-category experience carousels (one block per category)
8. Browse by theme (category / subcategory grid)

## Ordering & derivation of raw data
- **Feeds are server-ordered id lists.** Preserve list order for products, collections, and categories — it is editorial rank; do NOT re-sort.
- **Top experiences — availability filter:** show only product ids that resolve to a card **with a price**; drop ids with no listing price before rendering.
- **Per-category carousels:** build one carousel per category (from the categories list), fetching the product list by `cityCode` + `categoryId`; preserve the returned order.
- **Category tab navigation:** build one tab per category; render the sticky tab bar **only if there are ≥ 4 categories**. Tabs scroll/anchor to their section.
- **Truncation (fixed caps):** collections / attractions → 15.
- **Categories → parent/child grouping** (browse by theme): the categories feed is flat; build `Map<parentCategory, subcategory[]>` and render parents as headings with subcategories beneath.
- **Recently viewed:** most-recent-first from local history; cap to one row.

## Conditional render rules
- **Hero:** always shown — the city `image` with the city name overlaid (no video banner, no description).
- **Recently viewed:** render only if local history is non-empty; never server-render it.
- **Top experiences:** render only if ≥ 1 available (priced) product. Show carousel arrows + "View all" only when the list length `> 4`.
- **Per-category carousel:** hide a category block when its product list is empty. Arrows + "View all" only when `> 4`.
- **Top attractions:** self-hide when the collections feed is empty.
- **Browse by theme:** render only if at least one category/subcategory exists.
- **Lazy mount:** sections below the fold mount on scroll-into-view with a reserved placeholder height (prevents layout shift). For real users, eagerly load roughly the first three discovery sections and lazy-load the rest; for crawler/bot requests, load all sections up front (for SEO/indexing).
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles used: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **Hero/Masthead** (image), **SearchInput**, **ProductCard**, **CollectionCard**, **CategoryGrid**, **SectionTabs** (sticky, anchor-scroll), **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one before building: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page). Build each as a small, typed, presentational component:
- **Box / Text / Icon / Image / Carousel / ProductCard / CollectionCard / CategoryGrid / SearchInput / SkeletonLoader:** as in the home-page recipe (reuse them if already built).
- **Breadcrumb:** horizontal trail of links with separators; last item is the current page (non-link).
- **Hero/Masthead:** full-bleed city image with the city title overlaid; supports an overlaid search entry on mobile. (The Headout partner API provides no search endpoint — wire the search entry to the partner's own search, or omit it.)
- **SectionTabs:** a sticky horizontal tab bar; clicking a tab smooth-scrolls/anchors to its section; highlights the active section on scroll.

Keep these in `ui-components/` so other pages reuse them. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply these unless the partner design system overrides them:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. Generous vertical rhythm between sections (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = large bold heading (~24–28px desktop / ~20px mobile); card titles = medium label (~16px); captions/price = small label (~14px). One sans-serif family.
- **Hero:** tall on desktop (~50–60vh), shorter on mobile; dark overlay/gradient behind overlaid text for contrast; title large and bold.
- **Cards & carousel:** subtle border/shadow; image fills the top with matched radius; product image taller than wide, collection image landscape (~4:3); ~5–6 cards visible desktop, ~1.2–2 mobile (peek next).
- **Sticky tab bar:** sticks below any fixed header; active tab uses the primary accent.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text. Maintain WCAG AA contrast.

## Field mappings & fallbacks
- **Hero:** city `name` over the city `image`.
- **Product card:** name, image, lead price (`from {amount}`), rating.
- **Collection card:** title + image; link to the collection page.
- **Icon/label:** prefer an API-provided icon/label; fall back to your own asset when absent.
- **Loading:** show skeletons sized to the final card per section.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] City detail loaded first; unknown city → 404. (No canonical-slug redirect — the cities feed has no `urlSlug`.)
- [ ] Sections render in canonical order; only the sections listed above are built.
- [ ] Feed order preserved (no re-sort); collections/attractions capped at 15.
- [ ] Top experiences filtered to priced products; carousel arrows/view-all only when `> 4`.
- [ ] Per-category carousels built per category via `cityCode` + `categoryId`; sticky category tabs only when ≥ 4 categories; empty category blocks hidden.
- [ ] Empty feeds omit their section.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
