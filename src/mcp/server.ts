import {
  McpServer,
  type RegisteredTool,
  type ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  isZ4Schema,
  type AnySchema,
  type ZodRawShapeCompat,
} from "@modelcontextprotocol/sdk/server/zod-compat.js";
import {
  ListToolsRequestSchema,
  type Tool,
  type ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

function toolSchema(schema: AnySchema | undefined, io: "input" | "output"): Tool["inputSchema"] {
  const objectSchema = schema ?? z.object({});
  if (!isZ4Schema(objectSchema)) {
    throw new Error("Tool schema generation requires Zod 4.");
  }
  const jsonSchema = z.toJSONSchema(objectSchema, { target: "draft-2020-12", io });
  if (jsonSchema.type !== "object") {
    throw new Error("MCP tool schemas must describe an object.");
  }
  // SDK v1's Tool type predates JSON Schema's boolean subschemas.
  return jsonSchema as Tool["inputSchema"];
}

/**
 * SDK 1.29 generates draft-07 tool schemas, which strict MCP clients reject.
 * Override only tools/list using public registration handles; the SDK retains
 * tools/call handling and Zod input/output validation.
 * https://github.com/modelcontextprotocol/typescript-sdk/issues/2084
 */
export class SchemaMcpServer extends McpServer {
  private readonly schemaTools = new Map<string, RegisteredTool>();

  override registerTool<
    OutputArgs extends ZodRawShapeCompat | AnySchema,
    InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined,
  >(
    name: string,
    config: {
      title?: string;
      description?: string;
      inputSchema?: InputArgs;
      outputSchema?: OutputArgs;
      annotations?: ToolAnnotations;
      _meta?: Record<string, unknown>;
    },
    cb: ToolCallback<InputArgs>,
  ): RegisteredTool {
    const tool = super.registerTool(name, config, cb);
    this.schemaTools.set(name, tool);

    // Keep the advertised catalog aligned with the SDK's public update/remove API.
    let currentName = name;
    const update = tool.update.bind(tool);
    tool.update = (updates) => {
      update(updates);
      if (updates.name !== undefined && updates.name !== currentName) {
        this.schemaTools.delete(currentName);
        if (updates.name) {
          currentName = updates.name;
          this.schemaTools.set(currentName, tool);
        }
      }
    };

    // The first super.registerTool installs SDK handlers, so replace this after it.
    this.server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: Array.from(this.schemaTools, ([toolName, registered]): Tool | undefined => {
        if (!registered.enabled) return undefined;
        return {
          name: toolName,
          title: registered.title,
          description: registered.description,
          inputSchema: toolSchema(registered.inputSchema, "input"),
          ...(registered.outputSchema
            ? { outputSchema: toolSchema(registered.outputSchema, "output") }
            : {}),
          annotations: registered.annotations,
          execution: registered.execution,
          _meta: registered._meta,
        };
      }).filter((tool): tool is Tool => tool !== undefined),
    }));
    return tool;
  }
}
