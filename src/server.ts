import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerModules } from "./core/service.js";
import type { AppConfig } from "./config.js";
import { OutscraperClient } from "./outscraper/client.js";
import { extractApiKeyFromRequest } from "./outscraper/auth.js";
import { AiScraperModule } from "./services/ai-scraper/service.js";
import { BusinessesModule } from "./services/businesses/service.js";
import { CompanyInsightsModule } from "./services/company-insights/service.js";
import { EmailsAndContactsModule } from "./services/emails-and-contacts/service.js";
import { EnrichmentsModule } from "./services/enrichments/service.js";
import { GoogleMapsModule } from "./services/google-maps/service.js";
import { MediaModule } from "./services/media/service.js";
import { ProfileModule } from "./services/profile/service.js";
import { RequestsModule } from "./services/requests/service.js";
import { ReviewsModule } from "./services/reviews/service.js";
import { SearchModule } from "./services/search/service.js";
import { ValidatorsModule } from "./services/validators/service.js";

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
      new AiScraperModule(),
      new BusinessesModule(),
      new GoogleMapsModule(),
      new MediaModule(),
      new SearchModule(),
      new ReviewsModule(),
      new ValidatorsModule(),
      new EnrichmentsModule(),
      new CompanyInsightsModule(),
      new EmailsAndContactsModule(),
      new ProfileModule(),
      new RequestsModule(),
    ],
  );

  return server;
}
