import { describe, expect, it } from "vitest";
import worker from "./worker.js";

describe("worker", () => {
  it("serves health metadata", async () => {
    const response = await worker.fetch(
      new Request("https://example.com/health"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      server: "distro-mcp-server",
      promptCatalogVersion: "2026.05.23-1",
      channel: "stable",
    });
  });

  it("serves catalog metadata", async () => {
    const response = await worker.fetch(
      new Request("https://example.com/catalog"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mcpEndpoint).toBe("https://example.com/mcp");
    expect(body.prompts.map((prompt: { name: string }) => prompt.name)).toContain(
      "plan_headout_integration",
    );
    expect(body.resources.map((resource: { uri: string }) => resource.uri)).toContain(
      "headout://prompt-catalog",
    );
  });
});
