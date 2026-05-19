# Headout Distro MCP Handoff

This document captures the current product direction for `distro-mcp-server` and the adjacent partner-integration products that may come after it. It is written for humans and future coding agents.

## Goal

Build a partner-facing MCP server for Headout distribution/API integrations.

The first version should be prompt-first: it should expose reusable integration prompts/templates rather than API tools/actions. Its job is to make a partner's AI assistant behave like a careful Headout integration engineer across arbitrary tech stacks and architectures.

## Source Docs

Use these as the source of truth:

- `https://partner.headout.com/docs/llms.txt`
- `https://partner.headout.com/docs/specs/openapi-v2.yaml`

`llms.txt` is the machine-readable documentation index. It links to v1/v2 Markdown pages, guide pages, and OpenAPI specs.

Default to Headout API v2. Warn against v1 unless the user explicitly asks for it.

OpenAPI v2 confirms:

- Production server: `https://www.headout.com`
- Sandbox server: `https://sandbox.api.dev-headout.com`
- Auth header: `Headout-Auth: <YOUR_API_KEY>`

Important endpoint groups:

- `/api/public/v2/categories`
- `/api/public/v2/collections`
- `/api/public/v2/products`
- `/api/public/v2/products/{productId}`
- `/api/public/v2/subcategories`
- `/api/public/v2/cities`
- `/api/public/v2/inventory/list-by/tour`
- `/api/public/v2/bookings`
- `/api/public/v2/bookings/{bookingId}`
- booking cancellation and reschedule endpoints
- `/api/public/v2/webhooks`
- seatmap availability, inventory, validate, SVG, and iframe endpoints

## MCP Product Direction

The MCP should not assume a partner stack or code pattern. Each prompt should instruct the AI to first inspect the partner repo and classify the integration shape:

- Direct server-side API calls
- Existing API wrapper around Headout
- Generated OpenAPI client
- Monorepo package boundary
- Next.js API routes or server actions
- Backend service integration
- Serverless function integration
- Existing domain service/repository pattern

Prompts should tell the AI to preserve local conventions:

> Use the project's existing HTTP client, env loading, validation, logging, error handling, test runner, package manager, and folder boundaries. Do not introduce a new SDK/client abstraction unless the repo already has that pattern or no clear pattern exists.

## Initial Prompt Catalog

Recommended first prompts:

- `plan_headout_integration`
- `implement_headout_discovery`
- `implement_headout_inventory_and_pricing`
- `implement_headout_booking_tdd`
- `implement_headout_seatmap`
- `implement_headout_webhooks`
- `review_headout_integration`
- `debug_headout_integration`
- `generate_headout_test_plan`

Useful prompt arguments:

- `techStack`
- `partnerMode`: `api-partner | affiliate | unknown`
- `integrationSurface`: `existing-wrapper | direct-server-code | generated-client | unknown`
- `includeSeatmap`: boolean
- `testingMode`: `tdd | existing-tests | skip-tests`
- `maxFileLines`: default `400`
- `sandboxValidation`: `none | optional | required`

Default behavior: TDD unless the user explicitly overrides it.

## TDD Rules

Every implementation prompt should instruct the AI to:

1. Inspect the existing test setup.
2. Write failing tests first.
3. Cover unit tests for mapping, price calculation, and payload logic.
4. Add integration/contract-style tests with mocked Headout responses.
5. Add sandbox smoke tests only when sandbox credentials are available.
6. Skip sandbox tests cleanly if env vars are missing.
7. Never hardcode credentials.
8. Never call production for tests.
9. Avoid creating sandbox bookings unless explicitly allowed.
10. Run the project's existing tests before finishing.

Likely sandbox env vars:

- `HEADOUT_API_KEY`
- `HEADOUT_BASE_URL=https://sandbox.api.dev-headout.com`

## Code Quality Rules

Prompts should require:

- Keep Headout API keys server-side only.
- Do not use client-side or public env vars for API keys.
- Prefer files under 300 lines.
- Treat files over 400 lines as a review/split threshold.
- Avoid artificial abstractions just for line count.
- Use typed request/response boundaries where the stack supports it.
- Centralize auth/header/base URL handling.
- Centralize endpoint construction enough to avoid duplication.
- Map Headout errors into the partner's existing error model.
- Do not log API keys, customer PII, full request bodies, or voucher/ticket data.
- Use structured logs around endpoint, status, Headout booking ID, partner reference ID, and correlation/request ID where available.

## Critical Edge Cases

Booking, inventory, and pricing prompts must force tests for:

