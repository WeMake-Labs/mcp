#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

type Result = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

interface NarrativeInput {
  premise: string;
  characters: string[];
  arcs: string[];
}

function planNarrative(data: NarrativeInput) {
  const chars = data.characters
    .map((c) => c.trim())
    .filter(Boolean)
    .join(", ");

  return {
    setup: data.premise.trim(),
    conflicts: data.arcs.map((a) => a.trim()).filter(Boolean),
    resolution: `Characters ${chars} resolve the plot.`
  };
}

const NARRATIVE_PLANNER_TOOL = {
  name: "narrativePlanner",
  description: "Generates a simple three-act story outline",
  inputSchema: {
    type: "object",
    properties: {
      premise: { type: "string", minLength: 1 },
      characters: { type: "array", items: { type: "string" }, minItems: 1 },
      arcs: { type: "array", items: { type: "string" }, minItems: 1 }
    },
    required: ["premise", "characters", "arcs"],
    additionalProperties: false
  }
};

export class NarrativePlannerServer {
  async process(input: unknown): Promise<Result> {
    if (!input || typeof input !== "object") {
      return { content: [{ type: "text", text: "Invalid input" }], isError: true };
    }
    const data = input as Partial<NarrativeInput>;
    if (
      typeof data.premise !== "string" ||
      !data.premise.trim() ||
      !Array.isArray(data.characters) ||
      !Array.isArray(data.arcs) ||
      !data.characters.every((c) => typeof c === "string") ||
      !data.arcs.every((a) => typeof a === "string")
    ) {
      return { content: [{ type: "text", text: "Invalid input" }], isError: true };
    }

    const validCharacters = data.characters.filter((c) => c.trim().length > 0);
    const validArcs = data.arcs.filter((a) => a.trim().length > 0);

    if (validCharacters.length === 0 || validArcs.length === 0) {
      return {
        content: [
          { type: "text", text: "Invalid input: characters and arcs must contain at least one non-empty string" }
        ],
        isError: true
      };
    }
    // After validation, we can safely cast to NarrativeInput since all required properties are confirmed
    const outline = planNarrative(data as NarrativeInput);
    return { content: [{ type: "text", text: JSON.stringify(outline) }] };
  }
}

import { readFileSync } from "node:fs";

/**
 * Factory function that creates and configures a narrative planner MCP server instance.
 *
 * This function initializes a Server with the name "narrative-planner-server", reads the version
 * from the package.json file, registers the NARRATIVE_PLANNER_TOOL, and sets up request handlers
 * for listing available tools and processing narrative planning requests. The CallTool handler
 * calls NarrativePlannerServer.process when req.params.name === "narrativePlanner".
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
 * console.log("Narrative Planner Server running");
 * ```
 */
export default function createServer(): Server {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
  const server = new Server(
    { name: "narrative-planner-server", version: pkg.version },
    { capabilities: { tools: {} } }
  );
  const narrativeServer = new NarrativePlannerServer();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [NARRATIVE_PLANNER_TOOL] }));
  server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
    if (req.params.name === "narrativePlanner") {
      return await narrativeServer.process(req.params.arguments ?? {});
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
    console.error("Narrative Planner MCP Server running on stdio");
  }

  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}
