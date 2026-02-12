import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ConstraintSolver } from "../codemode/index.js";
import { ConstraintProblem } from "../core/types.js";

type Result = CallToolResult & { isError?: boolean };

export class ConstraintMcpServer {
  private solver: ConstraintSolver;

  constructor() {
    this.solver = new ConstraintSolver();
  }

  async process(input: unknown): Promise<Result> {
    // First treat input as a partial to allow safe inspection
    const data = input as Partial<ConstraintProblem>;

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

    // At this point the shape matches ConstraintProblem (formerly ConstraintSolverInput)
    const result = await this.solver.check(data as ConstraintProblem);

    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
}
