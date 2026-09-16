# Changelog

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