- `PER_PERSON` vs `PER_GROUP` pricing
- `ADULT`, `CHILD`, `STUDENT`, `SENIOR`, and unknown future person types
- `paxRange.min` and `paxRange.max`
- `customersDetails.count` equals `customers` array length
- exactly one primary customer
- required customer input fields such as `NAME`, `EMAIL`, `PHONE`, and custom fields
- booking-level `variantInputFields`
- `LIMITED`, `UNLIMITED`, and `CLOSED` inventory
- remaining count behavior
- stale price rejection
- `price.amount` calculation across multiple pax types
- currency consistency from inventory fetch to booking
- distinctions between `price`, `originalPrice`, `netPrice`, and `headoutSellingPrice`
- pagination fields: `nextUrl`, `prevUrl`, `nextOffset`, `total`
- local datetimes without timezone offsets
- null/empty optional fields

Booking lifecycle statuses:

- `UNCAPTURED`
- `PENDING`
- `COMPLETED`
- `CANCELLED`
- `FAILED`
- `CAPTURE_TIMEDOUT`

Important lifecycle behavior:

- Create booking returns/uses `UNCAPTURED`.
- Capture booking by updating status to `PENDING` and providing `partnerReferenceId`.
- `UNCAPTURED` can expire to `CAPTURE_TIMEDOUT` after 1 hour.
- Cancellation/reschedule submit async requests; the immediate response is acknowledgement, not final state.
- Webhooks do not send `UNCAPTURED`.

Seatmap edge cases:

- `inventorySelectionType: SEATMAP` vs `NORMAL`
- iframe flow vs custom seat selection flow
- seatmap validation can return HTTP 200 with business-level validation errors
- validate before booking
- hard ceiling of 20 seats per validation request
- `SEAT_UNAVAILABLE`
- `SEAT_NOT_FOUND`
- `ADJACENCY_RULE_VIOLATION`
- adjacent-seat and table-selection constraints
- use returned validated prices when creating booking

## MCP Telemetry And Logging

The MCP should include logging so Headout can improve prompts over time. A prompt-only MCP can log prompt invocations and arguments, but cannot see full downstream AI behavior unless tools are added or the client passes data.

Recommended telemetry modes:

- `HEADOUT_MCP_TELEMETRY=off | local | remote`
- `HEADOUT_MCP_TELEMETRY_ENDPOINT=<url>`
- `HEADOUT_MCP_LOG_LEVEL=error | info | debug`

Suggested default: `off` or `local`, not silent remote upload.

Safe telemetry fields:

- timestamp
- MCP package version
- prompt name
- redacted prompt arguments
- tech stack
- partner mode
- integration surface
- seatmap inclusion
- testing mode
- docs version/hash
- client name if available
- error category

Do not log:

- API keys
- customer PII
- full code files
- full request/response payloads
- booking vouchers/tickets
- partner proprietary business logic

Redact common secret and PII keys:

- `apiKey`
- `authorization`
- `Headout-Auth`
- `token`
- `secret`
- `password`
- `email`
- `phone`
- `name`

## Potential Future MCP Tools

The first version can remain prompt-only. Later useful tools:

- `fetch_headout_docs_section`
- `resolve_headout_endpoint`
- `validate_booking_payload_shape`
- `validate_price_calculation`
- `validate_seatmap_selection`
- `record_integration_feedback`
- `check_docs_freshness`

Sandbox validation tools may be useful later, but they need an explicit security and opt-in model.

## Non-MCP Partner Improvements

Potential products that may be higher leverage than MCP alone:

- Sandbox test kit with known products, variants, pax combinations, seatmap products, and expected outcomes
- Contract test package partners can run against their integration
- Postman collection
- Reference integrations for Next.js, Node/Express, Laravel, Rails, Django, and Spring Boot
- Webhook receiver simulator
- Generated SDKs or OpenAPI client generation guides
- Partner dashboard diagnostics for recent API errors and webhook failures
- More actionable API error messages

Best long-term package:

1. AI-readable docs and OpenAPI specs
2. Prompt-only MCP
3. Sandbox validation kit
4. Reference integrations
5. Contract tests
6. Partner diagnostics dashboard

## Feature: Contract Tests

Contract tests are a package or CLI that partners run against their own integration to prove they handled Headout flows correctly.

Example usage:

```bash
npx @headout/partner-contract-tests
```

Or inside their repo:

```bash
npm install -D @headout/partner-contract-tests
```

Example config:

```ts
export default {
  baseUrl: "http://localhost:3000",
  headoutSandboxBaseUrl: "https://sandbox.api.dev-headout.com",
  scenarios: ["discovery", "inventory", "booking", "webhooks", "seatmap"],
  endpoints: {
    searchProducts: "/api/experiences/search",
    createBooking: "/api/bookings",
    getBooking: "/api/bookings/:id",
    webhookReceiver: "/api/headout/webhook"
  }
};
```

