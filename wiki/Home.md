# Outscraper MCP Server

Official MCP server for Outscraper.

It provides MCP tools for:

- business discovery
- Google Maps places, reviews, photos, and chain detection
- company insights
- emails and contacts
- email validation and phone enrichment
- Google Search and Google Images search
- Yellow Pages, Booking, Yelp, Tripadvisor, Trustpilot, and Indeed data
- account balance checks
- async request lifecycle management

## Quick Start

Run from npm:

```bash
set OUTSCRAPER_API_KEY=YOUR_API_KEY
npx -y outscraper-mcp
```

Typical MCP client configuration:

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

## Main Capabilities

- `stdio` transport for MCP desktop and editor clients
- Streamable HTTP mode
- Stateful HTTP/SSE mode
- `execution_mode` support for sync, async, and auto
- normalized `structuredContent` tool responses
- hosted header-based auth mode

## Pages

- [Installation](Installation)
- [Tools](Tools)
- [Execution Modes](Execution-Modes)
- [HTTP Deployment](HTTP-Deployment)
- [Authentication](Authentication)
- [Known Limitations](Known-Limitations)
- [Adding New Services](Adding-New-Services)
- [Release Process](Release-Process)
