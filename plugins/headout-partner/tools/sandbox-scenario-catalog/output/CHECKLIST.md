# Partner Integration Verification Checklist

Generated from `output/scenarios.csv`. Each row is a scenario your integration
must handle; check the box once your client code has been tested against the
linked sandbox `tourId` and fixture. Regenerate with `node cli.js generate-checklist`
after a `discover`/`verify` run.

## Inventory-field retrieval fallback (read before the checklist below)

`GET /v2/inventories/{id}` (per-slot field overrides) can fail or be slow for a
given inventory even when the product/variant fetch succeeded. This is the
authoritative behavior per
`skills/headout-93-inventory-input-fields/references/backend.md` — do not implement
a looser policy than this:
- **The inventory-details call is blocking** once this workflow is enabled for a
  checkout — do not render or submit fields until it succeeds.
- **On failure**, show a safe recoverable error and preserve the existing
  product-derived implementation as an explicit rollback path. Do not merge
  conflicting field definitions or silently fall back to the Product API's
  `inputFields` within the same request.
- **Fields differ between the two** — when the inventory-details call succeeds,
  its response is authoritative for that specific date/slot over the Product API's.
- **Never cache** either response across bookings — availability/fields can change
  per request.

## Checkout Input Fields

- [x] **Passport / ID document field (by name/description, not id)** (`field.semantics.passport`)
  - tourId=`71533` productId=`33762` — field CUSTOM_235806 "Passport Details" (STRING) — fixture: `fixtures/field.semantics.passport__71533.json` (last verified 2026-08-19T07:21:01.670Z)
  - tourId=`71534` productId=`33762` — field CUSTOM_235812 "Passport Details" (STRING) — fixture: `fixtures/field.semantics.passport__71534.json` (last verified 2026-08-19T07:21:02.369Z)
- [x] **Date of Birth field (by name — real sandbox examples encode as dataType STRING, not DATE)** (`field.semantics.dob`)
  - tourId=`40974` productId=`20840` — field CUSTOM_138848 "Date of Birth" (STRING) — fixture: `fixtures/field.semantics.dob__40974.json` (last verified 2026-08-19T07:20:54.182Z)
  - tourId=`41246` productId=`20840` — field CUSTOM_138850 "Date of Birth" (STRING) — fixture: `fixtures/field.semantics.dob__41246.json` (last verified 2026-08-19T07:20:54.825Z)
- [x] **Field with numeric real-world meaning (weight/height) but dataType=STRING, not INT/FLOAT** (`field.semantics.numeric_as_string`)
  - tourId=`28840` productId=`15371` — field CUSTOM_177565 "Weight" (STRING) — fixture: `fixtures/field.semantics.numeric_as_string__28840.json` (last verified 2026-08-19T07:21:07.965Z)
  - tourId=`49152` productId=`24608` — field CUSTOM_160724 "Weight" (STRING) — fixture: `fixtures/field.semantics.numeric_as_string__49152.json` (last verified 2026-08-19T07:21:10.078Z)
