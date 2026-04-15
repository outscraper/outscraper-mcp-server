export function extractApiKeyFromRequest(extra?: unknown): string | undefined {
  const requestInfo = getRequestInfo(extra);

  return (
    extractApiKeyFromHeaders(requestInfo.headers)
    ?? extractApiKeyFromUrl(requestInfo.url)
  );
}

export function extractApiKeyFromHeaders(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
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

  return undefined;
}

export function extractApiKeyFromUrl(url?: URL): string | undefined {
  if (!url) {
    return undefined;
  }

  const match = /^\/v1\/mcp\/([^/]+)\/?$/.exec(url.pathname);
  if (!match) {
    return undefined;
  }

  try {
    const apiKey = decodeURIComponent(match[1]);
    return apiKey.trim().length > 0 ? apiKey.trim() : undefined;
  } catch {
    return undefined;
  }
}

interface RequestInfoLike {
  headers: Record<string, string | string[] | undefined>;
  url?: URL;
}

function getRequestInfo(extra?: unknown): RequestInfoLike {
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
    const requestInfo = extra.requestInfo as {
      headers: Record<string, string | string[] | undefined>;
      url?: URL;
    };

    return {
      headers: requestInfo.headers,
      url: requestInfo.url instanceof URL ? requestInfo.url : undefined,
    };
  }

  return { headers: {} };
}
