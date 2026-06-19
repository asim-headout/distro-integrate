---
name: page-collection
description: Build a Collection page (a curated themed product list, e.g. "Top things to do in {city}" / an attraction's experiences) for an experiences/tickets storefront. Self-contained spec — section order, how the product list is ordered/filtered/pinned, conditional-render rules, the UI components to build, and a visual language so output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Collection Page

Build a collection landing page — a curated, themed list of experiences around an attraction or topic (e.g. "Top things to do in {city}", "{Attraction} Tickets"), reached from a city page or a discovery card. The **product list is the core**; everything else frames it. This file is the **single source of truth**: page structure, the data each section needs, how to order/filter/pin the product list, when to show/hide each section, the components to build, and the visual language. Render under **your own brand and content**. Build only the sections listed here; emit no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, confirm exact fields first (`search_headout_api_docs({ query: "collection detail, products by collection, similar collections, collection reviews, categories by city, nearby cities" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'collection|product|reviews|categories' /" })` and read the spec). Otherwise map each feed below to your endpoints. Any feed you cannot fulfil → omit its section.
2. **Decide UI primitives.** Reuse the partner design system if present; otherwise build into the shared `ui-components/` folder.
3. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Page-level guards
- Resolve the collection by id/slug. Fetch **collection basic info first** (it drives the city context, redirects, and which loader runs).
- If the slug doesn't match the collection's canonical slug → 301 redirect to canonical.
- A collection has a `type` (default point-of-interest, or day-trip). Type only changes a couple of conditional sections (below) and which product scope is used — the skeleton is shared.

## Data sources (map to your endpoints)
- **Collection detail:** `displayName`, `content.subtext` (description), `medias[]` (image/video), `averageRating`, `ratingsCount`. Drives header.
- **Products by collection:** product card list for the collection, `sortType: POPULARITY`, limit **9**. Server-ranked ordered list → resolve each to a card.
- **Product availability** (mobile filter): per-product availability for today / tomorrow.
- **Similar/related collections:** collection list related to this one (limit 10).
- **Categories** (browse by theme): flat category + subcategory list for the city.
- **Reviews:** reviews for the collection.
- **Nearby cities / nearby destinations:** lists for the city (destinations used only on day-trip collections).
- **POI content:** about / fun facts / why-visit / highlights / pro-tips / plan-your-visit (operating schedules) for the collection's point(s) of interest.
- **Blog posts** and **long-form CMS content** (SEO + FAQ).

## Canonical section order (top → bottom)
1. Breadcrumb (`Home › Things to do in {city} › … › {collection}`)
2. Header / masthead (collection title + hero image/video + description with "read more"; optional reviews badge)
3. Product list (the core) — with a date-availability filter row above it on mobile
4. Nearby destinations (day-trip collections only)
5. Pro tips
6. Similar / related collections (carousel)
7. About the point of interest
8. Fun facts
9. Why visit
10. Highlights
11. Plan your visit (timings/operating hours)
12. Get inspired (blogs)
13. Browse by theme (category / subcategory)
14. Reviews
15. Nearby cities (city cards carousel)
16. Long-form content (SEO body + FAQ)
- A **sticky floating "View all experiences" CTA** scrolls to the product list; show it while the product list is off-screen.

## Ordering & derivation of raw data
- **Product list base order:** server-ranked by popularity. **Do NOT client re-sort and do NOT add a sort dropdown** — order is server-authoritative. Cap at **9**.
- **Highlight pinning:** if a valid product id arrives via a query/UTM param AND it belongs to this collection, **move that product to the front** (pinned card); otherwise leave order unchanged.
- **Mobile date-availability filter:** build filter pills `[All, Today, Tomorrow]`, but include `Today`/`Tomorrow` **only if at least one product has availability that day** (auto-hide a facet with no matches). When a day filter is active, drop products without that day's availability. Disable this filter for crawler/bot requests.
- **Ratings-label gate:** show the rating label on product cards **only if at least one product has > 10 ratings**; otherwise hide rating labels across all cards in the list.
- **Similar collections:** cap at 10 and **dedupe the current collection out** of its own related list.
- **Browse by theme:** either a starred-category list OR a `Map<parentCategory, subcategory[]>` (mutually exclusive); render nothing if neither has entries.
- **Eager vs lazy:** render the first ~2 product cards eagerly; lazy-mount the rest and all below-fold sections on scroll-into-view (reserved placeholder height to avoid layout shift).

## Conditional render rules
- **Header:** always shown. Hero media = first `medias` entry of type IMAGE (plus a VIDEO on desktop if present). Description truncated (~146 chars) with "read more" (a bottom sheet on mobile).
- **Reviews badge** (in header): show only if `averageRating ≥ a minimum` AND `ratingsCount ≥ a minimum`; otherwise omit the badge.
- **Product list:** render skeletons while loading; render nothing on error or zero products.
- **Nearby destinations:** day-trip collections only.
- **Get inspired (blogs):** only if blogs are supported for the active language.
- **Pro tips / about / fun facts / why visit / highlights / plan your visit:** render only when the collection has that POI content; self-hide otherwise.
- **Similar collections / reviews / nearby cities / browse by theme:** self-hide when their feed is empty.
- **Crawler/bot:** load all below-fold sections + long-form content server-side (for SEO/indexing) and turn product card titles into real links; real users lazy-load below-fold sections client-side.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
Roles: **Box, Text, Icon, Image, Carousel** (+ nav arrows), **Breadcrumb**, **CollectionMasthead** (image/video + read-more + optional rating badge), **HorizontalProductCard**, **DateFilterPills**, **ProductDetailsSheet** (mobile bottom sheet), **SimilarCollectionCard**, **CategoryGrid**, **PoiInfoSection** (titled rich-text block), **TimingsPanel**, **ReviewCard**, **FaqAccordion**, **FloatingCTA**, **CityCard**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into the shared `ui-components/` folder** (reused by every page; reuse anything already built):
- **CollectionMasthead:** full-bleed hero media with the collection title, a truncated description with a "read more" toggle (bottom sheet on mobile), and an optional star-rating badge.
- **HorizontalProductCard:** wide card — image left, content right: title, rating (`★ value (count)`), lead price (`from {amount}`), and on mobile explicit CTAs ("Check availability" + "More details"). Whole card (or primary CTA) links to the product page.
- **DateFilterPills:** a horizontal row of selectable pills (All / Today / Tomorrow); active pill uses the primary accent.
- **ProductDetailsSheet:** mobile bottom sheet showing quick product details without leaving the list.
- **SimilarCollectionCard:** image + collection title (+ optional count); links to that collection.
- **PoiInfoSection:** a titled section rendering rich-text/bulleted content (used for about/fun-facts/why-visit/highlights/pro-tips).
- **TimingsPanel:** opening-hours/plan-your-visit layout (day → hours rows).
- **FloatingCTA:** sticky button that scrolls to the product list when it's off-screen.
- Reuse **Breadcrumb, Carousel, CategoryGrid, ReviewCard, FaqAccordion, CityCard, Box/Text/Icon/Image, SkeletonLoader** from earlier recipes.

Keep these in `ui-components/`. Preserve any `data-qa-marker`/`data-testid` hooks you add.

## Visual language (so output is consistent)
Apply unless the partner design system overrides:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px; generous section rhythm (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards/inputs/sheets ~12px; pills ~999px.
- **Type hierarchy:** section titles = large bold heading (~24–28px desktop / ~20px mobile); card titles = medium label (~16px); price/captions = small label (~14px). One sans-serif family.
- **Header:** tall hero on desktop, shorter on mobile; dark gradient behind overlaid title for contrast.
- **Product list:** vertical stack of horizontal cards (full content width); on desktop the card click navigates, on mobile show explicit CTAs.
- **Carousels (similar collections, nearby cities):** ~5–6 cards desktop / ~2 mobile, peek next, arrows only when the list overflows.
- **Color:** neutral surfaces, one primary accent for links/CTAs (partner brand), muted grey secondary text; WCAG AA contrast.

## Field mappings & fallbacks
- **Header:** `displayName` + `content.subtext`; hero media as above; rating badge only when thresholds met.
- **Product card:** name, image, lead price (`from {amount}`), rating; rating label subject to the list-wide ratings gate.
- **Similar collection card:** title + image; link to the collection.
- **Review card:** reviewer name, rating, date, text; media thumbnails only when present.
- **POI sections:** render only the content blocks the API provides; skip absent ones.
- **Icon/label:** prefer an API-provided icon/label; fall back to your own asset when absent.
- **Loading:** skeletons sized to the final card/section.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Collection basic info loaded first; non-canonical slug → 301 redirect.
- [ ] Sections render in canonical order; only the sections listed above are built.
- [ ] Product list popularity-ordered (no client re-sort, no sort dropdown), capped at 9, highlight pinned when a valid in-collection id is passed.
- [ ] Mobile date-availability pills auto-hide empty facets and filter the list; disabled for bots.
- [ ] Ratings labels shown only when ≥ 1 product has > 10 ratings; similar collections capped at 10 and self-deduped.
- [ ] Day-trip-only and language-gated sections behave correctly; empty feeds omit their section.
- [ ] Long-form FAQ emitted as structured data; first ~2 cards eager, rest lazy.
- [ ] UI primitives map to the partner design system OR are built into `ui-components/` per the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
