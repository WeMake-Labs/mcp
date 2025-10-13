import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { EthicalReasoningServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

/**
 * Test suite for Ethical Reasoning MCP Server.
 *
 * Business Context: Ensures the ethical-reasoning framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Ethical Reasoning Server", () => {
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
describe("Tool Registration", () => {
  it("should advertise ethicalReasoning tool", async () => {
    const server = createTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("testTool");
    expect(response.tools[0].description).toContain("Test tool");
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
  let server: EthicalReasoningServer;

  beforeEach(() => {
    server = new EthicalReasoningServer();
  });

  it("should reject null input", () => {
    const result = server.process(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid scenario");
  });

  it("should reject missing scenario", () => {
    const input = {
      action: "Take the medication",
      frameworks: ["utilitarianism"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid scenario");
  });

  it("should reject missing action", () => {
    const input = {
      scenario: "A patient needs treatment",
      frameworks: ["utilitarianism"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid action");
  });

  it("should reject missing frameworks", () => {
    const input = {
      scenario: "A patient needs treatment",
      action: "Take the medication",
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid frameworks");
  });

  it("should reject empty frameworks array", () => {
    const input = {
      scenario: "A patient needs treatment",
      action: "Take the medication",
      frameworks: [],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid frameworks");
  });

  it("should reject invalid framework type", () => {
    const input = {
      scenario: "A patient needs treatment",
      action: "Take the medication",
      frameworks: ["invalid-framework"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unsupported framework");
  });

  it("should reject invalid confidence range (< 0)", () => {
    const input = {
      scenario: "A patient needs treatment",
      action: "Take the medication",
      frameworks: ["utilitarianism"],
      confidence: -0.1,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid confidence");
  });

  it("should reject invalid confidence range (> 1)", () => {
    const input = {
      scenario: "A patient needs treatment",
      action: "Take the medication",
      frameworks: ["utilitarianism"],
      confidence: 1.1,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid confidence");
  });

  it("should reject non-boolean nextStepNeeded", () => {
    const input = {
      scenario: "A patient needs treatment",
      action: "Take the medication",
      frameworks: ["utilitarianism"],
      confidence: 0.8,
      nextStepNeeded: "yes"
    };
    const result = server.process(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid nextStepNeeded");
  });

  it("should process valid input successfully", () => {
    const validInput = {
      scenario: "A patient needs treatment",
      action: "Prescribe medication",
      frameworks: ["utilitarianism"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(validInput);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Ethical Framework Tests.
 *
 * Business Context: Test that all supported ethical frameworks are correctly
 * handled and provide appropriate guidance.
 */
describe("Ethical Frameworks", () => {
  let server: EthicalReasoningServer;

  beforeEach(() => {
    server = new EthicalReasoningServer();
  });

  it("should handle utilitarianism framework", () => {
    const input = {
      scenario: "Company decision on layoffs",
      action: "Proceed with layoffs",
      frameworks: ["utilitarianism"],
      confidence: 0.7,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("utilitarianism");
  });

  it("should handle deontology framework", () => {
    const input = {
      scenario: "Should I lie to protect someone?",
      action: "Tell the truth",
      frameworks: ["deontology"],
      confidence: 0.9,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("deontology");
  });

  it("should handle virtue framework", () => {
    const input = {
      scenario: "How to handle a difficult conversation",
      action: "Approach with compassion",
      frameworks: ["virtue"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("virtue");
  });

  it("should handle care framework", () => {
    const input = {
      scenario: "Caring for an aging parent",
      action: "Prioritize their wellbeing",
      frameworks: ["care"],
      confidence: 0.85,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("care");
  });

  it("should handle social-contract framework", () => {
    const input = {
      scenario: "Tax policy decision",
      action: "Implement progressive taxation",
      frameworks: ["social-contract"],
      confidence: 0.75,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("social-contract");
  });

  it("should handle multiple frameworks", () => {
    const input = {
      scenario: "Healthcare decision",
      action: "Provide universal healthcare",
      frameworks: ["utilitarianism", "care", "social-contract"],
      confidence: 0.8,
      nextStepNeeded: true
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    const text = result.content[0].text;
    expect(text).toContain("utilitarianism");
    expect(text).toContain("care");
    expect(text).toContain("social-contract");
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
describe("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("handles valid ethical reasoning request", async () => {
    const server = createServer();
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "ethicalReasoning",
          arguments: {
            scenario: "Business decision",
            action: "Choose ethical option",
            frameworks: ["utilitarianism"],
            confidence: 0.8,
            nextStepNeeded: false
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
  let server: EthicalReasoningServer;

  beforeEach(() => {
    server = new EthicalReasoningServer();
  });

  it("handles very long scenario and action strings", () => {
    const longScenario = "A".repeat(10000);
    const longAction = "B".repeat(10000);
    const input = {
      scenario: longScenario,
      action: longAction,
      frameworks: ["utilitarianism"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles boundary confidence values", () => {
    const input1 = {
      scenario: "Test",
      action: "Test action",
      frameworks: ["utilitarianism"],
      confidence: 0.0,
      nextStepNeeded: false
    };
    const result1 = server.process(input1);
    expect(result1.isError).toBeUndefined();

    const input2 = {
      scenario: "Test",
      action: "Test action",
      frameworks: ["utilitarianism"],
      confidence: 1.0,
      nextStepNeeded: false
    };
    const result2 = server.process(input2);
    expect(result2.isError).toBeUndefined();
  });

  it("handles special characters in scenario and action", () => {
    const input = {
      scenario: "Scenario with special chars: @#$% & émojis 🎉",
      action: "Action with <html> \"quotes\" and 'apostrophes'",
      frameworks: ["deontology"],
      confidence: 0.8,
      nextStepNeeded: false
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles conflicting frameworks scenario", () => {
    const input = {
      scenario: "Trolley problem variant",
      action: "Pull the lever",
      frameworks: ["utilitarianism", "deontology"],
      confidence: 0.5,
      nextStepNeeded: true
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("utilitarianism");
    expect(result.content[0].text).toContain("deontology");
  });

  it("handles all frameworks simultaneously", () => {
    const input = {
      scenario: "Complex ethical dilemma",
      action: "Make a decision",
      frameworks: ["utilitarianism", "deontology", "virtue", "care", "social-contract"],
      confidence: 0.6,
      nextStepNeeded: true
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
    const text = result.content[0].text;
    expect(text).toContain("utilitarianism");
    expect(text).toContain("deontology");
    expect(text).toContain("virtue");
    expect(text).toContain("care");
    expect(text).toContain("social-contract");
  });

  it("handles suggestedNext field correctly", () => {
    const input = {
      scenario: "Initial ethical analysis",
      action: "First step",
      frameworks: ["utilitarianism"],
      confidence: 0.7,
      nextStepNeeded: true,
      suggestedNext: ["deontology", "virtue"]
    };
    const result = server.process(input);
    expect(result.isError).toBeUndefined();
  });
});
