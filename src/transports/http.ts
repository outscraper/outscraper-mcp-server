import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Express, Request, Response } from "express";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { AppConfig } from "../config.js";
import { extractApiKeyFromHeaders, extractApiKeyFromUrl } from "../outscraper/auth.js";
import { createServer } from "../server.js";

const STATELESS_MCP_PATHS = ["/mcp", "/v1/mcp/:apiKey"];
const STATEFUL_MCP_PATHS = ["/mcp", "/v1/mcp/:apiKey"];

export async function startHttpServer(config: AppConfig): Promise<HttpServer> {
  const app = createApp(config);

  return new Promise((resolve, reject) => {
    const httpServer = app.listen(config.httpPort, config.httpHost, (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      console.error(
        `${config.serverName} running on ${config.httpMode} Streamable HTTP at http://${config.httpHost}:${config.httpPort}/mcp`,
      );
      resolve(httpServer);
    });
  });
}

function createApp(config: AppConfig): Express {
  const app = createMcpExpressApp({ host: config.httpHost });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("ok");
  });

  if (config.httpMode === "stateful") {
    configureStatefulRoutes(app, config);
  } else {
    configureStatelessRoutes(app, config);
  }

  return app;
}

function configureStatelessRoutes(app: Express, config: AppConfig): void {
  app.post(STATELESS_MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const server = createServer(config);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP HTTP request:", error);

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });

  app.get(STATELESS_MCP_PATHS, (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.delete(STATELESS_MCP_PATHS, (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });
}

function configureStatefulRoutes(app: Express, config: AppConfig): void {
  const sessions = new Map<string, StatefulSession>();

  app.post(STATEFUL_MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const sessionId = getSessionId(req);

    try {
      if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId)!;
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && isInitializeRequest(req.body)) {
        const server = createServer(config);
        let transport!: StreamableHTTPServerTransport;

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            sessions.set(newSessionId, { server, transport });
          },
        });

        transport.onclose = () => {
          const activeSessionId = transport.sessionId;
          if (activeSessionId) {
            sessions.delete(activeSessionId);
          }

          void server.close();
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      }

      sendJsonRpcError(res, 400, "Bad Request: No valid session ID provided");
    } catch (error) {
      console.error("Error handling stateful MCP HTTP request:", error);

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error", -32603);
      }
    }
  });

  app.get(STATEFUL_MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const sessionId = getSessionId(req);

    if (!sessionId || !sessions.has(sessionId)) {
      sendJsonRpcError(res, 400, "Invalid or missing session ID");
      return;
    }

    try {
      await sessions.get(sessionId)!.transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling stateful MCP GET request:", error);

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error", -32603);
      }
    }
  });

  app.delete(STATEFUL_MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const sessionId = getSessionId(req);

    if (!sessionId || !sessions.has(sessionId)) {
      sendJsonRpcError(res, 400, "Invalid or missing session ID");
      return;
    }

    try {
      await sessions.get(sessionId)!.transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling stateful MCP DELETE request:", error);

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error", -32603);
      }
    }
  });
}

interface StatefulSession {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
}

function authenticateRequest(
  config: AppConfig,
  req: Request,
  res: Response,
): boolean {
  if (!config.cloudService) {
    return true;
  }

  const apiKey = extractApiKeyFromHeaders(req.headers) ?? extractApiKeyFromExpressPath(req);
  if (apiKey) {
    return true;
  }

  sendJsonRpcError(
    res,
    401,
    "Unauthorized: Outscraper API key is required in X-OUTSCRAPER-API-KEY, X-API-KEY, Authorization: Bearer <api-key>, or /v1/mcp/<api-key>.",
  );
  return false;
}

function extractApiKeyFromExpressPath(req: Request): string | undefined {
  const apiKeyParam = req.params.apiKey;
  if (typeof apiKeyParam === "string" && apiKeyParam.trim().length > 0) {
    return apiKeyParam.trim();
  }

  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost";
  const resolvedUrl = new URL(req.originalUrl || req.url, `${protocol}://${host}`);

  return extractApiKeyFromUrl(resolvedUrl);
}

function getSessionId(req: Request): string | undefined {
  const header = req.headers["mcp-session-id"];

  if (Array.isArray(header)) {
    return header[0];
  }

  return header;
}

function sendJsonRpcError(
  res: Response,
  httpStatus: number,
  message: string,
  code = -32000,
): void {
  res.status(httpStatus).json({
    jsonrpc: "2.0",
    error: {
      code,
      message,
    },
    id: null,
  });
}