- [ ] **Boolean (waiver/consent) field** (`field.type.bool`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.453Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario field.type.bool --force` if sandbox catalog has since grown._
- [x] **Enum/dropdown field** (`field.type.enum`)
  - tourId=`45780` productId=`23338` — field CUSTOM_146542 "Pick-up details" (ENUM) — fixture: `fixtures/field.type.enum__45780.json` (last verified 2026-08-19T07:20:44.208Z)
  - tourId=`45784` productId=`23342` — field CUSTOM_146558 "Pick-up details" (ENUM) — fixture: `fixtures/field.type.enum__45784.json` (last verified 2026-08-19T07:20:50.088Z)
- [ ] **Bounded numeric field (dataType INT/FLOAT with min/max) — rare; most numeric-looking fields are actually STRING, see field.semantics.numeric_as_string** (`field.type.numeric_bounded`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.504Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario field.type.numeric_bounded --force` if sandbox catalog has since grown._
- [x] **Per-traveler (ALL_CUSTOMER) input field** (`field.level.all_customer`)
  - tourId=`90547` productId=`23340` — field NAME level=ALL_CUSTOMER — fixture: `fixtures/field.level.all_customer__90547.json` (last verified 2026-08-19T07:20:46.123Z)
  - tourId=`90547` productId=`23341` — field NAME level=ALL_CUSTOMER — fixture: `fixtures/field.level.all_customer__90547.json` (last verified 2026-08-19T07:20:48.686Z)

## Location Fields

- [x] **Free-text LOCATION field** (`field.type.location.free_text`)
  - tourId=`54930` productId=`14828` — LOCATION field CUSTOM_178257, predefined=false — fixture: `fixtures/field.type.location.free_text__54930.json` (last verified 2026-08-19T07:20:40.290Z)
  - tourId=`80963` productId=`14828` — LOCATION field CUSTOM_272968, predefined=false — fixture: `fixtures/field.type.location.free_text__80963.json` (last verified 2026-08-19T07:20:41.574Z)
- [x] **Predefined/dropdown LOCATION field** (`field.type.location.predefined`)
  - tourId=`29302` productId=`15668` — LOCATION field CUSTOM_235892, predefined=true — fixture: `fixtures/field.type.location.predefined__29302.json` (last verified 2026-08-19T07:21:00.327Z)
  - tourId=`39975` productId=`20321` — LOCATION field CUSTOM_272990, predefined=true — fixture: `fixtures/field.type.location.predefined__39975.json` (last verified 2026-08-19T07:20:58.935Z)
- [x] **Predefined location with timingConfig window** (`field.type.location.predefined_timed`)
  - tourId=`29302` productId=`15668` — LOCATION field CUSTOM_235892, predefined=true — fixture: `fixtures/field.type.location.predefined_timed__29302.json` (last verified 2026-08-19T07:21:00.993Z)
  - tourId=`39975` productId=`20321` — LOCATION field CUSTOM_272990, predefined=true — fixture: `fixtures/field.type.location.predefined_timed__39975.json` (last verified 2026-08-19T07:20:59.596Z)

## Inventory Overrides

- [x] **Inventory-level input fields differ from variant-level default** (`inventory.field_override`)
  - tourId=`1268` productId=`793` — inventory 543469460: +[Weight] -[Pickup Location,Weight] — fixture: `fixtures/inventory.field_override__1268.json` (last verified 2026-08-19T07:21:17.769Z)
  - tourId=`90132` productId=`41693` — inventory 543516075: +[Pickup Location] -[] — fixture: `fixtures/inventory.field_override__90132.json` (last verified 2026-08-19T07:21:18.982Z)

## Pax/Pack Types

- [x] **Nationality-gated pack (e.g. resident/local pricing)** (`variant.pax.nationality_gated`)
  - tourId=`23362` productId=`33907` — property NATIONALITY="FOREIGN_TOURIST" — fixture: `fixtures/variant.pax.nationality_gated__23362.json` (last verified 2026-08-19T07:21:03.067Z)
  - tourId=`23363` productId=`33907` — property NATIONALITY="INDONESIAN_CITIZEN" — fixture: `fixtures/variant.pax.nationality_gated__23363.json` (last verified 2026-08-19T07:21:05.242Z)
- [x] **PER_GROUP priced product (vs PER_PERSON)** (`variant.pricing.per_group`)
  - tourId=`81053` productId=`9003` — profileType=PER_GROUP — fixture: `fixtures/variant.pricing.per_group__81053.json` (last verified 2026-08-19T07:20:42.925Z)
  - tourId=`90543` productId=`41929` — profileType=PER_GROUP — fixture: `fixtures/variant.pricing.per_group__90543.json` (last verified 2026-08-19T07:20:52.819Z)
- [x] **Non-default min/max pax per booking (booking-level variant.pax, not per-pax-type)** (`variant.pax.min_max_nondefault`)
  - tourId=`34761` productId=`18194` — pax min=2 max=10 — fixture: `fixtures/variant.pax.min_max_nondefault__34761.json` (last verified 2026-08-19T07:20:43.576Z)
  - tourId=`45780` productId=`23338` — pax min=2 max=10 — fixture: `fixtures/variant.pax.min_max_nondefault__45780.json` (last verified 2026-08-19T07:20:44.837Z)
- [x] **Per-pax-type bounded range (inventory.pricing.persons[].paxRange.max not null) — distinct from variant.pax.min_max_nondefault; confirmed rare across sandbox regardless of inventory date** (`variant.pax.per_type_range_bounded`)
  - tourId=`16969` productId=`5073` — personType=GENERAL paxRange.max=5 — fixture: `fixtures/variant.pax.per_type_range_bounded__16969.json` (last verified 2026-08-19T07:22:00.707Z)
  - tourId=`44762` productId=`5073` — personType=GENERAL paxRange.max=4 — fixture: `fixtures/variant.pax.per_type_range_bounded__44762.json` (last verified 2026-08-19T07:22:02.343Z)

## Seatmap

- [x] **Seatmap-selection product (vs NORMAL)** (`product.inventory_selection.seatmap`)
  - tourId=`81403` productId=`38078` — inventorySelectionType=SEATMAP — fixture: `fixtures/product.inventory_selection.seatmap__81403.json` (last verified 2026-08-19T07:20:55.627Z)
  - tourId=`82992` productId=`38741` — inventorySelectionType=SEATMAP — fixture: `fixtures/product.inventory_selection.seatmap__82992.json` (last verified 2026-08-19T07:21:07.263Z)
- [x] **inventorySelectionType=SVG — undocumented third value alongside NORMAL/SEATMAP, found via payload diffing (not in docs)** (`product.inventory_selection.svg`)
  - tourId=`90863` productId=`42057` — inventorySelectionType=SVG — fixture: `fixtures/product.inventory_selection.svg__90863.json` (last verified 2026-08-19T07:20:51.461Z)
  - tourId=`90864` productId=`42057` — inventorySelectionType=SVG — fixture: `fixtures/product.inventory_selection.svg__90864.json` (last verified 2026-08-19T07:20:52.169Z)

## Catalog Hierarchy

- [x] **Product with secondaryCategories populated (multi-category)** (`catalog.categories.secondary_present`)
  - tourId=`16969` productId=`5073` — secondaryCategories=[1] — fixture: `fixtures/catalog.categories.secondary_present__16969.json` (last verified 2026-08-19T07:20:38.151Z)
  - tourId=`44762` productId=`5073` — secondaryCategories=[1] — fixture: `fixtures/catalog.categories.secondary_present__44762.json` (last verified 2026-08-19T07:20:38.928Z)

## Product Structuring

- [x] **TRANSFER / AIRPORT_TRANSFER product type** (`product.type.transfer`)
  - tourId=`20691` productId=`11012` — productType=TRANSFER — fixture: `fixtures/product.type.transfer__20691.json` (last verified 2026-08-19T07:20:56.456Z)
  - tourId=`20692` productId=`11012` — productType=TRANSFER — fixture: `fixtures/product.type.transfer__20692.json` (last verified 2026-08-19T07:20:58.125Z)
- [x] **Product with 3+ variants** (`product.variant_count.multi`)
  - tourId=`26838` productId=`14122` — variantCount=5 — fixture: `fixtures/product.variant_count.multi__26838.json` (last verified 2026-08-19T07:20:30.351Z)
  - tourId=`32468` productId=`14122` — variantCount=5 — fixture: `fixtures/product.variant_count.multi__32468.json` (last verified 2026-08-19T07:20:33.944Z)
- [x] **Delayed confirmation product (hasInstantConfirmation=false)** (`product.confirmation.delayed`)
  - tourId=`26838` productId=`14122` — hasInstantConfirmation=false — fixture: `fixtures/product.confirmation.delayed__26838.json` (last verified 2026-08-19T07:20:31.059Z)
  - tourId=`32468` productId=`14122` — hasInstantConfirmation=false — fixture: `fixtures/product.confirmation.delayed__32468.json` (last verified 2026-08-19T07:20:34.635Z)
- [ ] **Variant with cashback** (`variant.cashback.present`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.606Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario variant.cashback.present --force` if sandbox catalog has since grown._

## Cancellation

- [x] **Non-cancellable / non-refundable variant** (`variant.cancellation.nonrefundable`)
  - tourId=`26838` productId=`14122` — cancellable=false cutoff=null — fixture: `fixtures/variant.cancellation.nonrefundable__26838.json` (last verified 2026-08-19T07:20:31.772Z)
  - tourId=`32468` productId=`14122` — cancellable=false cutoff=null — fixture: `fixtures/variant.cancellation.nonrefundable__32468.json` (last verified 2026-08-19T07:20:35.325Z)
- [x] **Cancellable-up-to cutoff window variant** (`variant.cancellation.cutoff_window`)
  - tourId=`44762` productId=`5073` — cancellable=true cutoff=2880 — fixture: `fixtures/variant.cancellation.cutoff_window__44762.json` (last verified 2026-08-19T07:20:39.629Z)
  - tourId=`72682` productId=`33426` — cancellable=true cutoff=2880 — fixture: `fixtures/variant.cancellation.cutoff_window__72682.json` (last verified 2026-08-19T07:20:37.421Z)

## Variant Properties

- [x] **Variant with non-empty `properties` (single string-valued)** (`variant.properties.single_value`)
  - tourId=`20691` productId=`11012` — properties keys=[VALIDITY] — fixture: `fixtures/variant.properties.single_value__20691.json` (last verified 2026-08-19T07:20:57.296Z)
  - tourId=`55513` productId=`26993` — properties keys=[LANGUAGE_CODE] — fixture: `fixtures/variant.properties.single_value__55513.json` (last verified 2026-08-19T07:20:53.516Z)
- [ ] **Variant with `propertiesV2` multi-value entry (e.g. multi-nationality/language)** (`variant.properties.v2_multi_value`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.656Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario variant.properties.v2_multi_value --force` if sandbox catalog has since grown._

## Validation Values Shape

- [x] **validation.values = null (no constraint) on a non-LOCATION field** (`field.values_shape.null`)
  - tourId=`26838` productId=`14122` — field NAME (STRING) validation.values shape=null — fixture: `fixtures/field.values_shape.null__26838.json` (last verified 2026-08-19T07:20:32.485Z)
  - tourId=`32468` productId=`14122` — field NAME (STRING) validation.values shape=null — fixture: `fixtures/field.values_shape.null__32468.json` (last verified 2026-08-19T07:20:36.013Z)
- [x] **validation.values as {type:TEXT, value:[...]} wrapper (ENUM) — only appears on GET /v2/inventories/{id}, never on the Product API** (`field.values_shape.wrapped_enum`)
  - tourId=`45780` productId=`23338` — field 146542 (ENUM) validation.values shape=wrapped(TEXT) — fixture: `fixtures/field.values_shape.wrapped_enum__45780.json` (last verified 2026-08-19T07:21:11.258Z)
  - tourId=`45784` productId=`23342` — field 146558 (ENUM) validation.values shape=wrapped(TEXT) — fixture: `fixtures/field.values_shape.wrapped_enum__45784.json` (last verified 2026-08-19T07:21:12.484Z)
- [x] **validation.values as {type:PREDEFINED_LOCATION, value:[...]} wrapper — only appears on GET /v2/inventories/{id}, never on the Product API** (`field.values_shape.wrapped_location`)
  - tourId=`100059` productId=`46899` — field 353237 (LOCATION) validation.values shape=wrapped(PREDEFINED_LOCATION) — fixture: `fixtures/field.values_shape.wrapped_location__100059.json` (last verified 2026-08-19T07:21:14.882Z)
  - tourId=`96647` productId=`45062` — field 331986 (LOCATION) validation.values shape=wrapped(PREDEFINED_LOCATION) — fixture: `fixtures/field.values_shape.wrapped_location__96647.json` (last verified 2026-08-19T07:21:13.680Z)

## Forward Compatibility

- [ ] **Field with a dataType outside the documented STRING/ENUM/BOOL/INT/FLOAT/LOCATION enum** (`field.type.unknown`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.706Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario field.type.unknown --force` if sandbox catalog has since grown._

## Field Level x Type Matrix

- [x] **STRING field at PRIMARY_CUSTOMER level** (`field.matrix.string.primary_customer`)
  - tourId=`26838` productId=`14122` — field NAME (STRING, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.string.primary_customer__26838.json` (last verified 2026-08-19T07:20:33.227Z)
  - tourId=`32468` productId=`14122` — field NAME (STRING, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.string.primary_customer__32468.json` (last verified 2026-08-19T07:20:36.738Z)
- [x] **STRING field at ALL_CUSTOMER level** (`field.matrix.string.all_customer`)
  - tourId=`90547` productId=`23340` — field NAME (STRING, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.string.all_customer__90547.json` (last verified 2026-08-19T07:20:46.757Z)
  - tourId=`90547` productId=`23341` — field NAME (STRING, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.string.all_customer__90547.json` (last verified 2026-08-19T07:20:49.310Z)
- [x] **ENUM field at PRIMARY_CUSTOMER level** (`field.matrix.enum.primary_customer`)
  - tourId=`45780` productId=`23338` — field CUSTOM_146542 (ENUM, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.enum.primary_customer__45780.json` (last verified 2026-08-19T07:20:45.495Z)
  - tourId=`45784` productId=`23342` — field CUSTOM_146558 (ENUM, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.enum.primary_customer__45784.json` (last verified 2026-08-19T07:20:50.745Z)
- [x] **ENUM field at ALL_CUSTOMER level** (`field.matrix.enum.all_customer`)
  - tourId=`19830` productId=`10477` — field CUSTOM_318326 (ENUM, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.enum.all_customer__19830.json` (last verified 2026-08-19T07:21:05.930Z)
  - tourId=`34386` productId=`33907` — field CUSTOM_236376 (ENUM, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.enum.all_customer__34386.json` (last verified 2026-08-19T07:21:03.813Z)
- [ ] **BOOL field at PRIMARY_CUSTOMER level** (`field.matrix.bool.primary_customer`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.854Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario field.matrix.bool.primary_customer --force` if sandbox catalog has since grown._
- [ ] **BOOL field at ALL_CUSTOMER level** (`field.matrix.bool.all_customer`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:15.904Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario field.matrix.bool.all_customer --force` if sandbox catalog has since grown._
- [x] **INT field at PRIMARY_CUSTOMER level** (`field.matrix.int.primary_customer`)
  - tourId=`40078` productId=`20371` — field CUSTOM_126640 (INT, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.int.primary_customer__40078.json` (last verified 2026-08-19T07:21:09.454Z)
  - tourId=`41808` productId=`21339` — field CUSTOM_133079 (INT, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.int.primary_customer__41808.json` (last verified 2026-08-19T07:21:08.630Z)
- [x] **INT field at ALL_CUSTOMER level** (`field.matrix.int.all_customer`)
  - tourId=`18326` productId=`9991` — field CUSTOM_151728 (INT, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.int.all_customer__18326.json` (last verified 2026-08-19T07:21:16.530Z)
  - tourId=`26523` productId=`13943` — field CUSTOM_87098 (INT, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.int.all_customer__26523.json` (last verified 2026-08-19T07:21:15.509Z)
- [ ] **FLOAT field at ALL_CUSTOMER level** (`field.matrix.float.all_customer`)
  - ⚠️ **Confirmed absent from sandbox** as of 2026-08-19T07:33:16.003Z — Scanned ~55 cities alphabetically (Amsterdam-Buenos Aires) plus targeted scan of Dubai/Singapore/London/Paris/Rome/Orlando/New York (largest catalogs), ~1500+ products total, as of 2026-08-18. Zero matches.
    _Re-attempt with `node cli.js discover --scenario field.matrix.float.all_customer --force` if sandbox catalog has since grown._
- [x] **LOCATION field at PRIMARY_CUSTOMER level** (`field.matrix.location.primary_customer`)
  - tourId=`54930` productId=`14828` — field CUSTOM_178257 (LOCATION, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.location.primary_customer__54930.json` (last verified 2026-08-19T07:20:40.931Z)
  - tourId=`80963` productId=`14828` — field CUSTOM_272968 (LOCATION, PRIMARY_CUSTOMER) — fixture: `fixtures/field.matrix.location.primary_customer__80963.json` (last verified 2026-08-19T07:20:42.217Z)
- [x] **LOCATION field at ALL_CUSTOMER level** (`field.matrix.location.all_customer`)
  - tourId=`34386` productId=`33907` — field CUSTOM_183502 (LOCATION, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.location.all_customer__34386.json` (last verified 2026-08-19T07:21:04.519Z)
  - tourId=`55771` productId=`24145` — field CUSTOM_180152 (LOCATION, ALL_CUSTOMER) — fixture: `fixtures/field.matrix.location.all_customer__55771.json` (last verified 2026-08-19T07:21:06.604Z)

