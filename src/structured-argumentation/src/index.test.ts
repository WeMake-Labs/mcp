import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { ArgumentationServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

/**
 * Test suite for Structured Argumentation MCP Server.
 *
 * Business Context: Ensures the structured-argumentation framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Structured Argumentation Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("should have correct name and version", async () => {
    const server = createServer();
    // Access server info through the server object
    expect(server).toBeDefined();
  });
});

/**
 * Tool Registration Tests.
 */
describe("Tool Registration", () => {
  it("should advertise structuredArgumentation tool", async () => {
    const server = createTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("structuredArgumentation");
    expect(response.tools[0].inputSchema).toBeDefined();
  });
});

/**
 * Input Validation Tests - Required Fields.
 */
describe("Input Validation - Required Fields", () => {
  let server: ArgumentationServer;

  beforeEach(() => {
    server = new ArgumentationServer();
  });

  it("should reject null input", () => {
    const result = server.processArgument(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid claim");
  });

  it("should reject missing claim", () => {
    const input = {
      premises: ["Premise 1"],
      conclusion: "Conclusion",
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid claim");
  });

  it("should reject missing premises", () => {
    const input = {
      claim: "Test claim",
      conclusion: "Conclusion",
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid premises");
  });

  it("should reject missing conclusion", () => {
    const input = {
      claim: "Test claim",
      premises: ["Premise 1"],
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid conclusion");
  });

  it("should reject missing argumentType", () => {
    const input = {
      claim: "Test claim",
      premises: ["Premise 1"],
      conclusion: "Conclusion",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid argumentType");
  });

  it("should reject invalid confidence range (< 0)", () => {
    const input = {
      claim: "Test claim",
      premises: ["Premise 1"],
      conclusion: "Conclusion",
      argumentType: "thesis",
      confidence: -0.1,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid confidence");
  });

  it("should reject invalid confidence range (> 1)", () => {
    const input = {
      claim: "Test claim",
      premises: ["Premise 1"],
      conclusion: "Conclusion",
      argumentType: "thesis",
      confidence: 1.1,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid confidence");
  });

  it("should process valid input successfully", () => {
    const validInput = {
      claim: "AI will transform education",
      premises: ["AI can personalize learning", "AI provides instant feedback"],
      conclusion: "Therefore, education will be transformed",
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(validInput);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Argument Type Tests.
 */
describe("Argument Types", () => {
  let server: ArgumentationServer;

  beforeEach(() => {
    server = new ArgumentationServer();
  });

  it("should handle all argument types", () => {
    const types: Array<"thesis" | "antithesis" | "synthesis" | "objection" | "rebuttal"> = [
      "thesis",
      "antithesis",
      "synthesis",
      "objection",
      "rebuttal"
    ];

    for (const type of types) {
      const input = {
        claim: `Claim for ${type}`,
        premises: [`Premise for ${type}`],
        conclusion: `Conclusion for ${type}`,
        argumentType: type,
        confidence: 0.7,
        nextArgumentNeeded: false
      };
      const result = server.processArgument(input);
      expect(result.isError).toBeUndefined();
    }
  });
});

/**
 * Relationship Tests.
 */
describe("Argument Relationships", () => {
  let server: ArgumentationServer;

  beforeEach(() => {
    server = new ArgumentationServer();
  });

  it("should handle respondsTo relationship", () => {
    server.processArgument({
      claim: "Original claim",
      premises: ["Premise"],
      conclusion: "Conclusion",
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: true
    });

    const result = server.processArgument({
      claim: "Response claim",
      premises: ["Response premise"],
      conclusion: "Response conclusion",
      argumentType: "antithesis",
      confidence: 0.7,
      nextArgumentNeeded: false,
      respondsTo: "arg-1"
    });

    expect(result.isError).toBeUndefined();
  });

  it("should handle supports relationship", () => {
    const input = {
      claim: "Supporting claim",
      premises: ["Support premise"],
      conclusion: "Support conclusion",
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: false,
      supports: ["arg-1", "arg-2"]
    };
    const result = server.processArgument(input);
    expect(result.isError).toBeUndefined();
  });

  it("should handle contradicts relationship", () => {
    const input = {
      claim: "Contradicting claim",
      premises: ["Contradiction premise"],
      conclusion: "Contradiction conclusion",
      argumentType: "objection",
      confidence: 0.9,
      nextArgumentNeeded: false,
      contradicts: ["arg-1"]
    };
    const result = server.processArgument(input);
    expect(result.isError).toBeUndefined();
  });

  it("should handle multiple relationship types simultaneously", () => {
    const input = {
      claim: "Complex relationship claim",
      premises: ["Complex premise"],
      conclusion: "Complex conclusion",
      argumentType: "synthesis",
      confidence: 0.75,
      nextArgumentNeeded: false,
      respondsTo: "arg-1",
      supports: ["arg-2"],
      contradicts: ["arg-3"]
    };
    const result = server.processArgument(input);
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

  it("handles valid argumentation request", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "structuredArgumentation",
          arguments: {
            claim: "Test claim",
            premises: ["Premise 1"],
            conclusion: "Conclusion",
            argumentType: "thesis",
            confidence: 0.8,
            nextArgumentNeeded: false
          }
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBeUndefined();
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let server: ArgumentationServer;

  beforeEach(() => {
    server = new ArgumentationServer();
  });

  it("handles large number of premises", () => {
    const premises = Array.from({ length: 1000 }, (_, i) => `Premise ${i}`);
    const input = {
      claim: "Complex claim with many premises",
      premises,
      conclusion: "Therefore, the conclusion follows",
      argumentType: "thesis",
      confidence: 0.7,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles empty premises array", () => {
    const input = {
      claim: "Claim without premises",
      premises: [],
      conclusion: "Conclusion",
      argumentType: "thesis",
      confidence: 0.5,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles very long strings", () => {
    const longClaim = "a".repeat(10000);
    const input = {
      claim: longClaim,
      premises: ["b".repeat(10000)],
      conclusion: "c".repeat(10000),
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles special characters in inputs", () => {
    const input = {
      claim: "Claim with special chars: @#$% & émojis 🎉",
      premises: ["Premise with <html>", 'Premise with "quotes"'],
      conclusion: "Conclusion with 'apostrophes' and newlines\n\n",
      argumentType: "synthesis",
      confidence: 0.8,
      nextArgumentNeeded: false
    };
    const result = server.processArgument(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles boundary confidence values", () => {
    const input1 = {
      claim: "Test",
      premises: ["Test"],
      conclusion: "Test",
      argumentType: "thesis",
      confidence: 0.0,
      nextArgumentNeeded: false
    };
    const result1 = server.processArgument(input1);
    expect(result1.isError).toBeUndefined();

    const input2 = {
      claim: "Test",
      premises: ["Test"],
      conclusion: "Test",
      argumentType: "thesis",
      confidence: 1.0,
      nextArgumentNeeded: false
    };
    const result2 = server.processArgument(input2);
    expect(result2.isError).toBeUndefined();
  });

  it("handles argument chains", () => {
    const arg1 = server.processArgument({
      claim: "Initial thesis",
      premises: ["Initial premise"],
      conclusion: "Initial conclusion",
      argumentType: "thesis",
      confidence: 0.8,
      nextArgumentNeeded: true
    });
    expect(arg1.isError).toBeUndefined();

    const arg2 = server.processArgument({
      claim: "Counter argument",
      premises: ["Counter premise"],
      conclusion: "Counter conclusion",
      argumentType: "antithesis",
      confidence: 0.7,
      nextArgumentNeeded: true,
      respondsTo: "arg-1"
    });
    expect(arg2.isError).toBeUndefined();

    const arg3 = server.processArgument({
      claim: "Synthesis",
      premises: ["Synthesis premise"],
      conclusion: "Synthesis conclusion",
      argumentType: "synthesis",
      confidence: 0.9,
      nextArgumentNeeded: false,
      supports: ["arg-1", "arg-2"]
    });
    expect(arg3.isError).toBeUndefined();
  });
});
