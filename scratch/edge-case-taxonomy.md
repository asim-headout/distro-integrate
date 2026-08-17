# Headout Partner API — Exhaustive Test-Case / Edge-Case Taxonomy

Source: crawled `https://partner.headout.com/docs` via its `llms.txt` index (62 URLs) and fetched
the guide/concept pages plus the most field-dense v2 API reference pages (products, inventory,
seatmap, bookings, vouchers, webhooks, enums-and-error-codes). All v1 endpoint pages were **not**
individually fetched in full detail — v1 is deprecated per the docs index, and taxonomy below
focuses on v2 (current) behavior; v1-specific field differences are noted briefly at the end.
No page required login; all listed docs were publicly fetchable via `.md` suffix.

---

## 1. Checkout Input Fields (`inputFields` / `VariantInputField`)

Surfaced by: `GET /v2/products/{id}` (`variants[].inputFields[]`), `GET /v2/inventories/{id}`
(`inputFields[]`), submitted via `POST /v2/bookings` (`customersDetails.customers[].inputFields[]`,
`variantInputFields[]`).

- **Data-type variation** — field `dataType` enum: `STRING | ENUM | BOOL | INT | FLOAT | LOCATION`.
  Each type needs its own sandbox exemplar (free text, single-select, checkbox, integer input,
  decimal input, location picker).
- **Known field-id catalog** (`id`, "200+ types" per docs, partial enum observed): `NAME`, `EMAIL`,
  `PHONE`, `ADDRESS`, `AGE_*`, `COUNTRY_*`, `DATE_OF_BIRTH_*`, `DROP_OFF_LOCATION_*`,
  `FULL_NAME_*`, `GENDER_*`, `IDENTITY_DOCUMENT_DETAILS_*`, `LANGUAGE_*`, `NATIONALITY_*`,
  `PASSPORT_DETAILS_*`, `PHYSICAL_INFORMATION_-_HEIGHT_*`, `PICK_UP_DETAILS_*`,
  `PICKUP_LOCATION`, and free-form `CUSTOM_*` fields. Real-world example list from docs also
  cites weight and meal preference, hotel name.
- **Passport / ID document scenario** — `PASSPORT_DETAILS_*`, `IDENTITY_DOCUMENT_DETAILS_*`:
  string field with `regex`/`minLength`/`maxLength` validation. Need a sandbox product requiring
  passport number.
- **Physical measurement scenario** — height/weight fields (`PHYSICAL_INFORMATION_-_HEIGHT_*`),
  `dataType: INT|FLOAT`, with `minValue`/`maxValue` bounds — used for gear-fitting activities
  (e.g. harness/wetsuit sizing).
- **Date-of-birth / age scenarios** — `DATE_OF_BIRTH_*` (`dataType: DATE`... actually docs list
  DATE only at variant/collection concept level, not confirmed in dataType enum — see
  discrepancy note below) vs `AGE_*` (`dataType: INT`). Both used to gate pax-type eligibility.
- **Boolean scenario** — `dataType: BOOL` field (e.g. a waiver / consent checkbox). Need exemplar.
- **Enum/dropdown scenario** — `dataType: ENUM` with `validation.values` populated — e.g. gender,
  meal preference, language selection dropdown.
- **Regex-constrained string** — `validation.regex` present (e.g. phone format, passport format).
- **Bounded numeric field** — `validation.minValue`/`maxValue` present (e.g. age, height, weight).
- **Bounded string length** — `validation.minLength`/`maxLength` present (e.g. name field).
- **Optional vs required field** — `validation.required: true|false`. Need both a mandatory and
  an optional custom field on the same variant to test conditional submission.
- **Field description present vs null** — `description` populated (helper text) vs `null`.
- **Legacy numeric ID mapping** — `oldId` integer alongside string `id`; test that partner code
  handles both v1-style numeric IDs and v2 string IDs during a migration scenario.

### 1.1 Collection Level (per-traveler vs per-booking fields)
- **`PRIMARY_CUSTOMER`** — field required only once, attached to the primary/lead traveler
  (e.g. contact email/phone).
- **`ALL_CUSTOMER`** — field required for every pax in the booking (e.g. full name, passport
  number per traveler, DOB per traveler).
- **`BOOKING`** — booking-level field, collected once independent of pax count, submitted via
  `variantInputFields[]` on the booking request rather than nested under a customer (e.g.
  pickup location, language, special requests). Need a sandbox product exercising each of the
  three levels, and ideally one product exercising all three simultaneously.
