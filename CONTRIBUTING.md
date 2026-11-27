# Contributing

The Node server bridges existing stdio and HTTP connections to the current Outscraper MCP backend. Keep tool definitions and execution behavior in Rashida rather than adding a second local tool catalog.

## Development Setup

Requires Node.js 20+ and npm:

```bash
npm ci
cp .env.example .env
```

Use a disposable test account's API key for authorized live checks. Keep keys out of fixtures, logs and commits. The configured API deployment must support `/mcp/<API_KEY>`.

## Project Structure

- `src/server.ts` registers forwarding handlers for MCP tool discovery and calls.
- `src/outscraper/` handles upstream MCP requests and API-key extraction.
- `src/transports/` implements the Node HTTP connection modes.
- `src/index.ts` selects stdio or HTTP using `src/config.ts`.
- `tests/` verifies forwarding, transport behavior and credential handling.

See the [README](./README.md) for connection and configuration details.

## Changes to Tools

Add or update services, schemas, descriptions, pricing and organization restrictions in Rashida. Verify the backend contract there, deploy it, and refresh the connected client’s tools. A new upstream tool should not require a Node adapter or a copied schema.

Keep the bridge transparent: preserve argument values, tool metadata, result content, pagination and tool errors. Do not add local defaults, synchronous execution modes or a custom result envelope. Preserve existing connection routes and credential isolation. Never retry a paid call automatically after an ambiguous upstream failure.

## Validation

Before opening a PR:

```bash
npm run check
npm test
npm run build
npm pack --dry-run
```

Verify changes through an actual MCP transport, not only by calling a helper. Authentication or deployment changes also need an authorized staging smoke test: compare discovery with the backend and exercise a read-only tool through the intended public proxy. Test paid execution only with explicit authorization and controlled fixtures or an agreed test budget. Do not equate `/health` with upstream readiness.

PR descriptions should explain the resulting behavior, validation, and any deployment prerequisites. Refresh documentation and examples when the published interface changes; do not publish npm packages or Docker images as part of routine local verification.
