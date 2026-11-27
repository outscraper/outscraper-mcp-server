import assert from "node:assert/strict";
import { createServer as createHttpServer, type Server as HttpServer } from "node:http";
import { test, type TestContext } from "node:test";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { AppConfig } from "../src/config.js";
import { startHttpServer } from "../src/transports/http.js";

const BALANCE_TOOL = {
  name: "balance_get",
  description: "Return account billing data and the billing dashboard URL.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: true },
};
const REQUEST_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

async function startFixture(t: TestContext, options: Partial<AppConfig> = {}) {
  const requests: { apiKey: string; method: string }[] = [];
  const upstream = createHttpServer(async (req, res) => {
    const match = /^\/mcp\/([^/]+)$/.exec(req.url ?? "");
    if (!match || req.method !== "POST") {
      res.writeHead(404).end();
      return;
    }

    const apiKey = decodeURIComponent(match[1]);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const message = JSON.parse(Buffer.concat(chunks).toString());
    requests.push({ apiKey, method: message.method });
    let result: unknown;
    if (message.method === "initialize") {
      result = {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "rashida-fixture", version: "1" },
      };
    } else if (message.method === "tools/list") {
      result = { tools: [BALANCE_TOOL] };
    } else if (message.method === "tools/call" && message.params.name === "balance_get") {
      result = { content: [{ type: "text", text: JSON.stringify({ balance: 10, account: apiKey }) }] };
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }));
  });
  await new Promise<void>((resolve, reject) => {
    upstream.once("error", reject);
    upstream.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => closeServer(upstream));

  const { port: upstreamPort } = upstream.address() as AddressInfo;
  const server = await startHttpServer({
    apiBaseUrl: `http://127.0.0.1:${upstreamPort}`,
    serverName: "http-regression",
    serverVersion: "test",
    cloudService: true,
    transport: "http",
    httpMode: "stateless",
    httpHost: "127.0.0.1",
    httpPort: 0,
    ...options,
  });
  const { port } = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;
  const connections: { client: Client; transport: StreamableHTTPClientTransport }[] = [];
  t.after(async () => {
    try {
      for (const { client, transport } of connections) {
        try {
          if (transport.sessionId) await transport.terminateSession();
        } finally {
          await client.close();
        }
      }
    } finally {
      await closeServer(server);
    }
  });

  async function connect(path = "/mcp", headers: Record<string, string> = { "X-API-KEY": "account-a" }) {
    const client = new Client({ name: "http-test", version: "1" });
    const transport = new StreamableHTTPClientTransport(new URL(path, baseUrl), { requestInit: { headers } });
    connections.push({ client, transport });
    await client.connect(transport);
    return { client, transport };
  }

  return { baseUrl, connect, requests };
}

