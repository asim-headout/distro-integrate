import { DOCS, HEADOUT_FACTS } from "./docs.js";
import { EDGE_CASES_URI, SEQUENCING_GUIDE_URI, TDD_GUIDE_URI } from "./uris.js";

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
  const integrationState = optional(
    args.integration_state,
    "unknown; ask the user for current progress or inspect the repo for evidence",
  );
  const completedSteps = optional(
    args.completed_steps,
    "unknown; infer from repo and ask the user to confirm before proceeding",
  );

  return `You are helping a partner integrate Headout APIs.

Context:
- Partner mode: ${partnerMode}
- Tech stack: ${stack}
- Architecture shape: ${architecture}
- Integration state: ${integrationState}
- Completed steps: ${completedSteps}

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
- Use the repo's existing test workflow when available. Never install or introduce a test framework just for Headout unless the user explicitly asks.
- Do not hardcode credentials, product IDs, inventory IDs, or sandbox secrets.
- Never log customer PII, API keys, full payment details, or voucher contents.
`;
}

export function continuitySection(): string {
  return `Continuity rule:
- Treat this as a resumable integration, not a one-off task.
- At the start, reconstruct current state from conversation, repo evidence, tests, and any provided integration_state/completed_steps.
- If state is unclear, ask for a brief status summary before making changes.
- At the end, summarize completed Headout steps, remaining steps, open decisions, and the recommended next MCP prompt.`;
}

export function prerequisiteGate(
  currentPrompt: string,
  required: readonly string[],
  recommendedPrompt = "plan_headout_integration",
): string {
  return `Sequencing gate for ${currentPrompt}:
- Required prior decisions/evidence: ${required.join(", ")}.
- If these are not confirmed by integration_state, completed_steps, repo evidence, or the user's message, do not start implementation yet.
- Strongly recommend running \`${recommendedPrompt}\` first, or ask the user for the missing state needed to continue safely.
- If the user explicitly overrides sequencing, state the risk and proceed with the smallest reversible step.`;
}

export function planningOnlySection(): string {
  return `Planning-only contract:
- Do not edit files, run migrations, install packages, or start implementing from this prompt.
- First inspect only enough repo structure to identify stack, package manager, app boundaries, and existing API patterns.
- If partner mode, stack, architecture, auth boundary, checkout shape, or target flows are unclear, ask concise questions before producing the final plan.
- Prefer at most 5 questions. If the repo makes an answer obvious, state the inference instead of asking.
- End with an implementation plan and explicit next prompt recommendation, not code changes.`;
}

export function implementationGate(): string {
  return `Discovery gate before edits:
- Before changing files, inspect the repo for stack, package manager, test framework, API/client patterns, env handling, logging, and existing domain models.
- If critical context is missing, ask concise questions before editing. Critical context includes partner mode, desired flows, sandbox permission, where Headout credentials live, checkout/order shape, and whether seatmap is needed.
- If the user has not explicitly asked you to implement now, stop after a plan and ask for confirmation.
- Once implementation is confirmed, use the existing test workflow if present: tests first, then production code, then refactor. If no test setup exists, do not create one unless the user approves.`;
}

export function tddSection(): string {
  return `Existing-test contract:
- First identify whether the repo already has a test framework and test style.
- If tests exist, work test-first: write or update failing tests before production code.
- If no test setup exists, do not install packages, scaffold a framework, or create test infrastructure unless the user explicitly asks.
- If no tests exist and the user does not approve setup, provide a concise manual verification plan and keep implementation minimal.
- Read ${TDD_GUIDE_URI} when more detail is needed.`;
}

export function edgeCaseSection(): string {
  return `Edge-case guidance:
- Cover pricing, pax, lifecycle, webhook, and seatmap edge cases in tests.
- Read ${EDGE_CASES_URI} when implementing, reviewing, or generating detailed tests.`;
}

export function guideReferences(): string {
  return `Opt-in MCP guide resources:
- Existing-test contract: ${TDD_GUIDE_URI}
- Edge cases: ${EDGE_CASES_URI}
- Sequencing/resume state: ${SEQUENCING_GUIDE_URI}`;
}
