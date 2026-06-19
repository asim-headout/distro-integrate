# Discovery Advanced Reference

Relevant docs:

- Products list: https://partner.headout.com/docs/api-partner/v2/products/list.md
- Product get: https://partner.headout.com/docs/api-partner/v2/products/get.md
- Key concepts: https://partner.headout.com/docs/guide/key-concepts.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced implementation cases:

- Search results and category pages share filter state.
- City, collection, category, and subcategory URLs need stable slugs.
- Catalog sync requires pagination, incremental updates, and unknown future fields.
- Product detail pages may include nullable media, reviews, pricing, canonical URLs, and `localeSpecificUrls`.

Test cases:

- Pagination via `nextUrl`, `prevUrl`, `nextOffset`, and `total`.
- Missing optional product content.
- Unknown language URL keys.
- Currency and language propagation.
- Empty city/category/collection results.
