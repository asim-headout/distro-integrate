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
- Production server: `https://www.headout.com`
- Sandbox server: `https://sandbox.api.dev-headout.com`
- Authentication uses the `Headout-Auth` header.
- Keep `Headout-Auth` strictly server-side. Never expose it to browser bundles, public environment variables, logs, or client telemetry.

Core endpoint groups:

- Discovery: `/api/public/v2/cities`, `/categories`, `/subcategories`, `/collections`, `/products`, `/products/{productId}`
- Inventory: `/api/public/v2/inventory/list-by/tour`
- Booking: `/api/public/v2/bookings`, `/api/public/v2/bookings/{bookingId}`
- Post-booking: cancellation and reschedule endpoints
- Webhooks: `/api/public/v2/webhooks`
- Seatmap: availability, inventory, validation, SVG, and iframe endpoints
