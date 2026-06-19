# Persistence and Migrations

Use this whenever a Headout step touches checkout, payment, booking, webhooks, cancellation,
reschedule, diagnostics, or reconciliation.

## First inspect persistence ownership

Before coding DB-related behavior, inspect the partner repo for:

- Existing order, booking, cart, payment, webhook, or event models/tables.
- Migration tooling: Prisma, Drizzle, Rails, Django, Laravel, TypeORM, Sequelize, SQLAlchemy/Alembic,
  Knex, raw SQL migrations, or a company-specific migration runner.
- Whether this repo owns the DB schema, calls an external order service, or is a frontend/BFF that
  expects migrations in another repo.

If persistence is needed and ownership is unclear, stop early and ask the developer one of these
questions:

- "I found DB usage here. Should I add migrations in this repo, only propose schema changes, or is
  persistence owned by another repo/service?"
- "I do not see DB schema ownership in this repo. Is this integration stateless, backed by an
  external order service, or should I add local persistence?"
- "Migrations appear to live elsewhere. Should I produce a schema handoff, or do you want to provide
  the migration repo/path?"

Do not add a new ORM, migration framework, database, queue, or persistence abstraction unless the
developer explicitly asks.

## Migration rules

- Preserve the repo's existing schema and migration conventions. Reuse existing order/booking/payment
  tables when possible; add minimal columns or join/event tables instead of replacing models.
- Generate migrations only when this repo clearly owns migrations or the developer approves it.
- If migrations live in another repo, produce a concise handoff schema spec and continue only with
  code that fits the current repo's boundary.
- Keep migrations reversible when the local migration system supports rollback.
- Never run production migrations. Local/test migrations follow the repo's normal workflow and only
  after the developer has approved DB changes or the repo convention clearly expects them.

## Minimum booking persistence

Persist enough to make create/capture/get, duplicate prevention, and reconciliation safe:

- Local order/cart id and partner order/reference id.
- Headout `bookingId` once create succeeds.
- `partnerReferenceId` used during capture.
- Headout booking status: `UNCAPTURED`, `PENDING`, `COMPLETED`, `CANCELLED`, `FAILED`,
  `CAPTURE_TIMEDOUT`.
- Partner payment/PSP reference, payment status, capture status, and timestamps.
- Selected product, variant, inventory, date/time, currency, language, pax summary, and seat ids when
  needed for reconciliation.
- Idempotency/client request key for submit/double-click/retry protection.
- Last successful Headout sync timestamp and last error/retry metadata if the repo has such patterns.

Recommended constraints when the local DB supports them:

- Unique `headoutBookingId` when present.
- Unique `partnerReferenceId` when used.
- Unique PSP payment/reference id when present.
- Unique idempotency key per checkout/order submit flow.

## Webhook/event persistence

For booking-management steps, persist enough event metadata for idempotency and out-of-order safety:

- Event id if Headout provides one; otherwise a derived key such as `bookingId + status + eventTimestamp`.
- `bookingId`, status, event timestamp, received timestamp, processed timestamp, and processing result.
- Previous local status and new local status when the repo keeps an audit trail.
- Redacted error/retry metadata for failed processing.

Return 2xx only after successful processing. A duplicate event must be a no-op. A stale event must not
overwrite a more advanced local booking status.

## Privacy and retention

- Do not store raw Headout responses by default.
- Do not store or log API keys, full PII-heavy customer payloads, voucher URLs, ticket payloads, QR
  codes, barcode values, or raw PSP card data.
- If the partner already stores raw payloads for compliance/debugging, follow their redaction and
  retention conventions exactly.

## Tests and verification

Use the existing test workflow. Add focused coverage for:

- Migration/model shape when a migration is added.
- Double submit uses the same idempotency key and does not create duplicate Headout bookings.
- Create succeeds but capture/payment fails; state can reconcile safely.
- Duplicate webhook is a no-op.
- Out-of-order webhook cannot regress status.
- Missing local booking is logged/reconciled without crashing the webhook handler.
