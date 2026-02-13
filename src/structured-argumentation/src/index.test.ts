import { describe, expect, it, beforeEach } from "bun:test";
import { StructuredArgumentation } from "./codemode/index.js";
import { createServer } from "./mcp/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListToolsResult, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

describe("Structured Argumentation (Code Mode)", () => {
  let argumentation: StructuredArgumentation;

  beforeEach(() => {
    argumentation = new StructuredArgumentation();
  });

  it("should initialize successfully", () => {
    expect(argumentation).toBeDefined();
  });

  describe("Input Validation", () => {
    it("should reject null input", () => {
      expect(argumentation.processArgument(null)).rejects.toThrow();
    });

    it("should reject missing claim", () => {
      const input = {
        premises: ["Premise 1"],
        conclusion: "Conclusion",
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: false
      };
      expect(argumentation.processArgument(input)).rejects.toThrow("Invalid claim");
    });

    it("should reject missing premises", () => {
      const input = {
        claim: "Test claim",
        conclusion: "Conclusion",
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: false
      };
      expect(argumentation.processArgument(input)).rejects.toThrow("Invalid premises");
    });

    it("should reject missing conclusion", () => {
      const input = {
        claim: "Test claim",
        premises: ["Premise 1"],
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: false
      };
      expect(argumentation.processArgument(input)).rejects.toThrow("Invalid conclusion");
    });

    it("should reject missing argumentType", () => {
      const input = {
        claim: "Test claim",
        premises: ["Premise 1"],
        conclusion: "Conclusion",
        confidence: 0.8,
        nextArgumentNeeded: false
      };
      expect(argumentation.processArgument(input)).rejects.toThrow("Invalid argumentType");
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
      expect(argumentation.processArgument(input)).rejects.toThrow("Invalid confidence");
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
      expect(argumentation.processArgument(input)).rejects.toThrow("Invalid confidence");
    });
  });

  describe("Core Functionality", () => {
    it("should process valid input successfully", async () => {
      const validInput = {
        claim: "AI will transform education",
        premises: ["AI can personalize learning", "AI provides instant feedback"],
        conclusion: "Therefore, education will be transformed",
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: false
      };
      const result = await argumentation.processArgument(validInput);
      expect(result.argumentId).toBeDefined();
      expect(result.argumentType).toBe("thesis");
    });

    it("should handle all argument types", async () => {
      const types = ["thesis", "antithesis", "synthesis", "objection", "rebuttal"] as const;
      for (const type of types) {
        const input = {
          claim: `Claim for ${type}`,
          premises: [`Premise for ${type}`],
          conclusion: `Conclusion for ${type}`,
          argumentType: type,
          confidence: 0.7,
          nextArgumentNeeded: false
        };
        const result = await argumentation.processArgument(input);
        expect(result.argumentType).toBe(type);
      }
    });

    it("should handle argument chains and relationships", async () => {
      const arg1 = await argumentation.processArgument({
        claim: "Initial thesis",
        premises: ["Initial premise"],
        conclusion: "Initial conclusion",
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: true
      });
      expect(arg1.argumentId).toBe("arg-1");

      const arg2 = await argumentation.processArgument({
        claim: "Counter argument",
        premises: ["Counter premise"],
        conclusion: "Counter conclusion",
        argumentType: "antithesis",
        confidence: 0.7,
        nextArgumentNeeded: true,
        respondsTo: "arg-1"
      });
      expect(arg2.argumentId).toBe("arg-2");

      const arg3 = await argumentation.processArgument({
        claim: "Synthesis",
        premises: ["Synthesis premise"],
        conclusion: "Synthesis conclusion",
        argumentType: "synthesis",
        confidence: 0.9,
        nextArgumentNeeded: false,
        supports: ["arg-1"],
        contradicts: ["arg-2"]
      });
      expect(arg3.argumentId).toBe("arg-3");
      expect(arg3.relationshipCount).toBeGreaterThan(0);
    });
  });
});

describe("MCP Server Integration", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  // Note: Full integration tests are skipped because createTestClient provides mocks
  // instead of actual server execution. Code Mode tests cover the logic.
});