- **Empty-but-required-object rule** — even when a customer has no applicable input fields,
  the docs require the guest object to still be submitted with `inputFields: []`, `paxType`, and
  `isPrimaryCustomer: false`. Edge case: booking with a pax type that has zero custom fields
  mixed with a pax type that has several.

### 1.2 Location-type Input Fields
Surfaced by `dataType: LOCATION`, `PredefinedLocation` object.
- **Free-text location** — `LOCATION` field with no `validation.values` supplied → renders as
  open text field, accepts any string (e.g. free-text drop-off address).
- **Constrained/dropdown location** — `LOCATION` field with `validation.values` populated as a
  map of `PredefinedLocation` objects (each with `id`, `latitude`, `longitude`, `address`,
  `displayName`, optional `timingConfig{startTime,endTime,minPeriod,maxPeriod}`, optional
  `note{content,language}`) → must submit one of the given `id`s, not free text.
- **Location with time-window constraint** — `PredefinedLocation.timingConfig` present, e.g. a
  pickup point only valid for pickups between certain times / limited to a min/max period —
  need a product where different predefined pickup points have different valid time windows.
- **Location with note/instruction attached** — `PredefinedLocation.note.content` populated,
  localized via `note.language`.
- **Pickup vs drop-off vs pickup=dropoff** — distinct field ids `PICK_UP_DETAILS_*`,
  `DROP_OFF_LOCATION_*`, `PICKUP_LOCATION`; and at the voucher level, `Pickup/Dropoff Type`
  enum `PICKUP | PICKUP_AND_DROPOFF | PICKUP_SAME_AS_DROPOFF` — need one sandbox transfer/tour
  product for each of these three pickup/dropoff shapes.
- **Address sequencing (voucher display)** — `Address Sequence Type` enum:
  `SINGLE_ADDRESS | ALL_ADDRESS_ANY_ORDER | ALL_ADDRESS_SPECIFIC_ORDER` — multi-leg itinerary
  where pickup stops must be displayed in a specific order vs any order vs single stop only.

### 1.3 Inventory-level Override of Tour-level Input Fields (explicitly flagged as important)
- **Same variant, different inventory, different required fields** — docs state explicitly:
  "Input fields can differ between inventories" for the same variant, and that the Inventory
  Details API (`GET /v2/inventories/{id}`) returns the *authoritative* field list (including
  numeric submission `id`s) that may differ from what the Product API showed at the variant
  level. **Critical sandbox need:** a product/variant where one time-slot/date inventory
  requires an extra field (e.g. passport number only for a specific late-night slot, or a
  seasonal slot requiring a waiver) that is absent from the tour-level `variants[].inputFields`
  default, and/or where a field present at variant level is *removed* for a specific inventory.
  Any integration that hardcodes fields from the Product API and skips a fresh Inventory Details
  call before checkout would fail on this scenario — a first-class edge case to catalog.
- **Field validation values differing per inventory** — e.g. the `values` list for a LOCATION
  or ENUM field differs by inventory (different pickup point list per date/time).

---

## 2. Pax / Pack Types (`personType`)

Surfaced by: `V2PersonPricing.type` (inventory), `customersDetails.customers[].personType`
(booking request).

- Enum values observed: `ADULT`, `CHILD`, `INFANT`, `SENIOR`, `GENERAL`, `STUDENT`, `YOUTH`.
  Docs explicitly warn: "Pax types vary per time slot and require dynamic rendering from API
  responses rather than hardcoded assumptions" — so a partner must never hardcode this enum.
- **Age-gated pack** — `ageFrom`/`ageTo` bounds populate eligibility (e.g. CHILD 3–12,
  INFANT 0–2, SENIOR 65+) — need products with tight/unusual age bands to test boundary
  handling.
- **Mixed-pack booking** — a single booking containing multiple different `personType`s at once
  (e.g. 2 ADULT + 1 CHILD + 1 INFANT) to test guest-array construction and per-pax pricing sum.
- **Nationality/region-restricted pack** — implied by variant-level `properties`/`propertiesV2`
  keys like `NATIONALITY` (e.g. a "resident" vs "non-resident"/nationality-specific pricing
  pack, akin to the "Malaysian pack" example from the task brief) — need a sandbox product whose
  `properties.NATIONALITY` or a `NATIONALITY_*` input field gates pricing/eligibility.
  Confirm via `propertiesV2` (string-array values) whether multiple nationality values are
  supported per variant.
