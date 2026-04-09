# Adding New Services

This project uses a modular structure for MCP tools.

## Standard Flow

1. Add the endpoint method in `src/outscraper/client.ts`.
2. Add or extend request types in `src/outscraper/types.ts`.
3. Create a new module in `src/services/<service-name>/service.ts`.
4. Register the module in `src/server.ts`.
5. Update `README.md`.
6. Update metadata if needed.

## Guidelines

- keep tool names short and domain-oriented
- follow documented Outscraper endpoint behavior
- use the shared MCP result envelope
- support `execution_mode` for async-capable tools
- keep docs product-facing
- document enrichments as enrichments, not standalone endpoints

## Validation

Before merging:

```bash
npm run build
npm run check
npm pack --dry-run
```

If the new service touches live behavior:

1. confirm the tool appears in `listTools`
2. call it through the running MCP server
3. verify at least one realistic request
4. re-check public docs
