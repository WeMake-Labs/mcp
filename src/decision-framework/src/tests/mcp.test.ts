import { describe, expect, it } from "bun:test";
import { DecisionFrameworkMCPServer } from "../mcp/server.js";
import { DECISION_FRAMEWORK_TOOL } from "../mcp/tools.js";

/**
 * MCP Server Integration Tests.
 */
describe("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = new DecisionFrameworkMCPServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("exports correct tool definition", () => {
    expect(DECISION_FRAMEWORK_TOOL.name).toBe("decisionFramework");
    expect(DECISION_FRAMEWORK_TOOL.inputSchema.properties?.decisionStatement).toBeDefined();
  });
});
