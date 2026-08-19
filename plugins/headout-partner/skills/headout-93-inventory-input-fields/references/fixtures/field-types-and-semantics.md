# Field Types and Semantics

## What

`inputFields[].dataType` is one of `STRING`, `ENUM`, `BOOL`, `INT`, `FLOAT`, `LOCATION`. A field's
real-world purpose (passport number, date of birth, weight, pickup location, ...) is **not** encoded
in `dataType`, and critically, **is not encoded in `id` either**.

Every custom field's `id` is an opaque `CUSTOM_<numericId>` (e.g. `CUSTOM_235806`) — there is no
stable, semantic id like `PASSPORT_NUMBER` or `DATE_OF_BIRTH`. Only the three standard fields
(`NAME`, `EMAIL`, `PHONE`) have semantic ids. The field's actual purpose lives only in `name` and
`description`.

## Where

`inputFields[].id`, `.name`, `.description`, `.dataType` — present on both the Products API
(`variants[].inputFields[]`) and the Inventory Details API (`inputFields[]`); see
[validation-values-shapes.md](validation-values-shapes.md) for how the numeric-vs-string `id` form
differs between the two.

## How

**Never pattern-match on `id`** to detect a field's semantics (e.g. `id.includes('PASSPORT')` — this
silently never matches, since real passport fields look like `CUSTOM_235806`). Match on `name`
and/or `description` text instead, and treat that matching as best-effort UI hinting only — the
authoritative behavior (required/optional, validation, level, submission key) always comes from the
field's own metadata, not from guessing its semantic category.

Do not assume a numeric-looking real-world field implies a numeric `dataType`. Weight, height, and
similar fields are frequently `dataType: STRING` with the unit given in `description` (e.g. "KGs"),
not `INT`/`FLOAT`. Render the field per its actual `dataType`; use `description` only as helper text.

## Samples

**Passport field** (tourId `71533`, productId `33762`) — semantic meaning only visible via `name`/`description`, `id` is opaque:

```json
{
  "id": "CUSTOM_235806",
  "name": "Passport Details",
  "description": "Please enter your Passport ID",
  "dataType": "STRING",
  "level": "ALL_CUSTOMER"
}
```

**Date of Birth field** (tourId `40974`, productId `20840`) — also `dataType: STRING`, not a `DATE` type (no `DATE` dataType exists):

```json
{
  "id": "CUSTOM_138848",
  "name": "Date of Birth",
  "description": "YYYY-MM-DD",
  "dataType": "STRING",
  "level": "ALL_CUSTOMER"
}
```

**"Numeric" field encoded as STRING** (tourId `28840`, productId `15371`):

```json
{
  "id": "CUSTOM_177565",
  "name": "Weight",
  "description": "KGs",
  "dataType": "STRING",
  "level": "ALL_CUSTOMER"
}
```

**Confirmed absent from sandbox** (searched ~120 cities, thousands of products, zero matches — as of
2026-08-18): `dataType: BOOL` fields, and any `dataType` outside the documented
`STRING`/`ENUM`/`BOOL`/`INT`/`FLOAT`/`LOCATION` set. Implement BOOL rendering and an unknown-`dataType`
blocking call-out per [backend.md](../backend.md) regardless — sandbox not exercising these does not
mean partner integrations won't encounter them in production.

## Full data

- Full fixture JSON: `../../../../tools/sandbox-scenario-catalog/output/fixtures/field.semantics.passport__71533.json`, `field.semantics.dob__40974.json`, `field.semantics.numeric_as_string__28840.json`
- Live status of every field-type/semantics scenario: [CHECKLIST.md](../../../../tools/sandbox-scenario-catalog/output/CHECKLIST.md)
