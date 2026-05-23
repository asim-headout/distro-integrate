import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getPrompt, listPrompts } from "./prompts.js";
import { readResource, resources } from "./resources.js";

export const SERVER_NAME = "distro-mcp-server";
export const SERVER_VERSION = "0.1.0";
export const PROMPT_CATALOG_VERSION = "2026.05.23-1";
export const PROMPT_CHANNEL = "stable";

export type PromptInvocationRecorder = (
  promptName: string,
  args: Record<string, string | undefined>,
) => void;

export function serverInstructions(): string {
  return [
    "This is a prompt-first MCP server for Headout partner API integrations.",
    "Use prompts/list to discover guided workflows such as plan_headout_integration, implement_headout_booking_tdd, review_headout_integration, and debug_headout_integration.",
    "Tools are intentionally empty in this POC.",
    "Read headout://prompt-catalog if your client or agent discovers resources before prompts.",
    `Prompt catalog version: ${PROMPT_CATALOG_VERSION}.`,
    `Prompt channel: ${PROMPT_CHANNEL}.`,
  ].join(" ");
}

export function createHeadoutMcpServer(options: {
  recordPromptInvocation?: PromptInvocationRecorder;
} = {}) {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      instructions: serverInstructions(),
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: listPrompts(),
  }));

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [],
  }));

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources,
  }));

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) =>
    readResource(request.params.uri),
  );

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const args = request.params.arguments ?? {};
    const result = getPrompt(request.params.name, args);
    options.recordPromptInvocation?.(request.params.name, args);
    return result;
  });

  return server;
}
