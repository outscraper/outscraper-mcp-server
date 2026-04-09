import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const googleMapsSearchInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more Google Maps queries or place ids."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Organizations per query limit."),
  language: z.string().optional().describe("Language code, for example en."),
  region: z.string().optional().describe("Region code, for example us."),
  coordinates: z
    .string()
    .optional()
    .describe("Optional latitude,longitude coordinates bias supported by Outscraper."),
  skip: z.number().int().min(0).optional().describe("Skip places count."),
  drop_duplicates: z
    .boolean()
    .optional()
    .describe("Drop duplicate places across results."),
  enrichment: z
    .array(z.string())
    .optional()
    .describe("Optional enrichment names supported by Outscraper."),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific place fields to return."),
  execution_mode: executionModeSchema,
  async: z
    .boolean()
    .optional()
    .describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z
    .string()
    .url()
    .optional()
    .describe("Optional webhook URL for async completion."),
};

const googleMapsReviewsInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more place ids or Google Maps business queries."),
  reviews_limit: z
    .number()
    .int()
    .min(1)
    .max(10000)
    .optional()
    .describe("Maximum reviews per place."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .describe("Maximum number of places to process."),
  reviews_query: z
    .string()
    .optional()
    .describe("Optional keyword filter inside reviews."),
  sort: z
    .enum(["most_relevant", "newest", "highest_rating", "lowest_rating"])
    .optional()
    .describe("Review sorting mode."),
  last_pagination_id: z.string().optional().describe("Resume token from previous page."),
  start: z.string().optional().describe("Start date or offset accepted by Outscraper."),
  cutoff: z.string().optional().describe("Cutoff date/timestamp accepted by Outscraper."),
  cutoff_rating: z.number().min(1).max(5).optional().describe("Minimum rating cutoff."),
  ignore_empty: z.boolean().optional().describe("Skip places without reviews."),
  source: z
    .enum(["google", "tripadvisor", "booking", "yelp"])
    .optional()
    .describe("Review source."),
  language: z.string().optional().describe("Language code, for example en."),
  region: z.string().optional().describe("Region code, for example us."),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific review fields to return."),
  execution_mode: executionModeSchema,
  async: z
    .boolean()
    .optional()
    .describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z
    .string()
    .url()
    .optional()
    .describe("Optional webhook URL for async completion."),
};

export class GoogleMapsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "google_maps_search",
      {
        title: "Google Maps Search",
        description: `
Search Google Maps places through Outscraper.

Best for:
- ad hoc place discovery from one or more Google Maps queries
- cases where the user thinks in Google Maps terms rather than /businesses filters
- retrieving place results directly from the Google Maps search pipeline

Prefer this tool when:
- the user gives Google Maps-style queries such as "restaurants brooklyn usa"
- you want place discovery without building structured business filters first
- you want async submissions for larger query batches or enriched Google Maps searches

Use businesses_search instead when:
- you want normalized businesses filters or cursor pagination
- you want to combine strict filters with natural-language business search

Use execution_mode="auto" when:
- there are multiple queries
- the limit is high
- enrichments are requested
        `.trim(),
        inputSchema: googleMapsSearchInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto:
            args.query.length > 1 ||
            Boolean(args.enrichment?.length) ||
            (args.limit ?? 0) > 25,
        });

        const response = await context.getClient(extra).googleMapsSearch({
          query: args.query,
          limit: args.limit,
          language: args.language,
          region: args.region,
          coordinates: args.coordinates,
          skipPlaces: args.skip,
          dropDuplicates: args.drop_duplicates,
          enrichment: args.enrichment,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "google_maps",
          operation: "search",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "google_maps_reviews",
      {
        title: "Google Maps Reviews",
        description: `
Fetch Google Maps reviews for place ids or place queries.

Best for:
- review analysis
- recent-review monitoring
- targeted review extraction for specific places

Prefer this tool when:
- the user needs review text, review counts, or review metadata
- you already know the place or can identify it from a query
- async polling is acceptable for heavier review jobs

Use async mode when:
- review volume is large
- you query many places in one request
- you want to poll progress later with requests_get

Do not use this for basic place discovery:
- use google_maps_search first
- then use google_maps_reviews once you know the target place or query set
        `.trim(),
        inputSchema: googleMapsReviewsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "async",
          shouldUseAsyncInAuto:
            args.query.length > 1 ||
            (args.reviews_limit ?? 0) > 100 ||
            (args.limit ?? 0) > 3,
        });

        const response = await context.getClient(extra).googleMapsReviews({
          query: args.query,
          reviewsLimit: args.reviews_limit,
          reviewsQuery: args.reviews_query,
          limit: args.limit,
          sort: args.sort,
          lastPaginationId: args.last_pagination_id,
          start: args.start,
          cutoff: args.cutoff,
          cutoffRating: args.cutoff_rating,
          ignoreEmpty: args.ignore_empty,
          source: args.source,
          language: args.language,
          region: args.region,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "google_maps",
          operation: "reviews",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
