#!/usr/bin/env node

import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getConfig } from "./config.js";
import { createServer } from "./server.js";
import { startHttpServer } from "./transports/http.js";

dotenv.config({ debug: false, quiet: true });

async function main(): Promise<void> {
  const config = getConfig();

  if (config.transport === "http") {
    await startHttpServer(config);
    return;
  }

  const server = createServer(config);
  await server.connect(new StdioServerTransport());
  console.error(`${config.serverName} running on stdio`);
}

main().catch(() => {
  // Startup exceptions may contain a configured URL or credentials.
  console.error("Unable to start Outscraper MCP. Check the transport and bind settings.");
  process.exit(1);
});
