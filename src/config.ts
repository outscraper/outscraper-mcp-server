import { createRequire } from "node:module";

const _require = createRequire(import.meta.url);
const { version: _pkgVersion } = _require("../package.json") as { version: string };

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
    process.env.HTTP_STATEFUL_SERVER === "true" ||
    process.env.SSE_LOCAL === "true"; // SSE_LOCAL is a deprecated alias for HTTP_STATEFUL_SERVER
  const streamableHttpEnabled = process.env.HTTP_STREAMABLE_SERVER === "true";
  const transport =
    streamableHttpEnabled || statefulHttpEnabled
      ? "http"
      : "stdio";

  const rawPort = Number(process.env.PORT ?? 3000);
  const httpPort = Number.isNaN(rawPort) ? 3000 : rawPort;

  return {
    apiKey,
    apiBaseUrl:
      process.env.OUTSCRAPER_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
    serverName: "outscraper-mcp",
    serverVersion: _pkgVersion,
    cloudService,
    transport,
    httpMode: statefulHttpEnabled ? "stateful" : "stateless",
    httpHost: process.env.HOST?.trim() || "localhost",
    httpPort,
  };
}
