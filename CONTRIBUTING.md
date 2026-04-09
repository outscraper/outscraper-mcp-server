# Contributing

Thanks for contributing to `outscraper-mcp-server`.

## Development Setup

Requirements:

- Node.js 20+
- npm
- an Outscraper API key for live endpoint checks

Setup:

```bash
npm install
copy .env.example .env
```

Then set `OUTSCRAPER_API_KEY` in `.env`.

## Local Development

Useful commands:

```bash
npm run build
npm run check
npm run dev
npm start
```

Default runtime is stdio MCP. HTTP mode is available through env flags documented in [`README.md`](/D:/Work/AI/outscraper-mcp/README.md).

## Project Structure

- `src/outscraper/` contains the API client and auth helpers
- `src/services/` contains MCP tool modules
- `src/transports/` contains stdio and HTTP transport bootstrapping
- `src/mcp/` contains shared MCP result and execution helpers

Current service modules include:

- `businesses`
- `google-maps`
- `media`
- `search`
- `reviews`
- `validators`
- `enrichments`
- `company-insights`
- `emails-and-contacts`
- `profile`
- `requests`

When adding a new service:

1. Add the endpoint method in `src/outscraper/client.ts`.
2. Add or extend request types in `src/outscraper/types.ts`.
3. Create a new module in `src/services/<service-name>/service.ts`.
4. Register the module in `src/server.ts`.
5. Update `README.md` so public docs reflect the real user-facing capability.
6. If the service changes install, metadata, or published behavior, update `server.json` and package metadata as needed.

## Contribution Guidelines

- Keep tool names short and domain-oriented.
- Prefer direct alignment with the documented Outscraper API surface.
- Keep output shapes consistent with the shared MCP result envelope.
- Use `execution_mode` for async-capable tools.
- Avoid adding unnecessary runtime dependencies.
- Prefer modular additions over growing a single large file.
- Keep public documentation product-facing. Avoid referencing internal verification artifacts or local-only workflows in `README.md`.
- When a service is only available as an enrichment rather than a standalone endpoint, document it that way explicitly.

## Validation

Before opening a PR:

```bash
npm run build
npm run check
npm pack --dry-run
```

If the change touches live endpoint behavior, also run a real MCP smoke test with a valid API key.

For new tools, validation should usually include:

1. Confirm the tool appears in `listTools`.
2. Call the tool through the running MCP server, not only through the raw API client.
3. Verify at least one realistic sync or async scenario, depending on the endpoint.
4. Re-check `README.md` so examples, limitations, and tool descriptions still match the implemented behavior.

## Pull Requests

PRs should include:

- what changed
- why it changed
- how it was validated
- any known API limitations or deviations from docs
