# Headout API Reference

Use these as the primary Headout documentation entrypoints:

- LLM docs index: https://partner.headout.com/docs/llms.txt
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml
- API Partner OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2-api-partner.yaml
- Affiliate OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2-affiliate.yaml
- Setup guide: https://partner.headout.com/docs/guide/setup.md
- Walkthrough: https://partner.headout.com/docs/guide/walkthrough.md
- Launch checklist: https://partner.headout.com/docs/guide/checklist.md
- Key concepts: https://partner.headout.com/docs/guide/key-concepts.md
- Enums and errors: https://partner.headout.com/docs/guide/enums-and-error-codes.md

Default facts:

- Default to Headout API v2 unless the user explicitly asks for v1.
- **For development, default to the sandbox.** Use the sandbox server `https://sandbox.api.dev-headout.com` with the partner's **sandbox** `Headout-Auth` key for all building and testing. Switch to the production server `https://www.headout.com` (and the production key) **only when the partner is ready to go live** — that cutover is the partner's decision, not a build step.
- Authentication uses the `Headout-Auth` header.
- Keep `Headout-Auth` strictly server-side. Never expose it to browser bundles, public environment variables, logs, or client telemetry.
- Store the real auth value only in the partner repo's approved server-side secret location, such as
  `.env.local`, platform environment variables, or a secret manager. Derive the exact env var names
  from the repo when possible; otherwise ask before introducing names. Placeholder docs are fine,
  but never write the real `Headout-Auth` value to files.

Core endpoint groups:

- Discovery: `/api/public/v2/cities`, `/categories`, `/subcategories`, `/collections`, `/products`, `/products/{productId}`
- Inventory: `/api/public/v2/inventory/list-by/tour`
- Inventory details: `/api/public/v2/inventories/{inventoryId}/`
- Booking: `/api/public/v2/bookings`, `/api/public/v2/bookings/{bookingId}`
- Post-booking: cancellation and reschedule endpoints
- Webhooks: `/api/public/v2/webhooks`
- Seatmap: availability, inventory, validation, SVG, and iframe endpoints

Per-endpoint doc pages (api-partner v2):

- Before you start: https://partner.headout.com/docs/api-partner/v2/before-you-get-started.md
- Products list: https://partner.headout.com/docs/api-partner/v2/products/list.md
- Product get: https://partner.headout.com/docs/api-partner/v2/products/get.md
- Inventory list-by-tour: https://partner.headout.com/docs/api-partner/v2/inventory/list-by-tour.md
- Booking create: https://partner.headout.com/docs/api-partner/v2/bookings/create.md
- Booking capture (update): https://partner.headout.com/docs/api-partner/v2/bookings/update.md
- Booking get: https://partner.headout.com/docs/api-partner/v2/bookings/get.md
- Booking cancel: https://partner.headout.com/docs/api-partner/v2/bookings/cancel.md
- Booking reschedule: https://partner.headout.com/docs/api-partner/v2/bookings/reschedule.md
- Webhooks create: https://partner.headout.com/docs/api-partner/v2/webhooks/create.md
- Seatmap inventory: https://partner.headout.com/docs/api-partner/v2/seatmap/inventory.md
- Seatmap validate: https://partner.headout.com/docs/api-partner/v2/seatmap/validate.md
- Seatmap iframe: https://partner.headout.com/docs/api-partner/v2/seatmap/iframe.md
