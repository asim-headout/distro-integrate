# Shared UI Data Contract

Use this contract wherever a Headout response is mapped into storefront UI. It prevents common
agent mistakes across page recipes and booking steps.

## Images and media

- Headout media URLs may be protocol-relative, for example `//cdn-imgix.headout.com/...`.
- Normalize protocol-relative URLs to absolute `https:` URLs before rendering or passing to image
  components. This is required for frameworks such as Next.js `next/image`.
- Preserve absent or nullable media as nullable mapped fields; do not invent placeholder Headout
  images unless the partner's own design system has a placeholder pattern.

## Customer-facing prices

- Customer-facing price must come from Headout selling price: `headoutSellingPrice` or the mapped
  selling-price field derived from it.
- Never render `netPrice` to the end user. `netPrice` is for partner reconciliation/margin handling,
  not customer display.
- Use `originalPrice` only as a strike-through/discount comparison when it is greater than the
  selling price. Derive discount percent from `originalPrice` vs selling price; do not expect a
  separate discount field.
- The booking `price.amount` must be revalidated against current inventory before create/capture
  flows. Do not charge or book from stale product-list pricing.

## Availability and remaining counts

- Treat `CLOSED` as not bookable.
- Treat `UNLIMITED` as bookable without a visible remaining count.
- Treat sentinel-like high `remaining` values as unlimited for UI purposes. The official walkthrough
  documents `remaining: 1000` as unlimited; hide `remaining` when it is `>= 1000` or otherwise looks
  sentinel-like, such as `9999`.
- Show scarcity copy only for genuinely low, limited inventory counts. If unsure, show availability
  state without a count.

## Product and collection cards

- ProductCard fields: normalized image URL, product name, aggregate rating when present, customer
  price `from {headoutSellingPrice}`, optional `originalPrice` strike-through, and an optional
  cancellation/reschedule pill derived from policy fields.
- Cancellation pill is derived, not copied from a marketing string:
  - cancellable with `cancellableUpToInMinutes === 0` -> "Free cancellation"
  - cancellable with a cutoff -> "Free cancellation up to {hours/days} before"
  - not cancellable but reschedulable -> "Reschedulable"
  - neither cancellable nor reschedulable -> omit the pill unless the partner explicitly wants a
    restrictive policy label
- CityCard and CollectionCard also normalize images and preserve server/editorial order. Do not pick
  random cities or collections to fill empty rails.

## Missing data and unsupported UI

- If a Headout field or feed is absent, omit the dependent UI or ask the user when the decision is
  product-level. Do not infer field names, invent routes, or add Headout-branded operator blocks.
- This omission rule applies only to the Headout-derived UI being added or mapped in the current
  task. Do not delete, rewrite, or "clean up" existing partner dummy/stub content, placeholder
  routes, TODOs, or unrelated UI because Headout data is absent; report those as observations unless
  the user explicitly asks for that specific change.
- If a live response contradicts this contract or another bundled reference, stop and surface the
  contradiction instead of guessing.
