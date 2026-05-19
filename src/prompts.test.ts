import { describe, expect, it } from "vitest";
import { getPrompt, listPrompts, prompts } from "./prompts.js";

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

  it("renders docs, TDD, sandbox, and maintainability guidance", () => {
    const result = getPrompt("implement_headout_booking_tdd", {
      stack: "Next.js monorepo",
      architecture: "direct server route calls",
      partner_mode: "api_partner",
      order_model: "orders table",
    });

    const text = result.messages[0]?.content.text ?? "";
    expect(text).toContain("https://partner.headout.com/docs/llms.txt");
    expect(text).toContain("https://partner.headout.com/docs/specs/openapi-v2.yaml");
    expect(text).toContain("Use TDD by default");
    expect(text).toContain("Sandbox server: https://sandbox.api.dev-headout.com");
    expect(text).toContain("customersDetails.count must match");
    expect(text).toContain("Prefer files under 300 lines");
    expect(text).toContain("Headout API keys strictly server-side");
  });

  it("keeps prompt source files within the intended review threshold", () => {
    expect(prompts.length).toBeGreaterThanOrEqual(8);
  });
});
