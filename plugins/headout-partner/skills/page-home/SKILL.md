---
name: page-home
description: Build a marketplace Home/Landing page for an experiences/tickets storefront. Self-contained spec — encodes the section order, how unordered API feeds get ordered, conditional-render rules, the UI components to build, and a visual language so the output is consistent. Reuses the partner's design system if one exists. Branding-neutral and portable.
disable-model-invocation: true
---

# Page Recipe: Home / Landing Page

Build the storefront landing page for an experiences & tickets marketplace: a hero plus a set of discovery feeds (destinations, collections, categories). This file is the **single source of truth** — it tells you the page structure, the data each section needs, how to order raw API data, when to show/hide each section, the components to build, and the visual language to render them in. Render it under **your own brand and content**. Emit no marketing/brand blocks beyond the commerce sections listed here, and no analytics/tracking.

## How to use this skill
1. **Resolve the API contract.** If an API-docs MCP server is configured, query it to confirm exact field names before coding (`search_headout_api_docs({ query: "cities list, collections list, categories" })`, then `query_docs_filesystem_headout_api_docs({ command: "rg -il 'cities|collections|categories' /" })` and read the spec). Otherwise map each feed below to your own endpoints. Any feed you cannot fulfil → omit its section.
2. **Apply the shared UI data contract** ([../../references/ui-data-contract.md](../../references/ui-data-contract.md)): normalize protocol-relative image URLs, preserve server/editorial order, and do not fill empty rails with random cities or collections.
3. **Decide UI primitives.** Reuse the partner design system if present; otherwise build the components into a shared `ui-components/` folder (see "UI components to build").
4. **Assemble** in the canonical order, applying the ordering and conditional rules.

## Data sources (map to your endpoints)
The discovery feeds below are "site-wide" (not scoped to one city). **Note:** the Headout product list is **scoped to a `cityCode` (required) and exposes no editorial "top picks" tag**, so there is **no site-wide recommended-products feed** — that is why this page has no product carousel. Use city pages for product feeds.
- **Cities** (top destinations): cities list. Fields: `code, name, image`.
- **Collections** (top things to do): collections list, capped at ~50. Returns an ordered list of collection ids → card (title, image, url).
- **Categories** (browse by theme): categories list → flat category + subcategory list.
- **Recently viewed**: read from local client history (no API).

## Canonical section order (top → bottom)
1. Hero banner + search bar
2. Recently viewed (omit when history empty)
3. Top destinations (city cards carousel)
4. Top things to do (collection cards carousel)
5. Browse by theme (category / subcategory grid)

## Ordering & derivation of raw data
- **Feeds are server-ordered id lists, not objects.** Each feed returns an **ordered list of ids** + a lookup map. **Preserve list order** — it is editorial rank; do NOT re-sort alphabetically or by price. Render by mapping the id list through the map.
- **Truncation (fixed caps):** cities → first **30**; collections → first **50**. Slice after preserving order.
- **Categories → parent/child grouping:** the categories feed is flat; build a `Map<parentCategory, subcategory[]>` by pushing each subcategory under its parent id. Render parents as headings with their subcategories beneath.
- **Recently viewed:** most-recent-first from local history; cap to one card row.

## Conditional render rules
- **Hero search:** always shown. Use a full search experience on desktop and a compact search entry on mobile (behavior parity; style is yours). **The Headout partner API provides no search endpoint** — wire this input to the partner's own search backend, or omit the search entry if there is none.
- **Recently viewed:** render only if local history is non-empty; never server-render it.
- **Top destinations:** show a loading skeleton while the cities feed is loading AND the list is empty; else render. "View all" links to your cities index. If the repo has no cities-index route, add one only when it fits existing routing; otherwise ask instead of choosing random extra cities.
- **Top things to do (collections):** render the section **only if** the collection list length `> 0`. Show carousel navigation arrows + "View all" **only if** length `> 6`; below 6, render the row with no chevrons/view-all.
- **Browse by theme:** render only if at least one category/subcategory exists; else omit.
- **Lazy mount:** sections 3–5 mount on scroll-into-view with a reserved placeholder height (prevents layout shift). Sections 2, 3, 4, 5 are client-rendered.
- **Empty state:** any feed that returns empty → omit that section entirely (no placeholder copy).

