---
name: headout-01-discovery
description: Step 01 of the Headout partner flow. Use for discovery surfaces: home page, search results, city pages, collections, categories, subcategories, catalog pages, product list APIs, product detail lookup, and pagination.
argument-hint: "[home/search/city/collection/category/product discovery scope]"
---

# Headout 01 Discovery

Implement the discovery step using the partner repo's existing backend/frontend conventions.

Basic path:

1. Inspect existing catalog, search, routing, data-fetching, caching, and test patterns.
2. Keep `Headout-Auth` server-side; frontend should use partner-safe APIs or existing data access boundaries.
3. Implement only the requested discovery surface: home, search results, city, collection, category tree, product list, or product detail.
4. Preserve explicit `currencyCode`, `languageCode`, `cityCode`, `categoryId`, `collectionId`, and `subCategoryId` propagation.
5. Support pagination and nullable Headout fields.
6. End with a context checkpoint and next skill recommendation.

User context:

```text
$ARGUMENTS
```

Advanced references, load only if needed:

- Discovery details: [references/advanced.md](references/advanced.md)
- API facts: [../../references/headout-api.md](../../references/headout-api.md)
- Testing contract: [../../references/existing-test-contract.md](../../references/existing-test-contract.md)
- Context checkpoint: [../../references/context-checkpoint.md](../../references/context-checkpoint.md)
