# Competitor Adapter Reference (Archetype C: the Switcher)

For partners already integrated with another experiences API (Viator, GetYourGuide) whose database
and UI are mapped to that competitor's naming. The goal: **reuse their existing schema/UI and write a
thin adapter** that maps competitor payloads into Headout/DistrOS equivalents, instead of re-modeling
from scratch.

> **Use this as a starting dictionary, not gospel.** The competitor column reflects those vendors'
> public concepts; the **Headout column must be confirmed** against
> [headout-api.md](headout-api.md), the OpenAPI v2 spec, and live responses before you rely on it.
> If a Headout field below is not present in the current API, apply the **stale-fact call-out**: stop
> and surface it to the partner. **Never invent a Headout field name to make a mapping "work."**

## Concept mapping (Viator / GetYourGuide → Headout)

| Concept | Viator | GetYourGuide (GYG) | Headout (confirm against spec) |
|---|---|---|---|
| Product identifier | `productCode` | activity / `tour_id` | `productId` |
| Product title | product `title` | `title` | `name` |
| Bookable option | `productOptions` / tour grade | `option` | variant / tour (`variants[]`) |
| Category / theme | `categories`, tags | `categories` | `categories` / `subcategories` |
| Availability | `availabilitySchedules` | `availabilities` | inventory via `inventory/list-by/tour` |
| Inventory state | bookable flag / sold-out | availability vacancy | `LIMITED` / `UNLIMITED` / `CLOSED` |
| Lead price | `fromPrice` / pricing summary | `price` / `retail_price` | `listingPrice` / inventory price |
| Price components | `lineItems` (price breakdown) | price breakdown | `price`, `originalPrice`, `netPrice`, `headoutSellingPrice` |
| Currency | `currency` / `currencyCode` | `currency` | `currencyCode` |
| Traveler/pax types | `ageBands` (ADULT, CHILD, INFANT, YOUTH, SENIOR, TRAVELER) | participant `category` (adult/child/youth/senior) | `personType` (ADULT, CHILD, STUDENT, SENIOR, + future) — **see note** |
| Pax limits | min/max travelers | min/max participants | `paxRange.min` / `paxRange.max` |
| Required customer/booking inputs | `bookingQuestions` | required `data`/questions | customer fields (`NAME`/`EMAIL`/`PHONE`/`CUSTOM_*`) + `variantInputFields` |
| Lead/primary traveler | lead traveler | primary participant | primary customer (exactly one) |
| Cancellation policy | `cancellationPolicy` | `cancellation_policy` | `cancellationPolicyV2{cancellable,cancellableUpTo}` |
| Booking reference | `bookingRef` | `booking_reference` / shopping cart | `partnerReferenceId` (partner side) + `bookingId` (Headout) |
| Booking lifecycle | CONFIRMED / PENDING / REJECTED / CANCELLED | confirmed / pending / cancelled / failed | `UNCAPTURED` → `PENDING` → `COMPLETED` / `CANCELLED` / `FAILED` / `CAPTURE_TIMEDOUT` |
| Post-booking events | booking notifications | webhooks | booking-status webhooks (no `UNCAPTURED`) |
| Seat selection | seat map (where supported) | seat map (where supported) | seatmap inventory + validate (≤ 20 seats/request) |

## Mapping notes (the traps)
- **Pax / age bands don't map 1:1.** Competitor age bands (INFANT, YOUTH, TRAVELER) have no fixed
  Headout equivalent; map by the partner's business rules and preserve **unknown future
  `personType`s** rather than dropping them. Validate against the product's supported person types
  from live inventory.
- **Pricing is not a single number.** Competitors often expose one retail price; Headout distinguishes
  `price` / `originalPrice` / `netPrice` / `headoutSellingPrice` and `PER_PERSON` vs `PER_GROUP`. Map
  what the partner displays vs. what they reconcile on separately.
- **Booking status semantics differ.** Headout's two-phase `UNCAPTURED → PENDING` capture has no
  direct competitor analog — don't collapse it into a single "confirmed". Cancellation/reschedule are
  async acknowledgements, not final states.
- **Adapter direction:** write the adapter at the partner's server boundary (BFF) so their existing UI
  and DB keep their competitor-shaped objects; the adapter is the only place that speaks Headout.

## How to use in a build
1. Identify the partner's current competitor and the objects already mapped to it.
2. For each in-scope concept, map competitor → Headout using the table, **confirming each Headout
   field against the spec**.
3. Implement the adapter at the server boundary; keep the partner's UI/DB shapes intact.
4. Flag any concept with no clean Headout equivalent to the partner rather than forcing a mapping.
