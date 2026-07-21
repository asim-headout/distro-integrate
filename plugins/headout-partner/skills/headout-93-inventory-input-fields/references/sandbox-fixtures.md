# Sandbox Fixture Matrix

This POC uses a Headout-owned matrix of sandbox product and inventory IDs. IDs are intentionally not
invented or copied from production. Headout must populate the table below before distributing a
fixture-dependent smoke-test handoff.

| Fixture | Product ID | Inventory ID | Expected coverage | Status |
|---|---|---|---|---|
| Standard customer fields | Headout supplied | Headout supplied | `STRING`, phone, required/optional | Pending IDs |
| Enum choice | Headout supplied | Headout supplied | `ENUM`, exact allowed value | Pending IDs |
| Predefined pickup | Headout supplied | Headout supplied | `LOCATION` + `PREDEFINED_LOCATION` | Pending IDs |
| Free-form location | Headout supplied | Headout supplied | `LOCATION` without options | Pending IDs |
| Booking-level field | Headout supplied | Headout supplied | `level=BOOKING` | Pending IDs |
| All-customer field | Headout supplied | Headout supplied | `level=ALL_CUSTOMER` | Pending IDs |

## How the skill uses the matrix

1. Configure the partner's sandbox base URL and server-side sandbox `Headout-Auth`.
2. Fetch each inventory-details URL with the ID from the approved matrix.
3. Record only redacted metadata: HTTP status, field IDs, levels, data types, and option counts.
4. Verify the matching checkout control and booking payload placement.
5. If an ID returns `404`, no longer exercises the expected shape, or is production-only, stop and
   request a replacement from Headout. Do not substitute a guessed ID.

For partners without the matrix, use their own sandbox inventory IDs and compare the response against
the API reference; the same no-guessing and redaction rules apply.
