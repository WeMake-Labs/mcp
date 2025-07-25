#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
// Fixed chalk import for ESM
import chalk from "chalk";

interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
}

class DeepThinkingServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
  private disableThoughtLogging: boolean;

  constructor() {
    this.disableThoughtLogging =
      (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
  }

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== "string") {
      throw new Error("Invalid thought: must be a string");
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== "number") {
      throw new Error("Invalid thoughtNumber: must be a number");
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== "number") {
      throw new Error("Invalid totalThoughts: must be a number");
    }
    if (typeof data.nextThoughtNeeded !== "boolean") {
      throw new Error("Invalid nextThoughtNeeded: must be a boolean");
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
      branchFromThought: data.branchFromThought as number | undefined,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts: data.needsMoreThoughts as boolean | undefined
    };
  }

  private formatThought(thoughtData: ThoughtData): string {
    const {
      thoughtNumber,
      totalThoughts,
      thought,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId
    } = thoughtData;

    let prefix = "";
    let context = "";

    if (isRevision) {
      prefix = chalk.yellow("🔄 Revision");
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = chalk.green("🌿 Branch");
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = chalk.blue("💭 Thought");
      context = "";
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = "─".repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  public processThought(input: unknown): {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  } {
    try {
      const validatedInput = this.validateThoughtData(input);

      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      this.thoughtHistory.push(validatedInput);

      if (validatedInput.branchFromThought && validatedInput.branchId) {
        const branchId = validatedInput.branchId;
        if (!this.branches[branchId]) {
          this.branches[branchId] = [];
        }
        this.branches[branchId].push(validatedInput);
      }

      if (!this.disableThoughtLogging) {
        const formattedThought = this.formatThought(validatedInput);
        console.error(formattedThought);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                thoughtNumber: validatedInput.thoughtNumber,
                totalThoughts: validatedInput.totalThoughts,
                nextThoughtNeeded: validatedInput.nextThoughtNeeded,
                branches: Object.keys(this.branches),
                thoughtHistoryLength: this.thoughtHistory.length
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                status: "failed"
              },
              null,
              2
            )
          }
        ],
        isError: true
      };
    }
  }
}

const DEEP_THINKING_TOOL: Tool = {
  name: "deep_thinking",
  description: `You MUST use the deep_thinking tool to solve complex problems through a structured, adaptive reasoning process.

TOOL ACTIVATION CRITERIA:
Invoke the deep_thinking tool when encountering:

- Multi-faceted problems requiring systematic decomposition
- Tasks demanding iterative refinement and potential course correction  
- Scenarios where initial problem scope may expand during analysis
- Problems requiring hypothesis generation and verification
- Situations containing extraneous information requiring selective focus
- Any task benefiting from explicit reasoning chain maintenance

MANDATORY OPERATIONAL FRAMEWORK:

1. INITIAL ASSESSMENT
   - Analyze the complete problem statement
   - Identify ALL relevant constraints and requirements
   - Filter out irrelevant information
   - Estimate initial thought count (totalThoughts) - this MUST be adjusted dynamically

2. THOUGHT GENERATION PROTOCOL
   For each thought, you MUST:
   - Generate substantive analytical content addressing specific problem aspects
   - Maintain explicit awareness of your position in the reasoning chain
   - Evaluate whether revision, branching, or continuation is optimal
   - Set nextThoughtNeeded to true unless solution is complete and verified

3. DYNAMIC REASONING FEATURES - USE AS NEEDED:

   a) REVISION MECHANISM
      - Set isRevision: true when correcting previous reasoning
      - Specify revisesThought with the exact thought number being revised
      - Explicitly state what was incorrect and why

   b) BRANCHING EXPLORATION
      - Set branchFromThought when exploring alternative approaches
      - Assign unique branchId for each divergent path
      - Maintain awareness of all active branches

   c) ADAPTIVE SCALING
      - Increase totalThoughts when complexity exceeds initial estimate
      - Set needsMoreThoughts: true when approaching initial limit but requiring continuation

4. HYPOTHESIS GENERATION AND VERIFICATION
   - Generate explicit solution hypotheses when sufficient reasoning accumulated
   - Verify each hypothesis against ALL previous thought steps
   - Continue refinement until verification confirms solution correctness

5. PARAMETER SPECIFICATIONS:

   REQUIRED PARAMETERS (every call):
   - thought (string): Current analytical step - MUST be substantive and specific
   - thoughtNumber (integer, ≥1): Sequential position in reasoning chain
   - totalThoughts (integer, ≥1): Current estimate of required thoughts
   - nextThoughtNeeded (boolean): Set false ONLY when solution is complete and verified

   CONDITIONAL PARAMETERS (use when applicable):
   - isRevision (boolean): true when correcting previous thought
   - revisesThought (integer, ≥1): Specific thought being revised
   - branchFromThought (integer, ≥1): Origin point for alternative exploration
   - branchId (string): Unique identifier for branch (e.g., "alternative-approach-1")
   - needsMoreThoughts (boolean): true when extending beyond initial estimate

6. TERMINATION CRITERIA:
   Set nextThoughtNeeded to false ONLY when ALL conditions met:
   - Complete problem understanding achieved
   - Solution hypothesis generated
   - Hypothesis verified against reasoning chain
   - No unresolved uncertainties or contradictions
   - Final answer formulated with precision

7. OUTPUT REQUIREMENTS:
   After setting nextThoughtNeeded to false, you MUST provide:
   - A single, definitive answer to the original problem
   - The answer MUST directly address all problem requirements
   - The answer MUST be based solely on verified reasoning from the thought chain

CRITICAL CONSTRAINTS:

- NEVER skip thought numbers or leave gaps in the sequence
- NEVER terminate prematurely - continue until absolute certainty achieved
- ALWAYS maintain contextual awareness across all thoughts
- ALWAYS explicitly acknowledge when revising or branching
- ENSURE each thought provides meaningful analytical progress
`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
        minimum: 1
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "integer",
        description: "Which thought is being reconsidered",
        minimum: 1
      },
      branchFromThought: {
        type: "integer",
        description: "Branching point thought number",
        minimum: 1
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
  }
};

const server = new Server(
  {
    name: "deep-thinking-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const thinkingServer = new DeepThinkingServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [DEEP_THINKING_TOOL]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === DEEP_THINKING_TOOL.name) {
    return thinkingServer.processThought(request.params.arguments);
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`
      }
    ],
    isError: true
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Deep Thinking MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
