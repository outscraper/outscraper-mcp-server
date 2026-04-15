export interface AppConfig {
  apiKey?: string;
  apiBaseUrl: string;
  serverName: string;
  serverVersion: string;
  cloudService: boolean;
  transport: "stdio" | "http";
  httpMode: "stateless" | "stateful";
  httpHost: string;
  httpPort: number;
}

const DEFAULT_API_BASE_URL = "https://api.outscraper.com";

export function getConfig(): AppConfig {
  const apiKey = process.env.OUTSCRAPER_API_KEY?.trim();
  const cloudService = process.env.CLOUD_SERVICE === "true";
  const statefulHttpEnabled =
    process.env.SSE_LOCAL === "true" ||
    process.env.HTTP_STATEFUL_SERVER === "true";
  const streamableHttpEnabled = process.env.HTTP_STREAMABLE_SERVER === "true";
  const transport =
    streamableHttpEnabled || statefulHttpEnabled
      ? "http"
      : "stdio";

  if (!apiKey && (!cloudService || transport === "stdio")) {
    throw new Error(
      "Missing OUTSCRAPER_API_KEY. Create an API key in Outscraper and export it before starting the MCP server.",
    );
  }

  return {
    apiKey,
    apiBaseUrl:
      process.env.OUTSCRAPER_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    serverName: "outscraper-mcp",
    serverVersion: "0.2.0",
    cloudService,
    transport,
    httpMode: statefulHttpEnabled ? "stateful" : "stateless",
    httpHost: process.env.HOST?.trim() || "localhost",
    httpPort: Number(process.env.PORT || 3000),
  };
}
