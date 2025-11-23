#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { Parser } from "expr-eval";

type Result = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

interface ConstraintSolverInput {
  variables: Record<string, number>;
  constraints: string[];
}

function evaluateConstraint(expr: string, vars: Record<string, number>): boolean {
  try {
    // Replace C-style operators with expr-eval style
    const sanitizedExpr = expr.replace(/&&/g, " and ").replace(/\|\|/g, " or ");
    const ast = Parser.parse(sanitizedExpr);
    return Boolean(ast.evaluate(vars));
  } catch {
    return false;
  }
}

function solve(input: ConstraintSolverInput) {
  // Guardrails: prevent too-large inputs from causing performance explosions
  if (Object.keys(input.variables).length > 1000) {
    return { satisfied: false, unsatisfied: ["Too many variables (>1000)"] };
  }
  if (input.constraints.length > 5000) {
    return { satisfied: false, unsatisfied: ["Too many constraints (>5000)"] };
  }

  const unsatisfied = input.constraints.filter((c) => !evaluateConstraint(c, input.variables));
  return { satisfied: unsatisfied.length === 0, unsatisfied };
}

const CONSTRAINT_SOLVER_TOOL = {
  name: "constraintSolver",
  description: "Checks if a set of variables satisfies all constraints",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      variables: {
        type: "object",
        description: "Variable assignments",
        additionalProperties: { type: "number" }
      },
      constraints: {
        type: "array",
        description: "Boolean expressions",
        items: {
          type: "string",
          pattern: "^[A-Za-z0-9_\\s<>=!()+\\-*/.%|&^]+$"
        },
        minItems: 1
      }
    },
    required: ["variables", "constraints"]
  }
};

export class ConstraintSolverServer {
  async process(input: unknown): Promise<Result> {
    // First treat input as a partial to allow safe inspection
    const data = input as Partial<ConstraintSolverInput>;

    // Helper to ensure we have a non-null object
    const isObj = (v: unknown): v is object => typeof v === "object" && v !== null;

    // Validate that `variables` is an object whose values are all finite numbers
    const isVarsOk =
      isObj(data?.variables) &&
      Object.values(data!.variables as Record<string, unknown>).every(
        (v) => typeof v === "number" && Number.isFinite(v)
      );

    // Validate that `constraints` is an array of strings
    const isConstraintsOk =
      Array.isArray(data?.constraints) && (data!.constraints as unknown[]).every((c) => typeof c === "string");

    if (!isVarsOk || !isConstraintsOk) {
      return {
        content: [{ type: "text", text: "Invalid input" }],
        isError: true
      };
    }

    // At this point the shape matches ConstraintSolverInput
    const result = solve(data as ConstraintSolverInput);

    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
}

/**
 * Factory function that creates and configures a constraint solver MCP server instance.
 *
 * This function initializes a Server with the name "constraint-solver-server" and version "0.3.0",
 * registers the CONSTRAINT_SOLVER_TOOL, and sets up request handlers for listing available tools
 * and processing constraint solving requests. The CallTool handler calls ConstraintSolverServer.process
 * when req.params.name === "constraintSolver" and returns an error response for unknown tool names.
 * The module also runs a Stdio transport when executed as a main script.
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
 * console.log("Constraint Solver Server running");
 * ```
 */
export default function createServer(): Server {
  const server = new Server({ name: "constraint-solver-server", version: "0.3.0" }, { capabilities: { tools: {} } });
  const constraintServer = new ConstraintSolverServer();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [CONSTRAINT_SOLVER_TOOL] }));
  server.setRequestHandler(CallToolRequestSchema, async (req: CallToolRequest) => {
    if (req.params.name === "constraintSolver") {
      return await constraintServer.process(req.params.arguments);
    }
    return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
  });

  return server;
}

if (import.meta.main) {
  const server = createServer();

  async function runServer() {
    const transport = new StdioServerTransport();
    try {
      await server.connect(transport);
      console.error("Constraint Solver MCP Server running on stdio");
    } catch (err) {
      console.error("Failed to connect constraint-solver:", err);
      process.exit(1);
    }
  }

  runServer().catch((err) => {
    console.error("Fatal error running server:", err);
    process.exit(1);
  });
}
