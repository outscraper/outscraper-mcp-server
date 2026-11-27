import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import type { AppConfig } from "./config.js";
import { OutscraperMcpClient } from "./outscraper/client.js";
import { extractApiKeyFromRequest } from "./outscraper/auth.js";

export function createServer(config: AppConfig): Server {
  // Forward the existing JSON schemas instead of rebuilding a second catalog.
  const server = new Server({
    name: config.serverName,
    version: config.serverVersion,
  }, { capabilities: { tools: { listChanged: false } } });

  function getClient(extra: unknown): OutscraperMcpClient {
    const apiKey = config.cloudService ? extractApiKeyFromRequest(extra) : config.apiKey;
    if (!apiKey) {
      throw new Error(config.cloudService
        ? "Outscraper API key is required in a supported header or /v1/mcp/<api-key>."
        : "Missing OUTSCRAPER_API_KEY.");
    }
    return new OutscraperMcpClient(apiKey, config.apiBaseUrl);
  }

  server.setRequestHandler(ListToolsRequestSchema, (request, extra) =>
    getClient(extra).request<ListToolsResult>("tools/list", request.params, extra.signal));
  server.setRequestHandler(CallToolRequestSchema, (request, extra) =>
    getClient(extra).request<CallToolResult>("tools/call", request.params, extra.signal));

  return server;
}
