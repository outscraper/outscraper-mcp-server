import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "../src/server.js";
import type { AppConfig } from "../src/config.js";
import { OutscraperMcpClient } from "../src/outscraper/client.js";

const config: AppConfig = {
  apiKey: "disposable/key+value=",
  apiBaseUrl: "https://example.invalid/",
  serverName: "bridge-test",
  serverVersion: "test",
  cloudService: false,
  transport: "stdio",
  httpMode: "stateless",
  httpHost: "127.0.0.1",
  httpPort: 0,
};

async function connected(options = config) {
  const server = createServer(options);
  const client = new Client({ name: "bridge-test", version: "1" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

function response(result: object) {
  return Response.json({ jsonrpc: "2.0", id: 1, result });
}

test("advertises the upstream catalog exactly and sees changes without a local registry", async (t) => {
  const first = {
    tools: [{
      name: "search_businesses",
      description: "Free masked catalog preview. Inspect pricing before full retrieval.",
      inputSchema: {
        type: "object", required: ["filters"], additionalProperties: false,
        properties: { filters: { type: "object", properties: { geo_filters: { type: "array", items: { oneOf: [{ type: "object" }, { type: "string" }] } } } } },
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
      _meta: { "openai/toolInvocation/invoking": "Searching" },
    }],
    nextCursor: "catalog-next",
  };
  const second = { tools: [{ name: "new_service", description: "Added upstream", inputSchema: { type: "object" } }] };
  const calls: any[] = [];
  t.mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), ...init, body: JSON.parse(init.body as string) });
    return response(calls.length === 1 ? first : second);
  });
  const client = await connected();
  t.after(() => client.close());
  assert.deepEqual(await client.listTools({ cursor: "previous" }), first);
  assert.deepEqual(await client.listTools(), second);
  assert.equal(calls[0].url, "https://example.invalid/mcp/disposable%2Fkey%2Bvalue%3D");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].redirect, "error");
  assert.equal(calls[0].headers["MCP-Protocol-Version"], "2025-03-26");
  assert.deepEqual(calls[0].body, { jsonrpc: "2.0", id: 1, method: "tools/list", params: { cursor: "previous" } });
});

test("passes arguments, asynchronous results and result fragments through unchanged", async (t) => {
  const results = [
    { content: [{ type: "text", text: JSON.stringify({ id: "request-uuid", status: "Pending" }) }] },
    { content: [{ type: "text", text: JSON.stringify({ fragment: { encoding: "json_text", text: '[{"name":' }, next_cursor: "next" }) }], _meta: { page: 1 } },
    { content: [{ type: "text", text: "Service unavailable on this endpoint." }], isError: true },
  ];
  const params = [
    { name: "run_service", arguments: { service_id: "google_maps_search", schema_version: "upstream-version", parameters: { query: ["bars NY USA"], limit: 200 } } },
    { name: "requests_get", arguments: { id: "request-uuid", cursor: "prior", limit: 50 } },
    { name: "google_maps_search", arguments: { query: ["test"] } },
  ];
  const sent: any[] = [];
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    const request = JSON.parse(init.body as string);
    sent.push(request.params);
    assert.equal(request.method, "tools/call");
    return response(results[sent.length - 1]);
  });
  const client = await connected();
  t.after(() => client.close());
  for (let i = 0; i < params.length; i++) {
    assert.deepEqual(await client.callTool(params[i]), results[i]);
  }
  assert.deepEqual(sent, params);
});

test("preserves JSON-RPC errors separately from tool errors", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    jsonrpc: "2.0", id: 1, error: { code: -32602, message: "Invalid tool arguments", data: { field: "filters" } },
  }, { status: 400 }));
  const client = await connected();
  t.after(() => client.close());
  await assert.rejects(client.callTool({ name: "search_businesses", arguments: {} }), (error: any) => {
    assert.ok(error instanceof McpError);
    assert.equal(error.code, -32602);
    assert.match(error.message, /Invalid tool arguments/);
    assert.deepEqual(error.data, { field: "filters" });
    return true;
  });
});

