# Changelog

## Unreleased

### Changed

- Forward tool discovery and calls to Rashida's API-key MCP endpoint so Node uses
  the same tool names, descriptions, schemas, annotations, pricing and results.
- Replace the separate REST tool catalog and result envelope with the backend's
  current catalog and asynchronous service workflow. Refresh cached tool lists
  and update saved workflows to use current schemas, including `requests_get.id`.
- Keep stdio configuration, hosted API-key headers, `/mcp`, `/v1/mcp/<API_KEY>`
  and optional stateful HTTP connections. Public legacy paths still need proxy
  routing to a running Node bridge.
- Update examples to use free catalog previews, live pricing, service discovery
  and bounded result polling.
- Point the registry's remote entry to the canonical OAuth MCP endpoint; local
  Node connections continue to use API keys.

### Fixed

- Bind hosted stateful sessions to their API key across POST, GET and DELETE.
- Keep credentials out of upstream error output and retain retry guidance when
  a response times out. Requests are never automatically resubmitted.
- Restore missing platform dependency entries in the lockfile so clean installs
  work without changing dependency versions.

### Deployment

- Deploy Rashida's `/mcp/<API_KEY>` endpoint first. No legacy REST fallback is
  provided. Redact credential-bearing URLs at every proxy and logging layer.

## 0.2.5

### Fixed

- Prevent recursive transport shutdown when a client terminates a stateful HTTP
  session. Remove the closed session without closing its transport again, so
  other sessions remain available and new clients can connect.
- Add an HTTP regression test covering session termination, rejection of the
  closed session ID, and continued operation of existing and new sessions.

## 0.2.4

### Fixed

- Fixed tool discovery in Claude Desktop and other MCP clients that only support
  JSON Schema 2020-12. Version 0.2.3 advertised draft-07 schemas, which could cause
  clients to reject every tool before any Outscraper API request was made.
- Explicitly generate JSON Schema 2020-12 for both `inputSchema` and `outputSchema`
  on all 28 tools, working around the MCP TypeScript SDK's draft-07 conversion
  default. Tool arguments, results, and SDK input/output validation are preserved.

### Tests

- Added regression tests for all tool schema dialects, tuple conversion,
  successful `ping`, invalid input/output rejection, and tool catalog updates.
- Run regression tests in the npm release workflow before publication.

### Upgrade

- After this version is published, update to `outscraper-mcp@0.2.4` and restart
  the MCP client. No API key or tool argument changes are required.