## UI components to build
The page needs these component roles: **Box** (layout), **Text** (typography), **Icon**, **Image**, **Carousel** (+ nav arrows), **CityCard**, **CollectionCard**, **CategoryGrid**, **SearchInput**, **SkeletonLoader**.

**Step A — reuse an existing design system first.** Search the partner repo for one before building: a `design-system/`, `ui/`, or `components/ui/` folder, an exported `Box`/`Text`/`Button`/`Card`, or a `panda.config.*` / `tailwind.config.*` / theme-tokens file. If found, **map each role to the partner's component and use their tokens. Do not build new primitives.**

**Step B — otherwise build them into a shared `ui-components/` folder** (reused by every page). Build each as a small, typed, presentational component with these anatomies:
- **Box / Text / Icon:** layout primitive, a typography primitive that takes a `variant` (heading/label/body) + `color`, and an icon wrapper that renders an inline SVG. All visual values come from the design tokens below.
- **Image:** responsive image with a blurred/low-res placeholder, lazy loading, an aspect-ratio prop, and `https:` normalization for protocol-relative Headout URLs.
- **Carousel:** horizontal scroller that snaps to cards and lets the next card "peek". Optional left/right nav arrows (shown per the `> 6` rule). Keyboard + drag scrollable.
- **CityCard / CollectionCard:** image with rounded corners + title (+ subtitle for city, e.g. country). Whole card is a link.
- **CategoryGrid:** a list of category headings, each with its subcategory links beneath.
- **SearchInput:** prominent rounded input with a search icon and placeholder; submitting routes to the partner's own search (the Headout partner API exposes no search endpoint).
- **SkeletonLoader:** shimmer placeholder sized to the final card so layout does not jump.

Always keep these in `ui-components/` so other pages reuse them. Preserve any `data-qa-marker`/`data-testid` hooks you add for QA.

## Visual language (so output is consistent)
Apply these unless the partner design system overrides them:
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px. Generous vertical rhythm between sections (~48–80px desktop, ~32–48px mobile).
- **Radius:** cards and inputs ~12px; pills ~999px.
- **Type hierarchy:** section titles = large bold heading (~24–28px desktop / ~20px mobile); card titles = medium label (~16px); captions/price = small label (~14px). Use one sans-serif family throughout.
- **Cards:** subtle border or shadow; image fills the top with matched corner radius; product image taller than wide, city/collection image landscape (~4:3).
- **Carousel:** ~5–6 cards visible on desktop, ~1.2–2 on mobile (peek next), with horizontal gap from the spacing scale.
- **Color:** neutral surfaces, one primary accent for links/CTAs (from partner brand), muted grey for secondary text. Maintain WCAG AA contrast.

## Field mappings & fallbacks
- **Hero copy/media:** static, partner-supplied (heading + background image/video). Preload the poster image; preload the video on desktop only.
- **City card:** `name` + image; optional country as subtitle; link to your city page.
- **Collection card:** title + image; link to your collection page.
- **Icon/label:** prefer an API-provided icon/label; fall back to your own asset when absent.
- **Loading:** show skeletons sized to the final card.

## Acceptance checks
- [ ] API contract confirmed (via MCP if available) and mapped to the partner's feeds.
- [ ] Sections render in canonical order; only the five sections above are built.
- [ ] Feed order preserved (no re-sort); caps applied (cities 30 / collections 50).
- [ ] Top destinations has a deterministic cities-index / "View all" path when available; no random city filler.
- [ ] Collections section hidden when empty; arrows/view-all only when `> 6`.
- [ ] Categories grouped parent→child; empty feeds omit their section.
- [ ] UI primitives either map to the partner design system OR are built into `ui-components/` following the visual language.
- [ ] No internal/operator branding; rendering uses the partner's brand and content.
