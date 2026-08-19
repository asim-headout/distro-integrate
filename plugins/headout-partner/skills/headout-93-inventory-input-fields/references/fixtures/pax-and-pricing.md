# Pax Types and Pricing Shapes

## What

Three independent pax/pricing variations to handle, each optional per product:

- **Nationality/region-gated pack** — a variant whose `properties`/`propertiesV2` key gates pricing
  or eligibility by nationality/residency (e.g. resident vs foreign-tourist pricing).
- **`PER_GROUP` vs `PER_PERSON` pricing** — `pricing.profileType` changes how price scales with pax
  count; `PER_GROUP` prices the whole booking as a unit rather than multiplying per traveler.
- **Booking-level vs per-pax-type pax bounds** — `variant.pax.{min,max}` bounds the *whole booking's*
  traveler count; `V2PersonPricing.paxRange.{min,max}` (per pax type, from the inventory pricing
  response) separately bounds how many of *that specific pax type* can be selected — these are
  different constraints and both need enforcing.

## Where

- `variant.properties` / `variant.propertiesV2` — nationality/region gating.
- `variant.pricing.profileType` — `PER_PERSON` | `PER_GROUP`.
- `variant.pax.{min,max}` — booking-level pax bounds (Products API).
- Inventory pricing response `persons[].paxRange.{min,max}` — per-pax-type bounds (Inventory list-by-tour).

## How

Read `profileType` before computing displayed/submitted price — do not assume `PER_PERSON` and
multiply blindly; a `PER_GROUP` variant prices as a flat total. Enforce both pax-bound levels
independently: booking-level `variant.pax` caps total travelers, per-pax-type `paxRange` caps how
many of one specific type (e.g. "max 2 CHILD") regardless of the booking-level max still being room.

## Samples

**Nationality-gated property** (tourId `23362`, productId `33907`):

```json
{ "key": "NATIONALITY", "value": "FOREIGN_TOURIST" }
```

**Non-default booking-level pax bounds** (tourId `34761`, productId `18194`) — this variant requires at least 2 travelers, not the default min of 1:

```json
{ "min": 2, "max": 10 }
```

**Per-pax-type bounded range** (tourId `16969`, productId `5073`) — this specific pax type is capped independently of the booking-level max:

```json
{
  "type": "GENERAL",
  "ageFrom": 3,
  "ageTo": 99,
  "paxRange": { "min": 0, "max": 5 }
}
```

**`PER_GROUP` pricing** (tourId `81053`, productId `9003`):

```json
{ "currency": "USD", "profileType": "PER_GROUP", "headoutSellingPrice": 156.3, "netPrice": 132.88 }
```

**Confirmed absent from sandbox** (as of 2026-08-18): variants with `propertiesV2` holding more than
one value (i.e. genuinely multi-valued properties, e.g. valid for multiple nationalities/languages at
once). Implement multi-value `propertiesV2` rendering per the documented contract regardless.

## Full data

- Full fixture JSON: `../../../../tools/sandbox-scenario-catalog/output/fixtures/variant.pax.nationality_gated__23362.json`, `variant.pax.min_max_nondefault__34761.json`, `variant.pax.per_type_range_bounded__16969.json`, `variant.pricing.per_group__81053.json`
- Live status: [CHECKLIST.md](../../../../tools/sandbox-scenario-catalog/output/CHECKLIST.md)
