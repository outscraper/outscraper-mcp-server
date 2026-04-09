import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const googleMapsPhotosInput = {
  query: z.array(z.string().min(1)).min(1).describe("One or more Google Maps place queries or ids."),
  photos_limit: z.number().int().min(1).optional().describe("Maximum photos per place."),
  limit: z.number().int().min(1).optional().describe("Maximum places to process."),
  tag: z.enum(["all", "latest", "menu", "by_owner"]).optional().describe("Optional photo filter tag."),
  language: z.string().optional().describe("Language code."),
  region: z.string().optional().describe("Region code."),
  fields: z.array(z.string()).optional().describe("Specific fields to return."),
  execution_mode: executionModeSchema,
  async: z.boolean().optional().describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z.string().url().optional().describe("Optional webhook URL for async completion."),
};

export class MediaModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "google_maps_photos",
      {
        title: "Google Maps Photos",
        description: `
Fetch Google Maps photos with the documented /google-maps-photos endpoint.

Best for:
- place photo extraction
- menu photo retrieval
- owner photo and latest photo analysis
        `.trim(),
        inputSchema: googleMapsPhotosInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "async",
          shouldUseAsyncInAuto:
            args.query.length > 1 ||
            (args.photos_limit ?? 0) > 50 ||
            (args.limit ?? 0) > 3,
        });

        const response = await context.getClient(extra).googleMapsPhotos({
          query: args.query,
          photosLimit: args.photos_limit,
          limit: args.limit,
          tag: args.tag,
          language: args.language,
          region: args.region,
          fields: args.fields?.join(","),
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "google_maps",
          operation: "photos",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
