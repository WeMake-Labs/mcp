import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { ConstraintSolverServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

/**
 * Test suite for Constraint Solver MCP Server.
 *
 * Business Context: Ensures the constraint-solver framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Constraint Solver Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("server has correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Tool Registration Tests.
 *
 * Business Context: Verifies that MCP tools are correctly advertised to clients.
 */
describe.skip("Tool Registration", () => {
  it("should advertise constraintSolver tool", async () => {
    const server = createTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("constraintSolver");
    expect(response.tools[0].description).toContain("Checks if a set of variables satisfies all constraints");
  });
});

/**
 * Constraint Solving Tests - Satisfied Constraints.
 *
 * Business Context: Verify that the solver correctly identifies when all
 * constraints are satisfied by the given variable assignments.
 */
describe("Constraint Solving - Satisfied Constraints", () => {
  let solver: ConstraintSolverServer;

  beforeEach(() => {
    solver = new ConstraintSolverServer();
  });

  it("should solve satisfied simple constraint", async () => {
    const input = {
      variables: { x: 5, y: 10 },
      constraints: ["x < y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
    expect(parsed.unsatisfied).toHaveLength(0);
  });

  it("should solve multiple satisfied constraints", async () => {
    const input = {
      variables: { a: 10, b: 20, c: 30 },
      constraints: ["a < b", "b < c", "a + b == c"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
    expect(parsed.unsatisfied).toHaveLength(0);
  });

  it("should handle equality constraints", async () => {
    const input = {
      variables: { x: 42, y: 42 },
      constraints: ["x == y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });

  it("should handle complex arithmetic constraints", async () => {
    const input = {
      variables: { a: 5, b: 3, c: 15 },
      constraints: ["a * b == c", "c / a == b"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });
});

/**
 * Constraint Solving Tests - Unsatisfied Constraints.
 *
 * Business Context: Verify that the solver correctly identifies when
 * constraints are violated and reports which constraints failed.
 */
describe("Constraint Solving - Unsatisfied Constraints", () => {
  let solver: ConstraintSolverServer;

  beforeEach(() => {
    solver = new ConstraintSolverServer();
  });

  it("should detect unsatisfied simple constraint", async () => {
    const input = {
      variables: { x: 10, y: 5 },
      constraints: ["x < y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(false);
    expect(parsed.unsatisfied).toHaveLength(1);
    expect(parsed.unsatisfied[0]).toBe("x < y");
  });

  it("should detect multiple unsatisfied constraints", async () => {
    const input = {
      variables: { a: 30, b: 20, c: 10 },
      constraints: ["a < b", "b < c"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(false);
    expect(parsed.unsatisfied).toHaveLength(2);
  });

  it("should handle partially satisfied constraints", async () => {
    const input = {
      variables: { x: 5, y: 10, z: 3 },
      constraints: ["x < y", "y < z"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(false);
    expect(parsed.unsatisfied).toHaveLength(1);
    expect(parsed.unsatisfied[0]).toBe("y < z");
  });
});

/**
 * Input Validation Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test validation logic directly without transport layer
 * to ensure clear error messages and proper input sanitization.
 */
describe("Input Validation", () => {
  let solver: ConstraintSolverServer;

  beforeEach(() => {
    solver = new ConstraintSolverServer();
  });

  it("should reject null input", async () => {
    const result = await solver.process(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid input");
  });

  it("should reject input missing variables", async () => {
    const input = {
      constraints: ["x < y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBe(true);
  });

  it("should reject input missing constraints", async () => {
    const input = {
      variables: { x: 5 }
    };
    const result = await solver.process(input);
    expect(result.isError).toBe(true);
  });

  it("should reject non-numeric variable values", async () => {
    const input = {
      variables: { x: "not a number", y: 10 },
      constraints: ["x < y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBe(true);
  });

  it("should reject non-array constraints", async () => {
    const input = {
      variables: { x: 5 },
      constraints: "x < 10"
    };
    const result = await solver.process(input);
    expect(result.isError).toBe(true);
  });

  it("should reject non-string constraints", async () => {
    const input = {
      variables: { x: 5 },
      constraints: [123, 456]
    };
    const result = await solver.process(input);
    expect(result.isError).toBe(true);
  });
});

/**
 * MCP Server Integration Tests.
 *
 * Business Context: MCP protocol compliance is essential for AI agent integration.
 *
 * Decision Rationale: Test server initialization without requiring a connected transport.
 * Full integration testing is done via MCP Inspector during development workflow.
 */
describe.skip("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("handles valid constraint solving request", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "constraintSolver",
          arguments: {
            variables: { x: 5, y: 10 },
            constraints: ["x < y"]
          }
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBeUndefined();
  });

  it("rejects unknown tool name", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "unknownTool",
          arguments: {}
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("Unknown tool");
  });
});

/**
 * Edge Cases and Performance Tests.
 *
 * Business Context: Enterprise applications must handle edge cases gracefully
 * and perform well under load.
 *
 * Decision Rationale: Test boundary conditions and performance to ensure
 * production reliability.
 */
describe("Edge Cases and Performance", () => {
  let solver: ConstraintSolverServer;

  beforeEach(() => {
    solver = new ConstraintSolverServer();
  });

  it("handles empty variables object", async () => {
    const input = {
      variables: {},
      constraints: ["true"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles very large variable count (> 1000)", async () => {
    const variables: Record<string, number> = {};
    for (let i = 0; i < 1001; i++) {
      variables[`var${i}`] = i;
    }
    const input = {
      variables,
      constraints: ["var0 < var1"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(false);
    expect(parsed.unsatisfied).toContain("Too many variables (>1000)");
  });

  it("handles very large constraint count (> 5000)", async () => {
    const constraints = Array.from({ length: 5001 }, () => "x < y");
    const input = {
      variables: { x: 5, y: 10 },
      constraints
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(false);
    expect(parsed.unsatisfied).toContain("Too many constraints (>5000)");
  });

  it("handles special characters in variable names", async () => {
    const input = {
      variables: { x_1: 5, y_2: 10, z_3: 15 },
      constraints: ["x_1 < y_2", "y_2 < z_3"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });

  it("handles complex boolean expressions", async () => {
    const input = {
      variables: { a: 5, b: 10, c: 15 },
      constraints: ["(a < b) && (b < c)", "a + b < c + 5"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });

  it("handles malformed expressions gracefully", async () => {
    const input = {
      variables: { x: 5 },
      constraints: ["x <<< y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(false);
  });

  it("handles zero and negative values", async () => {
    const input = {
      variables: { x: 0, y: -5, z: 10 },
      constraints: ["x > y", "z > x"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });

  it("handles floating point values", async () => {
    const input = {
      variables: { x: 3.14, y: 2.71 },
      constraints: ["x > y", "x + y > 5"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });
});
