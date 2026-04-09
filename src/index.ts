#!/usr/bin/env node

import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getConfig } from "./config.js";
import { OutscraperApiError } from "./outscraper/client.js";
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

main().catch((error: unknown) => {
  if (error instanceof OutscraperApiError) {
    console.error(
      `Outscraper API error (${error.status}): ${error.message}\n${JSON.stringify(error.payload, null, 2)}`,
    );
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unknown startup error", error);
  }

  process.exit(1);
});
