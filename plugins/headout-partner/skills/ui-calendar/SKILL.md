---
name: ui-calendar
description: Optional fallback reference for the date-picker calendar used on the booking widget / select step. Describes the calendar's structure, states, data contract, and behavior (dual-month grid, day-of-week header, per-date price + min-price/sold-out states, selected/unavailable states, month navigation, mobile rules). Reuse the partner's design system / date-picker first; this is only a structural fallback for when none exists, with approximate, overridable values. Branding-neutral and portable.
disable-model-invocation: true
---

# Component Reference: Calendar (optional fallback)

A date-picker used by the booking widget / select step. **Reuse the partner's existing date-picker or design-system component first** — if the partner has a calendar, use it and ignore the measurements here. This file is a **structural/behavioral fallback** for when the partner has no equivalent; all numbers are **approximate suggestions, not mandates**, and the partner's tokens always win.

## How to use this skill
1. **Reuse first.** Map the data contract below to the partner's date-picker if it has one; build fresh only if nothing fits.
2. **Confirm your inventory API contract.** Map each feed to the props table. Any feed you cannot fulfil → omit the dependent UI (e.g. skip price labels if there is no inventory pricing).
3. **Build into `ui-components/Calendar/`** (if building fresh) and wire it into the booking widget / select step.

## Structure
- A **calendar wrapper** (popover/panel) containing one or two month grids.
- A **day-of-week header** row of initials.
- Each **month**: a title (month + year) with previous/next navigation, and a grid of **date cells**.
- An optional **footer/legend** (min-price legend, scarcity key) shown only when that data exists.

## Date cell — states
- **Default:** the date number; optionally a price label below it.
- **Selected / hover:** highlighted (the partner's accent) — tinted background + accent text.
- **Unavailable / sold-out:** muted, non-interactive (no pointer events), price hidden or "Sold out".
- **Min-price (cheapest):** the price label emphasized (e.g. a positive/"good deal" treatment).
- **Empty offset cells** (before the 1st of the month): inert.

## Price label below the date
- Regular price; a **min-price** emphasis for the cheapest dates; an optional struck-through original price; a "Sold out" label for unavailable dates. Render the **selling price** (never `netPrice`); see `references/ui-data-contract.md`. Hide price labels entirely when `hidePrice` is set.

## Behavior
- **Dual-month on desktop** (navigate two months at a time); **single month per viewport on mobile** is fine.
- **Navigation:** previous on the first month, next on the last; hide "next" once at the last available month.
- **Accessibility:** keyboard-navigable (arrow/Tab), focus-visible, Escape closes; cells are buttons with accessible labels.
- **Open/close** with a light transition if desired.

## Data props (map to your feeds)
| Prop | Type | Description |
|---|---|---|
| `inventoryListsMap` | `Map<YYYY-MM, InventoryList>` | Months with their date entries |
| `inventoryMap` | `Map<YYYY-MM-DD, InventoryEntry>` | Per-date: price, availability, isMinPrice, isScarce |
| `selectedDate` | `string \| null` | Currently selected `YYYY-MM-DD` |
| `onDateSelected` | `(date: string) => void` | Callback on date click |
| `hidePrice` | `boolean` | Suppress price labels (show only dates) |
| `currencyCode` | `string` | Active currency code |
| `medianPrice` | `number` | Threshold used to identify min-price dates |

## Variants
| Variant | When |
|---|---|
| Dual-month grid | Default |
| Rolling 7-day window | Short availability horizon |
| Date list | A short fixed list of available dates |

Default to the dual-month grid unless the inventory signal suggests otherwise.

## Approximate fallback values (override with the partner's tokens)
Use only if the partner has no design system; treat as starting points:
- Date cell ≈ 3.75rem desktop / smaller on mobile; wrapper rounded ≈ 8px; subtle border + shadow.
- Selected ≈ accent tint + accent text, ≈ 4px radius; min-price ≈ a small positive-tinted pill.
- Open/close transitions ≈ 150–200ms.

## Acceptance checks
- [ ] Reused the partner's date-picker/design-system component and tokens where they exist; built fresh only as a fallback.
- [ ] Calendar shows day-of-week header + month grid(s); dual-month desktop / single-month mobile; navigation hides "next" at the last available month.
- [ ] Date cells handle default / selected / unavailable / min-price states; price labels show the selling price and hide when `hidePrice`.
- [ ] Data contract wired (`inventoryMap`/`selectedDate`/`onDateSelected`/…); keyboard-accessible.
- [ ] No fixed Headout pixel values, color tokens, or component-library names imposed over the partner's design system.
