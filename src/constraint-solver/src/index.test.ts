import { describe, expect, it, beforeEach } from "bun:test";
import createServer from "./index.js";
import { ConstraintMcpServer } from "./mcp/server.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  JSONRPCMessage,
  TextContent
} from "@modelcontextprotocol/sdk/types.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

/**
 * Mock Transport for testing MCP Server
 */
class MockTransport implements Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  private _messages: JSONRPCMessage[] = [];

  async start(): Promise<void> {}

  async send(message: JSONRPCMessage): Promise<void> {
    this._messages.push(message);
  }

  async close(): Promise<void> {
    this.onclose?.();
  }

  get messages() {
    return this._messages;
  }

  // Helper to simulate incoming message and wait for response
  async sendRequest(request: JSONRPCMessage): Promise<JSONRPCMessage> {
    const p = new Promise<JSONRPCMessage>((resolve) => {
      const originalSend = this.send.bind(this);
      this.send = async (msg) => {
        await originalSend(msg);
        if ("id" in msg && (msg as any).id === (request as any).id) {
          resolve(msg);
        }
      };
    });

    this.onmessage?.(request);
    return p;
  }
}

/**
 * Test suite for Constraint Solver MCP Server.
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
 */
describe("Tool Registration", () => {
  it("should advertise constraintSolver tool", async () => {
    const server = createServer();
    const transport = new MockTransport();
    await server.connect(transport);

    const response = (await transport.sendRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    })) as any;

    expect(response.result.tools).toHaveLength(1);
    expect(response.result.tools[0].name).toBe("constraintSolver");
    expect(response.result.tools[0].description).toContain("Checks if a set of variables satisfies all constraints");
  });
});

/**
 * Constraint Solving Tests - Satisfied Constraints.
 */
describe("Constraint Solving - Satisfied Constraints", () => {
  let solver: ConstraintMcpServer;

  beforeEach(() => {
    solver = new ConstraintMcpServer();
  });

  it("should solve satisfied simple constraint", async () => {
    const input = {
      variables: { x: 5, y: 10 },
      constraints: ["x < y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(true);
  });

  it("should handle complex arithmetic constraints", async () => {
    const input = {
      variables: { a: 5, b: 3, c: 15 },
      constraints: ["a * b == c", "c / a == b"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(true);
  });
});

/**
 * Constraint Solving Tests - Unsatisfied Constraints.
 */
describe("Constraint Solving - Unsatisfied Constraints", () => {
  let solver: ConstraintMcpServer;

  beforeEach(() => {
    solver = new ConstraintMcpServer();
  });

  it("should detect unsatisfied simple constraint", async () => {
    const input = {
      variables: { x: 10, y: 5 },
      constraints: ["x < y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(false);
    expect(parsed.unsatisfied).toHaveLength(1);
    expect(parsed.unsatisfied[0]).toBe("y < z");
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  let solver: ConstraintMcpServer;

  beforeEach(() => {
    solver = new ConstraintMcpServer();
  });

  it("should reject null input", async () => {
    const result = await solver.process(null);
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("Invalid input");
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
 */
describe("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("handles valid constraint solving request", async () => {
    const server = createServer();
    const transport = new MockTransport();
    await server.connect(transport);

    const response = (await transport.sendRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "constraintSolver",
        arguments: {
          variables: { x: 5, y: 10 },
          constraints: ["x < y"]
        }
      }
    })) as any;

    expect(response.error).toBeUndefined();
    expect(response.result.content[0].text).toBeDefined();
    const parsed = JSON.parse(response.result.content[0].text);
    expect(parsed.satisfied).toBe(true);
  });

  it("rejects unknown tool name", async () => {
    const server = createServer();
    const transport = new MockTransport();
    await server.connect(transport);

    const response = (await transport.sendRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "unknownTool",
        arguments: {}
      }
    })) as any;

    // Expect either a JSON-RPC error or a result with isError: true
    if (response.result) {
      expect(response.result.isError).toBe(true);
      expect(response.result.content[0].text).toContain("Unknown tool");
    } else {
      expect(response.error).toBeDefined();
    }
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let solver: ConstraintMcpServer;

  beforeEach(() => {
    solver = new ConstraintMcpServer();
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
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
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(true);
  });

  it("handles complex boolean expressions", async () => {
    const input = {
      variables: { a: 5, b: 10, c: 15 },
      constraints: ["(a < b) && (b < c)", "a + b < c + 5"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(true);
  });

  it("handles malformed expressions gracefully", async () => {
    const input = {
      variables: { x: 5 },
      constraints: ["x <<< y"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(false);
  });

  it("handles zero and negative values", async () => {
    const input = {
      variables: { x: 0, y: -5, z: 10 },
      constraints: ["x > y", "z > x"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(true);
  });

  it("handles floating point values", async () => {
    const input = {
      variables: { x: 3.14, y: 2.71 },
      constraints: ["x > y", "x + y > 5"]
    };
    const result = await solver.process(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse((result.content[0] as TextContent).text);
    expect(parsed.satisfied).toBe(true);
  });
});
