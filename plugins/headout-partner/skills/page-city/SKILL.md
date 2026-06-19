---
name: page-city
description: Build a City/Destination landing page ("Things to do in {city}") for an experiences/tickets storefront. Self-contained spec — section order, how unordered API feeds get ordered/grouped/filtered, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: City / Destination Page

Build the destination landing page for an experiences & tickets marketplace — the "Things to do in {city}" page a user reaches from search or a destination card. This file is the **single source of truth**: page structure, the data each section needs, how to order/group/filter raw API data, when to show/hide each section, the components to build, and the visual language. Render it under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields before coding (`search_headout_api_docs({ query: "city detail, city sections, product list recommended, collections, categories, reviews by city, nearby cities" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'city|sections|product|collections|reviews' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder (see "UI components to build").
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- The route resolves a city by code/slug. Fetch the **city detail** first; if the city is unknown → render a 404 (not a partial shell).
- If the requested slug doesn't match the city's canonical slug → redirect to the canonical URL.
- Hero copy (name, description) and the 404 decision both depend on city detail, so load it before anything else.

## Data sources (map to your endpoints)
- **City detail:** `displayName`, `description`, hero image. Drives the hero + the 404 guard.
- **Hero banners:** banner list; first banner is the hero. A banner may be `VIDEO` (use its video url + a fallback image) or `IMAGE`.
- **Recommended experiences:** product list with `sortType: RECOMMENDED`. Returns an ordered productId list → resolve each to a card.
- **Category sections:** a "city sections" feed that returns an **ordered list of typed sections**, each with a heading and its own product/tourGroup id list (this is how per-category carousels are ordered).
- **Categories** (browse by theme): flat category + subcategory list.
- **Collections** (top attractions): collections list (limit 10).
- **Top offers / combos:** product-cards filtered by an offer type (top-offers limit 6) and a combo type (limit 10).
- **Interest/persona affinities:** persona list for the city.
- **Reviews:** reviews for the city (limit 8).
- **Nearby cities:** nearby-cities list for the city.
- **Blog posts:** city blog/editorial posts.
- **Long-form content:** CMS body (SEO copy + FAQ). **Recently viewed:** local client history (no API).

## Canonical section order (top → bottom)
1. Breadcrumb (`Home → Things to do in {city}`)
2. Hero header (city name + hero image/video + description; search entry — overlaid on the hero on mobile, standalone on desktop)
3. Recently viewed (omit when history empty)
4. Top experiences (product carousel)
5. Top attractions / points of interest (collection cards)
6. Top offers (omit when empty)
7. Combos (omit when empty)
8. Interest/persona affinity entry
9. Category tab navigation (sticky)
10. Per-category experience carousels (one block per category section)
11. Must-do things
12. Get inspired (blog/editorial cards)
13. Browse by theme (category / subcategory grid)
14. Reviews
15. Nearby cities (city cards carousel)
16. Long-form content (SEO body + FAQ)

> **Order can be server-driven.** If your "city sections" feed returns an ordered, typed section list, render the discovery sections (4–13) in that returned order instead of hardcoding — the feed is the source of truth for order and which sections appear. The list above is the default when no such ordering is provided.

## Ordering & derivation of raw data
- **Feeds are server-ordered id lists.** Preserve list order for products, collections, category sections, nearby cities — it is editorial rank; do NOT re-sort.
- **Top experiences — availability filter:** show only product ids that resolve to a card **with a price**; drop ids with no listing price before rendering.
- **Per-category carousels:** render category sections in the feed's array order; within each, `productIds = section.tourGroups` order preserved.
- **Category tab navigation:** build one tab per category section; render the sticky tab bar **only if there are ≥ 4 category sections**. Tabs scroll/anchor to their section.
- **Truncation (fixed caps):** collections → 10; reviews → 8; top-offers → 6; combos → 10; attractions/POIs → 15.
- **Categories → parent/child grouping** (browse by theme): the categories feed is flat; build `Map<parentCategory, subcategory[]>` and render parents as headings with subcategories beneath.
- **Long-form content:** extract any FAQ/accordion block from the CMS body and also emit it as FAQ structured data (JSON-LD).
- **Recently viewed:** most-recent-first from local history; cap to one row.

## Conditional render rules
- **Hero:** always shown. First banner: if `VIDEO` use the video with the fallback image as poster, else the image.
- **Recently viewed:** render only if local history is non-empty; never server-render it.
- **Top experiences:** render only if ≥ 1 available (priced) product. Show carousel arrows + "View all" only when the list length `> 4`.
- **Per-category carousel:** hide a category block when its product list is empty. Arrows + "View all" only when `> 4`.
- **Top offers / combos / reviews / attractions:** self-hide when their feed is empty.
- **Interest/persona affinity:** render only if there are `> 2` affinities.
- **Get inspired (blogs):** render only if there are `≥ 3` posts AND blogs are supported for the active language.
- **Browse by theme:** render only if at least one category/subcategory exists.
- **Lazy mount:** sections below the fold mount on scroll-into-view with a reserved placeholder height (prevents layout shift). For real users, eagerly load roughly the first three discovery sections and lazy-load the rest; for crawler/bot requests, load all sections and the full long-form content up front (for SEO/indexing).
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles used: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **Hero/Masthead** (image or video), **SearchInput**, **ProductCard**, **CollectionCard**, **CityCard**, **CategoryGrid**, **SectionTabs** (sticky, anchor-scroll), **ReviewCard**, **FaqAccordion**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one before building: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page). Build each as a small, typed, presentational component:
- **Box / Text / Icon / Image / Carousel / ProductCard / CollectionCard / CityCard / CategoryGrid / SearchInput / SkeletonLoader:** as in the home-page recipe (reuse them if already built).
- **Breadcrumb:** horizontal trail of links with separators; last item is the current page (non-link).
- **Hero/Masthead:** full-bleed media (image or autoplaying muted video with poster fallback) with the city title + short description overlaid; supports an overlaid search entry on mobile.
- **SectionTabs:** a sticky horizontal tab bar; clicking a tab smooth-scrolls/anchors to its section; highlights the active section on scroll.
- **ReviewCard:** avatar + name + country/trip-type, star rating, date, review text (clamped), optional review media thumbnails.
- **FaqAccordion:** expandable question/answer list.

Keep these in `ui-components/` so other pages reuse them. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply these unless the partner design system overrides them:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. Generous vertical rhythm between sections (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs ~12px; pills/tabs ~999px.
- **Type hierarchy:** section titles = large bold heading (~24–28px desktop / ~20px mobile); card titles = medium label (~16px); captions/price = small label (~14px). One sans-serif family.
- **Hero:** tall on desktop (~50–60vh), shorter on mobile; dark overlay/gradient behind overlaid text for contrast; title large and bold.
- **Cards & carousel:** subtle border/shadow; image fills the top with matched radius; product image taller than wide, collection/city image landscape (~4:3); ~5–6 cards visible desktop, ~1.2–2 mobile (peek next).
- **Sticky tab bar:** sticks below any fixed header; active tab uses the primary accent.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text. Maintain WCAG AA contrast.

## Field mappings & fallbacks
- **Hero:** city `displayName` + `description`; banner media as above.
- **Product card:** name, image, lead price (`from {amount}`), city, rating.
- **Collection card:** title + image; link to the collection page.
- **City card (nearby):** name + image; link to that city page.
- **Review card:** reviewer name, rating, date, text; show media thumbnails only when present.
- **Icon/label:** prefer an API-provided icon/label; fall back to your own asset when absent.
- **Loading:** show skeletons sized to the final card per section.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] City detail loaded first; unknown city → 404; non-canonical slug → redirect.
- [ ] Sections render in canonical order (or the server-provided section order when available); only the sections listed above are built.
- [ ] Feed order preserved (no re-sort); caps applied (collections 10 / reviews 8 / offers 6 / combos 10 / attractions 15).
- [ ] Top experiences filtered to priced products; carousel arrows/view-all only when `> 4`.
- [ ] Sticky category tabs only when ≥ 4 category sections; empty category blocks hidden.
- [ ] Persona affinity only when `> 2`; blogs only when `≥ 3` and language-supported.
- [ ] FAQ from long-form emitted as structured data; empty feeds omit their section.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
