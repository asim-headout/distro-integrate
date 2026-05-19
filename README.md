# distro-mcp-server

Prompt-only MCP server for partners integrating Headout APIs.

The server gives an AI assistant Headout-specific integration workflows instead of making API calls for the user. It is designed for partners using any stack: Next.js, Rails, Django, Laravel, Spring, serverless functions, generated clients, monorepos, direct endpoint calls, or an API wrapper around Headout.

## What It Provides

- Prompt templates for planning, implementation, testing, review, and debugging.
- Headout API v2-first guidance with links to `llms.txt` and OpenAPI specs.
- TDD-by-default instructions unless the user explicitly opts out.
- Sandbox-safe guidance for live validation.
- Security guidance to keep `Headout-Auth` server-side.
- Local opt-in telemetry metadata for improving prompt DX.

## Prompts

- `plan_headout_integration`
- `implement_headout_discovery`
- `implement_headout_inventory_and_pricing`
- `implement_headout_booking_tdd`
- `implement_headout_seatmap`
- `implement_headout_webhooks`
- `generate_headout_test_plan`
- `review_headout_integration`
- `debug_headout_integration`

## Development

```bash
pnpm install
pnpm test
pnpm build
```

Run locally:

```bash
pnpm dev
```

## Client Configuration

After building, point an MCP client at the compiled stdio server:

```json
{
  "mcpServers": {
    "headout-distro": {
      "command": "node",
      "args": ["/absolute/path/to/distro-integrate/dist/index.js"],
      "env": {
        "HEADOUT_MCP_TELEMETRY": "local"
      }
    }
  }
}
```

For development, you can run via `pnpm`:

```json
{
  "mcpServers": {
    "headout-distro-dev": {
      "command": "pnpm",
      "args": ["dev"],
      "cwd": "/absolute/path/to/distro-integrate",
      "env": {
        "HEADOUT_MCP_TELEMETRY": "local"
      }
    }
  }
}
```

## Telemetry

Telemetry is intentionally minimal. The server records prompt invocation metadata only:

- prompt name
- argument keys
- timestamp
- MCP server version

It does not record argument values, customer data, source code, request payloads, API keys, or errors.

Modes:

```bash
HEADOUT_MCP_TELEMETRY=local
HEADOUT_MCP_TELEMETRY=off
```

Local telemetry defaults to:

```text
.headout-mcp/events.jsonl
```

Override it with:

```bash
HEADOUT_MCP_TELEMETRY_FILE=/path/to/events.jsonl
```

Remote telemetry is intentionally not implemented in this POC. Add it only after defining partner consent, retention, redaction, and data-processing rules.

## Headout Docs

- LLM docs index: https://partner.headout.com/docs/llms.txt
- OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2.yaml
- API Partner OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2-api-partner.yaml
- Affiliate OpenAPI v2: https://partner.headout.com/docs/specs/openapi-v2-affiliate.yaml

## DX Principles

- The MCP should behave like a Headout integration architect, not a docs search bot.
- Prompts should adapt to the partner repo instead of imposing a framework.
- Tests should come first by default.
- Sandbox calls should be explicit, credential-gated, and non-destructive unless approved.
- Code guidance should favor maintainable files, typed boundaries, existing conventions, and clear ownership.
