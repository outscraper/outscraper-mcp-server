import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Express, Request, Response } from "express";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { AppConfig } from "../config.js";
import { extractApiKeyFromHeaders, extractApiKeyFromUrl } from "../outscraper/auth.js";
import { createServer } from "../server.js";

const MCP_PATHS = ["/mcp", "/v1/mcp/:apiKey"];

const MAX_STATEFUL_SESSIONS = 100;

export async function startHttpServer(config: AppConfig): Promise<HttpServer> {
  const app = createApp(config);

  return new Promise((resolve, reject) => {
    const httpServer = app.listen(config.httpPort, config.httpHost, () => {
      console.error(
        `${config.serverName} running on ${config.httpMode} Streamable HTTP at http://${config.httpHost}:${config.httpPort}/mcp`,
      );
      resolve(httpServer);
    });
    httpServer.on("error", reject);
  });
}

function createApp(config: AppConfig): Express {
  const app = createMcpExpressApp({ host: config.httpHost });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("ok");
  });

  app.all(MCP_PATHS, (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");
    next();
  });

  if (config.httpMode === "stateful") {
    configureStatefulRoutes(app, config);
  } else {
    configureStatelessRoutes(app, config);
  }

  return app;
}

function configureStatelessRoutes(app: Express, config: AppConfig): void {
  app.post(MCP_PATHS, async (req: Request, res: Response) => {
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
    } catch {
      console.error("Error handling MCP HTTP request");

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

  app.get(MCP_PATHS, (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    });
  });

  app.delete(MCP_PATHS, (_req: Request, res: Response) => {
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

  app.post(MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const sessionId = getSessionId(req);

    try {
      if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId)!;
        if (!authorizeSession(session, req, res)) {
          return;
        }
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && isInitializeRequest(req.body)) {
        if (sessions.size >= MAX_STATEFUL_SESSIONS) {
          sendJsonRpcError(res, 503, "Service unavailable: too many active sessions");
          return;
        }

        const server = createServer(config);
        const apiKeyFingerprint = config.cloudService ? fingerprintApiKey(req) : undefined;
        let transport!: StreamableHTTPServerTransport;

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            sessions.set(newSessionId, { server, transport, apiKeyFingerprint });
          },
        });

        transport.onclose = () => {
          const activeSessionId = transport.sessionId;
          if (activeSessionId) {
            sessions.delete(activeSessionId);
          }

          // The SDK finishes server cleanup after this callback. Calling
          // server.close() here would close this transport again recursively.
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      }

      sendJsonRpcError(res, 400, "Bad Request: No valid session ID provided");
    } catch {
      console.error("Error handling stateful MCP HTTP request");

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error", -32603);
      }
    }
  });

  app.get(MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const sessionId = getSessionId(req);

    if (!sessionId || !sessions.has(sessionId)) {
      sendJsonRpcError(res, 400, "Invalid or missing session ID");
      return;
    }

    const session = sessions.get(sessionId)!;
    if (!authorizeSession(session, req, res)) {
      return;
    }

    try {
      await session.transport.handleRequest(req, res);
    } catch {
      console.error("Error handling stateful MCP GET request");

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error", -32603);
      }
    }
  });

  app.delete(MCP_PATHS, async (req: Request, res: Response) => {
    if (!authenticateRequest(config, req, res)) {
      return;
    }

    const sessionId = getSessionId(req);

    if (!sessionId || !sessions.has(sessionId)) {
      sendJsonRpcError(res, 400, "Invalid or missing session ID");
      return;
    }

    const session = sessions.get(sessionId)!;
    if (!authorizeSession(session, req, res)) {
      return;
    }

    try {
      await session.transport.handleRequest(req, res);
    } catch {
      console.error("Error handling stateful MCP DELETE request");

      if (!res.headersSent) {
        sendJsonRpcError(res, 500, "Internal server error", -32603);
      }
    }
  });
}

interface StatefulSession {
  server: Server;
  transport: StreamableHTTPServerTransport;
  apiKeyFingerprint?: Buffer;
}

function fingerprintApiKey(req: Request): Buffer {
  const apiKey = extractApiKeyFromHeaders(req.headers) ?? extractApiKeyFromExpressPath(req);
  return createHash("sha256").update(apiKey ?? "").digest();
}

function authorizeSession(session: StatefulSession, req: Request, res: Response): boolean {
  if (session.apiKeyFingerprint && !timingSafeEqual(session.apiKeyFingerprint, fingerprintApiKey(req))) {
    sendJsonRpcError(res, 403, "Forbidden: session belongs to another API key");
    return false;
  }
  return true;
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