- **Free/zero-priced pax rule** — error `CAL_0107` "No ADULT in free booking" and `CAL_0108`
  "Children not permitted without adult" — edge cases: booking with only children/infants and no
  adult chaperone should be rejected.
- **Max children-per-adult ratio** — error `CAL_0111` "Max 2 children per 1 Adult/Student/Senior"
  — need a product enforcing this ratio; test booking that violates it.
- **Group price type vs per-person price type** — `priceType`/`profileType` enum
  `PER_PERSON | PER_GROUP`. For `PER_GROUP`, pricing tiers are keyed by `size` (upper bound,
  inclusive) rather than by `personType` — a materially different pricing shape a partner must
  branch on. Need one PER_PERSON and one PER_GROUP sandbox product.
- **Per-pax-type remaining/availability** — `V2PersonPricing.remaining` and `.availability`
  (`LIMITED|UNLIMITED|CLOSED`) can differ *per pax type within the same inventory slot* — e.g.
  ADULT still available but CHILD sold out on the same time slot. Need a product exhibiting this
  partial sell-out.
- **paxRange min/max per pax type** — `V2PersonPricing.paxRange{min,max}` — e.g. a product
  requiring at least 2 adults, or capping infants to 1 per booking.
- **Min/max total pax per booking** — errors `CAL_0109` "Minimum number of tickets not selected",
  `CAL_0110` "Maximum number of tickets exceeded", `CAL_0112`/`CAL_0113` (min/max pax variants),
  and `variants[].pax{min,max}` — need products with non-default (i.e. not 1/unbounded) min/max
  pax constraints.

---

## 3. Seatmap vs Normal (Non-Seatmap) Products

Surfaced by: `Product.inventorySelectionType` enum `NORMAL | SEATMAP` — this single field forks
almost the entire integration path (different availability endpoint, different inventory
endpoint, extra validate step, seat-level booking payload).

- **NORMAL flow** — `GET /v2/availabilities` (date-level) → `GET /v2/inventories?tourId=...`
  (slot-level, `V2Inventory` with `availability` enum `LIMITED|UNLIMITED|CLOSED` + `remaining`
  int, sentinel `1000` for UNLIMITED) → `POST /v2/bookings`.
- **SEATMAP flow** — `GET /v2/seatmap/availabilities-by-variant` (date-level) →
  `GET /v2/seatmap/inventory` (show-level `remaining`, nested `sections[].seats[]`, each seat
  with `seatCode`, `row`, `seatNumber`, `seatType` [observed `STANDARD`, `PREMIUM`], per-seat
  `pricing` or `null` if unavailable) → `POST /v2/seatmap/.../validate` (validate chosen
  `seatCodes`, ≤20 seats) → `POST /v2/bookings` with `inventorySeatIds[]`.
- **Seat unavailable at validate time** — `validationErrors[].code`: `SEAT_UNAVAILABLE`,
  `SEAT_NOT_FOUND`, `ADJACENCY_RULE_VIOLATION` (e.g. booking two non-adjacent seats when the
  venue requires contiguous seating) — need a seatmap product/date where at least one requested
  seat has just sold out, and one exercising the adjacency rule.
  400 also fires for seat count violating pax min/max or exceeding the 20-seat request cap.
  403 for Affiliate-type partners (seatmap validate is API-Partner only, per docs).
- **Zero-remaining section vs zero-remaining whole show** — `sections[].remaining: 0` (one
  section sold out, others open) vs top-level `remaining: 0` (whole show sold out) vs a seat
  simply absent from the response (not bookable, no explicit status).
- **Standard vs premium seat type** — `seatType: STANDARD | PREMIUM`, each with independent
  `pricing` — need a seatmap product with mixed seat classes/prices in the same show.
- **Section without a name** — `sectionName: null` (unnamed/general-admission section) vs named
  sections (e.g. "Orchestra", "Balcony").
- **Seat response fields all null** (`row`, `seatNumber` null but `seatCode` present) — general
  admission / unassigned seating within a seatmap product, if it exists.
- **Venue map rendering** — separate `GET /v2/seatmap/svg` and `GET /v2/seatmap/iframe`
  endpoints for visually rendering the seat chart — need to confirm a sandbox seatmap product
  actually has SVG/iframe assets to test both rendering paths.
- **Post-booking seat display** — booking response `seatInfo[]` (`section`, `row`, `seatNumber`,
  `seatCode`) vs `NORMAL` bookings where `seatInfo` is absent/null.

---

## 4. Product & Variant Structuring

Surfaced by: `GET /v2/products/list`, `GET /v2/products/{id}`.

