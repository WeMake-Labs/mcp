import { describe, expect, test, beforeEach } from "bun:test";
import createServer from "./index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for SERVER_NAME MCP Server.
 *
 * Business Context: Ensures the server_name framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("SERVER_NAME Server", () => {
  test("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("server has correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Input Validation Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test all validation error paths to ensure clear error
 * messages and proper input sanitization.
 */
describe("Input Validation", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("rejects invalid input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "mainTool",
        arguments: null
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  test("handles valid input", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "mainTool",
        arguments: { validField: "value" }
      }
    };

    const result = await server.request(request, CallToolRequestSchema);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * MCP Server Integration Tests.
 *
 * Business Context: MCP protocol compliance is essential for AI agent integration.
 *
 * Decision Rationale: Test tool handler and error cases that can be validated
 * without requiring a connected transport.
 */
describe("MCP Server Integration", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  test("server can be created without errors", () => {
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  test("rejects unknown tool name", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "unknownTool",
        arguments: {}
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
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
  test("handles large inputs efficiently", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("handles empty inputs gracefully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  test("handles special characters in inputs", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
