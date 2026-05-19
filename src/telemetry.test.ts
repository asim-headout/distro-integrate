import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { recordPromptInvocation } from "./telemetry.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("telemetry", () => {
  it("writes local prompt invocation metadata without argument values", () => {
    const dir = mkdtempSync(join(tmpdir(), "headout-mcp-"));
    const file = join(dir, "events.jsonl");

    process.env.HEADOUT_MCP_TELEMETRY = "local";
    process.env.HEADOUT_MCP_TELEMETRY_FILE = file;

    recordPromptInvocation("debug_headout_integration", {
      symptom: "401 with redacted token",
      stack: "Rails",
    });

    const event = JSON.parse(readFileSync(file, "utf8"));
    expect(event).toMatchObject({
      event: "prompt_invoked",
      promptName: "debug_headout_integration",
      argumentKeys: ["stack", "symptom"],
      version: "0.1.0",
    });
    expect(JSON.stringify(event)).not.toContain("401 with redacted token");

    rmSync(dir, { recursive: true, force: true });
  });

  it("can be disabled", () => {
    const dir = mkdtempSync(join(tmpdir(), "headout-mcp-"));
    const file = join(dir, "events.jsonl");

    process.env.HEADOUT_MCP_TELEMETRY = "off";
    process.env.HEADOUT_MCP_TELEMETRY_FILE = file;

    recordPromptInvocation("plan_headout_integration", { goals: "bookings" });

    expect(() => readFileSync(file, "utf8")).toThrow();
    rmSync(dir, { recursive: true, force: true });
  });
});
