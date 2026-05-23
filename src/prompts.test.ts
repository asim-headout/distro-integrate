import { describe, expect, it } from "vitest";
import { getPrompt, listPrompts, prompts } from "./prompts.js";
import { PROMPT_CATALOG_URI, readResource, resources } from "./resources.js";
import {
  PROMPT_CATALOG_VERSION,
  PROMPT_CHANNEL,
  serverInstructions,
} from "./server.js";

describe("prompt catalog", () => {
  it("exposes a focused set of partner-facing prompts", () => {
    const names = listPrompts().map((prompt) => prompt.name);

    expect(names).toEqual([
      "plan_headout_integration",
      "implement_headout_discovery",
      "implement_headout_inventory_and_pricing",
      "implement_headout_booking_tdd",
      "implement_headout_seatmap",
      "implement_headout_webhooks",
      "generate_headout_test_plan",
      "review_headout_integration",
      "debug_headout_integration",
    ]);
  });

  it("requires declared required arguments", () => {
    expect(() => getPrompt("plan_headout_integration", {})).toThrow(
      'Missing required argument "goals"',
    );
  });

  it("renders docs, existing-test, sandbox, and maintainability guidance", () => {
    const result = getPrompt("implement_headout_booking_tdd", {
      stack: "Next.js monorepo",
      architecture: "direct server route calls",
      partner_mode: "api_partner",
      order_model: "orders table",
    });

    const text = result.messages[0]?.content.text ?? "";
    expect(text).toContain("https://partner.headout.com/docs/llms.txt");
    expect(text).toContain("https://partner.headout.com/docs/specs/openapi-v2.yaml");
    expect(text).toContain("Never install or introduce a test framework just for Headout");
    expect(text).toContain("Sequencing gate for implement_headout_booking_tdd");
    expect(text).toContain("Strongly recommend running `plan_headout_integration` first");
    expect(text).toContain("Continuity rule");
    expect(text).toContain("Sandbox server: https://sandbox.api.dev-headout.com");
    expect(text).toContain("Discovery gate before edits");
    expect(text).toContain("If critical context is missing, ask concise questions before editing");
    expect(text).toContain("Read headout://guides/tdd-contract");
    expect(text).toContain("Read headout://guides/edge-cases");
    expect(text).toContain("Prefer files under 300 lines");
    expect(text).toContain("Headout API keys strictly server-side");
  });

  it("keeps the planning prompt non-executing and question-first", () => {
    const result = getPrompt("plan_headout_integration", {
      goals: "Evaluate integration approach",
    });

    const text = result.messages[0]?.content.text ?? "";
    expect(text).toContain("Planning-only contract");
    expect(text).toContain("Do not edit files");
    expect(text).toContain("Continuity rule");
    expect(text).toContain("ask concise questions before producing the final plan");
  });

  it("keeps prompt source files within the intended review threshold", () => {
    expect(prompts.length).toBeGreaterThanOrEqual(8);
  });

  it("exposes a resource front door for clients that do not surface prompts first", () => {
    expect(resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uri: PROMPT_CATALOG_URI,
          name: "Headout prompt catalog",
        }),
      ]),
    );

    const text = readResource(PROMPT_CATALOG_URI).contents[0]?.text ?? "";
    expect(text).toContain("This MCP server is prompt-first");
    expect(text).toContain("Sequencing and resume state: `headout://guides/sequencing`");
    expect(text).toContain("plan_headout_integration");
    expect(text).toContain("implement_headout_booking_tdd");
  });

  it("publishes stable server metadata in initialization instructions", () => {
    const instructions = serverInstructions();

    expect(instructions).toContain("prompt-first MCP server");
    expect(instructions).toContain(PROMPT_CATALOG_VERSION);
    expect(instructions).toContain(PROMPT_CHANNEL);
  });
});
