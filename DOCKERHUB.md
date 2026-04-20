# Outscraper MCP

Official Docker image for the Outscraper MCP server.

Use this image to expose Outscraper as a hosted MCP endpoint for:

- business discovery and lead generation
- Google Maps intelligence, including places, reviews, and photos
- company insights and contact enrichment
- AI-assisted structured extraction from a single page with `ai_scraper`
- async job submission and polling with `requests_get`

## Why Use This Image

This image is useful when you want to:

- run Outscraper as a remote MCP server behind your own domain
- connect hosted MCP clients over HTTP
- use URL-based auth for connector-style workflows
- deploy with Docker or Docker Compose instead of `npx`

## Quick Start

Run the server as a hosted MCP endpoint:

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

## Authentication

When `CLOUD_SERVICE=true`, callers can authenticate with:

- `X-OUTSCRAPER-API-KEY`
- `X-API-KEY`
- `Authorization: Bearer <api-key>`
- `/v1/mcp/<api-key>` path auth

Header auth is preferred for server-to-server integrations.
URL auth is convenient for connector-style setups that cannot attach custom headers.

## Docker Compose

This repository includes a ready-to-run `docker-compose.yml`:

```bash
docker compose up --build -d
```

Default behavior:

- publishes port `3000`
- enables hosted mode with `CLOUD_SERVICE=true`
- enables stateless Streamable HTTP
- listens on `0.0.0.0`

## Common Environment Variables

- `CLOUD_SERVICE=true`
- `HTTP_STREAMABLE_SERVER=true`
- `HTTP_STATEFUL_SERVER=false`
- `SSE_LOCAL=false`
- `HOST=0.0.0.0`
- `PORT=3000`
- `OUTSCRAPER_API_BASE_URL=https://api.outscraper.com`

## ChatGPT Connector Style URL

If you are connecting from a hosted MCP connector that cannot set custom headers, use:

```text
https://your-domain.example/v1/mcp/YOUR_API_KEY
```

## Notes

- This image is intended for hosted MCP usage over HTTP.
- Local IDE and desktop MCP clients usually work better with stdio mode via `npx`.
- URL-auth is less private than header auth because URLs are more likely to appear in logs.
