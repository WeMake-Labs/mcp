import { describe, expect, it } from "bun:test";
import { DecisionManager } from "../core/manager.js";
import { DecisionAnalysisData } from "../core/types.js";

/**
 * Testing-only accessor for validateDecisionAnalysisData method.
 */
function validateDecisionAnalysisDataForTest(input: unknown) {
  const manager = new DecisionManager();
  return manager.validateDecisionAnalysisData(input);
}

/**
 * Decision Analysis Data Validation Tests.
 */
describe("Decision Analysis Data Validation", () => {
  it("validates complete decision analysis structure", () => {
    const validInput = {
      decisionStatement: "Should we invest in new technology infrastructure?",
      options: [
        {
          id: "option1",
          name: "Cloud Migration",
          description: "Migrate to cloud-based infrastructure"
        },
        {
          id: "option2",
          name: "On-Premise Upgrade",
          description: "Upgrade existing on-premise systems"
        }
      ],
      criteria: [
        {
          id: "cost",
          name: "Cost",
          description: "Total cost of implementation",
          weight: 0.4,
          evaluationMethod: "quantitative"
        }
      ],
      stakeholders: ["CTO", "CFO", "IT Director"],
      constraints: ["Budget limit $500K", "6-month timeline"],
      timeHorizon: "2 years",
      riskTolerance: "risk-neutral",
      decisionId: "tech-infrastructure-2024",
      analysisType: "multi-criteria",
      stage: "evaluation",
      iteration: 1,
      nextStageNeeded: false
    };

    const result = validateDecisionAnalysisDataForTest(validInput);
    expect(result.decisionStatement).toBe("Should we invest in new technology infrastructure?");
    expect(result.options).toHaveLength(2);
    expect(result.criteria).toHaveLength(1);
    expect(result.stakeholders).toHaveLength(3);
  });

  it("auto-generates missing option IDs", () => {
    const inputWithoutIds = {
      decisionStatement: "Test decision",
      options: [
        {
          name: "Option 1",
          description: "First option"
        },
        {
          name: "Option 2",
          description: "Second option"
        }
      ],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "expected-utility",
      stage: "options",
      iteration: 0,
      nextStageNeeded: true
    };

    const result = validateDecisionAnalysisDataForTest(inputWithoutIds);
    expect(result.options[0].id).toMatch(/^option-\d+$/);
    expect(result.options[1].id).toMatch(/^option-\d+$/);
    expect(result.options[0].id).not.toBe(result.options[1].id);
  });

  it("validates all analysis types", () => {
    const analysisTypes = ["expected-utility", "multi-criteria", "maximin", "minimax-regret", "satisficing"];

    for (const analysisType of analysisTypes) {
      const input = {
        decisionStatement: `Test decision for ${analysisType}`,
        options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
        stakeholders: ["Test"],
        constraints: [],
        timeHorizon: "1 year",
        riskTolerance: "risk-neutral",
        decisionId: `test-${analysisType}`,
        analysisType,
        stage: "problem-definition",
        iteration: 1,
        nextStageNeeded: false
      };

      const result = validateDecisionAnalysisDataForTest(input);
      expect(result.analysisType).toBe(analysisType as DecisionAnalysisData["analysisType"]);
    }
  });

  it("validates all decision stages", () => {
    const stages = ["problem-definition", "options", "criteria", "evaluation", "analysis", "recommendation"];

    for (const stage of stages) {
      const input = {
        decisionStatement: `Test decision for ${stage}`,
        options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
        stakeholders: ["Test"],
        constraints: [],
        timeHorizon: "1 year",
        riskTolerance: "risk-neutral",
        decisionId: `test-${stage}`,
        analysisType: "multi-criteria",
        stage,
        iteration: 1,
        nextStageNeeded: false
      };

      const result = validateDecisionAnalysisDataForTest(input);
      expect(result.stage).toBe(stage as DecisionAnalysisData["stage"]);
    }
  });

  it("validates all risk tolerance levels", () => {
    const riskLevels = ["risk-averse", "risk-neutral", "risk-seeking"];

    for (const riskTolerance of riskLevels) {
      const input = {
        decisionStatement: `Test decision for ${riskTolerance}`,
        options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
        stakeholders: ["Test"],
        constraints: [],
        timeHorizon: "1 year",
        riskTolerance,
        decisionId: `test-${riskTolerance}`,
        analysisType: "multi-criteria",
        stage: "problem-definition",
        iteration: 1,
        nextStageNeeded: false
      };

      const result = validateDecisionAnalysisDataForTest(input);
      expect(result.riskTolerance).toBe(riskTolerance as DecisionAnalysisData["riskTolerance"]);
    }
  });

  it("validates criterion evaluations", () => {
    const inputWithEvaluations = {
      decisionStatement: "Test decision with evaluations",
      options: [
        { id: "opt1", name: "Option 1", description: "Test option" },
        { id: "opt2", name: "Option 2", description: "Test option" }
      ],
      criteria: [
        {
          id: "cost",
          name: "Cost",
          description: "Cost criterion",
          weight: 0.5,
          evaluationMethod: "quantitative"
        },
        {
          id: "quality",
          name: "Quality",
          description: "Quality criterion",
          weight: 0.5,
          evaluationMethod: "qualitative"
        }
      ],
      criteriaEvaluations: [
        {
          criterionId: "cost",
          optionId: "opt1",
          score: 0.7,
          justification: "Lower cost than alternative"
        },
        {
          criterionId: "quality",
          optionId: "opt1",
          score: 0.8,
          justification: "Higher quality materials"
        }
      ],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "eval-test",
      analysisType: "multi-criteria",
      stage: "evaluation",
      iteration: 1,
      nextStageNeeded: false
    };

    const result = validateDecisionAnalysisDataForTest(inputWithEvaluations);
    expect(result.criteriaEvaluations).toHaveLength(2);
    expect(result.criteriaEvaluations![0].score).toBe(0.7);
    expect(result.criteriaEvaluations![0].justification).toBe("Lower cost than alternative");
  });

  it("validates possible outcomes", () => {
    const inputWithOutcomes = {
      decisionStatement: "Test decision with outcomes",
      options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
      possibleOutcomes: [
        {
          id: "outcome1",
          description: "Successful implementation",
          probability: 0.8,
          optionId: "opt1",
          value: 100000,
          confidenceInEstimate: 0.9
        }
      ],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "outcome-test",
      analysisType: "expected-utility",
      stage: "analysis",
      iteration: 1,
      nextStageNeeded: false
    };

    const result = validateDecisionAnalysisDataForTest(inputWithOutcomes);
    expect(result.possibleOutcomes).toHaveLength(1);
    expect(result.possibleOutcomes![0].probability).toBe(0.8);
    expect(result.possibleOutcomes![0].value).toBe(100000);
  });

  it("validates information gaps", () => {
    const inputWithGaps = {
      decisionStatement: "Test decision with information gaps",
      options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
      informationGaps: [
        {
          description: "Market research data needed",
          impact: 0.7,
          researchMethod: "Survey analysis"
        }
      ],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "gap-test",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: true,
      suggestedNextStage: "criteria"
    };

    const result = validateDecisionAnalysisDataForTest(inputWithGaps);
    expect(result.informationGaps).toHaveLength(1);
    expect(result.informationGaps![0].impact).toBe(0.7);
    expect(result.informationGaps![0].researchMethod).toBe("Survey analysis");
  });

  it("validates analysis results", () => {
    const inputWithResults = {
      decisionStatement: "Test decision with results",
      options: [
        { id: "opt1", name: "Option 1", description: "Test option" },
        { id: "opt2", name: "Option 2", description: "Test option" }
      ],
      expectedValues: {
        opt1: 85000,
        opt2: 72000
      },
      multiCriteriaScores: {
        opt1: 0.75,
        opt2: 0.68
      },
      sensitivityInsights: ["Cost has highest impact on decision", "Quality scores are most uncertain"],
      recommendation: "Option 1 is recommended based on higher expected value and multi-criteria score",
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "results-test",
      analysisType: "multi-criteria",
      stage: "recommendation",
      iteration: 2,
      nextStageNeeded: false
    };

    const result = validateDecisionAnalysisDataForTest(inputWithResults);
    expect(result.expectedValues?.opt1).toBe(85000);
    expect(result.multiCriteriaScores?.opt1).toBe(0.75);
    expect(result.sensitivityInsights).toHaveLength(2);
    expect(result.recommendation).toContain("Option 1 is recommended");
  });
});

