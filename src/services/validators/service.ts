import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { executionModeSchema, resolveAsyncFlag } from "../../mcp/execution.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

const emailsValidatorInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more email addresses to validate."),
  execution_mode: executionModeSchema,
  async: z.boolean().optional().describe("Deprecated compatibility flag. Prefer execution_mode."),
  webhook: z.string().url().optional().describe("Optional webhook URL for async completion."),
};

const phonesEnricherInput = {
  query: z
    .array(z.string().min(1))
    .min(1)
    .describe("One or more phone numbers to enrich."),
};

export class ValidatorsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "emails_validator",
      {
        title: "Emails Validator",
        description: `
Validate email addresses with the documented /email-validator endpoint.

Best for:
- deliverability checks
- validating outbound lead lists
- filtering invalid email inputs before enrichment or outreach
        `.trim(),
        inputSchema: emailsValidatorInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const asyncFlag = resolveAsyncFlag({
          executionMode: args.execution_mode,
          async: args.async,
          defaultMode: "sync",
          shouldUseAsyncInAuto: args.query.length > 1,
        });

        const response = await context.getClient(extra).emailValidator({
          query: args.query,
          async: asyncFlag,
          webhook: args.webhook,
        });

        return createToolResult(response, {
          service: "emails_validator",
          operation: "validate",
          asyncRequested: asyncFlag,
        });
      },
    );

    server.registerTool(
      "phones_enricher",
      {
        title: "Phones Enricher",
        description: `
Enrich phone numbers using the documented /phones-enricher endpoint.

Best for:
- carrier lookup
- phone validation
- message deliverability checks
        `.trim(),
        inputSchema: phonesEnricherInput,
        outputSchema: toolResultEnvelopeSchema,
      },
      async (args, extra) => {
        const response = await context.getClient(extra).phonesEnricher({
          query: args.query,
        });

        return createToolResult(response, {
          service: "phones_enricher",
          operation: "enrich",
        });
      },
    );
  }
}
