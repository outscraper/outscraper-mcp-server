import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const asyncFields = {
  execution_mode: executionModeSchema,
  async: z.boolean().optional().describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z.string().url().optional().describe("Optional webhook URL for async completion."),
};

const bookingReviewsInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Booking URLs."),
  reviews_limit: z.number().int().min(1).optional().describe("Maximum reviews per query."),
  skip: z.number().int().min(0).optional().describe("Skip reviews."),
  sort: z.string().optional().describe("Booking sort parameter."),
  cutoff: z.string().optional().describe("Cutoff value accepted by Outscraper."),
  language: z.string().optional().describe("Language code."),
  region: z.string().optional().describe("Region code."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...asyncFields,
};

const yelpReviewsInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Yelp business URLs."),
  reviews_limit: z.number().int().min(1).optional().describe("Maximum reviews per query."),
  cursor: z.string().optional().describe("Pagination cursor."),
  sort: z.string().optional().describe("Yelp sort parameter."),
  cutoff: z.string().optional().describe("Cutoff value accepted by Outscraper."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...asyncFields,
};

const tripadvisorReviewsInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Tripadvisor URLs."),
  reviews_limit: z.number().int().min(1).optional().describe("Maximum reviews per query."),
  cutoff: z.string().optional().describe("Cutoff value accepted by Outscraper."),
  language: z.string().optional().describe("Language code."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...asyncFields,
};

const trustpilotDataInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Trustpilot domains or review URLs."),
  enrichment: z.array(z.string()).optional().describe("Optional documented enrichments."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...asyncFields,
};

const trustpilotReviewsInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Trustpilot domains or review URLs."),
  reviews_limit: z.number().int().min(1).optional().describe("Maximum reviews per query."),
  skip: z.number().int().min(0).optional().describe("Skip reviews."),
  languages: z.array(z.string()).optional().describe("Language filters."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  ...asyncFields,
};

export class ReviewsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "booking_reviews",
      {
        title: "Booking Reviews",
        description: "Fetch Booking reviews with the documented /booking-reviews endpoint.",
        inputSchema: bookingReviewsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "async",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.reviews_limit ?? 0) > 50,
        });

        const response = await context.getClient(extra).bookingReviews({
          query: args.query,
          reviewsLimit: args.reviews_limit,
          skip: args.skip,
          sort: args.sort,
          cutoff: args.cutoff,
          language: args.language,
          region: args.region,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "booking",
          operation: "reviews",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "yelp_reviews",
      {
        title: "Yelp Reviews",
        description: "Fetch Yelp reviews with the documented /yelp-reviews endpoint.",
        inputSchema: yelpReviewsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "async",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.reviews_limit ?? 0) > 50,
        });

        const response = await context.getClient(extra).yelpReviews({
          query: args.query,
          reviewsLimit: args.reviews_limit,
          cursor: args.cursor,
          sort: args.sort,
          cutoff: args.cutoff,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "yelp",
          operation: "reviews",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "tripadvisor_reviews",
      {
        title: "Tripadvisor Reviews",
        description: "Fetch Tripadvisor reviews with the documented /tripadvisor-reviews endpoint.",
        inputSchema: tripadvisorReviewsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "async",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.reviews_limit ?? 0) > 50,
        });

        const response = await context.getClient(extra).tripadvisorReviews({
          query: args.query,
          reviewsLimit: args.reviews_limit,
          cutoff: args.cutoff,
          language: args.language,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "tripadvisor",
          operation: "reviews",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "tp_data",
      {
        title: "Trustpilot Data",
        description: "Fetch Trustpilot business data with the documented /trustpilot endpoint.",
        inputSchema: trustpilotDataInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1 || Boolean(args.enrichment?.length),
        });

        const response = await context.getClient(extra).trustpilotData({
          query: args.query,
          enrichment: args.enrichment,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "trustpilot",
          operation: "data",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "tp_reviews",
      {
        title: "Trustpilot Reviews",
        description: "Fetch Trustpilot reviews with the documented /trustpilot-reviews endpoint.",
        inputSchema: trustpilotReviewsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "async",
          shouldUseAsyncInAuto: args.query.length > 1 || (args.reviews_limit ?? 0) > 50,
        });

        const response = await context.getClient(extra).trustpilotReviews({
          query: args.query,
          reviewsLimit: args.reviews_limit,
          skip: args.skip,
          languages: args.languages,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "trustpilot",
          operation: "reviews",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
