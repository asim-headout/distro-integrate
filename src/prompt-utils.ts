import { DOCS, HEADOUT_FACTS } from "./docs.js";

export function optional(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export function lines(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function sharedPreamble(args: Record<string, string | undefined>): string {
  const partnerMode = optional(args.partner_mode, "unknown; ask and infer");
  const stack = optional(args.stack, "unknown; inspect the repository first");
  const architecture = optional(
    args.architecture,
    "unknown; determine whether this is a wrapper, direct server calls, monorepo package, generated client, or serverless integration",
  );

  return `You are helping a partner integrate Headout APIs.

Context:
- Partner mode: ${partnerMode}
- Tech stack: ${stack}
- Architecture shape: ${architecture}

Headout docs:
- Documentation index: ${DOCS.llms}
- OpenAPI v2: ${DOCS.openApiV2}
- API Partner spec: ${DOCS.openApiV2ApiPartner}
- Affiliate spec: ${DOCS.openApiV2Affiliate}

Ground rules:
${lines(HEADOUT_FACTS)}
- First inspect the partner repo and preserve existing conventions.
- Use the existing HTTP client, env loading, logging, validation, test runner, package manager, and folder boundaries.
- Support both API-wrapper integrations and direct server-side endpoint calls.
- In Next.js or browser-capable stacks, keep Headout API keys strictly server-side.
- Prefer files under 300 lines. Treat 400 lines as a review threshold and split by real responsibility.
- Write clean, typed, maintainable code. Avoid broad rewrites and unrelated abstractions.
- Use TDD by default unless the user explicitly opts out.
- Do not hardcode credentials, product IDs, inventory IDs, or sandbox secrets.
- Never log customer PII, API keys, full payment details, or voucher contents.
`;
}

export function tddSection(): string {
  return `TDD workflow:
1. Identify the existing test framework and how tests are organized.
2. Write focused failing tests before production code.
3. Cover unit tests for mapping, validation, pricing, and error handling.
4. Cover integration/contract tests with mocked Headout responses.
5. Add sandbox smoke tests only when sandbox credentials are available.
6. Skip sandbox tests cleanly when credentials are missing.
7. Use sandbox only for live calls and ask before creating/capturing/cancelling real sandbox bookings.
8. Implement the smallest production change that makes tests pass, then refactor.`;
}

export function edgeCaseSection(): string {
  return `Headout edge cases to consider:
- PER_PERSON vs PER_GROUP pricing.
- Future or unknown person types beyond ADULT, CHILD, STUDENT, and SENIOR.
- paxRange.min and paxRange.max.
- customersDetails.count must match the customers array length.
- Exactly one primary customer when customer details are required.
- Customer input fields such as NAME, EMAIL, PHONE, and CUSTOM_* fields.
- Booking-level variantInputFields such as pickup or transportation choices.
- Inventory availability: LIMITED, UNLIMITED, CLOSED.
- Currency consistency from product/inventory fetch through booking.
- Stale price rejection and price revalidation before checkout.
- originalPrice, netPrice, headoutSellingPrice, and customer-facing price differences.
- Pagination via nextUrl, prevUrl, nextOffset, and total.
- Local datetime values that may not include timezone offsets.
- Nullable optional fields and empty arrays.
- Booking statuses: UNCAPTURED, PENDING, COMPLETED, CANCELLED, FAILED, CAPTURE_TIMEDOUT.
- Webhooks do not send UNCAPTURED.
- Cancellation and reschedule requests are async acknowledgements, not final states.
- Seatmap validation can return HTTP 200 with business-level errors.
- Seatmap validation has a hard ceiling of 20 seats.
- Seatmap errors include SEAT_UNAVAILABLE, SEAT_NOT_FOUND, and ADJACENCY_RULE_VIOLATION.`;
}
