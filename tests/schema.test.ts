import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { z } from "zod";
import { createServer } from "../src/server.js";
import { SchemaMcpServer } from "../src/mcp/server.js";

const originalFetch = globalThis.fetch;

function config() {
  return {
    apiBaseUrl: "https://example.invalid",
    serverName: "test",
    serverVersion: "0.0.0",
    cloudService: false,
    transport: "stdio" as const,
    httpMode: "stateless" as const,
    httpHost: "localhost",
    httpPort: 3000,
  };
}

async function connected(server: McpServer) {
  const client = new Client({ name: "schema-test", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

before(() => { globalThis.fetch = async () => { throw new Error("unexpected network request"); }; });
after(() => { globalThis.fetch = originalFetch; });

describe("JSON Schema 2020-12 tool exposure", () => {
  it("lists all tools with draft 2020-12 schemas and validates calls", async (t) => {
    const client = await connected(createServer(config()));
    t.after(() => client.close());
    const listed = await client.listTools();
    assert.equal(listed.tools.length, 28);
    for (const tool of listed.tools) {
      assert.equal(tool.inputSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
      assert.equal(tool.outputSchema?.$schema, "https://json-schema.org/draft/2020-12/schema");
    }
    const ping = await client.callTool({ name: "ping", arguments: {} });
    assert.equal(ping.isError, undefined);
    assert.ok(ping.structuredContent);
    const invalid = await client.callTool({ name: "businesses_get", arguments: {} });
    assert.equal(invalid.isError, true);
  });

  it("uses prefixItems for tuple schemas and validates input/output", async (t) => {
    const server = new SchemaMcpServer({ name: "tuple", version: "1.0.0" });
    server.registerTool("tuple", { inputSchema: z.object({ values: z.tuple([z.string(), z.number()]) }), outputSchema: z.object({ values: z.tuple([z.boolean()]) }) }, async () => ({ content: [{ type: "text", text: "ok" }], structuredContent: { values: [true] } }));
    const client = await connected(server);
    t.after(() => client.close());
    const tool = (await client.listTools()).tools[0];
    const inputValues = (tool.inputSchema.properties as Record<string, any>).values;
    const outputValues = (tool.outputSchema?.properties as Record<string, any>).values;
    assert.ok(inputValues.prefixItems);
    assert.ok(!Array.isArray(inputValues.items));
    assert.ok(outputValues.prefixItems);
    assert.equal((await client.callTool({ name: "tuple", arguments: { values: ["x", 1] } })).isError, undefined);
    assert.equal((await client.callTool({ name: "tuple", arguments: { values: [1, "x"] } })).isError, true);
    server.registerTool("bad-output", { outputSchema: z.object({ ok: z.boolean() }) }, async () => ({ content: [{ type: "text", text: "bad" }], structuredContent: { ok: "no" } }));
    assert.equal((await client.callTool({ name: "bad-output", arguments: {} })).isError, true);
  });

  it("keeps the advertised catalog in sync with registration lifecycle updates", async (t) => {
    const server = new SchemaMcpServer({ name: "lifecycle", version: "1.0.0" });
    const handle = server.registerTool("lifecycle", {
      description: "before",
      inputSchema: { value: z.string() },
    }, async () => ({ content: [{ type: "text", text: "ok" }] }));
    const client = await connected(server);
    t.after(() => client.close());
    assert.equal((await client.listTools()).tools[0].description, "before");

    handle.disable();
    assert.equal((await client.listTools()).tools.length, 0);
    handle.enable();
    assert.equal((await client.listTools()).tools.length, 1);

    handle.update({ description: "after", paramsSchema: { count: z.number() } });
    const updated = (await client.listTools()).tools[0];
    assert.equal(updated.description, "after");
    assert.ok((updated.inputSchema.properties as Record<string, unknown>).count);
    assert.equal((updated.inputSchema.properties as Record<string, unknown>).value, undefined);

    handle.remove();
    assert.equal((await client.listTools()).tools.length, 0);
  });
});
