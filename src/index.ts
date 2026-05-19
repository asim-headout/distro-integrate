#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getPrompt, listPrompts } from "./prompts.js";
import { recordPromptInvocation } from "./telemetry.js";

const server = new Server(
  {
    name: "distro-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      prompts: {},
    },
  },
);

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: listPrompts(),
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const args = request.params.arguments ?? {};
  const result = getPrompt(request.params.name, args);
  recordPromptInvocation(request.params.name, args);
  return result;
});

const transport = new StdioServerTransport();
await server.connect(transport);
