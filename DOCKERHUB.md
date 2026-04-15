# Outscraper MCP Docker Image

Official Docker image for the Outscraper MCP server.

This image exposes Outscraper tools over MCP for:

- business discovery and enrichment
- Google Maps places, reviews, and photos
- company insights and contact discovery
- AI-assisted single-page structured extraction with `ai_scraper`
- async job submission and polling through `requests_get`

## Quick Start

Run the container:

```bash
docker run --rm -p 3000:3000 \
  -e CLOUD_SERVICE=true \
  -e HTTP_STREAMABLE_SERVER=true \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  outscraper/outscraper-mcp:latest
```

## Endpoints

- MCP endpoint: `http://localhost:3000/mcp`
- URL-auth MCP endpoint: `http://localhost:3000/v1/mcp/YOUR_API_KEY`
- Health endpoint: `http://localhost:3000/health`

## Auth Modes

When `CLOUD_SERVICE=true`, callers can authenticate with:

- `X-OUTSCRAPER-API-KEY`
- `X-API-KEY`
- `Authorization: Bearer <api-key>`
- `/v1/mcp/<api-key>` path auth

For server-to-server use, header auth is preferred.
For connector-style setups that cannot attach custom headers, URL auth is available.

## Docker Compose

This repository also includes a `docker-compose.yml` for hosted deployments:

```bash
docker compose up --build -d
```

## Environment Variables

Common variables:

- `CLOUD_SERVICE=true`
- `HTTP_STREAMABLE_SERVER=true`
- `HTTP_STATEFUL_SERVER=false`
- `SSE_LOCAL=false`
- `HOST=0.0.0.0`
- `PORT=3000`
- `OUTSCRAPER_API_BASE_URL=https://api.outscraper.cloud`

## Notes

- This image is intended for hosted MCP usage over HTTP.
- Local desktop MCP clients usually work better with stdio mode from `npx`.
- URL-auth is convenient, but less private than header auth because URLs are more likely to appear in logs.
