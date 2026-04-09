# Outscraper MCP

Official MCP server for [Outscraper](https://outscraper.com/).

It exposes production-ready MCP tools for:

- business discovery and enrichment
- Google Maps places, reviews, photos, and chain detection
- company insights, emails, email validation, and phone enrichment
- Google Search and Google Images search
- Yellow Pages, Booking, Yelp, Tripadvisor, Trustpilot, and Indeed data
- account balance checks and async request lifecycle management

The server supports stdio and HTTP transports, npm-based installation, hosted header auth, and a normalized `structuredContent` result shape for MCP clients and agents.

## Quick Start

```bash
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

For MCP clients, configure:

- command: `npx`
- args: `["-y", "outscraper-mcp"]`
- env: `OUTSCRAPER_API_KEY=YOUR_API_KEY`

## Current Tools

- `businesses_search`
- `businesses_get`
- `google_maps_search`
- `google_maps_reviews`
- `company_insights`
- `emails_and_contacts`
- `emails_validator`
- `google_maps_photos`
- `chain_info`
- `yellowpages_search`
- `booking_reviews`
- `phones_enricher`
- `tp_data`
- `tp_reviews`
- `yelp_reviews`
- `tripadvisor_search`
- `tripadvisor_reviews`
- `google_search`
- `google_search_images`
- `indeed_search`
- `balance_get`
- `requests_get`
- `requests_list`
- `requests_delete`

These tools are aligned to the current documented Outscraper API shapes, including:

- `POST /businesses`
- `GET /businesses/{business_id}`
- `GET /google-maps-search`
- `GET /google-maps-photos`
- `GET /google-search`
- `GET /google-search-images`
- `GET /yellowpages-search`
- `GET /booking-reviews`
- `GET /phones-enricher`
- `GET /trustpilot`
- `GET /trustpilot-reviews`
- `GET /yelp-reviews`
- `GET /tripadvisor-search`
- `GET /tripadvisor-reviews`
- `GET /indeed-search`
- `GET /google-maps-reviews`
- `GET /company-insights`
- `GET /emails-and-contacts`
- `GET /email-validator`
- documented `ai_chain_info` enrichment via `google-maps-search`
- `GET /profile/balance`
- `GET /requests/{requestId}`
- `DELETE /requests/{requestId}`
- `GET /requests`

### Unified Tool Result Shape

Every tool now returns the same structured envelope:

```json
{
  "data": {},
  "meta": {
    "service": "company_insights",
    "operation": "get"
  },
  "async": {
    "id": "request-id",
    "status": "Pending",
    "results_location": "https://api.outscraper.cloud/requests/request-id",
    "is_async_submission": true,
    "next_step": "Call requests_get with request_id=\"request-id\" to check progress."
  }
}
```

`async` is present when the response is an async submission or exposes async request metadata.

### Execution Mode

Async-capable tools now accept:

```json
{
  "execution_mode": "auto"
}
```

Available values:

- `auto`: let the MCP server choose sync or async
- `sync`: force direct response mode
- `async`: force async submission mode

The old boolean `async` is still accepted for compatibility, but `execution_mode` now has priority.

## Install

The recommended way to use this MCP server is from npm.

### Run from npm

```bash
npx -y outscraper-mcp
```

Provide `OUTSCRAPER_API_KEY` through your MCP client config or shell environment.

The server auto-loads `.env` on startup via `dotenv`.

On Windows, if a client cannot find `npx`, use the full Node.js path instead, for example:

```json
{
  "command": "C:\\Program Files\\nodejs\\npx.cmd",
  "args": ["-y", "outscraper-mcp"]
}
```

### Hosted Header Auth Mode

If you want hosted behavior, enable:

```bash
set CLOUD_SERVICE=true
```

Then the HTTP caller can send the Outscraper API key in one of these headers:

- `Authorization: Bearer <api-key>`
- `X-API-KEY: <api-key>`
- `X-OUTSCRAPER-API-KEY: <api-key>`

In `CLOUD_SERVICE=true` HTTP mode, request headers are used as the API key source. In local stdio mode, `OUTSCRAPER_API_KEY` is still required.

### Run with Streamable HTTP

```bash
set HTTP_STREAMABLE_SERVER=true
set HOST=localhost
set PORT=3000
npx -y outscraper-mcp
```

MCP endpoint:

```text
http://localhost:3000/mcp
```

Health endpoint:

```text
http://localhost:3000/health
```

### Run with Stateful HTTP/SSE Mode

This mode uses local session management:

```bash
set SSE_LOCAL=true
set HOST=localhost
set PORT=3000
npx -y outscraper-mcp
```

In this mode the server accepts:

- `POST /mcp` for initialize and subsequent requests
- `GET /mcp` for the session stream
- `DELETE /mcp` for session termination

The session is tracked through the `mcp-session-id` header.

## Client Setup

<details>
<summary>Claude Desktop</summary>

Add this to your Claude Desktop MCP config:

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

</details>

<details>
<summary>Claude Code</summary>

Add the server with the Claude Code CLI:

```bash
claude mcp add outscraper -e OUTSCRAPER_API_KEY=YOUR_API_KEY -- npx -y outscraper-mcp
```

</details>

<details>
<summary>Cursor</summary>

Add this to your global MCP configuration:

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

</details>

<details>
<summary>Windsurf</summary>

Add this to your MCP config:

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

</details>

<details>
<summary>VS Code</summary>

For `settings.json`:

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "outscraperApiKey",
        "description": "Outscraper API Key",
        "password": true
      }
    ],
    "servers": {
      "outscraper": {
        "command": "npx",
        "args": ["-y", "outscraper-mcp"],
        "env": {
          "OUTSCRAPER_API_KEY": "${input:outscraperApiKey}"
        }
      }
    }
  }
}
```

</details>

<details>
<summary>Cline / Roo Code / other command-based MCP clients</summary>

Use the standard stdio command form:

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

</details>

<details>
<summary>n8n</summary>

For n8n or other HTTP MCP clients, run the server in Streamable HTTP mode:

```bash
set HTTP_STREAMABLE_SERVER=true
set HOST=localhost
set PORT=3000
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

Then use:

```text
http://localhost:3000/mcp
```

</details>

## Tool Examples

### Search businesses with structured filters

```json
{
  "filters": {
    "country_code": "US",
    "states": ["NY"],
    "cities": ["New York"],
    "types": ["restaurant", "cafe"]
  },
  "fields": ["name", "phone", "website", "address", "rating", "reviews"],
  "limit": 25
}
```

Natural-language `query` support on `/businesses` currently depends on Outscraper's own parser behavior. In live testing, structured `filters` were reliable while free-form `query` values often returned `Could not parse query into a valid request format.`

### Get one business

```json
{
  "business_id": "YOUR_BUSINESS_ID",
  "fields": ["name", "phone", "website", "address", "rating", "reviews"]
}
```

### Search Google Maps

```json
{
  "query": ["restaurants brooklyn usa"],
  "limit": 20,
  "language": "en",
  "region": "us"
}
```

### Fetch Google Maps reviews

```json
{
  "query": ["ChIJrc9T9fpYwokRdvjYRHT8nI4"],
  "reviews_limit": 20,
  "sort": "newest",
  "language": "en"
}
```

### Get company insights

```json
{
  "query": ["outscraper.com"],
  "fields": ["name", "description", "industry"],
  "execution_mode": "async"
}
```

### Find emails and contacts

```json
{
  "query": ["outscraper.com"],
  "preferred_contacts": ["technical", "decision makers"],
  "execution_mode": "sync"
}
```

### Validate email addresses

```json
{
  "query": ["support@outscraper.com"],
  "execution_mode": "sync"
}
```

### Fetch Google Maps photos

```json
{
  "query": ["NoMad Restaurant, NY, USA"],
  "photos_limit": 5,
  "limit": 1,
  "execution_mode": "sync"
}
```

### Get chain info

```json
{
  "query": ["Starbucks, New York, NY, USA"],
  "limit": 1,
  "execution_mode": "sync"
}
```

### Get Trustpilot business data

```json
{
  "query": ["outscraper.com"],
  "execution_mode": "sync"
}
```

### Search Google

```json
{
  "query": ["outscraper"],
  "pages_per_query": 1,
  "execution_mode": "sync"
}
```

### Search Google Images

```json
{
  "query": ["outscraper"],
  "limit": 5,
  "execution_mode": "sync"
}
```

### Search Indeed

```json
{
  "query": ["https://www.indeed.com/jobs?q=software+engineer&l=New+York%2C+NY"],
  "limit": 10,
  "execution_mode": "sync"
}
```

### Check account balance

```json
{}
```

### Delete async request

```json
{
  "request_id": "YOUR_REQUEST_ID"
}
```

## Known Limitations

- `businesses_search` works reliably with structured `filters`, but free-form `query` values on `/businesses` may fail with `Could not parse query into a valid request format.` This behavior was reproduced against the live API, not only inside the MCP layer.
- When Outscraper OpenAPI examples and live API behavior differ, live endpoint behavior should be treated as the source of truth.
- `businesses_search` is intentionally exposed here as a synchronous MCP tool because the current `/businesses` OpenAPI shape is request-body-based and did not prove to be a stable async-style workflow during live validation.
- `execution_mode="auto"` is heuristic-driven. It is designed to choose a practical default, but callers that need deterministic behavior should explicitly use `sync` or `async`.
- HTTP hosted mode requires correct auth headers when `CLOUD_SERVICE=true`; stdio mode still expects `OUTSCRAPER_API_KEY` in the process environment.
- `chain_info` is implemented from the documented `ai_chain_info` enrichment on `google-maps-search`, because Outscraper currently does not describe a standalone `chain info` endpoint.
- `builtwith` is not currently exposed as a tool because Outscraper currently does not document a dedicated BuiltWith endpoint.

## Tool Selection Notes

- Use `businesses_search` for structured business discovery with filters and cursor pagination.
- Use `businesses_get` once you already have a concrete business id.
- Use `google_maps_search` for Google Maps-style place discovery from human search queries.
- Use `google_maps_reviews` when the user specifically needs review data rather than place discovery.
- Use `company_insights` for firmographics and company profile enrichment.
- Use `emails_and_contacts` for contact discovery from known domains.
- Use `requests_get`, `requests_list`, and `requests_delete` only for async lifecycle management.
- Use `balance_get` for account and billing checks, not business data retrieval.

## Notes

- The server supports stdio, stateless Streamable HTTP, and stateful local HTTP/SSE mode.
- `CLOUD_SERVICE=true` enables header-based API key resolution for HTTP requests.
- For npm publication, package contents are intentionally limited to runtime artifacts and docs.
- Client-specific config snippets in this README are meant as practical templates; the exact settings UI and config key names may vary slightly between MCP clients and versions.
