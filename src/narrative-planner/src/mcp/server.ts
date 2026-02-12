import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { NarrativePlanner } from "../codemode/index.js";
import { NARRATIVE_PLANNER_TOOL } from "./tools.js";
import { NarrativeInput } from "../core/types.js";

export class NarrativePlannerServer {
  private planner: NarrativePlanner;

  constructor() {
    this.planner = new NarrativePlanner();
  }

  async process(input: unknown) {
    try {
      // The planner validates inside, but we can also rely on Schema validation to some extent
      // However, the planner's validateNarrativeInput throws errors which we should catch
      const outline = this.planner.planNarrative(input as NarrativeInput);
      return { content: [{ type: "text", text: JSON.stringify(outline, null, 2) }] };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true
      };
    }
  }
}

export default function createServer(): Server {
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf-8"));
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
