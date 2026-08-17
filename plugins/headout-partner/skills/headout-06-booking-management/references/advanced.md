# Booking Management Advanced Reference

Relevant docs:

- Webhooks: https://partner.headout.com/docs/api-partner/v2/webhooks/create.md
- Get booking: https://partner.headout.com/docs/api-partner/v2/bookings/get.md
- Cancel: https://partner.headout.com/docs/api-partner/v2/bookings/cancel.md
- Reschedule: https://partner.headout.com/docs/api-partner/v2/bookings/reschedule.md
- Enums and errors: https://partner.headout.com/docs/guide/enums-and-error-codes.md
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml

Advanced cases:

- Register, retrieve, or update webhook configuration only if the integration owns setup.
- Cancellation/reschedule requests are async acknowledgements, not final states.
- Structured logs should include booking ID, partner reference ID when present, status, and correlation/request ID.
- Do not log PII-heavy payloads.
- Webhook events are untrusted until receiver authentication and booking GET reconciliation succeed.

Test cases:

- Duplicate webhook events.
- Unknown status.
- Missing booking.
- Status regression.
- Retry behavior.
- Out-of-order status updates.
- Cancellation/reschedule acknowledgement vs final state.
- Forged, malformed, oversized, and rate-limited webhook requests.
- Forged event cannot poison dedupe storage or mutate a booking.
- Cancel/reschedule CSRF, cross-account IDOR, stale policy, and duplicate mutation.
