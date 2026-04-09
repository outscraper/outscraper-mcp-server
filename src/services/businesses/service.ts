import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const businessesSearchInput = {
  filters: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Structured Outscraper /businesses filters JSON."),
  query: z
    .string()
    .optional()
    .describe("Optional natural-language business search query parsed by Outscraper."),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to return for each business."),
  limit: z.number().int().min(1).max(500).optional().describe("Result page size."),
  cursor: z.string().optional().describe("Pagination cursor from the previous response."),
  include_total: z
    .boolean()
    .optional()
    .describe("Whether Outscraper should include total matching count."),
};

const businessesGetInput = {
  business_id: z
    .string()
    .min(1)
    .describe("Outscraper business id returned by /businesses search."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
};

export class BusinessesModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "businesses_search",
      {
        title: "Outscraper Businesses Search",
        description: `
Search Outscraper businesses using structured filters, a natural-language query, or both.

Best for:
- building lead lists from normalized business records
- filtering by country, state, city, type, and other structured business fields
- paginated browsing with cursor when you want repeatable result navigation

Prefer this tool when:
- you already know the geography, categories, or other business filters you want
- you want the normalized /businesses dataset rather than raw Google Maps search behavior
- you need stable field selection and cursor-based pagination

Use this instead of google_maps_search when:
- you want the normalized /businesses API
- you need field selection, filters, or cursor pagination

Note:
- according to the current OpenAPI, /businesses is a synchronous endpoint in this MCP server
- async-style execution controls are intentionally not exposed here
- structured filters are the most reliable input mode
- live Outscraper testing showed that free-form query parsing may fail with "Could not parse query into a valid request format."
        `.trim(),
        inputSchema: businessesSearchInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        if (process.env.DEBUG_BUSINESSES_TOOL === "true") {
          console.error("[businesses_search args]", JSON.stringify(args));
        }

        const response = await context.getClient(extra).businessesSearch({
          filters: args.filters,
          query: args.query,
          fields: args.fields,
          limit: args.limit,
          cursor: args.cursor,
          include_total: args.include_total,
        });

        return createToolResult(response, {
          service: "businesses",
          operation: "search",
        });
      },
    );

    server.registerTool(
      "businesses_get",
      {
        title: "Outscraper Business Details",
        description: `
Get one business by Outscraper business id.

Best for:
- loading the full detail payload for a business found via businesses_search
- fetching a smaller field-selected payload for one known business id

Use this after businesses_search when you already know the exact business id.

Do not use this for discovery:
- use businesses_search to find records first
- then call businesses_get for the exact item you want to enrich or inspect
        `.trim(),
        inputSchema: businessesGetInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        if (process.env.DEBUG_BUSINESSES_TOOL === "true") {
          console.error("[businesses_get args]", JSON.stringify(args));
        }

        const response = await context.getClient(extra).businessesGet(args.business_id, {
          fields: args.fields?.join(","),
        });

        return createToolResult(response, {
          service: "businesses",
          operation: "get",
        });
      },
    );
  }
}
