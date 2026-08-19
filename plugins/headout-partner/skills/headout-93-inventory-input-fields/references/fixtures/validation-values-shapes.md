# `validation.values` Shape — Endpoint-Specific, Not Just DataType-Specific

## What

The [enums-and-error-codes doc](https://partner.headout.com/docs/guide/enums-and-error-codes#validation-values-%E2%80%94-polymorphic-field)
correctly documents that `validation.values` is polymorphic by `dataType`:

- `ENUM` → `string[]` (exact-match values).
- `LOCATION` with predefined options → array of location objects.
- everything else → `null`.

**That part of the doc is accurate — do not re-litigate it.** What the doc does not say: this shape
is specific to the **Products API** (`GET /v2/products/{id}`, i.e. `variants[].inputFields[]`). The
**Inventory Details API** (`GET /v2/inventories/{id}`) returns the identical underlying field wrapped
in an object instead: `{ "type": "TEXT" | "PREDEFINED_LOCATION", "value": [...] }`, where `value` holds
exactly the array the doc describes.

Confirmed live on the same field (same `oldId`/numeric id, same product) returning both shapes
depending on which endpoint you call — see the before/after pair below.

## Where

- Products API: `variants[].inputFields[].validation.values` — plain array or `null`.
- Inventory Details API: `inputFields[].validation.values` — `{type, value}` object or `null`.

## How

Write one parser per endpoint, or normalize immediately after fetch — do not write a single
`values`-parsing function and reuse it against both endpoints' responses. If your integration calls
the Products API for the default contract and separately calls Inventory Details for per-slot
overrides (see [inventory-overrides.md](inventory-overrides.md)), code that correctly parses one will
silently break (or throw) on the other unless it branches on which endpoint produced the response.

A `values` object that isn't a plain array (from Inventory Details) and isn't `null` and isn't
`{type, value}` is an unknown shape — treat that as a blocking contract mismatch per
[backend.md](../backend.md)'s stale-fact rule, don't silently coerce it.

## Samples — the same field, both shapes

**Products API** (productId `23338`, variantId/tourId `45780`, field `CUSTOM_146542`):

```json
{
  "id": "CUSTOM_146542",
  "dataType": "ENUM",
  "validation": {
    "required": true,
    "values": [
      "Pick-up service is available from all hotels in Abu Dhabi as well as major shopping malls."
    ]
  }
}
```

**Inventory Details API** (same underlying field, numeric id `146542`, on an inventory slot for the same variant):

```json
{
  "id": "146542",
  "dataType": "ENUM",
  "validation": {
    "required": true,
    "values": {
      "type": "TEXT",
      "value": [
        "Pick-up service is available from all hotels in Abu Dhabi as well as major shopping malls."
      ]
    }
  }
}
```

**LOCATION at Products API level** (tourId `39975`, productId `20321`, field `CUSTOM_272990`) — plain
array, no wrapper, 700+ predefined locations total, first 2 shown:

```json
{
  "id": "CUSTOM_272990",
  "name": "Pickup Location",
  "dataType": "LOCATION",
  "validation": {
    "required": true,
    "values": [
      { "id": 462715, "displayName": "AG Hotels", "latitude": 36.887432, "longitude": 30.732705,
        "address": "Kızıltoprak, Aspendos Blv. No: 27/A, 07300 Muratpaşa/Antalya, Türkiye",
        "timingConfig": { "startTime": null, "endTime": null, "minPeriod": null, "maxPeriod": null },
        "note": null },
      { "id": 462716, "displayName": "APA Boutique Hotel", "latitude": 36.865879, "longitude": 30.4557,
        "address": "Çağlarca, 07070 Konyaaltı/Antalya, Türkiye",
        "timingConfig": { "startTime": null, "endTime": null, "minPeriod": null, "maxPeriod": null },
        "note": null }
    ]
  }
}
```

**LOCATION at Inventory Details level** (tourId `100059`, productId `46899`, field `353237`) — the
`{type, value}` wrapper, 9 predefined locations total, first 2 shown:

```json
{
  "id": "353237",
  "name": "Pickup Same As Drop Off Location",
  "dataType": "LOCATION",
  "validation": {
    "required": true,
    "values": {
      "type": "PREDEFINED_LOCATION",
      "value": [
        { "id": 487584, "displayName": "Zephyr Agadir", "latitude": 30.428041, "longitude": -9.592544,
          "timingConfig": { "startTime": "05:00:00", "endTime": "06:00:00" } },
        { "id": 487585, "displayName": "Hotel Petite Suede", "latitude": 30.428041, "longitude": -9.592544,
          "timingConfig": { "startTime": "05:00:00", "endTime": "06:00:00" } }
      ]
    }
  }
}
```

**`null` case** (tourId `26838`, productId `14122`, standard `NAME` field) — most STRING fields have no `values` constraint at all:

```json
{ "id": "NAME", "dataType": "STRING", "validation": { "required": true, "values": null } }
```

## Full data

- Full fixture JSON: `../../../../tools/sandbox-scenario-catalog/output/fixtures/field.values_shape.wrapped_enum__45780.json`, `field.type.location.predefined__39975.json`, `field.values_shape.wrapped_location__100059.json`, `field.values_shape.null__26838.json`
- Live status: [CHECKLIST.md](../../../../tools/sandbox-scenario-catalog/output/CHECKLIST.md)
