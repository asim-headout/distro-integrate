---
name: ui-calendar
description: Pixel-exact spec for Headout's production dual-month date-picker calendar used on the experience detail page booking widget. Covers the RegularCalendar (dual-month default), DateBig date cell, price/min-price labels, selected/hover/unavailable states, month navigation, day-of-week header, open/close animation, and mobile responsive rules. Build once into `ui-components/Calendar/`; reuse on every booking flow page that needs a date picker. Branding-neutral and portable.
disable-model-invocation: true
---

# Component Spec: Calendar (`ui-calendar`)

Build the **RegularCalendar** — Headout's dual-month date-picker, used on the experience/product detail page booking widget. This is a **fully custom component** (not a browser date input, not from espeon or eevee). The canonical implementation is in next-deimos at `src/containers/desktop/regularCalendar.tsx` + `src/containers/common/dateBig.tsx`. Build into `ui-components/Calendar/` once; reuse wherever a date picker is needed.

## How to use this skill
1. **Confirm your inventory API contract.** Map each feed to the props table below (`inventoryMap`, `selectedDate`, `onDateSelected`, `hidePrice`, `currencyCode`). Any feed you cannot fulfil → omit the dependent UI (e.g. skip price labels if no inventory pricing).
2. **Apply the shared design system.** Use `@headout/eevee` + Panda CSS (`@headout/pixie`) for all new tokens and styles. For existing implementations that use `@headout/aer` typography labels, map them using the token table at the bottom of this file.
3. **Build into `ui-components/Calendar/`** and wire into the booking widget on the product detail page.

## Anatomy (desktop RegularCalendar)

```
CalendarWrapper
  TopBar
    DayListContainerDualMonth
      [firstMonth]  DayList  ← 7 × day-of-week initials
      [secondMonth] DayList  ← same
  [firstMonth] MonthWrapper
    MonthTitle
      ChevronLeft  ← previous months
      MonthName    ← e.g. "June 2026"
    CalendarBody
      DateComponentsWrapper
        DateBig × N  ← empty offset cells + date cells
  [secondMonth] MonthWrapper
    MonthTitle
      MonthName    ← e.g. "July 2026"
      ChevronRight ← next months
    CalendarBody
      DateComponentsWrapper
        DateBig × N
  FootNote  ← optional: min-price legend + scarcity key
```

## Pixel-exact measurements

### CalendarWrapper
| Property | Value |
|---|---|
| background | white |
| border-radius | `0.5rem` (8px) |
| border | `1px solid #EBEBEB` (GREY['EB']) |
| box-shadow | `0 0 1px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.1)` |
| open animation | scale 0.9→1 over **200ms** `cubic-bezier(0,0,0.3,1)` |
| close animation | scale 1→0.9 over **150ms** `cubic-bezier(0.7,0,1,1)` |

### TopBar (day-of-week header row)
| Property | Value |
|---|---|
| border-bottom | `1px solid` grey-6 (`GREY_DS.G6`) |
| padding-top | `1rem` |
| DayList first month | margin `0.75rem 1.25rem 0.75rem 2.75rem` |
| DayList second month | margin `0.75rem 2.75rem 0.75rem 1.25rem` |
| Day-initial text | `HEADING_XS` weight; width `3.75rem`; centered; color grey-4 (`GREY_DS.G4`) |

### CalendarBody
| Property | Value |
|---|---|
| width | `26.25rem` (= 7 × 3.75rem cells) |
| padding — first month | `1.375rem 0.125rem 1.5rem 0.5rem` |
| padding — second month | `1.375rem 2.75rem 1.5rem 0.125rem` |
| padding — single month | `1.375rem 2.75rem 1.5rem` |
| DateComponentsWrapper | `flex-flow: row wrap`, each cell `margin-top: 0.25rem` |

### MonthTitle
| Property | Value |
|---|---|
| font | `HEADING_REGULAR` weight |
| color | grey-2 (`GREY_DS.G2`) |
| text-transform | capitalize |
| first-month name margin | `0 2.5rem 0 3.5625rem` |
| second-month name margin | `0 4rem 0 2.25rem` |
| chevron position | `position: absolute; top: 0.5rem` |
| left chevron | `left: 1rem; transform: rotate(180deg)` |
| right chevron | `right: 1rem` |

## DateBig cell

### Wrapper
| Property | Desktop | Mobile |
|---|---|---|
| size | `3.75rem × 3.75rem` | `3rem × 3.625rem` |
| cursor | pointer | pointer |

### Date number
| State | Color |
|---|---|
| Default | grey-2 (`GREY_DS.G2`) |
| Unavailable | `GREY.C4` (light grey) |
| Selected / hover | purple (`PURPS`) |

- date-label top margin: `0.8125rem`; bottom margin: `0.125rem`
- Font: `SUBHEADING_LARGE` weight

### Selected / hover state
```css
border-radius: 0.25rem;
background-color: PURPS_LEVEL[10];   /* light purple tint */
.date-number, .price { color: PURPS; }
.price.min-price { color: PURPS; background: white; }
```
Hover applies only at `min-width: 768px`.

