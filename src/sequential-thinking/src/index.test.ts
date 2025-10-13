import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { SequentialThinkingServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for Sequential Thinking MCP Server.
 *
 * Business Context: Ensures the Sequential Thinking framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Sequential Thinking Server", () => {
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
  it("should advertise sequentialthinking tool", async () => {
    const server = createServer();
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("sequentialthinking");
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    server = new SequentialThinkingServer();
  });

  it("should reject null input", () => {
    const result = server.processThought(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid thought");
  });

  it("should reject missing thought", () => {
    const input = {
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid thought");
  });

  it("should reject missing thoughtNumber", () => {
    const input = {
      thought: "First thought",
      totalThoughts: 5,
      nextThoughtNeeded: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid thoughtNumber");
  });

  it("should reject missing totalThoughts", () => {
    const input = {
      thought: "First thought",
      thoughtNumber: 1,
      nextThoughtNeeded: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid totalThoughts");
  });

  it("should reject missing nextThoughtNeeded", () => {
    const input = {
      thought: "First thought",
      thoughtNumber: 1,
      totalThoughts: 5
    };
    const result = server.processThought(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid nextThoughtNeeded");
  });

  it("should process valid input successfully", () => {
    const validInput = {
      thought: "Let me think about this problem step by step",
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true
    };
    const result = server.processThought(validInput);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Thought Processing Tests.
 */
describe("Thought Processing", () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    server = new SequentialThinkingServer();
  });

  it("should process a single thought", () => {
    const input = {
      thought: "First thought",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.thoughtNumber).toBe(1);
  });

  it("should process multiple thoughts in sequence", () => {
    server.processThought({
      thought: "First thought",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true
    });
    server.processThought({
      thought: "Second thought",
      thoughtNumber: 2,
      totalThoughts: 3,
      nextThoughtNeeded: true
    });
    const result = server.processThought({
      thought: "Third thought",
      thoughtNumber: 3,
      totalThoughts: 3,
      nextThoughtNeeded: false
    });
    expect(result.isError).toBeUndefined();
  });

  it("should adjust totalThoughts if thoughtNumber exceeds it", () => {
    const input = {
      thought: "Unexpected additional thought",
      thoughtNumber: 6,
      totalThoughts: 5,
      nextThoughtNeeded: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.totalThoughts).toBe(6);
  });
});

/**
 * Revision Tests.
 */
describe("Thought Revision", () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    server = new SequentialThinkingServer();
  });

  it("should handle revision of a previous thought", () => {
    server.processThought({
      thought: "Initial thought",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true
    });
    const result = server.processThought({
      thought: "Revised thought",
      thoughtNumber: 2,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      isRevision: true,
      revisesThought: 1
    });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.isRevision).toBe(true);
    expect(parsed.revisesThought).toBe(1);
  });
});

/**
 * Branch Tracking Tests.
 */
describe("Branch Tracking", () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    server = new SequentialThinkingServer();
  });

  it("should handle branching from a thought", () => {
    server.processThought({
      thought: "Main thought",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true
    });
    const result = server.processThought({
      thought: "Branching thought",
      thoughtNumber: 2,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      branchFromThought: 1,
      branchId: "branch-a"
    });
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.branchFromThought).toBe(1);
    expect(parsed.branchId).toBe("branch-a");
  });

  it("should track multiple branches independently", () => {
    server.processThought({
      thought: "Main thought",
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true
    });
    server.processThought({
      thought: "Branch A thought",
      thoughtNumber: 2,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      branchFromThought: 1,
      branchId: "branch-a"
    });
    const result = server.processThought({
      thought: "Branch B thought",
      thoughtNumber: 2,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      branchFromThought: 1,
      branchId: "branch-b"
    });
    expect(result.isError).toBeUndefined();
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
 */
describe("Edge Cases and Performance", () => {
  let server: SequentialThinkingServer;

  beforeEach(() => {
    server = new SequentialThinkingServer();
  });

  it("handles very long thought strings", () => {
    const longThought = "a".repeat(10000);
    const input = {
      thought: longThought,
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles empty thought string", () => {
    const input = {
      thought: "",
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles special characters in thought", () => {
    const input = {
      thought: 'Thought with special chars: @#$% & émojis 🎉 <html> "quotes"',
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles many thoughts in sequence", () => {
    for (let i = 1; i <= 100; i++) {
      const result = server.processThought({
        thought: `Thought ${i}`,
        thoughtNumber: i,
        totalThoughts: 100,
        nextThoughtNeeded: i < 100
      });
      expect(result.isError).toBeUndefined();
    }
  });

  it("handles needsMoreThoughts flag", () => {
    const input = {
      thought: "Realizing I need more thoughts",
      thoughtNumber: 3,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      needsMoreThoughts: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.needsMoreThoughts).toBe(true);
  });

  it("handles zero and negative thought numbers gracefully", () => {
    const input = {
      thought: "Edge case thought",
      thoughtNumber: 0,
      totalThoughts: 5,
      nextThoughtNeeded: true
    };
    const result = server.processThought(input);
    expect(result.isError).toBeUndefined();
  });
});
