import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerModules } from "./core/service.js";
import type { AppConfig } from "./config.js";
import { OutscraperClient } from "./outscraper/client.js";
import { extractApiKeyFromRequest } from "./outscraper/auth.js";
import { BusinessesModule } from "./services/businesses/service.js";
import { CompanyInsightsModule } from "./services/company-insights/service.js";
import { EmailsAndContactsModule } from "./services/emails-and-contacts/service.js";
import { GoogleMapsModule } from "./services/google-maps/service.js";
import { ProfileModule } from "./services/profile/service.js";
import { RequestsModule } from "./services/requests/service.js";

export function createServer(config: AppConfig): McpServer {
  const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion,
  });

  registerModules(
    server,
    {
      getClient: (extra?: unknown) => {
        const resolvedApiKey = config.cloudService
          ? extractApiKeyFromRequest(extra)
          : config.apiKey;

        if (!resolvedApiKey) {
          throw new Error(
            config.cloudService
              ? "Outscraper API key is required in Authorization or X-API-KEY headers."
              : "Missing OUTSCRAPER_API_KEY.",
          );
        }

        return new OutscraperClient(resolvedApiKey, config.apiBaseUrl);
      },
    },
    [
      new BusinessesModule(),
      new GoogleMapsModule(),
      new CompanyInsightsModule(),
      new EmailsAndContactsModule(),
      new ProfileModule(),
      new RequestsModule(),
    ],
  );

  return server;
}
