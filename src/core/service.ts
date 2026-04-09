import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { OutscraperClient } from "../outscraper/client.js";

export interface ModuleContext {
  getClient(extra?: unknown): OutscraperClient;
}

export interface ToolModule {
  register(server: McpServer, context: ModuleContext): void;
}

export function registerModules(
  server: McpServer,
  context: ModuleContext,
  modules: ToolModule[],
): void {
  for (const module of modules) {
    module.register(server, context);
  }
}
