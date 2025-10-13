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

/**
 * Server class for bias detection functionality in the MCP protocol.
 *
 * This class provides the core logic for detecting biased language patterns
 * in text input using predefined word lists. It processes bias detection
 * requests and returns structured results.
 *
 * @export
 * @public
 * @class BiasDetectionServer
 * @example
 * ```typescript
 * const server = new BiasDetectionServer();
 * const result = server.process({ text: "This is obviously wrong" });
 * console.log(result.content[0].text); // {"biases": ["obviously"]}
 * ```
 */
export class BiasDetectionServer {
  /**
   * Processes bias detection requests by analyzing text for biased language patterns.
   *
   * This method validates the input, detects biased terms using predefined word lists,
   * and returns a structured result with detected biases or error information.
   *
   * @param input - The input object containing text to analyze
   * @param input.text - The text content to analyze for biased language
   * @returns Structured result containing detected biases or error information
   * @throws {Error} If input validation fails or processing encounters an error
   *
   * @example
   * ```typescript
   * const result = server.process({ text: "This is obviously wrong" });
   * // Returns: { content: [{ type: "text", text: "{\"biases\":[\"obviously\"]}" }] }
   * ```
   */
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

/**
 * Factory function that creates and configures a new bias detection MCP server instance.
 *
 * This function initializes a Server with the name "bias-detection-server" and version "0.3.0",
 * registers the bias detection tool, and sets up the appropriate request handlers for
 * listing available tools and processing bias detection requests.
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
 * console.log("Bias Detection Server running");
 * ```
 */
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
