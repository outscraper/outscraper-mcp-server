export function extractApiKeyFromRequest(extra?: unknown): string | undefined {
  const headers = getHeaders(extra);

  const directHeader = headers["x-outscraper-api-key"]
    ?? headers["x-api-key"]
    ?? headers["authorization"];

  const xApiKey = headers["x-outscraper-api-key"] ?? headers["x-api-key"];
  if (typeof xApiKey === "string" && xApiKey.trim().length > 0) {
    return xApiKey.trim();
  }

  if (Array.isArray(xApiKey) && xApiKey.length > 0) {
    return String(xApiKey[0]).trim();
  }

  const authorization = headers["authorization"];
  if (typeof authorization === "string" && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  if (Array.isArray(authorization) && authorization.length > 0) {
    const first = String(authorization[0]);
    if (first.toLowerCase().startsWith("bearer ")) {
      return first.slice(7).trim();
    }
  }

  if (typeof directHeader === "string" && directHeader.trim().length > 0) {
    return directHeader.trim();
  }

  return undefined;
}

function getHeaders(extra?: unknown): Record<string, string | string[] | undefined> {
  if (
    extra &&
    typeof extra === "object" &&
    "requestInfo" in extra &&
    extra.requestInfo &&
    typeof extra.requestInfo === "object" &&
    "headers" in extra.requestInfo &&
    extra.requestInfo.headers &&
    typeof extra.requestInfo.headers === "object"
  ) {
    return extra.requestInfo.headers as Record<string, string | string[] | undefined>;
  }

  return {};
}
