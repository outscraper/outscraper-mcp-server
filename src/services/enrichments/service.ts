import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const chainInfoInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more Google Maps-style business queries."),
  limit: z.number().int().min(1).max(500).optional().describe("Organizations per query limit."),
  language: z.string().optional().describe("Language code."),
  region: z.string().optional().describe("Region code."),
  execution_mode: executionModeSchema,
  async: z.boolean().optional().describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z.string().url().optional().describe("Optional webhook URL for async completion."),
};

export class EnrichmentsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "chain_info",
      {
        title: "Chain Info",
        description: `
Detect chain membership using the documented ai_chain_info enrichment.

This tool uses the documented enrichment on top of the Google Maps search pipeline.
Use it when you want to know whether a business is part of a chain.
        `.trim(),
        inputSchema: chainInfoInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.limit ?? 0) > 25,
        });

        const response = await context.getClient(extra).googleMapsSearch({
          query: args.query,
          limit: args.limit,
          language: args.language,
          region: args.region,
          enrichment: ["ai_chain_info"],
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "chain_info",
          operation: "enrich",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