async function closeServer(server: HttpServer) {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function assertAvailable(client: Client, account = "account-a") {
  assert.deepEqual((await client.listTools()).tools, [BALANCE_TOOL]);
  assert.deepEqual(await client.callTool({ name: "balance_get", arguments: {} }), {
    content: [{ type: "text", text: JSON.stringify({ balance: 10, account }) }],
  });
}

test("stateless HTTP preserves legacy API key routes and header priority", { timeout: 15_000 }, async (t) => {
  const fixture = await startFixture(t);
  const cases: { path: string; headers: Record<string, string>; account: string }[] = [
    { path: "/mcp", headers: { "X-API-KEY": "x-api-key" }, account: "x-api-key" },
    { path: "/mcp", headers: { Authorization: "Bearer bearer-key" }, account: "bearer-key" },
    { path: "/v1/mcp/path-key", headers: {}, account: "path-key" },
    { path: "/v1/mcp/trailing-key/", headers: {}, account: "trailing-key" },
    { path: "/v1/mcp/encoded%2Fkey%2Bvalue%25", headers: {}, account: "encoded/key+value%" },
    { path: "/v1/mcp/path-key", headers: { "X-API-KEY": "header-key", Authorization: "Bearer bearer-key" }, account: "header-key" },
    { path: "/v1/mcp/path-key", headers: { "X-OUTSCRAPER-API-KEY": "preferred-key", "X-API-KEY": "header-key", Authorization: "Bearer bearer-key" }, account: "preferred-key" },
  ];
  for (const { path, headers, account } of cases) {
    const { client, transport } = await fixture.connect(path, headers);
    assert.equal(transport.sessionId, undefined);
    await assertAvailable(client, account);
  }
  assert.deepEqual(fixture.requests.filter(({ method }) => method === "tools/call").map(({ apiKey }) => apiKey),
    cases.map(({ account }) => account));
});

test("concurrent stateless clients keep account credentials isolated", { timeout: 15_000 }, async (t) => {
  const { connect } = await startFixture(t);
  const [first, second] = await Promise.all([
    connect("/v1/mcp/account-a", {}),
    connect("/mcp", { "X-API-KEY": "account-b" }),
  ]);
  await Promise.all(Array.from({ length: 5 }, () => Promise.all([
    assertAvailable(first.client, "account-a"),
    assertAvailable(second.client, "account-b"),
  ])));
});

test("hosted MCP requires a key and protects authentication and method errors from caching and referrers", { timeout: 15_000 }, async (t) => {
  const { baseUrl, requests } = await startFixture(t);
  const missingKey = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: REQUEST_HEADERS,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  assert.equal(missingKey.status, 401);
  assert.equal(missingKey.headers.get("Cache-Control"), "no-store");
  assert.equal(missingKey.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(requests.length, 0);
  await missingKey.arrayBuffer();

  for (const method of ["GET", "DELETE"]) {
    const response = await fetch(`${baseUrl}/v1/mcp/private-key`, { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
    await response.arrayBuffer();
  }
});

test("local HTTP uses only the configured API key", { timeout: 15_000 }, async (t) => {
  const { connect, requests } = await startFixture(t, { cloudService: false, apiKey: "configured-key" });
  const { client } = await connect("/v1/mcp/path-key", { "X-API-KEY": "header-key" });
  await assertAvailable(client, "configured-key");
  assert.ok(requests.every(({ apiKey }) => apiKey === "configured-key"));
});

test("stateful sessions reject another key on POST, GET and DELETE", { timeout: 15_000 }, async (t) => {
  const { baseUrl, connect, requests } = await startFixture(t, { httpMode: "stateful" });
  const first = await connect("/v1/mcp/account-a/", {});
  const second = await connect("/mcp", { "X-API-KEY": "account-b" });
  assert.ok(first.transport.sessionId);
  assert.ok(second.transport.sessionId);

  for (const method of ["POST", "GET", "DELETE"]) {
    const response = await fetch(`${baseUrl}/v1/mcp/account-b`, {
      method,
      headers: { ...REQUEST_HEADERS, "Mcp-Session-Id": first.transport.sessionId! },
      ...(method === "POST" ? { body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) } : {}),
    });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
    assert.match((await response.json()).error.message, /session/i);
  }
  assert.equal(requests.length, 0);
  await Promise.all([assertAvailable(first.client), assertAvailable(second.client, "account-b")]);
});

test("stateful sessions accept the original key through a different supported credential source", { timeout: 15_000 }, async (t) => {
  const { baseUrl, connect } = await startFixture(t, { httpMode: "stateful" });
  const { client, transport } = await connect("/v1/mcp/account-a", {});
  const response = await fetch(`${baseUrl}/v1/mcp/ignored-path-key`, {
    method: "POST",
    headers: { ...REQUEST_HEADERS, "X-API-KEY": "account-a", "Mcp-Session-Id": transport.sessionId! },
    body: JSON.stringify({ jsonrpc: "2.0", id: 5, method: "tools/list" }),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-cache");
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.match(await response.text(), /balance_get/);
  await assertAvailable(client);
});

test("terminating a stateful session preserves other and new sessions", { timeout: 15_000 }, async (t) => {
  const { baseUrl, connect } = await startFixture(t, { httpMode: "stateful", cloudService: false, apiKey: "account-a" });
  const first = await connect();
  const second = await connect();
  await assertAvailable(first.client);
  await assertAvailable(second.client);
  const closedSessionId = first.transport.sessionId!;
  await first.transport.terminateSession();

  const staleSession = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: { ...REQUEST_HEADERS, "Mcp-Session-Id": closedSessionId },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  assert.equal(staleSession.status, 400);
  assert.match((await staleSession.json()).error.message, /No valid session ID/);

  await assertAvailable(second.client);
  const third = await connect();
  assert.notEqual(third.transport.sessionId, closedSessionId);
  await assertAvailable(third.client);
});
