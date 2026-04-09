import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ModuleContext, ToolModule } from "../../core/service.js";
import { createToolResult, toolResultEnvelopeSchema } from "../../mcp/result.js";

export class RequestsModule implements ToolModule {
  register(server: McpServer, context: ModuleContext): void {
    server.registerTool(
      "requests_get",
      {
        title: "Outscraper Request Status",
        description: `
Check the status of an asynchronous Outscraper request.

Use this after calling any tool with execution_mode="async" or after an auto-selected async submission.
Typical flow:
1. call google_maps_reviews, company_insights, emails_and_contacts, or google_maps_search with execution_mode="async"
2. capture the returned request id
3. poll requests_get until the job is completed or failed

Use this tool when:
- a previous tool returned an async request id
- you want to know whether the request is Pending, Success, or Failure
- you need the completed data from a previously submitted async job
        `.trim(),
        inputSchema: {
          request_id: z.string().min(1).describe("Async request id."),
        },
        outputSchema: toolResultEnvelopeSchema,
      },
      async ({ request_id }, extra) => {
        const response = await context.getClient(extra).getRequestArchive(request_id);

        return createToolResult(response, {
          service: "requests",
          operation: "get",
        });
      },
    );

    server.registerTool(
      "requests_list",
      {
        title: "Outscraper Request History",
        description: `
List recent Outscraper requests by bucket.

Best for:
- debugging async flows
- seeing running, completed, or failed jobs
- checking what was recently submitted through the current API key

Use this when:
- you lost a request id and want to find recent jobs
- you want a quick view of recent running or finished requests
- you are debugging async submissions across tools
        `.trim(),
        inputSchema: {
          type: z
            .enum(["running", "finished", "all"])
            .optional()
            .describe("Optional request bucket."),
        },
        outputSchema: toolResultEnvelopeSchema,
      },
      async ({ type }, extra) => {
        const normalizedType = type === "all" ? undefined : type;
        const response = await context.getClient(extra).getRequestsHistory(normalizedType);

        return createToolResult(response, {
          service: "requests",
          operation: "list",
        });
      },
    );

    server.registerTool(
      "requests_delete",
      {
        title: "Outscraper Request Delete",
        description: `
Delete or terminate an asynchronous Outscraper request by request id.

Best for:
- cleaning up queued or no-longer-needed async jobs
- stopping work you no longer want to keep polling
- testing the full async request lifecycle from MCP

Use this carefully:
- it is intended for cleanup or cancellation
- only use it when you are sure the request is no longer needed
- after deletion, the original async request should not be expected to complete normally
        `.trim(),
        inputSchema: {
          request_id: z.string().min(1).describe("Async request id to delete."),
        },
        outputSchema: toolResultEnvelopeSchema,
      },
      async ({ request_id }, extra) => {
        const response = await context.getClient(extra).deleteRequestArchive(request_id);

        return createToolResult(response, {
          service: "requests",
          operation: "delete",
        });
      },
    );
  }
}
