import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

export class ProfileModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "ping",
      {
        title: "Outscraper Ping",
        description: `
Check whether the Outscraper MCP server is running and return basic server metadata.

Best for:
- validating local or container startup
- confirming the MCP server is reachable before making live API calls
- lightweight health checks in demos, IDE setups, or registry validation
        `.trim(),
        inputSchema: {},
        outputSchema: toolResultEnvelopeSchema,
      },
      async () =>
        createToolResult(
          {
            ok: true,
            server: "outscraper-mcp",
            transport: "mcp",
            authentication_required_for_live_calls: true,
          },
          {
            service: "profile",
            operation: "ping",
          },
        ),
    );

    server.registerTool(
      "balance_get",
      {
        title: "Outscraper Balance",
        description: `
Fetch the current Outscraper account balance and billing summary for the active API key.

Best for:
- checking whether the key is attached to a funded account
- confirming account status before running larger jobs
- reading upcoming invoice and usage billing details

Use this when:
- you want a quick health check for the current API key/account
- you need to confirm available balance before large async jobs
- you are debugging whether billing or account status might explain API behavior
        `.trim(),
        inputSchema: {},
        outputSchema: toolResultEnvelopeSchema,
      },
      async (_args, extra) => {
        const response = await context.getClient(extra).getProfileBalance();

        return createToolResult(response, {
          service: "profile",
          operation: "balance",
        });
      },
    );
  }
}
