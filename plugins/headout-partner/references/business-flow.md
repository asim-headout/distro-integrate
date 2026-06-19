# Headout Partner Business Flow

Use this as the default implementation order:

1. Plan the integration and classify the partner stack.
2. Discovery: home page, city pages, collections, category tree, and catalog/product discovery. (The Headout partner API has no search endpoint, so there is no search-results surface.)
3. Product selection: product detail page, tour/variant/date/pax selection, inventory, and checkout entry.
4. Checkout inputs: customer/passenger fields and variant input fields returned by Headout responses.
5. Seatmap validation, only when the product uses seatmap inventory or the partner asks for seat selection.
6. Payment and booking: partner payment handoff, Headout booking create/capture/get, and reconciliation.
7. Booking management: webhooks, cancellation, reschedule, and post-booking status updates.
8. Test, review, or debug as cross-cutting support steps.

Default to the next skill in the sequence unless the user explicitly asks for a later step or the repo already shows previous steps are complete.
