import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const companyInsightsInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more company domains, company names, or URLs supported by Outscraper."),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific company insight fields to return. Leave empty to receive the default payload."),
  enrichments: z
    .array(z.string())
    .optional()
    .describe("Optional enrichments supported by Outscraper for company insights."),
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

export class CompanyInsightsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "company_insights",
      {
        title: "Company Insights",
        description: `
Get structured company-level insight data from Outscraper.

Best for:
- enriching known companies or domains
- pulling structured company metadata instead of raw search results
- larger async enrichment jobs that can be tracked later with requests_get

Prefer this tool when:
- the user already has domains or company URLs
- the goal is firmographics, company profile data, size, revenue, industry, or founding details
- you want structured company enrichment rather than contact extraction

Use async mode when:
- you send many companies at once
- the endpoint is expected to do expensive enrichment work

Use emails_and_contacts instead when:
- the user mainly wants emails, phones, socials, or people/contact data
- company profile enrichment is secondary to lead/contact discovery

Returns:
- direct response payload in sync mode
- async request metadata in async mode
        `.trim(),
        inputSchema: companyInsightsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto:
            args.query.length > 1 || Boolean(args.enrichments?.length),
        });

        const response = await context.getClient(extra).companyInsights({
          query: args.query,
          fields: args.fields?.join(","),
          enrichment: args.enrichments,
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "company_insights",
          operation: "get",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