What partners might see:

```text
Headout Partner Contract Tests

✓ Auth key is never exposed to browser responses
✓ Product listing maps Headout product IDs correctly
✓ Inventory handles LIMITED, UNLIMITED, CLOSED
✓ Price calculation matches inventory pricing
✓ Booking payload includes exactly one primary customer
✓ Booking count matches customer array length
✓ CHILD/STUDENT/SENIOR pax types are preserved
✓ Stale price failure is surfaced as retryable checkout error
✓ Webhook PENDING updates local booking state
✓ Webhook COMPLETED exposes ticket availability
✕ Cancellation acknowledgement incorrectly treated as final cancellation

Failed:
Cancellation request returns SUBMITTED, but your integration marked the booking as CANCELLED immediately.
Expected: pending cancellation state until final booking/webhook update.
```

How partners use it:

1. Start their app locally.
2. Point the contract test config to their local endpoints.
3. Provide sandbox credentials through env vars.
4. Run the test suite.
5. Fix failures before launch.
6. Add it to CI as a launch gate.

Contract test modes:

- Mock mode: uses fixed Headout-like responses. Fast, safe, deterministic.
- Sandbox mode: calls Headout sandbox. Slower, closer to reality, useful before launch.

Recommended first version: mock mode first, sandbox smoke tests later.

Contract tests answer:

> Does your integration behave correctly?

## Feature: Partner Diagnostics Dashboard

The partner diagnostics dashboard is a Headout-hosted dashboard where partners see whether their integration is healthy during sandbox testing and after launch.

Example overview:

```text
Integration Health

Environment: Sandbox
Status: Needs attention

Last 24 hours
- API requests: 1,284
- Failed requests: 37
- Booking attempts: 42
- Booking success rate: 81%
- Webhook delivery success: 92%
- Avg API latency: 420ms
```

Example issue list:

```text
Top Issues

1. Price mismatch during booking
   18 failures
   Endpoint: POST /api/public/v2/bookings
   Likely cause: booking price.amount does not match latest inventory price
   Suggested fix: refetch inventory before checkout and calculate price from current pax pricing

2. Missing primary customer
   7 failures
   Endpoint: POST /api/public/v2/bookings
   Likely cause: no customer has isPrimary=true
   Suggested fix: mark exactly one lead customer as primary

3. Webhook endpoint returning 500
   5 failures
   Last failure: 2026-05-19 14:12 IST
   Suggested fix: make webhook handler idempotent and return 2xx after successful validation
```

Example booking lifecycle view:

```text
Booking ID        Partner Ref     Status             Last Update
87514392          ORD-10492       COMPLETED          2 min ago
87514341          ORD-10481       PENDING            11 min ago
87514288          ORD-10477       CAPTURE_TIMEDOUT   1 hr ago
87514190          missing         UNCAPTURED         42 min ago
```

Example webhook view:

```text
Webhook Deliveries

✓ COMPLETED delivered to https://partner.com/api/headout/webhook
✕ FAILED delivery timed out after 10s
↻ Retry scheduled in 5 minutes
```

Example request diagnostics:

```text
Request ID: req_abc123
Endpoint: POST /api/public/v2/bookings
Status: 400
Error: PRICE_MISMATCH
Fields:
- price.amount
- customersDetails.customers[1].personType

Safe payload summary:
- productId present
- variantId present
- inventoryId present
- currencyCode: USD
- pax: ADULT x2, CHILD x1
- primaryCustomer: present
```

How partners use it:

1. During sandbox integration, they open the dashboard.
2. They make test API calls from their app.
3. The dashboard shows failures grouped by root cause.
4. They fix their code using suggested remediation.
5. Before launch, Headout and the partner check the health score.
6. After launch, the dashboard becomes production monitoring.

The dashboard should avoid showing sensitive data. Show summaries, not full customer details.

Good diagnostic categories:

- Auth failures
- Invalid request shape
- Missing required fields
- Unsupported pax type mapping
- Price mismatch
- Currency mismatch
- Closed inventory
- Stale inventory
- Booking not captured
- Capture timeout
- Webhook delivery failure
- Webhook non-2xx response
- Seat unavailable
- Seat not found
- Seat adjacency violation
- Cancellation/reschedule lifecycle misuse

The diagnostics dashboard answers:

> What is actually failing in sandbox or production?

## Product Flow

Ideal partner experience:

1. The MCP helps the partner's AI write the integration.
2. Contract tests prove the integration works locally or in CI.
3. The diagnostics dashboard shows real API/webhook health during sandbox and production.

The MCP can later point partners to both:

> Run Headout contract tests before launch. Then verify sandbox traffic in the Partner Diagnostics Dashboard.

