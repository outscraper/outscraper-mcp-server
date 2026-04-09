import { z } from "zod";
import { stringifyJson } from "../lib/json.js";

export const asyncMetadataSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  results_location: z.string().optional(),
  is_async_submission: z.boolean(),
  next_step: z.string().optional(),
});

export const toolResultEnvelopeSchema = z.object({
  data: z.unknown(),
  async: asyncMetadataSchema.optional(),
  meta: z.object({
    service: z.string(),
    operation: z.string(),
  }),
});

interface ToolEnvelopeOptions {
  service: string;
  operation: string;
  asyncRequested?: boolean;
}

interface AsyncMetadata {
  id?: string;
  status?: string;
  results_location?: string;
  is_async_submission: boolean;
  next_step?: string;
}

export function createToolResult(
  response: unknown,
  options: ToolEnvelopeOptions,
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: z.infer<typeof toolResultEnvelopeSchema>;
} {
  const asyncMetadata = normalizeAsyncMetadata(response, options.asyncRequested);
  const structuredContent = {
    data: response,
    meta: {
      service: options.service,
      operation: options.operation,
    },
    ...(asyncMetadata ? { async: asyncMetadata } : {}),
  };

  return {
    content: buildTextContent(response, asyncMetadata),
    structuredContent,
  };
}

function normalizeAsyncMetadata(
  response: unknown,
  asyncRequested?: boolean,
): AsyncMetadata | undefined {
  if (!response || typeof response !== "object") {
    return undefined;
  }

  const candidate = response as Record<string, unknown>;
  const id = typeof candidate.id === "string" ? candidate.id : undefined;
  const status =
    typeof candidate.status === "string" ? candidate.status : undefined;
  const resultsLocation =
    typeof candidate.results_location === "string"
      ? candidate.results_location
      : undefined;

  if (!asyncRequested && !resultsLocation && !(id && status)) {
    return undefined;
  }

  return {
    id,
    status,
    results_location: resultsLocation,
    is_async_submission: Boolean(asyncRequested),
    ...(asyncRequested && id
      ? { next_step: `Call requests_get with request_id="${id}" to check progress.` }
      : {}),
  };
}

function buildTextContent(
  response: unknown,
  asyncMetadata?: AsyncMetadata,
): Array<{ type: "text"; text: string }> {
  if (asyncMetadata?.is_async_submission && asyncMetadata.id) {
    return [
      {
        type: "text",
        text: `Async request accepted with id ${asyncMetadata.id}. ${asyncMetadata.next_step ?? ""}`.trim(),
      },
      {
        type: "text",
        text: stringifyJson(response),
      },
    ];
  }

  return [
    {
      type: "text",
      text: stringifyJson(response),
    },
  ];
}
