---
name: headout-01-discovery
description: Step 01 of the Headout partner flow. Use for discovery surfaces: home page, city pages, collections, categories, subcategories, catalog pages, product list APIs, product detail lookup, and pagination.
argument-hint: "[home/city/collection/category/product discovery scope]"
---

# Headout 01 — Discovery

## Outcome (what "done" looks like — FE/BE agnostic)
The requested discovery surface (home, city, collection, category/subcategory tree, product
list, or product detail) renders the partner's catalog, with correct currency/language/geo
propagation and pagination — backed server-side by Headout v2 discovery APIs, displayed under the
partner's own brand. (Note: the Headout partner API has **no search endpoint** and **no end-user
accounts**, so there is no search-results or profile/account surface in this flow.)

## Ground rules (apply on every step)
- **Security / gate-keeping:** `Headout-Auth` and all raw Headout calls stay server-side. The browser
  only ever sees safe field metadata — never the key, never raw API responses.
- **Non-breaking:** preserve the partner's existing routes, design system, types, and conventions.
  Add, don't replace. Don't introduce a new client/SDK abstraction unless the repo already has one.
- **Stale-fact call-out:** the API facts in references are a snapshot. If a live response contradicts
  a reference (missing field, new status, changed shape) → STOP and surface it to the partner. Never
  silently code around it or guess field names.
- **Sandbox-safe:** never call production for tests; gate sandbox calls behind credentials.
- Emit no analytics/tracking.

## Steps
1. Inspect existing catalog, routing, data-fetching, caching, and test patterns.
2. Resolve the API contract for the surface (Backend reference + headout-api.md) before coding.
3. Build the frontend to the matching **page recipe** (see References) — it is the source of truth for section order, derivation, conditional rules, components, and visual language.
4. Wire the backend: server-side fetch + map Headout discovery responses into the shape the FE consumes via the partner's data boundary / BFF.
5. Preserve explicit `currencyCode`, `languageCode`, `cityCode`, `categoryId`, `collectionId`, and `subCategoryId` propagation; support pagination and nullable fields.
6. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

## Verification gate
- **Basic pass first:** the surface fetches, maps, and renders one happy path (correct currency/language, pagination works, empty/nullable fields handled). Get this green before hardening.
- **Advanced pass:** only then handle the edge cases in the Advanced reference.

## References (load only what's needed)
- **Frontend — look & structure (page recipes):** [../page-home/SKILL.md](../page-home/SKILL.md), [../page-city/SKILL.md](../page-city/SKILL.md), [../page-collection/SKILL.md](../page-collection/SKILL.md), [../page-collections-index/SKILL.md](../page-collections-index/SKILL.md), [../page-category/SKILL.md](../page-category/SKILL.md), [../page-subcategory/SKILL.md](../page-subcategory/SKILL.md), [../page-places-to-visit/SKILL.md](../page-places-to-visit/SKILL.md), [../page-tours-by-city/SKILL.md](../page-tours-by-city/SKILL.md)
- **Backend — API & server mapping:** [references/backend.md](references/backend.md), [../../references/headout-api.md](../../references/headout-api.md)
- **Advanced — edge cases:** [references/advanced.md](references/advanced.md)
- **Testing contract:** [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- **Context checkpoint:** [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
