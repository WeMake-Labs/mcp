#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

type Result = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

interface BiasDetectionInput {
  text: string;
}

const BIAS_WORDS = ["always", "never", "obviously", "clearly", "everyone", "no one"];

function detectBias(text: string): string[] {
  const escaped = BIAS_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const matches = text.match(regex) ?? [];
  return [...new Set(matches.map((m) => m.toLowerCase()))];
}

const BIAS_DETECTION_TOOL = {
  name: "biasDetection",
  description: "Detects simplistic biased terms in text",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Text to analyze for bias" }
    },
    required: ["text"]
  }
};

export class BiasDetectionServer {
  process(input: unknown): Result {
    if (
      !input ||
      typeof input !== "object" ||
      input === null ||
      !("text" in input) ||
      typeof (input as Record<string, unknown>).text !== "string"
    ) {
      return { content: [{ type: "text", text: "Invalid input" }], isError: true };
    }
    const data = input as BiasDetectionInput;
    const biases = detectBias(data.text);
    return {
      content: [{ type: "text", text: JSON.stringify({ biases }) }]
    };
  }
}

export default function createServer(): Server {
  const server = new Server({ name: "bias-detection-server", version: "0.3.0" }, { capabilities: { tools: {} } });
  const biasServer = new BiasDetectionServer();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [BIAS_DETECTION_TOOL] }));
  server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
    if (req.params.name === "biasDetection") {
      return biasServer.process(req.params.arguments);
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
    console.error("Bias Detection MCP Server running on stdio");
  }

  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}