- **Product type variation** — `productType` enum: `TOUR | ACTIVITY | EVENT | ATTRACTION |
  TRANSFER | AIRPORT_TRANSFER | ADD_ON`. Need at least one sandbox product per type, since
  transfer-type products uniquely surface pickup/dropoff fields and voucher sections.
- **Multiple variants per product** — e.g. "Eiffel Tower – 2nd Floor Access" vs "– Summit
  Access" under one product; need a product with ≥3 variants differing in inclusions,
  cancellation policy, and pricing to test variant-selection UI.
- **`properties` / `propertiesV2` display requirement** — variant-distinguishing metadata
  (e.g. `LANGUAGE_CODE`, `NATIONALITY`, `NUMBER_OF_ATTRACTIONS`) that docs say **must** be shown
  prominently next to the variant name or customers may book the wrong variant. `properties` is
  single string-valued; `propertiesV2` is string-array-valued (multi-value properties, e.g. a
  variant valid for multiple nationalities/languages at once) — need a variant exercising
  multi-value `propertiesV2`.
- **Instant vs delayed confirmation** — `hasInstantConfirmation: true` (ticket generated
  immediately) vs `false` (avg ~30 min delay, p99 up to 1 day) — need one product of each to
  test partner polling/webhook-wait logic.
- **Mobile ticket support** — `hasMobileTicket` boolean.
- **Inventory type (start/duration flexibility)** — `inventoryType` enum:
  `FIXED_START_FIXED_DURATION | FIXED_START_FLEXIBLE_DURATION | FLEXIBLE_START_FIXED_DURATION |
  FLEXIBLE_START_FLEXIBLE_DURATION`. Need one product per combination — this affects how
  `startDateTime`/`endDateTime`/`duration` should be interpreted and displayed (e.g. open-dated
  / flexible-start "voucher" style products vs fixed showtimes).
- **Cutoff time** — `cutoffTimeInMinutes` (product-level) and separate variant-level
  `cancellationPolicy.cancellableUpTo` — need a product with a same-day cutoff vs one with no
  cutoff (`null`).
- **Cashback field** — `variants[].cashback{value, type: PERCENTAGE|ABSOLUTE}` — need one variant
  with cashback and one without to test conditional display.
- **Meeting point object present vs null** — `meetingPointInfo{latitude,longitude,address}` vs
  `null` (i.e. no fixed meeting point, e.g. hotel-pickup-only products).
- **Localized URLs** — `localeSpecificUrls` keyed by language code, vs a product with only a
  `canonicalUrl` and no locale variants.
- **Combo/bundle products explicitly unsupported** — docs state "Products requiring
  section-based booking, combo booking, or any other non-standard flow are unavailable via the
  Partner API." This is itself a notable negative-scenario: verify the Partner API product feed
  never returns combo-typed products, and that any attempt to reference one 404s
  (`CAL_1403` "Unsupported itinerary type (combo)").
- **Media type variation** — `media[].type` enum `IMAGE | VIDEO | PDF` — need a product with all
  three media types attached vs one with images only.
- **Reviews present vs absent** — `reviewsSummary{ratingsCount, averageRating}` — a brand-new
  sandbox product with zero reviews vs an established one.
- **POI / operating-schedule products** — `pois[]` with `operatingSchedules[]`, `holidays[]`,
  `freeEntryDays[]` — attraction products with complex calendar exceptions (holiday closures,
  free-entry days) — need a product exercising at least one holiday and one free-entry day.

---

## 5. Pricing & Currency

Surfaced by: `pricing` objects at product, variant, availability, and inventory levels.

- **Four pricing granularities that can each show a different number for the "same" product**:
  product-listing min price, variant-selection min price, date-calendar min price, and
  checkout-exact inventory price — need a product where the listing "from" price is materially
  lower than the actual selected-date price, so partner UIs relying on stale prices are caught.
- **PER_PERSON vs PER_GROUP `profileType`** (see also §2) — mandatory branch in price
  calculation and pax-selection UI.
- **`headoutSellingPrice` (mandatory floor) vs `netPrice` (partner cost) vs deprecated
  `listingPrice`** — need to verify sandbox responses include `listingPrice` only on legacy
  (v1-style) integrations, and confirm the price submitted at booking must equal
  `headoutSellingPrice`, not `netPrice`.
- **Currency mismatch** — errors `CAL_0221` "Booking currency mismatch", `CAL_0222` "Itinerary
  vs booking currency mismatch" — test booking with a `currencyCode` that doesn't match the
  inventory's priced currency.
