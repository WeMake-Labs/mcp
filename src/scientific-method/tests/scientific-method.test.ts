import { describe, expect, it } from "bun:test";
import { ScientificMethodCodeMode } from "../src/codemode/index.js";

describe("Scientific Method Code Mode", () => {
  it("initializes successfully", () => {
    const api = new ScientificMethodCodeMode();
    expect(api).toBeDefined();
  });

  it("processes observation stage", async () => {
    const api = new ScientificMethodCodeMode();
    const result = await api.processInquiry({
      inquiryId: "test-1",
      stage: "observation",
      observation: "Sky is blue",
      iteration: 0,
      nextStageNeeded: true
    });
    expect(result.inquiryId).toBe("test-1");
    expect(result.stage).toBe("observation");
    expect(result.observation).toBe("Sky is blue");
    expect(result.iteration).toBe(0);
  });

  it("validates invalid input", async () => {
    const api = new ScientificMethodCodeMode();
    try {
      await api.processInquiry({
        // Missing required fields
        stage: "observation"
      });
      throw new Error("Should have thrown error");
    } catch (error) {
      expect((error as Error).message).toContain("Invalid inquiryId");
    }
  });

  it("processes hypothesis stage", async () => {
    const api = new ScientificMethodCodeMode();
    const result = await api.processInquiry({
      inquiryId: "test-1",
      stage: "hypothesis",
      iteration: 1,
      nextStageNeeded: true,
      hypothesis: {
        statement: "If sky is blue, then it is daytime",
        variables: [
          { name: "sky_color", type: "independent" },
          { name: "time_of_day", type: "dependent" }
        ],
        assumptions: ["No eclipse"],
        hypothesisId: "hyp-1",
        confidence: 0.8,
        domain: "Meteorology",
        iteration: 1,
        status: "proposed"
      }
    });
    expect(result.stage).toBe("hypothesis");
    expect(result.hypothesis).toBeDefined();
    expect(result.hypothesis?.statement).toBe("If sky is blue, then it is daytime");
  });

  it("visualizes data", async () => {
    const api = new ScientificMethodCodeMode();
    const data = await api.processInquiry({
      inquiryId: "test-1",
      stage: "observation",
      observation: "Sky is blue",
      iteration: 0,
      nextStageNeeded: true
    });
    const visualization = api.visualize(data);
    expect(visualization).toContain("SCIENTIFIC INQUIRY");
    expect(visualization).toContain("Sky is blue");
  });

  it("retrieves inquiry history", async () => {
    const api = new ScientificMethodCodeMode();
    await api.processInquiry({
      inquiryId: "hist-1",
      stage: "observation",
      observation: "Initial observation",
      iteration: 0,
      nextStageNeeded: true
    });

    await api.processInquiry({
      inquiryId: "hist-1",
      stage: "question",
      question: "Why?",
      iteration: 1,
      nextStageNeeded: true
    });

    const history = await api.getInquiryHistory("hist-1");
    expect(history).toHaveLength(2);
    expect(history[0].stage).toBe("observation");
    expect(history[1].stage).toBe("question");
  });
});
