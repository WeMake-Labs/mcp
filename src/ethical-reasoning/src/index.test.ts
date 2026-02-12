import { describe, expect, it, beforeEach } from "bun:test";
import { createServer } from "./mcp/server.js";
import { EthicalReasoningAPI } from "./codemode/index.js";

/**
 * Test suite for Ethical Reasoning Code Mode API.
 */
describe("Ethical Reasoning API (Code Mode)", () => {
  let api: EthicalReasoningAPI;

  beforeEach(() => {
    api = new EthicalReasoningAPI();
  });

  it("initializes successfully", () => {
    expect(api).toBeDefined();
  });

  describe("Input Validation", () => {
    it("should reject null input", () => {
      expect(api.analyze(null)).rejects.toThrow("null is not an object");
    });

    it("should reject missing scenario", () => {
      const input = {
        action: "Take the medication",
        frameworks: ["utilitarianism"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid scenario");
    });

    it("should reject missing action", () => {
      const input = {
        scenario: "A patient needs treatment",
        frameworks: ["utilitarianism"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid action");
    });

    it("should reject missing frameworks", () => {
      const input = {
        scenario: "A patient needs treatment",
        action: "Take the medication",
        confidence: 0.8,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid frameworks");
    });

    it("should reject empty frameworks array", () => {
      const input = {
        scenario: "A patient needs treatment",
        action: "Take the medication",
        frameworks: [],
        confidence: 0.8,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid frameworks");
    });

    it("should reject invalid framework type", () => {
      const input = {
        scenario: "A patient needs treatment",
        action: "Take the medication",
        frameworks: ["invalid-framework"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Unsupported framework");
    });

    it("should reject invalid confidence range (< 0)", () => {
      const input = {
        scenario: "A patient needs treatment",
        action: "Take the medication",
        frameworks: ["utilitarianism"],
        confidence: -0.1,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid confidence");
    });

    it("should reject invalid confidence range (> 1)", () => {
      const input = {
        scenario: "A patient needs treatment",
        action: "Take the medication",
        frameworks: ["utilitarianism"],
        confidence: 1.1,
        nextStepNeeded: false
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid confidence");
    });

    it("should reject non-boolean nextStepNeeded", () => {
      const input = {
        scenario: "A patient needs treatment",
        action: "Take the medication",
        frameworks: ["utilitarianism"],
        confidence: 0.8,
        nextStepNeeded: "yes"
      };
      expect(api.analyze(input)).rejects.toThrow("Invalid nextStepNeeded");
    });
  });

  describe("Ethical Frameworks", () => {
    it("should process valid input successfully", async () => {
      const validInput = {
        scenario: "A patient needs treatment",
        action: "Prescribe medication",
        frameworks: ["utilitarianism"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      const result = await api.analyze(validInput);
      expect(result).toBeDefined();
      expect(result.frameworks).toContain("utilitarianism");
      expect(result.guidance["utilitarianism"]).toBeDefined();
    });

    it("should handle utilitarianism framework", async () => {
      const input = {
        scenario: "Company decision on layoffs",
        action: "Proceed with layoffs",
        frameworks: ["utilitarianism"],
        confidence: 0.7,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result.guidance["utilitarianism"]).toContain("Consider total expected benefits");
    });

    it("should handle deontology framework", async () => {
      const input = {
        scenario: "Should I lie to protect someone?",
        action: "Tell the truth",
        frameworks: ["deontology"],
        confidence: 0.9,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result.guidance["deontology"]).toContain("Identify the relevant duties");
    });

    it("should handle virtue framework", async () => {
      const input = {
        scenario: "How to handle a difficult conversation",
        action: "Approach with compassion",
        frameworks: ["virtue"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result.guidance["virtue"]).toContain("Examine what virtues or vices");
    });

    it("should handle care framework", async () => {
      const input = {
        scenario: "Caring for an aging parent",
        action: "Prioritize their wellbeing",
        frameworks: ["care"],
        confidence: 0.85,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result.guidance["care"]).toContain("Assess how relationships");
    });

    it("should handle social-contract framework", async () => {
      const input = {
        scenario: "Tax policy decision",
        action: "Implement progressive taxation",
        frameworks: ["social-contract"],
        confidence: 0.75,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result.guidance["social-contract"]).toContain("Evaluate whether the action");
    });

    it("should handle multiple frameworks", async () => {
      const input = {
        scenario: "Healthcare decision",
        action: "Provide universal healthcare",
        frameworks: ["utilitarianism", "care", "social-contract"],
        confidence: 0.8,
        nextStepNeeded: true
      };
      const result = await api.analyze(input);
      expect(result.frameworks).toHaveLength(3);
      expect(result.guidance["utilitarianism"]).toBeDefined();
      expect(result.guidance["care"]).toBeDefined();
      expect(result.guidance["social-contract"]).toBeDefined();
    });
  });

  describe("Edge Cases and Performance", () => {
    it("handles very long scenario and action strings", async () => {
      const longScenario = "A".repeat(10000);
      const longAction = "B".repeat(10000);
      const input = {
        scenario: longScenario,
        action: longAction,
        frameworks: ["utilitarianism"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result).toBeDefined();
      expect(result.guidance["utilitarianism"]).toBeDefined();
    });

    it("handles boundary confidence values", async () => {
      const input1 = {
        scenario: "Test",
        action: "Test action",
        frameworks: ["utilitarianism"],
        confidence: 0.0,
        nextStepNeeded: false
      };
      await expect(api.analyze(input1)).resolves.toBeDefined();

      const input2 = {
        scenario: "Test",
        action: "Test action",
        frameworks: ["utilitarianism"],
        confidence: 1.0,
        nextStepNeeded: false
      };
      await expect(api.analyze(input2)).resolves.toBeDefined();
    });

    it("handles special characters in scenario and action", async () => {
      const input = {
        scenario: "Scenario with special chars: @#$% & émojis 🎉",
        action: "Action with <html> \"quotes\" and 'apostrophes'",
        frameworks: ["deontology"],
        confidence: 0.8,
        nextStepNeeded: false
      };
      const result = await api.analyze(input);
      expect(result).toBeDefined();
    });

    it("handles suggestedNext field correctly", async () => {
      const input = {
        scenario: "Initial ethical analysis",
        action: "First step",
        frameworks: ["utilitarianism"],
        confidence: 0.7,
        nextStepNeeded: true,
        suggestedNext: ["deontology", "virtue"]
      };
      const result = await api.analyze(input);
      expect(result.suggestedNext).toHaveLength(2);
      expect(result.suggestedNext).toContain("deontology");
    });
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
});
