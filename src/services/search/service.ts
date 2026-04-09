import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const commonAsyncFields = {
  execution_mode: executionModeSchema,
  async: z.boolean().optional().describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z.string().url().optional().describe("Optional webhook URL for async completion."),
};

const googleSearchInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Google search queries."),
  pages_per_query: z.number().int().min(1).optional().describe("Pages to fetch per query."),
  uule: z.string().optional().describe("Optional Google UULE location string."),
  language: z.string().optional().describe("Language code."),
  region: z.string().optional().describe("Region code."),
  tbs: z.string().optional().describe("Optional Google search tbs parameter."),
  skip: z.number().int().min(0).optional().describe("Skip results."),
  enrichment: z.array(z.string()).optional().describe("Optional documented enrichments."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...commonAsyncFields,
};

const googleSearchImagesInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Google image search queries."),
  limit: z.number().int().min(1).optional().describe("Items per query limit."),
  uule: z.string().optional().describe("Optional Google UULE location string."),
  language: z.string().optional().describe("Language code."),
  region: z.string().optional().describe("Region code."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...commonAsyncFields,
};

const yellowpagesInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Yellowpages search queries."),
  location: z.array(z.string()).optional().describe("Optional locations paired with the search query."),
  limit: z.number().int().min(1).optional().describe("Maximum results."),
  region: z.string().optional().describe("Region code."),
  enrichment: z.array(z.string()).optional().describe("Optional documented enrichments."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...commonAsyncFields,
};

const indeedSearchInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Indeed search queries."),
  limit: z.number().int().min(1).optional().describe("Maximum results."),
  enrichment: z.array(z.string()).optional().describe("Optional documented enrichments."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...commonAsyncFields,
};

const tripadvisorSearchInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Tripadvisor search queries or URLs."),
  search_type: z.string().optional().describe("Tripadvisor SearchType parameter from the documented endpoint."),
  limit: z.number().int().min(1).optional().describe("Maximum results."),
  skip: z.number().int().min(0).optional().describe("Skip results."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...commonAsyncFields,
};

export class SearchModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "google_search",
      {
        title: "Google Search",
        description: "Search Google with the documented /google-search endpoint.",
        inputSchema: googleSearchInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.pages_per_query ?? 1) > 1,
        });

        const response = await context.getClient(extra).googleSearch({
          query: args.query,
          pagesPerQuery: args.pages_per_query,
          uule: args.uule,
          language: args.language,
          region: args.region,
          tbs: args.tbs,
          skip: args.skip,
          enrichment: args.enrichment,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "google_search",
          operation: "search",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "google_search_images",
      {
        title: "Google Search Images",
        description: "Search Google Images with the documented /google-search-images endpoint.",
        inputSchema: googleSearchImagesInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.limit ?? 0) > 20,
        });

        const response = await context.getClient(extra).googleSearchImages({
          query: args.query,
          limit: args.limit,
          uule: args.uule,
          language: args.language,
          region: args.region,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "google_search_images",
          operation: "search",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "yellowpages_search",
      {
        title: "Yellowpages Search",
        description: "Search Yellowpages with the documented /yellowpages-search endpoint.",
        inputSchema: yellowpagesInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || Boolean(args.enrichment?.length),
        });

        const response = await context.getClient(extra).yellowpagesSearch({
          query: args.query,
          location: args.location,
          limit: args.limit,
          region: args.region,
          enrichment: args.enrichment,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "yellowpages",
          operation: "search",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "indeed_search",
      {
        title: "Indeed Search",
        description: "Search Indeed with the documented /indeed-search endpoint.",
        inputSchema: indeedSearchInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || Boolean(args.enrichment?.length),
        });

        const response = await context.getClient(extra).indeedSearch({
          query: args.query,
          limit: args.limit,
          enrichment: args.enrichment,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "indeed",
          operation: "search",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "tripadvisor_search",
      {
        title: "Tripadvisor Search",
        description: "Search Tripadvisor with the documented /tripadvisor-search endpoint.",
        inputSchema: tripadvisorSearchInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.limit ?? 0) > 25,
        });

        const response = await context.getClient(extra).tripadvisorSearch({
          query: args.query,
          SearchType: args.search_type,
          limit: args.limit,
          skip: args.skip,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "tripadvisor",
          operation: "search",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
