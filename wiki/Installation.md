# Installation

Requires Node.js 20 or newer. Configure your MCP client to launch the package with an account API key in its private environment:

```json
{
  "mcpServers": {
    "outscraper": {
      "command": "npx",
      "args": ["-y", "outscraper-mcp"],
      "env": {
        "OUTSCRAPER_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Adapt configuration keys to your client's supported format. Preserve unrelated MCP connections. If a Windows client cannot find `npx`, configure the full path to its `npx.cmd` executable.

The Node process uses stdio by default and forwards tool requests to `https://api.outscraper.com/mcp/<API_KEY>`. To use another organization's API deployment, set `OUTSCRAPER_API_BASE_URL` to that API origin; the key must belong to the same organization. The origin must support the keyed MCP endpoint.

## Connection Modes

- stdio: the client starts a local process using `OUTSCRAPER_API_KEY`.
- Stateless Streamable HTTP: set `HTTP_STREAMABLE_SERVER=true`.
- Stateful Streamable HTTP: set `HTTP_STATEFUL_SERVER=true`; this takes precedence over stateless mode. `SSE_LOCAL` remains a deprecated alias.

For hosted HTTP, set `CLOUD_SERVICE=true` so every request supplies its own key through a supported header or `/v1/mcp/<API_KEY>`. See [HTTP Deployment](HTTP-Deployment) and [Authentication](Authentication).

## Existing Users

Restart the process after upgrading and refresh the client's tools. The connection settings remain available, but saved tool workflows must use current Rashida schemas and results. Services submit asynchronous work, and `requests_get` uses `id`. The package does not retain the former Node-only aliases or result envelope.

Publishing or installing this package does not restore a retired public URL. Operators must route legacy paths to a running bridge if they want those addresses to keep working.
