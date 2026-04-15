# HTTP Deployment

The server supports:

- Streamable HTTP
- Stateful HTTP/SSE
- header-based hosted auth
- URL-based hosted auth through `/v1/mcp/<api-key>`

## Streamable HTTP

Start:

```bash
set HTTP_STREAMABLE_SERVER=true
set HOST=localhost
set PORT=3000
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

Endpoints:

- `http://localhost:3000/mcp`
- `http://localhost:3000/v1/mcp/YOUR_API_KEY`
- `http://localhost:3000/health`

## Stateful HTTP/SSE

Start:

```bash
set SSE_LOCAL=true
set HOST=localhost
set PORT=3000
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

Or:

```bash
set HTTP_STATEFUL_SERVER=true
set HOST=localhost
set PORT=3000
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

Session endpoints:

- `POST /mcp`
- `GET /mcp`
- `DELETE /mcp`

The server tracks session state via the `mcp-session-id` header.

The same stateful routes are also available behind:

- `http://localhost:3000/v1/mcp/YOUR_API_KEY`

## Health Check

Use:

```text
GET /health
```

Expected result:

```text
ok
```

## When to Use Which Mode

- `stdio`: desktop and IDE MCP clients
- Streamable HTTP: simple hosted HTTP endpoint
- Stateful HTTP/SSE: session-based HTTP usage

## Docker Deployment

If you want a simple hosted deployment, use the included compose file:

```bash
docker compose up --build -d
```

By default it:

- publishes port `3000`
- enables `CLOUD_SERVICE=true`
- enables stateless Streamable HTTP
- listens on `0.0.0.0`