- **Price drift between quote and booking** — errors `CAL_0106` "Price of the item has changed",
  `CAL_0122` "Pricing has changed", `CAL_0231` "Tour prices have changed" — need a
  time-of-check/time-of-book race scenario (price changes between inventory fetch and booking
  submit).
- **Multi-currency support** — `currencyCode` query param on most GET endpoints; need to verify
  same product priced correctly across ≥2 currencies (e.g. USD vs local currency) including
  correct `precision`/`symbol` from the `Currency` object.
- **Multi-language support** — `languageCode` enum (19 values: EN, ES, FR, IT, DE, PT, NL, PL,
  KO, JA, ZH_HANS, ZH_HANT, AR, DA, NO, RO, RU, SV, TR) — need to confirm content
  (`content.highlights`, etc.) actually localizes for a non-English language, and RTL handling
  for `AR`.

---

## 6. Availability States

- **LIMITED vs UNLIMITED vs CLOSED** (`availability` enum) at both the whole-inventory level and
  the per-pax-type level — `UNLIMITED` returns a sentinel `remaining: 1000` rather than a true
  count, which is itself a gotcha partners must not treat as a literal stock number.
  Need: a LIMITED slot near sell-out (remaining=1), an UNLIMITED slot, and a CLOSED slot/date
  (should not be bookable/shown).
- **Duplicate booking guard** — `CAL_0130` "Duplicate booking attempt within 30 min" — test
  rapid resubmission of the same booking payload.
- **Slot disappears between selection and purchase** — `CAL_0120` "Slot not available anymore",
  `CAL_0121` "Tour not available anymore", `CAL_0123` "Selected date-time closed or invalid".
- **Stale cache anti-pattern** — docs explicitly warn availability/inventory must never be
  cached; a good "trap" sandbox product would have inventory that changes rapidly (e.g. flash
  sell-out) to catch partners that cache.

---

## 7. Booking Lifecycle & Payment States

Surfaced by: `POST /v2/bookings`, `GET/PATCH /v2/bookings/{id}`, `booking-event` webhook.

- **Status enum** (6 values): `UNCAPTURED` (not yet paid, doesn't lock price/inventory, never
  webhooked), `PENDING` (payment captured = confirmed with supplier — must be treated as
  confirmed even though ticket not yet issued), `COMPLETED` (ticket generated, in `tickets[]`),
  `CANCELLED` (not always terminal), `FAILED` (terminal, capture rejected), `CAPTURE_TIMEDOUT`
  (terminal, not captured within 1 hour).
- **Transition matrix scenarios to reproduce**: UNCAPTURED→PENDING (success capture);
  UNCAPTURED→FAILED (rejected capture, e.g. card decline); UNCAPTURED→CAPTURE_TIMEDOUT (capture
  window missed — 1hr); PENDING→COMPLETED (ticket generation, instant vs delayed per
  `hasInstantConfirmation`); PENDING→CANCELLED (pre-fulfillment cancel); COMPLETED→CANCELLED
  (post-ticket cancel); CANCELLED→PENDING→COMPLETED (reschedule cycle — non-terminal cancelled).
- **"Book now pay later" scenario** — error `CAL_0114` "Book now pay later not eligible" implies
  a deferred-payment product type exists; need a sandbox product that supports it and one that
  explicitly rejects it.
- **`PATCH` (capture) endpoint** — `bookings/update.md` = "Capture a booking" — separate step
  from creation; need to test capturing an `UNCAPTURED` booking both within and after the 1-hour
  window (latter should hit `CAPTURE_TIMEDOUT`).
