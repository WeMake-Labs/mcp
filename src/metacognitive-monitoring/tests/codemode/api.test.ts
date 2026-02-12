import { describe, expect, it } from "bun:test";
import { metacognitive, MetacognitiveCodeMode, MetacognitiveMonitoringData } from "../../src/codemode/index.js";

describe("Metacognitive Code Mode API", () => {
  it("should expose a default instance", () => {
    expect(metacognitive).toBeDefined();
    expect(typeof metacognitive.monitor).toBe("function");
  });

  it("should allow creating new instances", () => {
    const api = new MetacognitiveCodeMode();
    expect(api).toBeInstanceOf(MetacognitiveCodeMode);
  });

  it("should perform monitoring with fully populated valid input", async () => {
    const input: MetacognitiveMonitoringData = {
      task: "Code Mode Test",
      stage: "execution",
      overallConfidence: 0.9,
      uncertaintyAreas: [],
      recommendedApproach: "Execute",
      monitoringId: "cm-1",
      iteration: 1,
      nextAssessmentNeeded: false,
      // Optional fields
      knowledgeAssessment: {
        domain: "Test Domain",
        knowledgeLevel: "expert",
        confidenceScore: 0.95,
        supportingEvidence: "Test Evidence",
        knownLimitations: []
      }
    };

    const result = await metacognitive.monitor(input);
    expect(result.task).toBe("Code Mode Test");
    expect(result.stage).toBe("execution");
    expect(result.monitoringId).toBe("cm-1");
    expect(result.hasKnowledgeAssessment).toBe(true);
  });

  it("should throw clear error when required fields are missing (simulating type bypass)", async () => {
    // We cast to unknown to simulate a user bypassing TypeScript checks or passing data from an untyped source
    const input = {
      task: "Invalid Input"
      // Missing required fields like stage, overallConfidence, etc.
    } as unknown as MetacognitiveMonitoringData;

    // Expect the analyzer to throw a validation error
    // The error message comes from the analyzer: "Invalid stage: must be a string" (since it checks task then stage)
    await expect(metacognitive.monitor(input)).rejects.toThrow("Invalid stage");
  });

  it("should throw error when fields have invalid types", async () => {
    const input = {
      task: "Type Mismatch Test",
      stage: "execution",
      overallConfidence: "high", // Should be number
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    } as unknown as MetacognitiveMonitoringData;

    await expect(metacognitive.monitor(input)).rejects.toThrow("Invalid overallConfidence");
  });
});
