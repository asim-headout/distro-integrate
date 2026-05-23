import { DOCS } from "./docs.js";
import { listPrompts } from "./prompts.js";
import {
  EDGE_CASES_URI,
  PROMPT_CATALOG_URI,
  SEQUENCING_GUIDE_URI,
  TDD_GUIDE_URI,
} from "./uris.js";

export {
  EDGE_CASES_URI,
  PROMPT_CATALOG_URI,
  SEQUENCING_GUIDE_URI,
  TDD_GUIDE_URI,
};

export const resources = [
  {
    uri: PROMPT_CATALOG_URI,
    name: "Headout prompt catalog",
    title: "Headout Prompt Catalog",
    description:
      "Start here. This MCP is prompt-first; use these prompts to guide Headout API integrations.",
    mimeType: "text/markdown",
  },
  {
    uri: TDD_GUIDE_URI,
    name: "Headout existing-test contract",
    title: "Headout Existing-Test Contract",
    description: "How to use an existing test workflow without adding setup.",
    mimeType: "text/markdown",
  },
  {
    uri: EDGE_CASES_URI,
    name: "Headout edge cases",
    title: "Headout Edge Cases",
    description: "Pricing, pax, booking lifecycle, webhook, and seatmap cases.",
    mimeType: "text/markdown",
  },
  {
    uri: SEQUENCING_GUIDE_URI,
    name: "Headout sequencing guide",
    title: "Headout Sequencing Guide",
    description: "Recommended prompt order and resume-state conventions.",
    mimeType: "text/markdown",
  },
];

export function readResource(uri: string) {
  if (uri === PROMPT_CATALOG_URI) {
    return markdown(uri, promptCatalog());
  }
  if (uri === TDD_GUIDE_URI) {
    return markdown(uri, tddGuide());
  }
  if (uri === EDGE_CASES_URI) {
    return markdown(uri, edgeCasesGuide());
  }
  if (uri === SEQUENCING_GUIDE_URI) {
    return markdown(uri, sequencingGuide());
  }
  throw new Error(`Resource not found: ${uri}`);
}

function promptCatalog(): string {
  const promptList = listPrompts()
    .map((prompt) => {
      const args =
        prompt.arguments
          ?.map((arg) => `${arg.name}${arg.required ? " (required)" : ""}`)
          .join(", ") || "none";
      return `- \`${prompt.name}\`: ${prompt.description}\n  Arguments: ${args}`;
    })
    .join("\n");

  return `# Headout MCP Prompt Catalog

This MCP server is prompt-first. Use \`prompts/list\` and \`prompts/get\` for the main product surface. Tools are intentionally empty in this POC.

## Recommended Starting Points

- Planning: \`plan_headout_integration\`
- Booking implementation: \`implement_headout_booking_tdd\`
- Review: \`review_headout_integration\`
- Debugging: \`debug_headout_integration\`
- Test planning: \`generate_headout_test_plan\`

## Opt-In Guides

- Existing-test contract: \`${TDD_GUIDE_URI}\`
- Edge cases: \`${EDGE_CASES_URI}\`
- Sequencing and resume state: \`${SEQUENCING_GUIDE_URI}\`

## Available Prompts

${promptList}

## Headout References

- LLM docs index: ${DOCS.llms}
- OpenAPI v2: ${DOCS.openApiV2}
- API Partner OpenAPI v2: ${DOCS.openApiV2ApiPartner}
- Affiliate OpenAPI v2: ${DOCS.openApiV2Affiliate}
`;
}

function tddGuide(): string {
  return `# Headout Existing-Test Contract

Use the partner repo's existing test workflow. Never introduce testing setup just for Headout unless the user explicitly asks.

Required behavior:

1. Inspect the repo to identify whether tests already exist.
2. If tests exist, follow test-first development in the repo's existing style.
3. Show or summarize the failing tests before implementing production code.
4. Run focused tests and confirm expected failure when feasible.
5. Implement the smallest production change needed.
6. Run focused tests again, then broader relevant tests.
7. Gate sandbox smoke tests behind credentials and user permission.
8. If no test setup exists, do not install packages, scaffold a framework, or create test infrastructure unless the user approves.
9. If no tests exist and the user does not approve setup, provide a manual verification plan and keep the implementation small.

Coding production files before checking for an existing test workflow violates this MCP's implementation contract.
`;
}

function edgeCasesGuide(): string {
  return `# Headout Edge Cases

Use this only when implementing, reviewing, or generating tests.

- PER_PERSON vs PER_GROUP pricing.
- Unknown future person types beyond ADULT, CHILD, STUDENT, and SENIOR.
- paxRange.min and paxRange.max.
- customersDetails.count must match customers length.
- Exactly one primary customer when customer details are required.
- Customer fields such as NAME, EMAIL, PHONE, and CUSTOM_*.
- Booking-level variantInputFields such as pickup or transportation choices.
- Inventory availability: LIMITED, UNLIMITED, CLOSED.
- Currency consistency from inventory fetch through booking.
- Stale price rejection and price revalidation before checkout.
- originalPrice, netPrice, headoutSellingPrice, and customer-facing price differences.
- Pagination via nextUrl, prevUrl, nextOffset, and total.
- Local datetime values that may not include timezone offsets.
- Booking statuses: UNCAPTURED, PENDING, COMPLETED, CANCELLED, FAILED, CAPTURE_TIMEDOUT.
- Webhooks do not send UNCAPTURED.
- Cancellation/reschedule requests are async acknowledgements, not final states.
- Seatmap validation can return HTTP 200 with business-level errors.
- Seatmap validation has a hard ceiling of 20 seats.
- Seatmap errors include SEAT_UNAVAILABLE, SEAT_NOT_FOUND, and ADJACENCY_RULE_VIOLATION.
`;
}

function sequencingGuide(): string {
  return `# Headout Sequencing Guide

Recommended default order:

1. \`plan_headout_integration\`
2. \`implement_headout_discovery\`
3. \`implement_headout_inventory_and_pricing\`
4. \`implement_headout_booking_tdd\`
5. \`implement_headout_webhooks\`
6. \`implement_headout_seatmap\`, when needed
7. \`generate_headout_test_plan\`
8. \`review_headout_integration\`

Resume arguments:

- \`integration_state\`: concise current state summary.
- \`completed_steps\`: comma-separated list such as planning, setup, discovery, inventory.

If a user starts in the middle, reconstruct state from repo evidence and provided arguments. If prerequisites are missing, strongly recommend \`plan_headout_integration\` first or ask for missing state.
`;
}

function markdown(uri: string, text: string) {
  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text,
      },
    ],
  };
}