/**
 * Input Validation Error Tests.
 */
describe("Input Validation Errors", () => {
  it("rejects missing decisionStatement", () => {
    const invalidInput = {
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid decisionStatement");
  });

  it("rejects non-string decisionStatement", () => {
    const invalidInput = {
      decisionStatement: 123,
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid decisionStatement");
  });

  it("rejects invalid analysisType", () => {
    const invalidInput = {
      decisionStatement: "Test decision",
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "invalid-type",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid analysisType");
  });

  it("rejects invalid stage", () => {
    const invalidInput = {
      decisionStatement: "Test decision",
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "invalid-stage",
      iteration: 1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid stage");
  });

  it("rejects invalid riskTolerance", () => {
    const invalidInput = {
      decisionStatement: "Test decision",
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "invalid-risk",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid riskTolerance");
  });

  it("rejects negative iteration", () => {
    const invalidInput = {
      decisionStatement: "Test decision",
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: -1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid iteration");
  });

  it("rejects non-boolean nextStageNeeded", () => {
    const invalidInput = {
      decisionStatement: "Test decision",
      options: [{ id: "opt1", name: "Option 1", description: "Test" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: "yes"
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid nextStageNeeded");
  });

  it("rejects non-array options", () => {
    const invalidInput = {
      decisionStatement: "Test decision",
      options: "not an array",
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "test-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: false
    };

    expect(() => validateDecisionAnalysisDataForTest(invalidInput)).toThrow("Invalid options");
  });
});

/**
 * Decision Processing Tests.
 */
describe("Decision Processing", () => {
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

    const manager = new DecisionManager();
    const validated = manager.validateDecisionAnalysisData(input);
    const result = manager.updateDecisionAnalysis(validated);

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

    const manager = new DecisionManager();
    const validated = manager.validateDecisionAnalysisData(input);
    const result = manager.updateDecisionAnalysis(validated);

    expect(result.multiCriteriaScores).toBeDefined();
    expect(result.multiCriteriaScores?.opt1).toBeCloseTo(0.8);
  });
});
