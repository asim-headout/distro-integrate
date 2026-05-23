import { DOCS } from "./docs.js";
import {
  edgeCaseSection,
  implementationGate,
  optional,
  planningOnlySection,
  prerequisiteGate,
  sharedPreamble,
  continuitySection,
  tddSection,
} from "./prompt-utils.js";
import type { PromptDefinition, PromptMessageResult } from "./types.js";

const commonArgs = [
  {
    name: "partner_mode",
    description: "api_partner, affiliate, or unknown.",
    required: false,
  },
  {
    name: "stack",
    description: "Partner stack, for example Next.js, Rails, Laravel, Spring, or unknown.",
    required: false,
  },
  {
    name: "architecture",
    description: "Wrapper/client package, direct server calls, monorepo, generated client, or unknown.",
    required: false,
  },
  {
    name: "integration_state",
    description: "Current known integration state or resume summary from a previous session.",
    required: false,
  },
  {
    name: "completed_steps",
    description: "Comma-separated completed steps, for example planning, setup, discovery, inventory.",
    required: false,
  },
] as const;

export const prompts: PromptDefinition[] = [
  {
    name: "plan_headout_integration",
    description:
      "Create a stack-aware Headout integration plan before code changes.",
    arguments: [
      ...commonArgs,
      {
        name: "goals",
        description: "What the partner wants to build or migrate.",
        required: true,
      },
      {
        name: "constraints",
        description: "Known constraints such as deadline, platform, regions, currencies, or seatmap needs.",
        required: false,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Goal:
${optional(args.goals, "Clarify integration goals with the user.")}

Constraints:
${optional(args.constraints, "Unknown. Ask only when the repo and docs cannot answer safely.")}

${planningOnlySection()}

${continuitySection()}

Create an implementation plan that:
- Classifies the current integration shape: wrapper, direct server calls, generated client, serverless functions, or monorepo package.
- Identifies which Headout v2 docs and OpenAPI sections are relevant.
- Splits work into discovery, product detail, inventory/pricing, booking, post-booking, webhooks, and observability.
- Calls out security boundaries and where the Headout API key must live.
- Defines a testing strategy using the repo's existing setup, plus sandbox validation strategy.
- Lists data model changes and migration risks.
- Produces a short sequence of implementation steps with acceptance criteria.

Use these references:
- Setup: ${DOCS.guide.setup}
- Walkthrough: ${DOCS.guide.walkthrough}
- Launch checklist: ${DOCS.guide.checklist}
- OpenAPI v2: ${DOCS.openApiV2}

${tddSection()}

${edgeCaseSection()}`,
  },
  {
    name: "implement_headout_discovery",
    description:
      "Implement city/category/collection/product discovery using the partner repo's patterns.",
    arguments: [
      ...commonArgs,
      {
        name: "scope",
        description: "Discovery scope, such as cities only, products by city, collections, or full catalog.",
        required: true,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Discovery scope:
${optional(args.scope, "Implement only the discovery flow requested by the user.")}

Implement Headout discovery using the repo's existing test workflow.

${continuitySection()}

${prerequisiteGate("implement_headout_discovery", [
  "partner mode selected or explicitly deferred",
  "server-side auth boundary identified",
  "base URL and environment strategy decided",
  "repo stack and package/test workflow identified, or absence confirmed",
])}

${implementationGate()}

Relevant docs:
- Products list: ${DOCS.apiPartnerV2.products}
- Product get: ${DOCS.apiPartnerV2.product}
- Key concepts: ${DOCS.guide.concepts}
- OpenAPI v2: ${DOCS.openApiV2}

Requirements:
- Preserve the partner's existing data access and caching style.
- Support pagination and avoid assuming a single page.
- Keep currencyCode, languageCode, cityCode, categoryId, collectionId, and subCategoryId handling explicit.
- Do not expose Headout API keys to browser/client bundles.
- Map Headout product fields into local domain objects without discarding unknown future fields unnecessarily.
- Handle nullable content, images, reviews, pricing, canonical URLs, and localeSpecificUrls.
- Add tests for pagination, missing optional fields, unknown language URL keys, and currency/language propagation.

${tddSection()}`,
  },
  {
    name: "implement_headout_inventory_and_pricing",
    description:
      "Implement normal inventory lookup, price mapping, pax validation, and checkout-ready pricing tests.",
    arguments: [
      ...commonArgs,
      {
        name: "checkout_shape",
        description: "How the partner checkout/cart/order model currently represents tickets or passengers.",
        required: false,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Checkout shape:
${optional(args.checkout_shape, "Inspect the repo and infer before changing code.")}

Implement Headout inventory and pricing using the repo's existing test workflow.

${continuitySection()}

${prerequisiteGate("implement_headout_inventory_and_pricing", [
  "plan exists",
  "Headout server-side client or request boundary exists",
  "discovery/product or variant selection flow exists or is stubbed",
  "currency strategy decided",
  "test workflow confirmed, or absence confirmed",
])}

${implementationGate()}

Relevant docs:
- Inventory: ${DOCS.apiPartnerV2.inventory}
- Enums and errors: ${DOCS.guide.enums}
- OpenAPI v2: ${DOCS.openApiV2}

Requirements:
- Fetch inventory using the selected variant/tour, date range, and currencyCode.
- Treat returned inventory pricing as the source of truth for booking price construction.
- Validate availability before allowing checkout.
- Model PER_PERSON and PER_GROUP separately; do not force one into the other.
- Preserve netPrice/headoutSellingPrice/originalPrice if the partner needs reconciliation or display logic.
- Add tests for mixed pax types, min/max pax ranges, CLOSED inventory, LIMITED remaining counts, UNLIMITED inventory, price precision, and stale pricing.

${tddSection()}

${edgeCaseSection()}`,
  },
  {
    name: "implement_headout_booking_tdd",
    description:
      "Implement create/capture/get booking flow with existing tests, sandbox safety, and reconciliation.",
    arguments: [
      ...commonArgs,
      {
        name: "order_model",
        description: "How the partner stores orders/bookings today.",
        required: false,
      },
      {
        name: "sandbox_policy",
        description: "Whether sandbox live booking tests are allowed.",
        required: false,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Order model:
${optional(args.order_model, "Inspect existing order/booking models first.")}

Sandbox policy:
${optional(args.sandbox_policy, "Do not create live sandbox bookings unless the user explicitly approves.")}

Implement Headout booking using the repo's existing test workflow.

${continuitySection()}

${prerequisiteGate("implement_headout_booking_tdd", [
  "plan exists",
  "server-side Headout auth/client boundary exists",
  "inventory and current pricing flow exists or is intentionally mocked",
  "checkout/order model is known",
  "sandbox policy is confirmed",
])}

${implementationGate()}

Relevant docs:
- Create booking: ${DOCS.apiPartnerV2.bookingCreate}
- Capture booking: ${DOCS.apiPartnerV2.bookingCapture}
- Get booking: ${DOCS.apiPartnerV2.bookingGet}
- Cancel: ${DOCS.apiPartnerV2.cancel}
- Reschedule: ${DOCS.apiPartnerV2.reschedule}
- OpenAPI v2: ${DOCS.openApiV2}

Requirements:
- Create bookings in UNCAPTURED state and capture by updating status to PENDING.
- Store Headout bookingId and partnerReferenceId for reconciliation.
- Build customersDetails from current inventory pricing and required input fields.
- Ensure customersDetails.count matches customers length.
- Ensure exactly one primary customer when required.
- Keep booking APIs server-side.
- On uncertain failures, prefer lookup/reconciliation over duplicate booking creation.
- Map Headout errors into the partner's existing error model.
- Add sandbox smoke tests only when credentials are present and user allows booking operations.

${tddSection()}

${edgeCaseSection()}`,
  },
  {
    name: "implement_headout_seatmap",
    description:
      "Implement Headout seatmap iframe or custom seat selection with validation-first tests.",
    arguments: [
      ...commonArgs,
      {
        name: "seatmap_mode",
        description: "iframe, custom, both, or unknown.",
        required: true,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Seatmap mode:
${optional(args.seatmap_mode, "Ask whether iframe or custom seat selection is required.")}

Implement Headout seatmap support using the repo's existing test workflow.

${continuitySection()}

${prerequisiteGate("implement_headout_seatmap", [
  "plan exists",
  "seatmap mode selected: iframe, custom, or both",
  "product/variant discovery exists",
  "server-side Headout auth/client boundary exists",
  "booking integration knows how to pass inventorySeatIds",
])}

${implementationGate()}

Relevant docs:
- Seatmap iframe: ${DOCS.apiPartnerV2.seatmapIframe}
- Seatmap inventory: ${DOCS.apiPartnerV2.seatmapInventory}
- Seatmap validate: ${DOCS.apiPartnerV2.seatmapValidate}
- OpenAPI v2: ${DOCS.openApiV2}

Requirements:
- Use iframe mode when the partner wants the Headout-hosted selection UI.
- Use custom mode only when the partner needs to render seats and validation themselves.
- Validate selected seats before booking.
- Treat HTTP 200 validation responses with business-level errors as failed selections.
- Enforce the 20-seat validation ceiling.
- Handle SEAT_UNAVAILABLE, SEAT_NOT_FOUND, ADJACENCY_RULE_VIOLATION, and unknown future error codes.
- Preserve selected seat codes through booking via inventorySeatIds.
- Add tests for stale seats, invalid seats, adjacency violations, price changes, and mixed seat price types.

${tddSection()}`,
  },
  {
    name: "implement_headout_webhooks",
    description:
      "Implement booking-status webhooks with idempotency, observability, and tests.",
    arguments: [
      ...commonArgs,
      {
        name: "webhook_runtime",
        description: "Runtime for receiving webhooks, such as Next.js route handler, Lambda, Rails controller.",
        required: false,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Webhook runtime:
${optional(args.webhook_runtime, "Inspect the app's existing webhook/controller pattern.")}

Implement Headout webhooks using the repo's existing test workflow.

${continuitySection()}

${prerequisiteGate("implement_headout_webhooks", [
  "plan exists",
  "booking persistence model is known",
  "webhook runtime and public endpoint strategy are known",
  "idempotency storage strategy is known",
  "logging/observability pattern is identified",
])}

${implementationGate()}

Relevant docs:
- Webhooks: ${DOCS.apiPartnerV2.webhooks}
- Enums and errors: ${DOCS.guide.enums}
- OpenAPI v2: ${DOCS.openApiV2}

Requirements:
- Register, retrieve, and update webhook configuration if the integration owns setup.
- Implement the inbound webhook endpoint using existing routing conventions.
- Handle PENDING, COMPLETED, CANCELLED, FAILED, and CAPTURE_TIMEDOUT. Do not expect UNCAPTURED.
- Make processing idempotent and resilient to retries/out-of-order delivery.
- Persist enough event metadata for reconciliation without storing PII-heavy payloads.
- Add structured logs with bookingId, partnerReferenceId when present, status, and correlation/request ID.
- Add tests for duplicate events, unknown status, missing booking, status regression, and retry behavior.

${tddSection()}`,
  },
  {
    name: "generate_headout_test_plan",
    description:
      "Generate a comprehensive Headout test plan for a partner implementation.",
    arguments: [
      ...commonArgs,
      {
        name: "implemented_flows",
        description: "Flows already implemented or planned.",
        required: true,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Implemented flows:
${optional(args.implemented_flows, "Ask the user or inspect the repo.")}

Create a practical test plan.

${continuitySection()}

${prerequisiteGate("generate_headout_test_plan", [
  "target flows are known",
  "test workflow is identified, or absence confirmed",
  "sandbox policy is known or explicitly deferred",
])}

The plan must include:
- Unit tests for request builders, mappers, validators, and error translation.
- Contract tests using mocked Headout v2 responses.
- Sandbox smoke tests gated by env vars.
- Negative tests for stale price, closed inventory, invalid pax, missing required input fields, auth failures, and unknown enum values.
- Seatmap tests when inventorySelectionType is SEATMAP.
- Webhook tests for duplicate delivery and non-UNCAPTURED statuses.
- Launch-readiness checks and rollback/reconciliation checks.

${edgeCaseSection()}`,
  },
  {
    name: "review_headout_integration",
    description:
      "Review an existing Headout integration for correctness, security, testing, and maintainability.",
    arguments: [
      ...commonArgs,
      {
        name: "review_scope",
        description: "Files, PR, feature area, or symptoms to review.",
        required: true,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Review scope:
${optional(args.review_scope, "Review the Headout integration surface.")}

Review the implementation. Lead with findings ordered by severity.

${continuitySection()}

Check for:
- API key exposure to client/browser code.
- v1 usage when v2 should be used.
- Incorrect base URL or missing sandbox separation.
- Missing coverage in an existing test setup for pricing, pax, inventory, booking lifecycle, and webhooks.
- Duplicate booking risk after network failures.
- Incorrect price amount/currency propagation.
- Assuming only ADULT pax or one price type.
- Ignoring required customer or variant input fields.
- Missing idempotency in webhooks.
- Logging PII, secrets, vouchers, or full customer payloads.
- Files exceeding 400 lines without clear responsibility split.
- Unbounded retries, missing timeouts, and poor error translation.

Reference docs:
- ${DOCS.llms}
- ${DOCS.openApiV2}
- ${DOCS.guide.checklist}`,
  },
  {
    name: "debug_headout_integration",
    description:
      "Debug a failing Headout integration without exposing secrets or PII.",
    arguments: [
      ...commonArgs,
      {
        name: "symptom",
        description: "Failure symptom, error, or unexpected behavior.",
        required: true,
      },
      {
        name: "endpoint",
        description: "Headout endpoint or flow involved.",
        required: false,
      },
    ],
    render: (args) => `${sharedPreamble(args)}
Symptom:
${optional(args.symptom, "Ask for the failing behavior, with secrets redacted.")}

Endpoint or flow:
${optional(args.endpoint, "Unknown. Infer from logs/code if available.")}

Debug safely.

${continuitySection()}

Process:
- Ask the user to redact Headout-Auth, customer PII, voucher data, and payment details.
- Identify whether the issue is auth, base URL, request shape, pricing, inventory, booking lifecycle, webhook handling, or seatmap validation.
- Compare the request/response against the relevant Markdown doc and OpenAPI v2 schema.
- Check sandbox vs production configuration.
- Check datetime, currencyCode, languageCode, cityCode, inventoryId, variantId, and price.amount consistency.
- Prefer minimal diagnostic code or tests over ad hoc console output.
- Add a regression test once the root cause is identified.

Useful references:
- Docs index: ${DOCS.llms}
- OpenAPI v2: ${DOCS.openApiV2}
- Enums/errors: ${DOCS.guide.enums}

${edgeCaseSection()}`,
  },
];

export function listPrompts() {
  return prompts.map(({ name, description, arguments: args }) => ({
    name,
    description,
    arguments: args,
  }));
}

export function getPrompt(name: string, args: Record<string, string | undefined>): PromptMessageResult {
  const prompt = prompts.find((candidate) => candidate.name === name);
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }

  for (const argument of prompt.arguments) {
    if (argument.required && !optional(args[argument.name], "")) {
      throw new Error(`Missing required argument "${argument.name}" for prompt "${name}"`);
    }
  }

  return {
    description: prompt.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: prompt.render(args),
        },
      },
    ],
  };
}
