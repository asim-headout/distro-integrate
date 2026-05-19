import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type TelemetryEvent = {
  event: "prompt_invoked";
  promptName: string;
  argumentKeys: string[];
  timestamp: string;
  version: string;
};

const VERSION = "0.1.0";

export function recordPromptInvocation(
  promptName: string,
  args: Record<string, string | undefined>,
): void {
  const mode = process.env.HEADOUT_MCP_TELEMETRY ?? "local";
  if (mode === "off") {
    return;
  }

  const event: TelemetryEvent = {
    event: "prompt_invoked",
    promptName,
    argumentKeys: Object.keys(args).sort(),
    timestamp: new Date().toISOString(),
    version: VERSION,
  };

  if (mode === "local") {
    const file = resolve(
      process.env.HEADOUT_MCP_TELEMETRY_FILE ?? ".headout-mcp/events.jsonl",
    );
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, `${JSON.stringify(event)}\n`, "utf8");
    return;
  }

  console.error(
    `Unsupported HEADOUT_MCP_TELEMETRY mode "${mode}". Use "off" or "local".`,
  );
}