### Unavailable state
```css
pointer-events: none; cursor: auto;
.date-number { color: GREY.C4; }
/* all price spans hidden */
```

### Empty offset cell
```css
pointer-events: none; outline: none; border: none; cursor: auto;
```

## Price block below date

| Variant | CSS class | Font weight | Color | Background | Notes |
|---|---|---|---|---|---|
| Regular price | `.price` | `MISC_TAG_REGULAR` | grey-3 (`GREY_DS.G3`) | transparent | pad `0 0.0625rem` |
| Min price (cheapest) | `.price.min-price` | `MISC_TAG_REGULAR` | dark green (`OKAY_GREEN_DARK_TONE`) | light green (`SOOTHING_GREEN`) | `border-radius: 0.125rem; padding: 0.0625rem` |
| Original / cut price | `.cut-price` | `UI_LABEL_SMALL_HEAVY` | grey-4 (`GREY_DS.G4`) | transparent | `text-decoration: line-through` |
| Sold out | `.sold-out` | `MISC_TAG_REGULAR` | grey-4a (`GREY_DS.G4a`) | transparent | capitalize |

- PriceWrapper: `margin-top: -0.125rem; margin-bottom: 0.8125rem`

## Footer / legend
- `border-top: 1px dashed` grey-6; padding `0.75rem 0 0`; margin `0 2.75rem 1rem`
- Min-price legend: green swatch with label
- Scarcity legend: `background-color: var(--colors-core-candy-100)`, `UI_LABEL_SMALL_HEAVY` font — only shown when at least one date is scarce

## Month navigation
- Dual-month: scrolls **2 months** at a time (previous = −2, next = +2)
- Left (previous) arrow shown only on first month title; right (next) only on second
- Right arrow hidden when already at the last available month

## Data props (map to your feeds)

| Prop | Type | Description |
|---|---|---|
| `inventoryListsMap` | `Map<YYYY-MM, InventoryList>` | All months with their date entries |
| `inventoryMap` | `Map<YYYY-MM-DD, InventoryEntry>` | Per-date: price, availability, isMinPrice, isScarce |
| `selectedDate` | `string \| null` | Currently selected `YYYY-MM-DD` |
| `onDateSelected` | `(date: string) => void` | Callback on date click |
| `hidePrice` | `boolean` | Suppress price labels (show only dates) |
| `currencyCode` | `string` | Active currency code |
| `medianPrice` | `number` | Threshold used to identify min-price dates |

## Calendar variants

| Variant | When |
|---|---|
| `REGULAR_CALENDAR` | Default — dual-month grid |
| `SEVEN_DAY_CALENDAR` | Rolling 7-day availability window |
| `DATE_LIST_CALENDAR` | Short fixed list of available dates |

Default to `REGULAR_CALENDAR` unless the inventory API signals otherwise.

## Build into `ui-components/Calendar/`

```
ui-components/
  Calendar/
    index.tsx              ← orchestrator (selects variant by inventory signal)
    RegularCalendar.tsx    ← dual-month shell
    DateBig.tsx            ← individual date cell
    CalendarTypes.ts       ← InventoryEntry, CalendarProps, CalendarVariant
    calendarUtils.ts       ← getPriceTag(), isDateUnavailable(), isMinPrice()
    styles/
      regularCalendar.ts
      dateBig.ts
```

Preserve `data-qa-marker` on `CalendarWrapper` and each `DateBig` cell.

## Typography token mapping (aer → eevee/Panda)

| aer `TYPE_LABELS` | Role | Eevee textStyle equivalent |
|---|---|---|
| `HEADING_REGULAR` | Month title | `heading.regular` |
| `HEADING_XS` | Day-of-week initials | `ui.label.small` |
| `SUBHEADING_LARGE` | Date number | `ui.label.large` |
| `MISC_TAG_REGULAR` | Price / sold-out | `ui.label.xsmall` |
| `UI_LABEL_SMALL_HEAVY` | Cut-price / scarcity | `ui.label.small` (bold) |
| `PARAGRAPH_SMALL` | Upcoming-month strip | `ui.paragraph.small` |

## Acceptance checks
- [ ] CalendarWrapper: white bg, 8px radius, shadow, border, open/close animation.
- [ ] Dual-month: two CalendarBody blocks side by side, each 26.25rem wide (7 × 3.75rem).
- [ ] Day-of-week header: 7 labels per month at 3.75rem each, grey-4 color.
- [ ] DateBig: 3.75rem × 3.75rem desktop; 3rem × 3.625rem mobile.
- [ ] Selected / hover: purple tint bg, purple text, 4px radius.
- [ ] Unavailable: grey text, no pointer events, price hidden.
- [ ] Min-price pill: dark green text on light green bg, 2px radius.
- [ ] Navigation: left arrow on first month (−2), right on second (+2); right hidden at last month.
- [ ] Footer with dashed border-top renders when min-price or scarcity data is present.
- [ ] `data-qa-marker` on wrapper and each date cell.
