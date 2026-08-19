# Field Levels and the Type×Level Matrix

## What

`inputFields[].level` controls where a field's answer is collected and submitted:

- `PRIMARY_CUSTOMER` — collected once, from the primary/lead traveler only.
- `ALL_CUSTOMER` — collected once per traveler in the booking.

A third level, `BOOKING`, exists in Headout's general enum documentation but is not served in this
integration — Headout confirmed no product returns a `BOOKING`-level field, so don't build a
submission path for it.

Not every `dataType` × `level` combination has been observed in sandbox — see the matrix below.

## Where

`inputFields[].level` on both the Products API and Inventory Details API responses. Submission
placement mirrors this: see [backend.md](../backend.md)'s "Booking mapping" section for exactly where
each level's value goes in the create-booking payload.

## How

Route rendering and submission by `level`, not by assumption. A field with the same `name` can appear
at different levels on different products — always read `level` from the live response, never
hardcode which fields are per-traveler vs per-booking.

## Matrix (confirmed in sandbox, as of 2026-08-18)

| dataType | PRIMARY_CUSTOMER | ALL_CUSTOMER |
|---|---|---|
| STRING | ✅ found | ✅ found |
| ENUM | ✅ found | ✅ found |
| BOOL | ❌ confirmed absent | ❌ confirmed absent |
| INT | ✅ found | ✅ found |
| FLOAT | not found in scan | ❌ confirmed absent |
| LOCATION | ✅ found | ✅ found |

## Samples

**STRING at ALL_CUSTOMER** (tourId `90547`, productId `23340`) and **INT at PRIMARY_CUSTOMER** (tourId `40078`, productId `20371`):

```json
{
  "id": "CUSTOM_126640",
  "name": "Postal Code/Zip",
  "dataType": "INT",
  "level": "PRIMARY_CUSTOMER"
}
```

## Full data

- Fixture JSON per matrix cell: `../../../../tools/sandbox-scenario-catalog/output/fixtures/field.matrix.*.json`
- Live status of every matrix cell: [CHECKLIST.md](../../../../tools/sandbox-scenario-catalog/output/CHECKLIST.md)
