# Installation

## npm Usage

The recommended way to run the server is from npm:

```bash
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

This form is intended for local stdio MCP clients.

## Connection Modes

- `stdio`: local MCP process for IDE and desktop clients
- stateless Streamable HTTP: hosted MCP endpoint over `POST /mcp`
- stateful HTTP/SSE: session-based remote MCP over `POST/GET/DELETE /mcp`

When `CLOUD_SERVICE=true`, remote HTTP mode also supports:

- `X-OUTSCRAPER-API-KEY`
- `X-API-KEY`
- `Authorization: Bearer <api-key>`
- `/v1/mcp/<api-key>` URL auth

## Claude Desktop

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

## Claude Code

```bash
claude mcp add outscraper -e OUTSCRAPER_API_KEY=YOUR_API_KEY -- npx -y outscraper-mcp
```

## Cursor

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

## VS Code

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

## Windows Note

If a client cannot resolve `npx`, use:

```json
{
  "command": "C:\\Program Files\\nodejs\\npx.cmd",
  "args": ["-y", "outscraper-mcp"]
}
```

## Environment Variables

Required:

- `OUTSCRAPER_API_KEY`

Optional:

- `OUTSCRAPER_API_BASE_URL`
- `HTTP_STREAMABLE_SERVER`
- `SSE_LOCAL`
- `HTTP_STATEFUL_SERVER`
- `HOST`
- `PORT`
- `CLOUD_SERVICE`

## Docker Compose

This repository includes a `docker-compose.yml` for hosted deployment.

Start it with:

```bash
docker compose up --build -d
```

Default exposed endpoints:

- `http://localhost:3000/mcp`
- `http://localhost:3000/v1/mcp/YOUR_API_KEY`
- `http://localhost:3000/health`
