#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

type Result = {
  content: Array<{ type: "text"; text: string } | { type: "json"; json: unknown }>;
  isError?: boolean;
};

interface MultimodalInput {
  text: string[];
  images: string[];
}

function synthesize(data: MultimodalInput) {
  const text = data.text
    .map((t) => t.trim())
    .filter(Boolean)
    .join(" ");
  const images = data.images
    .map((i) => i.trim())
    .filter(Boolean)
    .join(", ");
  return { summary: `${text} | Images: ${images}` };
}

const MULTIMODAL_SYNTH_TOOL = {
  name: "multimodalSynth",
  description: "Combines text and image descriptions into a unified summary",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "array", items: { type: "string" }, minItems: 1 },
      images: { type: "array", items: { type: "string" }, minItems: 0 }
    },
    required: ["text", "images"],
    additionalProperties: false
  }
};

export class MultimodalSynthServer {
  async process(input: unknown): Promise<Result> {
    if (!input || typeof input !== "object") {
      return { content: [{ type: "text", text: "Invalid input" }], isError: true };
    }
    const data = input as Partial<MultimodalInput>;
    if (
      !Array.isArray(data.text) ||
      !Array.isArray(data.images) ||
      !data.text.every((t) => typeof t === "string") ||
      !data.images.every((i) => typeof i === "string")
    ) {
      return { content: [{ type: "text", text: "Invalid input" }], isError: true };
    }
    const result = synthesize({ text: data.text, images: data.images });
    return { content: [{ type: "json", json: result }] };
  }
}

/**
 * Factory function that creates and configures a multimodal synthesizer MCP server instance.
 *
 * This function initializes a Server with the name "multimodal-synthesizer-server" and version "0.3.0",
 * registers the MULTIMODAL_SYNTH_TOOL, and sets up request handlers for listing available tools
 * and processing multimodal synthesis requests. The CallTool handler calls MultimodalSynthServer.process
 * when req.params.name === "multimodalSynth".
 *
 * @returns A configured Server instance ready for MCP communication
 *
 * @example
 * ```typescript
 * import createServer from './index.js';
 * import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
 *
 * const server = createServer();
 * const transport = new StdioServerTransport();
 * await server.connect(transport);
 * console.log("Multimodal Synthesizer Server running");
 * ```
 *
 * @see {@link https://modelcontextprotocol.io/} for MCP protocol documentation
 */
export default function createServer(): Server {
  const server = new Server(
    { name: "multimodal-synthesizer-server", version: "0.3.0" },
    { capabilities: { tools: {} } }
  );
  const synthServer = new MultimodalSynthServer();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [MULTIMODAL_SYNTH_TOOL] }));
  server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
    if (req.params.name === "multimodalSynth") {
      return await synthServer.process(req.params.arguments);
    }
    return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
  });

  return server;
}

if (import.meta.main) {
  const server = createServer();

  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.once("SIGINT", () => process.exit(0));
    process.once("SIGTERM", () => process.exit(0));
    console.error("Multimodal Synthesizer MCP Server running on stdio");
  }

  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}
