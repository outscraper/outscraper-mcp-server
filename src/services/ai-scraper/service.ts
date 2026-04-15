import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const aiScraperSchema = z
  .object({
    type: z.string().describe("Top-level schema type. Usually object."),
    required: z
      .array(z.string())
      .optional()
      .describe("Optional list of required property names in the extracted result."),
    properties: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Property definitions describing the fields you want the scraper to extract."),
  })
  .passthrough()
  .describe(
    "Extraction schema describing the shape of the result. This is typically a JSON-schema-like object with type, properties, and optional required fields.",
  );

const aiScraperInput = {
  query: z
    .string()
    .min(1)
    .describe("One URL to scrape, for example https://outscraper.com."),
  prompt: z
    .string()
    .min(1)
    .optional()
    .describe("Natural-language extraction instructions, for example what to summarize or pull from the page."),
  schema: aiScraperSchema.optional(),
  execution_mode: executionModeSchema,
  async: z
    .boolean()
    .optional()
    .describe("Deprecated compatibility flag. Prefer execution_mode."),
};

export class AiScraperModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "ai_scraper",
      {
        title: "AI Scraper",
        description: `
Extract structured information from a web page with Outscraper AI Scraper.

Best for:
- scraping one page and turning it into structured JSON
- extracting company, people, product, or document metadata from a site
- guiding extraction with both a prompt and a JSON-schema-like shape

This tool is best for extracting structured data from a single page.

How schema works:
- schema describes the shape of the output you want back
- use type="object" with properties for named fields
- use type="array" with items when a field should be a list
- add required when some fields must be present

Example schema:
{
  "type": "object",
  "required": [],
  "properties": {
    "company_name": { "type": "string" },
    "company_description": { "type": "string" },
    "people": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}

Execution notes:
- execution_mode="sync" requests a direct response
- execution_mode="async" returns a request id for polling with requests_get
- if both prompt and schema are provided, prompt guides the extraction and schema shapes the output
        `.trim(),
        inputSchema: aiScraperInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        if (!args.prompt && !args.schema) {
          throw new Error("Either prompt or schema is required.");
        }

        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: false,
        });

        const response = await context.getClient(extra).aiScraper({
          query: args.query,
          prompt: args.prompt,
          schema: args.schema,
          async: asyncFlag,
        });

        return createToolResult(response, {
          service: "ai_scraper",
          operation: "scrape",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