- **Missing/invalid mandatory customer fields** — `CAL_0600`–`CAL_0604` ("Incorrect user field",
  "Missing last name", "Missing mandatory user fields", "Invalid phone number", "Primary
  customer details missing") — need booking payloads that individually violate each.
- **Pax count mismatch** — `CAL_1300` "Count doesn't match number of customers" — submit
  `customersDetails.count` ≠ actual `customers[]` array length.
- **Reservation/creation retry errors** — `CAL_0201` "Could not create booking, retry",
  `CAL_0202` "Reserved for use", `CAL_0223` "Reservation failed via plugin".

---

## 8. Cancellation & Reschedule

Surfaced by: `POST /v2/bookings/{id}/cancel`, `POST /v2/bookings/{id}/reschedule`,
`cancellationPolicy`/`reschedulePolicy` on product & variant.

- **Cancellable vs non-cancellable variant** — `cancellationPolicy.cancellable: true|false`; when
  true, `cancellableUpToInMinutes`/`cancellableUpTo` defines the free-cancellation cutoff window
  — need a non-refundable product, a free-cancellation-anytime product, and a
  cutoff-window product (e.g. cancellable up to 24h before start) to test boundary behavior
  right before/after cutoff.
- **Reschedulable vs not** — mirrors the above via `reschedulePolicy.reschedulable` and
  `reschedulableUpToInMinutes`.
- **Reschedule-of-a-reschedule blocked** — docs: "A booking that has already been rescheduled
  cannot be rescheduled again" — need to attempt a second reschedule and confirm rejection.
- **Reschedule needs valid future inventory** — failure when target slot doesn't exist/is
  closed; also `CAL_1804` "Live inventory not available for reschedule".
- **Failed reschedule not retryable** — `CAL_1803` "Failed to reschedule booking" — confirm no
  partner-side retry path.
- **Refund handled outside the API** — cancellation eligibility (API concern) is explicitly
  separate from refund execution: API-Partner accounts get wallet credit and must refund the
  customer themselves; Affiliate accounts get direct refund from Headout. Need to test both
  partner account types if sandbox supports it.
- **Cancellation reason codes** — enum `TICKETS_NOT_RECEIVED | CHANGE_OF_TRAVEL_PLANS |
  MODIFY_EXISTING_RESERVATION | FOUND_CHEAPER_OPTION_ELSEWHERE | OTHER` submitted with a cancel
  request — need to test all five plus `OTHER` with free-text reason.
- **Cancel-ticket failure** — `CAL_1801` "Failed to cancel ticket" (e.g. supplier-side rejection
  after cutoff has technically passed on their end even though API said cancellable).

---

## 9. Voucher & Ticket Delivery

Surfaced by: `GET /v2/vouchers/{voucherId}`, `understanding-the-response.md`.

- **Ticket type variety** — `type` enum: `QRCODE`, `BARCODE`, `TEXT` (all rendered inline on the
  voucher), `PDF_URL`, `HTML_URL` (external link — screenshotting only captures a button, so
  partners doing custom PDF generation must fetch and embed these programmatically),
  `APPLE_WALLET_URL`, `GOOGLE_WALLET_URL`, and fallback `UNKNOWN`. Need one sandbox product per
  ticket type, especially one exercising `PDF_URL`/`HTML_URL` (the documented gotcha) and one
  with `UNKNOWN` (unhandled/new type) for forward-compat testing.
- **Multi-ticket booking** — `ticketSection.tickets[]` with >1 entries (e.g. one ticket per pax)
  vs a single-ticket-covers-all-pax booking — each ticket has its own `displayType` enum
  (`PDF | IMAGE | TICKET_NUMBER | NONE`).
- **Voucher template** — `voucherTemplate` enum `SINGLE_PAGE | MULTI_PAGE` — need one of each.
- **Instructions format** — mutually exclusive `instructions.legacy` (HTML) vs
  `instructions.structured` (4 sections: general guidance, location, policies, additional info)
  — need one voucher of each shape; never both populated simultaneously per docs.
- **Seat info on voucher** — `bookingDetails.seats[]` present only for seatmap bookings (section,
  row, seat number, plus accessibility notes) vs absent for NORMAL bookings.
- **Pickup/dropoff section on voucher** — present only for transfer-type experiences,
  `pickupDropoffLocation` typed `PICKUP | PICKUP_AND_DROPOFF | PICKUP_SAME_AS_DROPOFF`.
- **Check-in button present vs null** — `checkinButton{url}` — online check-in-enabled product
  vs one without.
- **Callouts array** — informational banners, possibly empty `[]` vs populated (e.g. weather
  advisory, ID-required notice) — need at least one voucher with a populated callout.
- **Partner branding** — voucher can be Headout-branded or partner-reskinned (logo/contact info
  masked) — confirm both a Headout-branded and partner-branded sandbox voucher render correctly.
- **Disclaimer text present vs null**.
- **Voucher `bookingStatus` mirrors booking lifecycle** but only exposes 3 of the 6 states:
  `PENDING | COMPLETED | CANCELLED` — need to confirm voucher page behaves sanely when the
  underlying booking is `UNCAPTURED`, `FAILED`, or `CAPTURE_TIMEDOUT` (states it can't represent).
- **Exchange location type** (from enums page) — `VENUE_LOCATION | DIFF_LOCATION` — a voucher
  redemption point identical to vs different from the venue itself (e.g. a separate ticket booth)
  — need one of each.

---

## 10. Webhooks

Surfaced by: `POST/GET/PATCH /v2/webhooks`, `booking-event.md`.

- **Payload shape** — `bookingId`, `status`, `eventTimestamp` (ISO 8601) — minimal payload,
  requires a follow-up `GET booking` call for full details.
- **Never-sent status** — `UNCAPTURED` is explicitly never webhooked; need to confirm no webhook
  fires until at least `PENDING`.
- **Delivery/retry semantics** — partner endpoint must respond within 45s; `2xx` = success/no
  retry, `4xx` = permanent failure (no retry), `5xx`/`408`/`429` = exponential backoff up to 4
  attempts. Need a test harness that: times out (>45s), returns 4xx, returns 5xx once then 2xx
  (recovery mid-retry), and returns 429.
- **Webhook config lifecycle** — create/get/update endpoints imply multiple configured webhook
  URLs or a single one per partner; test updating the URL and confirming old URL stops
  receiving events.
- **All lifecycle transitions should fire a webhook** except UNCAPTURED — need one sandbox
  booking exercised through PENDING, COMPLETED, and CANCELLED to confirm 3 distinct webhook
  deliveries with correct statuses and ordering.

---

## 11. Errors & Negative-Path Scenarios

Full code list extracted from `enums-and-error-codes.md` (grouped by theme; ~60 codes total,
prefix `CAL_*`):

- **Tour/itinerary validity**: `CAL_0101` invalid tour info, `CAL_0102` tour/language doesn't
  exist, `CAL_0103` addon doesn't exist, `CAL_0105` itinerary item doesn't exist, `CAL_1403`
  unsupported combo itinerary type.
- **Pricing validity**: `CAL_0104` invalid price info, `CAL_0106`/`CAL_0122`/`CAL_0231` price
  changed, `CAL_0221`/`CAL_0222` currency mismatch.
- **Pax count rules**: `CAL_0107` no adult in free booking, `CAL_0108` children without adult,
  `CAL_0109`/`CAL_0112` min pax/tickets not met, `CAL_0110`/`CAL_0113` max pax/tickets exceeded,
  `CAL_0111` max 2 children per adult.
- **Payment eligibility**: `CAL_0114` book-now-pay-later not eligible.
- **Availability**: `CAL_0120` slot gone, `CAL_0121` tour gone, `CAL_0123` date-time closed/
  invalid, `CAL_0130` duplicate booking within 30 min.
- **Booking creation**: `CAL_0201` retry creation, `CAL_0202` reserved for use, `CAL_0220` no
  recent order found, `CAL_0223` plugin reservation failure, `CAL_0241` unsupported op for API
  version.
- **City/geography**: `CAL_0310` city not found.
- **Customer fields**: `CAL_0600`–`CAL_0604` (see §7).
- **Product-level generic**: `CAL_0900` error in Calipso product.
- **Auth**: `CAL_1000` invalid API key.
- **Request shape**: `CAL_1300` count/customer mismatch, `CAL_1400` invalid date range,
  `CAL_1600` invalid body/query/path params.
- **Booking retrieval**: `CAL_1401` booking not found, `CAL_1402` voucher fetch — booking
  missing, `CAL_1404` voucher auth failed, `CAL_1405` temp error fetching booking, `CAL_1406`
  booking doesn't belong to user.
- **Amendment**: `CAL_1801` cancel-ticket failed, `CAL_1802` fetch-booking server error, `CAL_1803`
  reschedule failed, `CAL_1804` live inventory unavailable for reschedule.
- **Audio guide add-on** (a distinct add-on subsystem worth its own sandbox scenario):
  `CAL_1900` vendor audio guide not found, `CAL_1901` could not add, `CAL_1902` expired,
  `CAL_1903` share limit exceeded, `CAL_1904` unavailable, `CAL_1905` unsupported form type,
  `CAL_1906` non-nullable attribute null, `CAL_1907` quote not found, `CAL_1908` tour user
  fields not found.
- **Seatmap-specific HTTP errors** (not CAL_-coded): 400 seat-count/pax violation or >20 seats,
  403 unauthorized/Affiliate-type partner, 404 product not found or not seatmap type, 413
  payload too large, 415 wrong content-type, 503 supplier unavailable.
- **Generic unknown**: `CAL_0000`/`CAL_0100` unknown error — need to confirm these are true
  catch-alls and rarely returned in sandbox (if reproducible, worth documenting how).

---

## 12. Sandbox-Specific Behavior (environment-level edge cases)

- **Partial auto-fulfillment** — only a limited, spreadsheet-tracked subset of sandbox products
  auto-transition to `COMPLETED`; all others sit indefinitely in `PENDING`. Taxonomy needs: (a)
  at least one auto-completing sandbox product per major product type/flow (NORMAL, SEATMAP,
  TRANSFER) to test the full ticket-issuance path, and (b) explicit awareness that most sandbox
  products will *never* auto-complete — a partner-side test suite must not assume completion.
- **Scheduled downtime** — daily maintenance window 2:00–3:00 AM IST, up to 5 min of API
  failures — a resilience/retry-handling scenario, distinct from production error handling.
- **Strict policy enforcement differs from prod** — cancellation/reschedule "enforced strictly"
  in production but sandbox behavior may be more lenient/simulated; worth flagging as a
  known gap — recommend confirming with Headout which policy edge cases are actually enforced
  in sandbox vs merely documented.

---

## 13. Catalog Hierarchy & Listing Variations

Surfaced by: `GET /v2/cities`, `/v2/collections`, `/v2/categories`, `/v2/subcategories`,
`/v2/products/list`.

- **City → Collection → Category → Subcategory → Product → Variant → Inventory (→ Seat) →
  Booking → Ticket** hierarchy — need to confirm test coverage exists at each level, e.g. a
  product with a `primaryCollection` populated vs one without, and one with `secondaryCategories`
  populated (multi-category product) vs only a `primaryCategory`.
- **Pagination** — `list` endpoints return `items`, `nextUrl`/`prevUrl` (nullable), `total`,
  `nextOffset` — need a city/category with enough products to force pagination, and confirm
  correct null-handling on the last page.
- **Product listing minimum price vs actual price drift** (see §5).

---

## 14. V1 vs V2 API Differences (noted, not deep-crawled)

The docs index lists a full v1 endpoint set (`cities/list`, `categories/list`,
`products/list-by-city`, `products/list-by-category`, `products/get`,
`inventory/list-by-variant`, `bookings/create|list|get|update`) plus a
`migration-v1-to-v2.md` guide, all marked deprecated. Not deep-crawled here since the task
scope is forward-looking sandbox coverage, but flagged because:
- v1 uses numeric `oldId`-style identifiers where v2 uses string IDs (the `oldId` field
  persisting in v2's `VariantInputField` is a legacy bridge).
- v1 product listing is split by city vs by category (two separate endpoints) rather than v2's
  unified filterable `products/list`.
- If any partner is mid-migration, a taxonomy of "v1 behavior vs v2 behavior for the same
  sandbox product" could be a useful additional scenario category — recommend a follow-up
  crawl of `migration-v1-to-v2.md` and the v1 endpoint pages if that's in scope.

---

## Open Items / Pages Not Deeply Extracted (fetch again if more detail needed)
- `guide/how-it-works.md`, `guide/setup.md`, `guide/walkthrough.md`, `guide/key-concepts.md`,
  `guide/checklist.md`, `guide/whats-new.md`, `guide/upcoming-releases.md` — fetched for nav
  only, not deep-content-extracted.
- `v2/cities/list.md`, `v2/collections/list.md`, `v2/categories/list.md`,
  `v2/subcategories/list.md`, `v2/products/list.md`, `v2/availabilities/normal-availabilities.md`,
  `v2/seatmap/availabilities-by-variant.md`, `v2/seatmap/svg.md`, `v2/seatmap/iframe.md`,
  `v2/bookings/list.md`, `v2/bookings/get.md`, `v2/bookings/update.md`,
  `v2/bookings/cancel.md`, `v2/bookings/reschedule.md`, `v2/webhooks/get.md`,
  `v2/webhooks/create.md`, `v2/webhooks/update.md` — not fetched individually; their field
  shapes are largely covered indirectly via the concept pages and sibling endpoints above, but a
  targeted re-crawl would sharpen exact field names/nullability if needed.
- All three OpenAPI YAML/JSON spec files (`openapi-v2-api-partner.yaml`,
  `openapi-v2-affiliate.yaml`, `openapi-v1.yaml`, `openapi-v2-common.yaml`,
  `api-reference/openapi.json`) were not parsed — these would be the most authoritative source
  for exact schema/enum completeness and are recommended as the next research step before
  finalizing sandbox product selection, since the prose docs occasionally hedge ("observed
  values", "partial enum") where the OpenAPI spec would give definitive enums.
- No page in this crawl required authentication or returned an access error; nothing was skipped
  due to being inaccessible.
