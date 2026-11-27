# Adding New Services

Service definitions and behavior belong in Rashida. The Node package forwards its current tool list and calls, so adding a backend service does not require a Node module, copied schema or REST adapter.

## Standard Flow

1. Add or update the reviewed service registry entry and backend adapter in Rashida using its existing MCP service workflow.
2. Verify the public parameters, worker mapping, billing identity, async execution and organization boundaries in backend tests.
3. Decide whether it is an upfront tool or discovery-only; both remain discoverable through the backend.
4. Deploy the backend change and refresh the MCP client's tools.
5. Compare tool discovery and an authorized call through Node with the direct keyed MCP endpoint. Check pricing and paginated results where applicable.

Targetron's catalog-only restriction is enforced by the backend. Do not add a local exception or a second Node allowlist.

## Bridge Changes

Change this repository only when forwarding, authentication, transport or package behavior needs an update. Preserve schemas and results rather than normalizing them. Keep tests for unknown future tools so new backend services remain callable without a Node release.

Run `npm run check`, `npm test` and `npm run build` for bridge changes. Update task examples when they would otherwise teach stale names or arguments.
