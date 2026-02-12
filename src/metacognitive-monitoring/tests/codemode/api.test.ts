import { describe, expect, it } from "bun:test";
import { metacognitive, MetacognitiveCodeMode } from "../../src/codemode/index.js";

describe("Metacognitive Code Mode API", () => {
  it("should expose a default instance", () => {
    expect(metacognitive).toBeDefined();
    expect(typeof metacognitive.monitor).toBe("function");
  });

  it("should allow creating new instances", () => {
    const api = new MetacognitiveCodeMode();
    expect(api).toBeInstanceOf(MetacognitiveCodeMode);
  });

  it("should perform monitoring via API", async () => {
    const input = {
      task: "Code Mode Test",
      stage: "execution" as const,
      overallConfidence: 0.9,
      uncertaintyAreas: [],
      recommendedApproach: "Execute",
      monitoringId: "cm-1",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = await metacognitive.monitor(input);
    expect(result.task).toBe("Code Mode Test");
    expect(result.stage).toBe("execution");
    expect(result.monitoringId).toBe("cm-1");
  });

  it("should throw error for invalid input", async () => {
    const input = {
      task: "Invalid Input"
      // Missing required fields
    };

    // Note: Since monitor is async, we expect it to reject
    expect(metacognitive.monitor(input)).rejects.toThrow();
  });
});
