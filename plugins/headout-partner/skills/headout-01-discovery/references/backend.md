# Discovery — Backend Reference

Server-side fetch + mapping that feeds the discovery page recipes. Keep all of this behind the
partner's BFF / data boundary; the browser never sees `Headout-Auth` or raw responses.

## Endpoints
- Cities: `/api/public/v2/cities`
- Categories / subcategories: `/api/public/v2/categories`, `/api/public/v2/subcategories`
- Collections: `/api/public/v2/collections`
- Products list: `/api/public/v2/products`
- Product detail: `/api/public/v2/products/{productId}`

## Server-side rules
- Send `Headout-Auth` server-side only. Pass `currencyCode`, `languageCode`, `cityCode`, and the
  relevant `categoryId` / `collectionId` / `subCategoryId` filters through from the request.
- Paginate with `nextUrl`, `prevUrl`, `nextOffset`, `total`; never assume a single page.
- Map tolerantly: preserve unknown/future fields rather than dropping them; treat optional media,
  pricing, reviews, and `localeSpecificUrls` as nullable.

## BFF shape (what to expose to the FE)
- Return mapped, partner-safe view objects (e.g. product card: `id`, `name`, `image`, lead price,
  `cityName`, rating) — the shape the page recipes consume. Do **not** proxy raw Headout JSON or the
  auth header to the client.
- Filter products to those with a resolvable listing price before returning list/feed surfaces.

## Cross-check
The page recipe is the source of truth for *which* fields each surface renders and their order. This
file is the source of truth for *how* they are fetched and mapped server-side. If the two disagree
about a field name, apply the stale-fact call-out (stop, surface to partner).
