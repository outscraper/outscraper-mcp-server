# Authentication

## Local stdio Mode

Pass the API key through environment variables:

- `OUTSCRAPER_API_KEY`

Example:

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

## Hosted HTTP Mode

Enable:

```bash
set CLOUD_SERVICE=true
```

Then provide the API key via one of these headers:

- `Authorization: Bearer <api-key>`
- `X-API-KEY: <api-key>`
- `X-OUTSCRAPER-API-KEY: <api-key>`

Requests without one of these auth forms are rejected before MCP processing begins.

## Notes

- In local stdio mode, environment-based auth is expected.
- In hosted HTTP mode with `CLOUD_SERVICE=true`, request headers are used.
- Rotate exposed API keys if they have been shared or logged accidentally.
