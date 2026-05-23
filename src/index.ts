#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createHeadoutMcpServer } from "./server.js";
import { recordPromptInvocation } from "./telemetry.js";

const server = createHeadoutMcpServer({
  recordPromptInvocation,
});

const transport = new StdioServerTransport();
await server.connect(transport);
