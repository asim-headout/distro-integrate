# Field Levels and the Type×Level Matrix

## What

`inputFields[].level` controls where a field's answer is collected and submitted:

- `PRIMARY_CUSTOMER` — collected once, from the primary/lead traveler only.
- `ALL_CUSTOMER` — collected once per traveler in the booking.
- `BOOKING` — collected once per booking, independent of traveler count.

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

| dataType | PRIMARY_CUSTOMER | ALL_CUSTOMER | BOOKING |
|---|---|---|---|
| STRING | ✅ found | ✅ found | ❌ confirmed absent |
| ENUM | ✅ found | ✅ found | ❌ confirmed absent |
| BOOL | ❌ confirmed absent | ❌ confirmed absent | ❌ confirmed absent |
| INT | ✅ found | ✅ found | not scanned |
| FLOAT | not found in scan | ❌ confirmed absent | not scanned |
| LOCATION | ✅ found | ✅ found | ❌ confirmed absent |

**No `BOOKING`-level field of any dataType was found anywhere in sandbox** across ~120 cities and
thousands of products. Booking-level fields (pickup/transportation/product-specific choices per
[backend.md](../backend.md)) are a documented, real part of the contract — implement the `BOOKING`
submission path regardless of this gap; it cannot currently be exercised against live sandbox data.

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
