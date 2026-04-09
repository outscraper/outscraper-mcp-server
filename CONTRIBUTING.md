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

When adding a new service:

1. Add the endpoint method in `src/outscraper/client.ts`.
2. Add or extend request types in `src/outscraper/types.ts`.
3. Create a new module in `src/services/<service-name>/service.ts`.
4. Register the module in `src/server.ts`.
5. Update `README.md` and, if needed, `server.json`.

## Contribution Guidelines

- Keep tool names short and domain-oriented.
- Prefer direct alignment with `outscraper-api-docs.json`.
- Keep output shapes consistent with the shared MCP result envelope.
- Use `execution_mode` for async-capable tools.
- Avoid adding unnecessary runtime dependencies.
- Prefer modular additions over growing a single large file.

## Validation

Before opening a PR:

```bash
npm run build
npm run check
npm pack --dry-run
```

If the change touches live endpoint behavior, also run a real MCP smoke test with a valid API key.

## Pull Requests

PRs should include:

- what changed
- why it changed
- how it was validated
- any known API limitations or deviations from docs
