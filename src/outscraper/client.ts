import {
  ErrorCode,
  JSONRPCErrorSchema,
  JSONRPCResponseSchema,
  McpError,
  type Result,
} from "@modelcontextprotocol/sdk/types.js";

const REQUEST_TIMEOUT_MS = 120_000;
const PROTOCOL_VERSION = "2025-03-26";

export class OutscraperMcpClient {
  private readonly url: URL;

  constructor(private readonly apiKey: string, baseUrl: string) {
    try {
      const url = new URL(baseUrl);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error();
      }
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/mcp/${encodeURIComponent(apiKey)}`;
      this.url = url;
    } catch {
      throw new McpError(ErrorCode.InternalError, "Invalid OUTSCRAPER_API_BASE_URL; use the API base URL without credentials, query parameters or a fragment.");
    }
  }

  async request<T extends Result>(
    method: "tools/list" | "tools/call",
    params?: object,
    signal?: AbortSignal,
  ): Promise<T> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    const timeout = setTimeout(abort, REQUEST_TIMEOUT_MS);

    try {
      // Rashida is stateless. Never retry a request that may have started paid work.
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
          "MCP-Protocol-Version": PROTOCOL_VERSION,
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, ...(params ? { params } : {}) }),
        redirect: "error",
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch((error: unknown) => {
        if (error instanceof SyntaxError) return undefined;
        throw error;
      });
      const rpcError = JSONRPCErrorSchema.safeParse(payload);
      if (rpcError.success && rpcError.data.id === 1) {
        const error = this.redactError(rpcError.data.error);
        throw new McpError(error.code, error.message, error.data);
      }
      if (!response.ok) {
        const hint = response.status === 404 ? " Deploy the Rashida API-key MCP endpoint before using this bridge." : "";
        throw new McpError(ErrorCode.InternalError, `Upstream MCP returned HTTP ${response.status}.${hint}`);
      }
      const result = JSONRPCResponseSchema.safeParse(payload);
      if (!result.success || result.data.id !== 1 || !("result" in result.data)) {
        throw new McpError(ErrorCode.InternalError, "Upstream MCP returned an invalid JSON-RPC response.");
      }
      return result.data.result as T;
    } catch (error) {
      if (error instanceof McpError) throw error;
      // Fetch errors can include the credential-bearing URL. Do not expose them.
      const reason = controller.signal.aborted ? "was cancelled or timed out" : "failed";
      throw new McpError(ErrorCode.InternalError, `Upstream MCP request ${reason}. For a submitted service, check request history before retrying; stopping this wait does not cancel the service.`);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }

  private redactError<T extends object>(error: T): T {
    // Preserve validation details, but never echo the API key in protocol errors.
    const text = JSON.stringify(error)
      .replaceAll(JSON.stringify(this.apiKey).slice(1, -1), "[redacted]")
      .replaceAll(encodeURIComponent(this.apiKey), "[redacted]");
    return JSON.parse(text) as T;
  }
}
