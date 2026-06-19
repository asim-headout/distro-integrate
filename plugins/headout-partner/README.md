# Headout Partner Claude Plugin

Claude Code plugin that packages Headout partner integration workflows as focused Agent Skills.

Partners install one plugin, then Claude loads only the skill that matches the
task. Skills are ordered by the partner user journey, not by internal
engineering ownership. Plugin skills are namespaced by the plugin name, so
explicit invocations look like:

```text
/headout-partner:headout-01-discovery
/headout-partner:headout-03-checkout-inputs
/headout-partner:headout-05-payment-booking
```

## Business Flow Skills

- `headout-00-plan`: classify stack, scope, architecture, and integration sequence.
- `headout-01-discovery`: home, search results, city, collections, categories, product list, and product detail discovery.
- `headout-02-product-selection`: product page, variant/tour/date/pax selection, inventory, pricing, and checkout entry.
- `headout-03-checkout-inputs`: customer/passenger fields, variant input fields, pickup choices, and validation before payment.
- `headout-04-seatmap-validation`: iframe or custom seatmap selection and validation.
- `headout-05-payment-booking`: partner payment handoff, Headout create/capture/get booking, and reconciliation.
- `headout-06-booking-management`: webhooks, cancellation, reschedule, status updates, and post-booking reconciliation.

These files are intentionally lightweight. Treat them as the basic workflow
layer. Put detailed API behavior, edge cases, examples, and implementation
notes in references so they are loaded only when needed.

Frontend-specific skills should still follow the journey. For example,
dedicated frontend work belongs under discovery pages, product selection,
checkout inputs, seatmap validation, or booking management UX instead of a
parallel frontend hierarchy.

## Support Skills

- `headout-90-test-plan`
- `headout-91-review`
- `headout-92-debug`
- `headout-99-context-checkpoint`

Every completed step should end with a compact-ready context checkpoint.

## Local Testing

```bash
claude --plugin-dir ./plugins/headout-partner
```

Inside Claude Code, run `/reload-plugins` after editing plugin files, then test with an explicit skill invocation.
