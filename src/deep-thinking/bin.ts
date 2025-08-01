#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";
import { DeepThinkingServer } from "./index.js";

/**
 * Deep Thinking Tool definition for the MCP server
 * Provides structured reasoning capabilities for complex problem solving
 */
const DEEP_THINKING_TOOL: Tool = {
  name: "thinking",
  description: `You MUST use the thinking tool to solve complex problems through a structured, adaptive reasoning process.

TOOL ACTIVATION CRITERIA:
Invoke the thinking tool when encountering:

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

/**
 * Initialize and configure the MCP server
 * Sets up the server with deep thinking capabilities
 */
function createServer(): {
  server: Server;
  deepThinkingServer: DeepThinkingServer;
} {
  const server = new Server(
    {
      name: "deep-thinking-server",
      version: "1.0.6"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const deepThinkingServer = new DeepThinkingServer();

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [DEEP_THINKING_TOOL]
  }));

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === DEEP_THINKING_TOOL.name) {
      return deepThinkingServer.processThought(request.params.arguments);
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

  return { server, deepThinkingServer };
}

/**
 * Start the MCP server with stdio transport
 * This function handles server initialization and error management
 */
async function runServer(): Promise<void> {
  try {
    const { server } = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Deep Thinking MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

// Start the server when this file is executed directly
// Use a more reliable method for detecting direct execution
if (process.argv[1] && (process.argv[1].endsWith("bin.js") || process.argv[1].includes("mcpserver-deep-thinking"))) {
  runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}

// Export for potential programmatic use
export { createServer, runServer, DEEP_THINKING_TOOL };
