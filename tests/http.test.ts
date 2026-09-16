import assert from "node:assert/strict";
import { test } from "node:test";
import type { AddressInfo } from "node:net";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { startHttpServer } from "../src/transports/http.js";

test("terminating a stateful session preserves other and new sessions", { timeout: 15_000 }, async (t) => {
  const httpServer = await startHttpServer({
    apiBaseUrl: "https://example.invalid",
    serverName: "http-regression",
    serverVersion: "test",
    cloudService: false,
    transport: "http",
    httpMode: "stateful",
    httpHost: "127.0.0.1",
    httpPort: 0,
  });
  const { port } = httpServer.address() as AddressInfo;
  const url = new URL(`http://127.0.0.1:${port}/mcp`);
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
      httpServer.closeAllConnections();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
  });

  async function connect() {
    const client = new Client({ name: "session-test", version: "1" });
    const transport = new StreamableHTTPClientTransport(url);
    connections.push({ client, transport });
    await client.connect(transport);
    assert.ok(transport.sessionId);
    return { client, transport };
  }

  async function assertAvailable(client: Client) {
    assert.equal((await client.listTools()).tools.length, 28);
    const result = await client.callTool({ name: "ping", arguments: {} });
    assert.notEqual(result.isError, true);
    assert.equal((result.structuredContent?.data as { ok: boolean }).ok, true);
  }

  const first = await connect();
  const second = await connect();
  await assertAvailable(first.client);
  await assertAvailable(second.client);
  const closedSessionId = first.transport.sessionId!;
  await first.transport.terminateSession();

  const staleSession = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Mcp-Session-Id": closedSessionId,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  assert.equal(staleSession.status, 400);
  assert.match((await staleSession.json()).error.message, /No valid session ID/);

  await assertAvailable(second.client);
  const third = await connect();
  assert.notEqual(third.transport.sessionId, closedSessionId);
  await assertAvailable(third.client);
});
