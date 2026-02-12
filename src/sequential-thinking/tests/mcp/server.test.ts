import { describe, expect, it } from "bun:test";
import createServer from "../../src/mcp/server.js";
import { SEQUENTIAL_THINKING_TOOL } from "../../src/mcp/tools.js";

describe("Sequential Thinking MCP Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  describe("Tool Definition", () => {
    it("should have correct tool name", () => {
      expect(SEQUENTIAL_THINKING_TOOL.name).toBe("sequentialthinking");
    });

    it("should have correct input schema", () => {
      expect(SEQUENTIAL_THINKING_TOOL.inputSchema.required).toContain("thought");
      expect(SEQUENTIAL_THINKING_TOOL.inputSchema.required).toContain("nextThoughtNeeded");
      expect(SEQUENTIAL_THINKING_TOOL.inputSchema.required).toContain("thoughtNumber");
      expect(SEQUENTIAL_THINKING_TOOL.inputSchema.required).toContain("totalThoughts");
    });
  });
});
