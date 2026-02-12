import { describe, expect, it } from "bun:test";
import { DecisionFramework } from "../codemode/index.js";

/**
 * Code Mode API Tests.
 */
describe("DecisionFramework Code Mode API", () => {
  it("processes decision with expected utility analysis", () => {
    const input = {
      decisionStatement: "Investment decision",
      options: [{ id: "opt1", name: "High Risk Investment", description: "High risk, high reward" }],
      possibleOutcomes: [
        {
          id: "outcome1",
          description: "Success",
          probability: 0.3,
          optionId: "opt1",
          value: 1000000,
          confidenceInEstimate: 0.8
        },
        {
          id: "outcome2",
          description: "Failure",
          probability: 0.7,
          optionId: "opt1",
          value: -200000,
          confidenceInEstimate: 0.9
        }
      ],
      stakeholders: ["Investor"],
      constraints: [],
      timeHorizon: "5 years",
      riskTolerance: "risk-seeking",
      decisionId: "investment-001",
      analysisType: "expected-utility",
      stage: "analysis",
      iteration: 1,
      nextStageNeeded: false
    };

    const framework = new DecisionFramework();
    const result = framework.processDecision(input);

    expect(result.expectedValues).toBeDefined();
    expect(result.expectedValues?.opt1).toBeCloseTo(160000);
  });

  it("processes decision with multi-criteria analysis", () => {
    const input = {
      decisionStatement: "Technology selection",
      options: [
        { id: "opt1", name: "Cloud Solution", description: "Cloud-based technology" },
        { id: "opt2", name: "On-Premise Solution", description: "On-premise technology" }
      ],
      criteria: [
        {
          id: "cost",
          name: "Cost",
          description: "Implementation cost",
          weight: 0.4,
          evaluationMethod: "quantitative"
        },
        {
          id: "scalability",
          name: "Scalability",
          description: "Ability to scale",
          weight: 0.3,
          evaluationMethod: "qualitative"
        },
        {
          id: "security",
          name: "Security",
          description: "Security features",
          weight: 0.3,
          evaluationMethod: "boolean"
        }
      ],
      criteriaEvaluations: [
        {
          criterionId: "cost",
          optionId: "opt1",
          score: 0.8,
          justification: "Lower initial cost"
        },
        {
          criterionId: "scalability",
          optionId: "opt1",
          score: 0.9,
          justification: "Excellent scalability"
        },
        {
          criterionId: "security",
          optionId: "opt1",
          score: 0.7,
          justification: "Good security features"
        }
      ],
      stakeholders: ["CTO", "Security Team"],
      constraints: ["Must comply with regulations"],
      timeHorizon: "3 years",
      riskTolerance: "risk-neutral",
      decisionId: "tech-selection-001",
      analysisType: "multi-criteria",
      stage: "evaluation",
      iteration: 1,
      nextStageNeeded: false
    };

    const framework = new DecisionFramework();
    const result = framework.processDecision(input);

    expect(result.multiCriteriaScores).toBeDefined();
    expect(result.multiCriteriaScores?.opt1).toBeCloseTo(0.8);
  });

  it("visualizes decision analysis", () => {
    const input = {
      decisionStatement: "Visual test",
      options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "visual-test",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: false
    };

    const framework = new DecisionFramework();
    const result = framework.processDecision(input);
    const visualization = framework.visualize(result);

    expect(visualization).toContain("DECISION ANALYSIS: Visual test");
    expect(visualization).toContain("Option 1");
  });
});
