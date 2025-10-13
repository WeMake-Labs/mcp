#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

type Result = {
  content: Array<{ type: "text"; text: string } | { type: "json"; json: unknown }>;
  isError?: boolean;
};

interface GoalInput {
  action: "add" | "complete" | "status";
  goal?: string;
}

interface GoalState {
  goal: string;
  completed: boolean;
}

export class GoalTracker {
  private goals: GoalState[] = [];

  handle(input: GoalInput): Result {
    const goal = input.goal?.trim();
    switch (input.action) {
      case "add": {
        if (!goal) {
          return {
            content: [{ type: "text", text: "Fehlender Parameter: 'goal' für action 'add'." }],
            isError: true
          };
        }
        // idempotent: identische Ziele nicht doppelt hinzufügen
        if (!this.goals.some((g) => g.goal === goal)) {
          this.goals.push({ goal, completed: false });
        }
        break;
      }
      case "complete": {
        if (!goal) {
          return {
            content: [{ type: "text", text: "Fehlender Parameter: 'goal' für action 'complete'." }],
            isError: true
          };
        }
        const g = this.goals.find((x) => x.goal === goal);
        if (g) {
          g.completed = true;
        } else {
          return {
            content: [{ type: "text", text: `Goal nicht gefunden: ${goal}` }],
            isError: true
          };
        }
        break;
      }
      case "status":
        break;
    }
    return {
      content: [{ type: "json", json: { goals: this.goals } }]
    };
  }
}

const GOAL_TRACKER_TOOL = {
  name: "goalTracker",
  description: "Adds goals, marks completion, and reports status",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: { type: "string", enum: ["add", "complete", "status"] },
      goal: { type: "string", minLength: 1 }
    },
    required: ["action"]
  }
};

// src/goal-tracker/src/index.ts (around lines 52–53)

/**
 * Factory function that creates and configures a goal tracking MCP server instance.
 *
 * This function initializes a Server with the name "goal-tracker-server", derives the version
 * from process.env.PKG_VERSION (falling back to "0.3.0"), registers the GOAL_TRACKER_TOOL,
 * and sets up request handlers for listing available tools and processing goal tracking requests.
 * The CallTool handler calls GoalTracker.handle when req.params.name === "goalTracker".
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
 * console.log("Goal Tracker Server running");
 * ```
 */
export default function createServer(): Server {
  // derive version from build/env rather than hard-coding
  const version = process.env.PKG_VERSION ?? "0.3.0";
  const server = new Server({ name: "goal-tracker-server", version }, { capabilities: { tools: {} } });
  const tracker = new GoalTracker();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [GOAL_TRACKER_TOOL] }));
  server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
    if (req.params.name === "goalTracker") {
      return tracker.handle((req.params.arguments ?? {}) as unknown as GoalInput);
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
    console.error("Goal Tracker MCP Server running on stdio");
  }

  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });

  // Graceful Shutdown
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}
