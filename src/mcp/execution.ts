import { z } from "zod";

export const executionModeSchema = z
  .enum(["auto", "sync", "async"])
  .optional()
  .describe(
    "Execution strategy. Use auto to let the MCP server choose between sync and async.",
  );

interface ResolveExecutionModeOptions {
  executionMode?: "auto" | "sync" | "async";
  async?: boolean;
  defaultMode?: "sync" | "async";
  shouldUseAsyncInAuto?: boolean;
}

export function resolveAsyncFlag(
  options: ResolveExecutionModeOptions,
): boolean {
  if (options.executionMode === "sync") {
    return false;
  }

  if (options.executionMode === "async") {
    return true;
  }

  if (options.executionMode === "auto") {
    return Boolean(options.shouldUseAsyncInAuto);
  }

  if (typeof options.async === "boolean") {
    return options.async;
  }

  if (options.defaultMode) {
    return options.defaultMode === "async";
  }

  return Boolean(options.shouldUseAsyncInAuto);
}
