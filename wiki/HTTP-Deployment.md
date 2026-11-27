# HTTP Deployment

The Node application retains stateless and stateful Streamable HTTP, including the legacy `/v1/mcp/<API_KEY>` path. It forwards tool discovery and calls to Rashida's keyed MCP endpoint.

## Prerequisite

Deploy `/mcp/<API_KEY>` on the configured API origin first. Verify authenticated tool discovery there. There is no fallback to the previous REST adapters.

## Stateless Hosted Server

After building from source:

```bash
CLOUD_SERVICE=true HTTP_STREAMABLE_SERVER=true HOST=127.0.0.1 PORT=3000 npm start
```

Configure a public HTTPS reverse proxy in front of the process. Supported routes:

- `POST /mcp` with API-key header authentication
- `POST /v1/mcp/<API_KEY>` with path authentication
- `GET /health` for process health only

Stateless MCP GET and DELETE requests return 405. A trailing slash on the key path is supported.

## Stateful Server

Use `HTTP_STATEFUL_SERVER=true` instead of the stateless flag. `SSE_LOCAL=true` is a deprecated alias; it does not expose a legacy SSE endpoint. The same MCP paths support POST, GET and DELETE with the `mcp-session-id` header. Send the same credentials on each request. A terminated session cannot be reused.

## Preserve an Existing Public Address

To retain `https://mcp.outscraper.com/v1/mcp/<API_KEY>`, route that path to the Node bridge. The host's root can serve the setup website independently. Installing this version does not change DNS or proxy routing, and protocol POST requests should not be redirected through the website.

Preserve required transport headers and disable response buffering where needed for Streamable HTTP. Redact key-bearing paths from access, error and tracing logs on both the public route and upstream API. Test the actual public connection before notifying existing users.

## Docker

```bash
docker compose up --build -d
```

The included Compose configuration enables hosted stateless HTTP on port 3000. `OUTSCRAPER_API_BASE_URL` defaults to `https://api.outscraper.com`; override it with the intended organization's API origin when needed. Use keys belonging to that organization.

`/health` returns `ok` when the process is running. It does not prove upstream reachability, key validity or tool-call success.
