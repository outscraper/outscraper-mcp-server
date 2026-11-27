# Outscraper MCP — Node Bridge

[![Outscraper MCP server](https://glama.ai/mcp/servers/outscraper/outscraper-mcp-server/badges/score.svg)](https://glama.ai/mcp/servers/outscraper/outscraper-mcp-server)

> Most users can connect directly through our hosted MCP at [mcp.outscraper.com](https://mcp.outscraper.com/). This package provides a Node bridge for clients that require a local MCP process.

Official Node MCP bridge for [Outscraper](https://outscraper.com/).

Use the same business catalog, scraping, enrichment, pricing, and request tools as the main Outscraper MCP server through an existing stdio or Node HTTP connection. Tool names, descriptions, parameters, annotations, and results come directly from Rashida, the Outscraper API backend. This package does not maintain a separate service catalog or transform tool results into a Node-specific envelope.

## Connect to the Hosted MCP

The hosted Outscraper MCP is the recommended starting point for clients that support remote HTTP. No Node.js installation is needed for a direct hosted connection.

| Connection | MCP server URL | Authentication |
| --- | --- | --- |
| OAuth | `https://api.outscraper.com/mcp` | Choose OAuth and sign in to Outscraper |
| API key | `https://api.outscraper.com/mcp/<API_KEY>` | Replace `<API_KEY>` with your Outscraper API key and choose no additional authentication |

Use these API URLs in your client's MCP settings; the setup website is a guide. The plain `/mcp` endpoint uses OAuth, so a normal API key is not an OAuth bearer token. Keep the complete API-key URL private. See the [client setup guides](https://mcp.outscraper.com/#setup) for compatibility and connection instructions.

## Node Bridge Quick Start

Requires Node.js 20 or newer and an Outscraper account API key. Keep the key in your client's private configuration or secret storage.

For a client that launches local MCP processes:

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

The process uses stdio by default. It sends tool requests to the API-key endpoint at `https://api.outscraper.com/mcp/<API_KEY>`. Do not put a real key in shared examples, screenshots, or support messages.

The Node HTTP server's header authentication described below is separate from the hosted OAuth endpoint.

### Upgrading From 0.2.x

Version 0.3.0 uses Rashida's tool definitions and results. Refresh your client's tool list and update saved workflows: catalog discovery uses `search_businesses`, full catalog retrieval uses `search_businesses_full`, and result retrieval uses `requests_get` with `id`. The previous `businesses_search` / `businesses_get` contract and Node-specific result envelope are not preserved. Review the [changelog](./CHANGELOG.md) before upgrading fixed integrations.

## How It Works

1. Your client connects to this Node process using stdio or Streamable HTTP.
2. Node forwards `tools/list` and `tools/call` to the configured API origin's `/mcp/<API_KEY>` endpoint.
3. Rashida supplies tool definitions, validates arguments and account access, executes tools, and returns results.
4. Node returns those MCP results without adding the old `structuredContent.data` wrapper or converting asynchronous requests into synchronous responses.

Refresh your client's tools after an upstream release. Tools are read from the backend rather than cached in a local catalog. Protocol initialization and transport sessions are handled locally; the upstream API remains stateless. The bridge does not automatically retry submissions. A lost connection or timeout does not prove a paid request failed to start.

The API host selects the organization, and the key must belong to that organization. An API-key connection receives the capabilities allowed for its organization. Targetron remains limited to business catalog, catalog pricing, and account balance; it does not gain scraping tools through Node. Use that organization's API origin in `OUTSCRAPER_API_BASE_URL` when connecting to another brand.

## Tools and Workflows

Inspect `tools/list` and the live schemas after connecting. The available tools depend on the backend deployment and organization.

| Tool | Purpose |
| --- | --- |
| `search`, `fetch` | Natural-language catalog discovery and masked single-record previews |
| `search_businesses` | Structured, free masked catalog previews |
| `search_businesses_full` | Paid full catalog records and requested enrichments |
| `pricing_get` | Organization rates, recorded allowances, and optional cost scenarios |
| `balance_get` | Account billing data and dashboard link |
| `discover_services` | Find enabled services, including services already exposed as direct tools |
| `get_service_schema` | Load one service's parameters and current schema version |
| `run_service` | Start an asynchronous service request |
| `requests_get`, `requests_list` | Read results and account request history |

Common services are also exposed as direct tools. Use discovery for the rest rather than loading every schema. Direct tools and `run_service` use the same execution and pricing rules. Business catalog preview/full modes do not apply to scraping or enrichment services.

### Preview Business Catalog Data

Call `search_businesses` with:

```json
{
  "filters": {
    "country_code": "US",
    "states": ["MA"],
    "cities": ["boston"],
    "types": ["dentist"],
    "has_website": true
  },
  "limit": 5
}
```

Preview fields may be masked. For authorized full retrieval, price `search_businesses_full` first and select actual returned IDs using `filters.os_ids`. Paid pages and repeated calls can each record usage. See the [agent guide](https://outscraper.com/agents.md) for catalog filters and enrichment guidance; the connected server's schema remains authoritative.

### Discover and Run a Service

Call `discover_services`:

```json
{"query": "google maps search", "limit": 5}
```

Then call `get_service_schema` with an ID returned by discovery:

```json
{"service_id": "google_maps_search"}
```

Before paid execution, call `pricing_get`, explain the returned units, rates and estimate limitations, and obtain authorization or continue within an agreed scope and budget:

```json
{"service_id": "google_maps_search", "quantity": 20}
```

For one query capped at 20 places, this prices the scenario at that cap. Fewer extracted places mean fewer base-service units. Check each service's limit semantics and price enrichments separately; there is no fixed free allowance shared by all services or organizations.

Call `run_service`, replacing the version placeholder with the exact returned `schema_version`:

```json
{
  "service_id": "google_maps_search",
  "schema_version": "<returned schema_version>",
  "parameters": {"query": ["dentists in Boston"], "limit": 20}
}
```

If `google_maps_search` is advertised directly, you can instead call it with `{"query":["dentists in Boston"],"limit":20}`. Use one execution path, not both. Submission returns an `id` and `status: "Pending"`.

### Read Results

Call `requests_get` with the returned `id`:

```json
{"id": "<returned request id>", "limit": 50}
```

Poll at bounded intervals while status is `Pending`; report outstanding work if your wait budget expires. Missing or expired results may also appear as `Pending`, so do not submit a replacement automatically. `Success` and `Failure` are the backend's completion statuses.

Follow `next_cursor` with the same `id` and `limit`. Preserve query and record indexes and empty result groups. If a page contains `fragment.encoding: "json_text"`, concatenate fragment text in cursor order and parse the complete JSON, not each fragment independently.

`requests_list` uses `type: "running"` or `"finished"`, plus `skip` and `limit`. It returns `items` and `has_more`; advance `skip` by the number of returned items. After an ambiguous submission, inspect both history types before deciding whether to try again. Missing history does not prove the request never started.

### Pricing

Use `pricing_get` before paid work. Rates and recorded usage come from the connected organization and account; do not hardcode prices or promise a universal first-500 free tier. Estimates are advisory, exclude pending usage, and do not reserve credits or enforce a spending cap. Unknown pricing or allowance does not mean free. `balance_get` provides account billing information and a dashboard link. Request history can expose recorded service usage, but it is not a guaranteed per-conversation charge total.

More [task examples](./examples/README.md) and [example agent skills](./examples/skills/README.md) are included in this repository.

## Run an HTTP Bridge

Build from source, then enable stateless Streamable HTTP:

```bash
npm ci
npm run build
CLOUD_SERVICE=true HTTP_STREAMABLE_SERVER=true HOST=127.0.0.1 PORT=3000 npm start
```

In hosted mode, each request supplies its own API key. Supported local routes are:

- `/mcp`, with `X-OUTSCRAPER-API-KEY`, `X-API-KEY`, or `Authorization: Bearer <API_KEY>`
- `/v1/mcp/<API_KEY>`, including a trailing slash
- `/health`, a process health check

Header credentials take precedence over a key in the path. `CLOUD_SERVICE=true` uses request credentials rather than a shared `OUTSCRAPER_API_KEY`. With hosted mode off, the process uses its configured `OUTSCRAPER_API_KEY`; keep such a server private because all callers would use that account.

Set `HTTP_STATEFUL_SERVER=true` for session-based Streamable HTTP. `SSE_LOCAL=true` remains a deprecated alias for this mode; it is not a legacy SSE endpoint. Send the same credentials on every session request. Stateless GET and DELETE return 405. Use HTTPS at the public reverse proxy.

These routes remain available in the Node application. Updating this package does not move DNS or restore a retired public route. To preserve `https://mcp.outscraper.com/v1/mcp/<API_KEY>`, route that path to a deployed Node bridge at the reverse proxy; the root of the host can continue serving the setup website. Do not redirect protocol POST requests through a landing page.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `OUTSCRAPER_API_KEY` | Unset | Account key for stdio or private HTTP mode |
| `OUTSCRAPER_API_BASE_URL` | `https://api.outscraper.com` | API origin; the bridge appends `/mcp/<API_KEY>` |
| `CLOUD_SERVICE` | `false` | Resolve HTTP credentials per request |
| `HTTP_STREAMABLE_SERVER` | `false` | Enable stateless HTTP |
| `HTTP_STATEFUL_SERVER` | `false` | Enable stateful HTTP; takes precedence over stateless mode |
| `SSE_LOCAL` | `false` | Deprecated alias for stateful HTTP |
| `HOST` | `localhost` | HTTP listen address |
| `PORT` | `3000` | HTTP listen port |

The `.cloud` API mirror is supported. Use an API origin without `/mcp`, credentials, or query parameters for `OUTSCRAPER_API_BASE_URL`. The chosen deployment must support the keyed endpoint.

## Upgrade and Deployment

This release aligns the Node tool interface with the current Rashida interface. Existing API keys, launch settings and Node connection paths remain usable. Saved workflows must refresh their tool definitions and adopt the current names and arguments: catalog preview/full tools replace the old catalog interface, request reads use `id`, and services always submit asynchronous requests. Old-only tools and aliases are not retained. Tool results use the backend's MCP content rather than the previous Node envelope.

Deploy Rashida's `/mcp/<API_KEY>` endpoint before releasing or deploying this bridge. There is deliberately no fallback to the old REST adapters, which would reintroduce different tools and behavior. Verify tool discovery and an authenticated read with a disposable test account on the intended API host.

Redact API keys from proxy, access, error and tracing logs on both the Node route and upstream API path. Never log full key-bearing URLs. `/health` only checks the Node process; it does not establish upstream readiness or account access. Route old public connection paths explicitly if retaining them, and verify them through the public proxy before announcing compatibility.

## Development

```bash
npm ci
npm run check
npm test
npm run build
```

Tool behavior belongs in Rashida. Add or update backend services there; this bridge should continue forwarding their published schemas and results without a matching local adapter.
