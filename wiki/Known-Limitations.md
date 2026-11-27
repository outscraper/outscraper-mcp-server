# Known Limitations

## Backend Availability

The bridge requires Rashida's `/mcp/<API_KEY>` endpoint. A successful Node startup or `/health` response does not verify the backend. There is no legacy REST fallback; check the configured host and backend deployment when tool discovery fails.

## Upgrades

Connection settings and Node routes remain available, but this release adopts Rashida's current tool contract. Cached tool definitions and fixed workflows must be refreshed. Old aliases, synchronous service modes and the Node-specific response envelope are not retained.

## Organization Capabilities

The API host and key must belong to the same organization. Targetron exposes only catalog, catalog pricing and balance. A missing service tool cannot be enabled by changing Node flags; use the backend's current discovery and policy.

## Pricing and Execution

Estimates are advisory and do not reserve allowance or enforce budgets. Usage can be pending, and output counts may be unknown before a search. The bridge does not automatically retry submissions or provide cancellation.

Request history is bounded by the existing backend retention rules. Missing or expired results can return `Pending`. Do not infer that such work never started, or automatically replace it with a new paid request.

## Transport

`SSE_LOCAL` is an alias for stateful Streamable HTTP, not support for the legacy SSE protocol. Restoring an old public URL requires proxy routing to a running Node bridge; this package cannot change a separately hosted website or DNS.
