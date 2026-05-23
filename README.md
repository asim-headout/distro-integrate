# distro-mcp-server

Prompt-only MCP server for partners integrating Headout APIs.

The server gives an AI assistant Headout-specific integration workflows instead of making API calls for the user. It is designed for partners using any stack: Next.js, Rails, Django, Laravel, Spring, serverless functions, generated clients, monorepos, direct endpoint calls, or an API wrapper around Headout.

## What It Provides

- Prompt templates for planning, implementation, testing, review, and debugging.
- A prompt-catalog resource at `headout://prompt-catalog` for clients that discover resources before prompts.
- Opt-in guide resources for details that should not bloat every prompt:
  `headout://guides/tdd-contract`, `headout://guides/edge-cases`, and
  `headout://guides/sequencing`.
- Headout API v2-first guidance with links to `llms.txt` and OpenAPI specs.
- Existing-test-first instructions: use tests when the repo already has them, but never add test setup unless the user explicitly asks.
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

## Discovery DX

Some MCP clients and agents look for tools or resources before they surface prompts. This server handles that explicitly:

- `prompts/list` returns the real product surface.
- `resources/list` returns `headout://prompt-catalog`.
- `resources/read` for `headout://prompt-catalog` explains that the MCP is prompt-first and lists available prompts.
- `tools/list` returns an empty list.

The server also sends initialization instructions telling clients to use `prompts/list` first.

Implementation prompts are intentionally short control prompts. They enforce
sequencing and the repo's existing test workflow, then point agents to guide
resources only when deeper detail is needed.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
```

Run local stdio MCP:

```bash
pnpm dev
```

Run local Cloudflare Worker:

```bash
pnpm worker:dev
```

## Cloudflare Deployment

This repo deploys a remote Streamable HTTP MCP server to Cloudflare Workers.

Worker config:

- Worker name: `headout-partners-mcp`
- MCP endpoint: `/mcp`
- Health endpoint: `/health`
- Catalog endpoint: `/catalog`
- Access model: public POC

Validate the Worker bundle:

```bash
pnpm exec wrangler deploy --dry-run --outdir /private/tmp/headout-partners-mcp-worker
```

Deploy manually:

```bash
pnpm worker:deploy
```

After deploy, point remote MCP clients at:

```text
https://headout-partners-mcp.<your-subdomain>.workers.dev/mcp
```

Prompt/resource updates are shipped by redeploying the Worker. Partners using the remote MCP URL do not reinstall anything.

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
- Use the repo's existing test workflow when available; never add test setup unless the user explicitly asks.
- Sandbox calls should be explicit, credential-gated, and non-destructive unless approved.
- Code guidance should favor maintainable files, typed boundaries, existing conventions, and clear ownership.