test("redacts credentials in upstream error details", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    jsonrpc: "2.0", id: 1, error: {
      code: -32603, message: `Failure at /mcp/${config.apiKey}`,
      data: { url: `/mcp/${encodeURIComponent(config.apiKey!)}` },
    },
  }));
  const client = await connected();
  t.after(() => client.close());
  await assert.rejects(client.listTools(), (error: any) => {
    assert.match(error.message, /\[redacted\]/);
    assert.deepEqual(error.data, { url: "/mcp/[redacted]" });
    assert.ok(!error.message.includes(config.apiKey!));
    return true;
  });
});

for (const scenario of ["404", "redirect", "invalid-json", "invalid-envelope", "network"] as const) {
  test(`does not retry or leak credentials on ${scenario}`, async (t) => {
    let calls = 0;
    t.mock.method(globalThis, "fetch", async () => {
      calls++;
      if (scenario === "network") throw new Error(`fetch failed for /mcp/${config.apiKey}`);
      if (scenario === "404") return new Response(`not found: ${config.apiKey}`, { status: 404 });
      if (scenario === "redirect") return new Response(null, { status: 302, headers: { Location: `https://other.invalid/${config.apiKey}` } });
      if (scenario === "invalid-json") return new Response(config.apiKey);
      return Response.json({ jsonrpc: "2.0", id: 999, result: { content: [] } });
    });
    const client = await connected();
    t.after(() => client.close());
    await assert.rejects(client.callTool({ name: "run_service", arguments: {} }), (error: Error) => {
      assert.ok(!error.message.includes(config.apiKey!));
      assert.ok(!error.message.includes(encodeURIComponent(config.apiKey!)));
      return true;
    });
    assert.equal(calls, 1);
  });
}

test("missing credentials fail without sending a request or using a different account", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return response({ tools: [] }); });
  const client = await connected({ ...config, apiKey: undefined });
  t.after(() => client.close());
  await assert.rejects(client.listTools(), /OUTSCRAPER_API_KEY/);
  assert.equal(calls, 0);
});

test("cancelling a call aborts the upstream wait without resubmission", async (t) => {
  let signal: AbortSignal | undefined;
  let calls = 0;
  let started!: () => void;
  const pending = new Promise<void>((resolve) => { started = resolve; });
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    calls++;
    signal = init.signal!;
    started();
    return new Promise((_resolve, reject) => {
      signal!.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    });
  });
  const client = await connected();
  t.after(() => client.close());
  const controller = new AbortController();
  const result = client.callTool({ name: "run_service", arguments: {} }, undefined, { signal: controller.signal });
  const rejected = assert.rejects(result);
  await pending;
  controller.abort();
  await rejected;
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(signal?.aborted, true);
  assert.equal(calls, 1);
});

test("upstream timeouts stop waiting without retrying a potentially paid call", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    calls++;
    return new Promise((_resolve, reject) => {
      init.signal!.addEventListener("abort", () => reject(new Error("timed out")), { once: true });
    });
  });
  const upstream = new OutscraperMcpClient(config.apiKey!, config.apiBaseUrl);
  const result = upstream.request("tools/call", { name: "run_service", arguments: {} });
  const rejected = assert.rejects(result, /timed out.*check request history/i);
  t.mock.timers.tick(120_000);
  await rejected;
  assert.equal(calls, 1);
});

test("a timeout while reading the response body retains the ambiguous-submission guidance", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (_url: string, init: RequestInit) => {
    calls++;
    return new Response(new ReadableStream({
      start(controller) {
        init.signal!.addEventListener("abort", () => controller.error(new DOMException("aborted", "AbortError")), { once: true });
      },
    }));
  });
  const upstream = new OutscraperMcpClient(config.apiKey!, config.apiBaseUrl);
  const result = upstream.request("tools/call", { name: "run_service", arguments: {} });
  const rejected = assert.rejects(result, /timed out.*check request history/i);
  await new Promise((resolve) => setImmediate(resolve));
  t.mock.timers.tick(120_000);
  await rejected;
  assert.equal(calls, 1);
});
