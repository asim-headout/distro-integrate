# Sandbox Scenario Catalog

A deterministic (no LLM) CLI that finds and re-verifies real sandbox products
demonstrating each edge-case scenario from `../../references/` /
`scratch/edge-case-taxonomy.md`, and maintains `output/scenarios.csv` — a
durable, shareable catalog of `tourId`/`productId`/`inventoryId` examples for
partner integration testing.

## Why not DB-driven discovery

Discovery is done entirely through the public sandbox Partner API
(`GET /v2/products/list`, `GET /v2/products/{id}`, `GET /v2/inventories`),
not a direct DB connection — the script is meant to run standalone (cron,
your laptop, CI) without embedding DB credentials. If you already have a
candidate list from a DB query (e.g. via the `headout-db` MCP tool in a
Claude session), pass it with `--candidates candidates.csv` (a file with a
`tourId` column) to skip full-catalog crawling and go straight to
verification — this is the fast path for "verify these Dubai products".

## Setup

```bash
cd plugins/headout-partner/tools/sandbox-scenario-catalog
export HEADOUT_SANDBOX_TOKEN="tk_..."   # Headout-Auth header value
```

No npm install needed — pure Node 18+ (uses built-in fetch).

## Commands

### 1. Discover — find fresh examples for scenarios not yet in the catalog

```bash
node cli.js discover --scenario all
node cli.js discover --scenario location_predefined,passport_field
node cli.js discover --candidates candidates.csv          # fast path
node cli.js discover --city DUBAI --max-products 500       # scoped crawl
```

- Reads `output/scenarios.csv` first and **skips any scenario that already
  has `earlyExitMatches` verified rows** (config-driven, default 2 per
  scenario) — so re-running only fills gaps, it never redoes finished work.
- Crawls `GET /v2/products/list` (paginated, optionally `--city`-filtered),
  fetches each product + its inventories, and runs every *not-yet-satisfied*
  scenario's checker function against it.
- Rate-limit safe: bounded concurrency (`--concurrency`, default 3), a fixed
  delay between requests (`--delay-ms`, default 250), and exponential
  backoff + retry (up to 5 attempts) on 429/5xx.
- Early-exits the whole crawl once every requested scenario has hit its
  `earlyExitMatches` count — it does not keep scanning all 6500 products
  once it has enough evidence.
- Appends new matches to `output/scenarios.csv`.

### 2. Verify — re-check existing rows are still valid (for the 6-12mo lifetime)

```bash
node cli.js verify                      # re-verify every row
node cli.js verify --scenario passport_field
node cli.js verify --refill             # if a row goes stale, auto re-discover a replacement
```

- Re-fetches each catalogued product/inventory and reruns its original
  checker. Updates `lastVerifiedAt` + `status` (`OK` / `STALE`) in place.
- Never deletes rows (history is preserved) — `STALE` rows stay in the CSV
  so you can see what broke and when.

### 3. List scenarios

```bash
node cli.js list-scenarios
```

### 4. Generate checklist — partner-facing deliverable

```bash
node cli.js generate-checklist
```

Writes `output/CHECKLIST.md`: every scenario grouped by category, checked off
once a verified sandbox example exists, with the `tourId`/`productId` and
fixture link. Also documents expected fallback behavior when
`GET /v2/inventories/{id}` fails (see below). This is the file to link to
partners alongside `scenarios.csv` — it doubles as a lightweight contract
test list even without generated code.

## Scope

This tool covers:

- **Field Level x Type Matrix** — one raw field object per (dataType, level)
  combination (`config.json` + `output/fixtures/*.json`).
- **Validation Values Shape** — the exact `validation.values` shape (`null` /
  raw array / `{type, value}` wrapper) per dataType, backed by real fixture
  JSON.
- **Verification checklist / contract tests** — `node cli.js
  generate-checklist` → `output/CHECKLIST.md`.
- **Inventory-field retrieval fallback** — documented in `CHECKLIST.md`'s
  "Inventory-field retrieval fallback" section, and implemented in
  `cli.js`'s `evaluateProductForScenarios` (inventory-details fetch failures
  are caught and inventory-level checks are skipped for that variant rather
  than failing the whole run).
- **Variant Properties** — `properties` (single string-valued) vs
  `propertiesV2` (multi-value) populated on a variant.
- **Forward Compatibility** — a field whose `dataType` falls outside the
  documented `STRING/ENUM/BOOL/INT/FLOAT/LOCATION` enum, so partners can
  verify their fallback/unknown-type handling.

## Config

`config.json` defines the scenario list: `id`, `category`, `name`,
`checker` (function name in `lib/checkers.js`), `earlyExitMatches`. Add a
new scenario by adding a config entry + a checker function — no other code
changes needed.

## Output

`output/scenarios.csv` columns:

```
scenarioId,category,scenarioName,productId,variantId,tourId,inventoryId,evidence,firstVerifiedAt,lastVerifiedAt,status
```

This is the file you import into Google Sheets / share with partners.
