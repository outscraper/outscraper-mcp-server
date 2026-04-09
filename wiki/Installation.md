# Installation

## npm Usage

The recommended way to run the server is from npm:

```bash
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

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
