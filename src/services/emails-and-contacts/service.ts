import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const preferredContactOptions = [
  "decision makers",
  "influencers",
  "procurement/purchasing",
  "technical",
  "finance",
  "operations",
  "marketing",
  "sales",
  "maintenance",
  "human resources",
  "legal and compliance",
  "supply chain/logistics",
  "education/training",
] as const;

const emailsAndContactsInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more domains or URLs, for example outscraper.com."),
  preferred_contacts: z
    .array(z.enum(preferredContactOptions))
    .optional()
    .describe("Optional contact-role prioritization."),
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

export class EmailsAndContactsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "emails_and_contacts",
      {
        title: "Emails And Contacts",
        description: `
Find emails, phones, and social/contact data from one or more company domains.

Best for:
- domain-based lead enrichment
- finding reachable company contacts from a known website
- quick contact discovery before running heavier enrichment flows

Prefer this tool when:
- the user already knows the company website or domain
- the main goal is contact discovery rather than company metadata
- you want emails, phones, socials, and website-derived contact details

Use async mode when:
- you send many domains at once
- you expect the crawl/enrichment to take longer
- you want to track progress later with requests_get

Use company_insights instead when:
- the user wants firmographics, company profile, revenue, size, or founding details
- contact data is not the main objective
        `.trim(),
        inputSchema: emailsAndContactsInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto:
            args.query.length > 1 || Boolean(args.preferred_contacts?.length),
        });

        const response = await context.getClient(extra).emailsAndContacts({
          query: args.query,
          preferredContacts: args.preferred_contacts,
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "emails_and_contacts",
          operation: "get",
          asyncRequested: asyncFlag,
        });
      },
    );
  }
}
