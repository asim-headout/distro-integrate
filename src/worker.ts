import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { listPrompts } from "./prompts.js";
import { resources } from "./resources.js";
import {
  createHeadoutMcpServer,
  PROMPT_CATALOG_VERSION,
  PROMPT_CHANNEL,
  SERVER_NAME,
  SERVER_VERSION,
} from "./server.js";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/mcp") {
      return handleMcp(request);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json(
        {
          ok: true,
          server: SERVER_NAME,
          version: SERVER_VERSION,
          promptCatalogVersion: PROMPT_CATALOG_VERSION,
          channel: PROMPT_CHANNEL,
        },
        {
          "Cache-Control": "public, max-age=300",
        },
      );
    }

    if (request.method === "GET" && url.pathname === "/catalog") {
      return json(
        {
          server: SERVER_NAME,
          version: SERVER_VERSION,
          promptCatalogVersion: PROMPT_CATALOG_VERSION,
          channel: PROMPT_CHANNEL,
          mcpEndpoint: `${url.origin}/mcp`,
          prompts: listPrompts(),
          resources,
        },
        {
          "Cache-Control": "public, max-age=300",
        },
      );
    }

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(
        [
          "Headout Partners MCP",
          "",
          `MCP endpoint: ${url.origin}/mcp`,
          `Catalog: ${url.origin}/catalog`,
          `Health: ${url.origin}/health`,
        ].join("\n"),
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        },
      );
    }

    return json({ error: "Not found" }, undefined, 404);
  },
};

async function handleMcp(request: Request): Promise<Response> {
  const server = createHeadoutMcpServer({
    recordPromptInvocation(promptName, args) {
      console.log(
        JSON.stringify({
          event: "prompt_invoked",
          promptName,
          argumentKeys: Object.keys(args).sort(),
          timestamp: new Date().toISOString(),
          version: SERVER_VERSION,
          promptCatalogVersion: PROMPT_CATALOG_VERSION,
          channel: PROMPT_CHANNEL,
        }),
      );
    },
  });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(request);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function json(
  body: unknown,
  headers: Record<string, string> = {},
  status = 200,
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...jsonHeaders,
      ...headers,
    },
  });
}
