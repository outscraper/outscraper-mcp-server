# Outscraper MCP Server

Official Node MCP bridge for Outscraper. It exposes the same current tool names, descriptions, schemas and results as the main Outscraper MCP backend through stdio or Streamable HTTP.

Business catalog, pricing, scraping, enrichment and asynchronous request workflows are supplied by the connected backend. Targetron remains limited to catalog, catalog pricing and balance. There is no separate Node service registry to maintain.

## Quick Start

Configure a local MCP process using `npx`, arguments `["-y", "outscraper-mcp"]`, and the private environment variable `OUTSCRAPER_API_KEY`. The default upstream API origin is `https://api.outscraper.com`; its `/mcp/<API_KEY>` endpoint must be deployed first.

For clients supporting remote HTTP directly, use OAuth at `https://api.outscraper.com/mcp` or the API-key URL `https://api.outscraper.com/mcp/<API_KEY>`. Keep actual keys private. See the [setup website](https://mcp.outscraper.com/) for connection guidance.

## Pages

- [Installation](Installation)
- [Tools](Tools)
- [Execution Workflow](Execution-Modes)
- [HTTP Deployment](HTTP-Deployment)
- [Authentication](Authentication)
- [Known Limitations](Known-Limitations)
- [Adding New Services](Adding-New-Services)
- [Release Process](Release-Process)
