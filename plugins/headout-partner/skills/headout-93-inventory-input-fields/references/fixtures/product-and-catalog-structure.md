# Product and Catalog Structure

## What

Contract details outside the input-field system, still relevant to checkout/booking flows built on
this skill's output:

- `productType` (e.g. `TRANSFER`) changes which fields/sections a product surfaces (pickup/dropoff).
- Products can have 3+ variants; variant-selection UI must not assume 1-2.
- `hasInstantConfirmation: false` means ticket generation is delayed — booking UI must not assume
  immediate ticket availability.
- `cancellationPolicy.{cancellable, cancellableUpTo}` varies per variant.
- `variant.properties` (single string-valued) is separate from `propertiesV2` (array-valued) — a
  general-purpose key/value bag, not tied to one meaning. See the `VALIDITY` sample below, and
  [pax-and-pricing.md](pax-and-pricing.md) for the nationality-gating key.
- `secondaryCategories` — a product can belong to more than one catalog category.

## Where

Products API (`GET /v2/products/{id}`): `productType`, `variants[]`, `hasInstantConfirmation`,
`variants[].cancellationPolicy`, `variants[].properties`/`propertiesV2`, `secondaryCategories`.

## How

Don't hardcode assumptions about variant count, confirmation timing, or cancellation terms per
product — always read these per-variant/per-product from the live response, same as input fields.

## Samples

**TRANSFER product type** (tourId `20691`, productId `11012`):
```json
{ "productType": "TRANSFER" }
```

**Single-value `properties`** (same product) — `VALIDITY` gates ticket usage window:
```json
{ "VALIDITY": "1_DAY" }
```

**Multi-variant product** (productId `14122`) — 5 variants on one product:
```json
{ "variantIds": [26838, 32468, 33273, 33278, 86097] }
```

**Cancellation cutoff window** (tourId `44762`, productId `5073`) — cancellable up to 2880 minutes (48h) before start:
```json
{ "cancellable": true, "cancellableUpTo": 2880 }
```

**Delayed confirmation** (tourId `26838`, productId `14122`):
```json
{ "hasInstantConfirmation": false }
```

**Multi-category product** (tourId `16969`, productId `5073`) — `secondaryCategories` populated alongside `primaryCategory`.

**Confirmed absent from sandbox** (as of 2026-08-18): variants with a nonzero `cashback` value.
Implement cashback display per the documented contract regardless.

## Full data

- Full fixture JSON: `../../../../tools/sandbox-scenario-catalog/output/fixtures/product.type.transfer__20691.json`, `variant.properties.single_value__20691.json`, `product.variant_count.multi__26838.json`, `variant.cancellation.cutoff_window__44762.json`, `product.confirmation.delayed__26838.json`, `catalog.categories.secondary_present__16969.json`
- Live status: [CHECKLIST.md](../../../../tools/sandbox-scenario-catalog/output/CHECKLIST.md)
