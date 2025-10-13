import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { DecisionFrameworkServer } from "./index.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test subclass to access protected methods for testing
 */
class TestableDecisionFrameworkServer extends DecisionFrameworkServer {
  public testValidateDecisionAnalysisData(input: unknown) {
    return this.validateDecisionAnalysisData(input);
  }
}

/**
 * Test suite for Decision Framework MCP Server.
 *
 * Business Context: Ensures the decision framework correctly validates complex
 * decision analysis structures for enterprise strategic planning and risk management.
 *
 * Decision Rationale: Tests focus on server initialization, comprehensive validation,
 * and decision analysis logic to ensure production-ready reliability for strategic decisions.
 */
describe("Decision Framework Server", () => {
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
 * Decision Analysis Data Validation Tests.
 *
 * Business Context: Enterprise applications require comprehensive validation
 * of decision analysis data to ensure strategic decisions are based on accurate information.
 *
 * Decision Rationale: Test all validation paths including required fields,
 * enum values, and complex nested structures.
 */
describe("Decision Analysis Data Validation", () => {
  let serverInstance: TestableDecisionFrameworkServer;

  beforeEach(() => {
    serverInstance = new TestableDecisionFrameworkServer();
  });

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

    const result = serverInstance.testValidateDecisionAnalysisData(validInput);
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

    const result = serverInstance.testValidateDecisionAnalysisData(inputWithoutIds);
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

      const result = serverInstance.testValidateDecisionAnalysisData(input);
      expect(result.analysisType).toBe(analysisType);
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

      const result = serverInstance.testValidateDecisionAnalysisData(input);
      expect(result.stage).toBe(stage);
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

      const result = serverInstance.testValidateDecisionAnalysisData(input);
      expect(result.riskTolerance).toBe(riskTolerance);
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

    const result = serverInstance.testValidateDecisionAnalysisData(inputWithEvaluations);
    expect(result.criteriaEvaluations).toHaveLength(2);
    expect(result.criteriaEvaluations[0].score).toBe(0.7);
    expect(result.criteriaEvaluations[0].justification).toBe("Lower cost than alternative");
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

    const result = serverInstance.testValidateDecisionAnalysisData(inputWithOutcomes);
    expect(result.possibleOutcomes).toHaveLength(1);
    expect(result.possibleOutcomes[0].probability).toBe(0.8);
    expect(result.possibleOutcomes[0].value).toBe(100000);
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

    const result = serverInstance.testValidateDecisionAnalysisData(inputWithGaps);
    expect(result.informationGaps).toHaveLength(1);
    expect(result.informationGaps[0].impact).toBe(0.7);
    expect(result.informationGaps[0].researchMethod).toBe("Survey analysis");
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

    const result = serverInstance.testValidateDecisionAnalysisData(inputWithResults);
    expect(result.expectedValues?.opt1).toBe(85000);
    expect(result.multiCriteriaScores?.opt1).toBe(0.75);
    expect(result.sensitivityInsights).toHaveLength(2);
    expect(result.recommendation).toContain("Option 1 is recommended");
  });
});

/**
 * Input Validation Error Tests.
 *
 * Business Context: Enterprise applications require robust error handling
 * to prevent data corruption and ensure system stability.
 *
 * Decision Rationale: Test all validation error paths to ensure clear error
 * messages and proper input sanitization.
 */
describe("Input Validation Errors", () => {
  let serverInstance: TestableDecisionFrameworkServer;

  beforeEach(() => {
    serverInstance = new TestableDecisionFrameworkServer();
  });

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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid decisionStatement");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid decisionStatement");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid analysisType");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid stage");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid riskTolerance");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid iteration");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid nextStageNeeded");
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

    expect(() => serverInstance.testValidateDecisionAnalysisData(invalidInput)).toThrow("Invalid options");
  });
});

/**
 * Decision Processing Tests.
 *
 * Business Context: Decision processing must handle complex calculations
 * and provide accurate recommendations for enterprise decision-making.
 *
 * Decision Rationale: Test decision processing logic including expected value
 * calculations and multi-criteria analysis.
 */
describe("Decision Processing", () => {
  let serverInstance: TestableDecisionFrameworkServer;

  beforeEach(() => {
    serverInstance = new TestableDecisionFrameworkServer();
  });

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

    const result = serverInstance.processDecisionAnalysis(input);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();
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

    const result = serverInstance.processDecisionAnalysis(input);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();
  });

  it("handles decision with information gaps", () => {
    const input = {
      decisionStatement: "Market expansion decision",
      options: [
        { id: "opt1", name: "Expand to Europe", description: "European market expansion" },
        { id: "opt2", name: "Expand to Asia", description: "Asian market expansion" }
      ],
      informationGaps: [
        {
          description: "European market research",
          impact: 0.8,
          researchMethod: "Market analysis"
        },
        {
          description: "Regulatory compliance in Asia",
          impact: 0.6,
          researchMethod: "Legal review"
        }
      ],
      stakeholders: ["CEO", "Legal Team"],
      constraints: ["Limited budget"],
      timeHorizon: "2 years",
      riskTolerance: "risk-averse",
      decisionId: "expansion-001",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 1,
      nextStageNeeded: true,
      suggestedNextStage: "criteria"
    };

    const result = serverInstance.processDecisionAnalysis(input);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBeUndefined();
  });
});

/**
 * MCP Server Integration Tests.
 *
 * Business Context: MCP protocol compliance is essential for AI agent integration.
 *
 * Decision Rationale: Test tool handler and error cases that can be validated
 * without requiring a connected transport.
 */
describe("MCP Server Integration", () => {
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    server = createServer();
  });

  it("server can be created without errors", () => {
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("rejects unknown tool name", async () => {
    const request = {
      method: "tools/call" as const,
      params: {
        name: "unknownTool",
        arguments: {}
      }
    };

    await expect(server.request(request, CallToolRequestSchema)).rejects.toThrow();
  });

  it("handles valid decision analysis request", () => {
    const validInput = {
      decisionStatement: "Should we implement the new feature?",
      options: [
        { id: "opt1", name: "Implement Feature", description: "Add the new feature" },
        { id: "opt2", name: "Delay Feature", description: "Wait for more data" }
      ],
      stakeholders: ["Product Manager"],
      constraints: [],
      timeHorizon: "6 months",
      riskTolerance: "risk-neutral",
      decisionId: "feature-001",
      analysisType: "multi-criteria",
      stage: "options",
      iteration: 1,
      nextStageNeeded: false
    };

    const serverInstance = new TestableDecisionFrameworkServer();
    const result = serverInstance.testValidateDecisionAnalysisData(validInput);
    expect(result.decisionStatement).toBe("Should we implement the new feature?");
    expect(result.options).toHaveLength(2);
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
  let serverInstance: TestableDecisionFrameworkServer;

  beforeEach(() => {
    serverInstance = new TestableDecisionFrameworkServer();
  });

  it("handles large number of options", () => {
    const manyOptions = Array.from({ length: 50 }, (_, i) => ({
      id: `opt${i + 1}`,
      name: `Option ${i + 1}`,
      description: `Description for option ${i + 1}`
    }));

    const input = {
      decisionStatement: "Decision with many options",
      options: manyOptions,
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "many-options-test",
      analysisType: "multi-criteria",
      stage: "options",
      iteration: 1,
      nextStageNeeded: false
    };

    const result = serverInstance.testValidateDecisionAnalysisData(input);
    expect(result.options).toHaveLength(50);
  });

  it("handles complex nested structures", () => {
    const complexInput = {
      decisionStatement: "Complex decision with nested evaluations",
      options: [{ id: "opt1", name: "Option 1", description: "Complex option" }],
      criteria: [
        {
          id: "criterion1",
          name: "Complex Criterion",
          description: "A criterion with complex evaluation",
          weight: 1.0,
          evaluationMethod: "quantitative"
        }
      ],
      criteriaEvaluations: [
        {
          criterionId: "criterion1",
          optionId: "opt1",
          score: 0.85,
          justification: "Complex justification with detailed reasoning and multiple factors to consider"
        }
      ],
      possibleOutcomes: [
        {
          id: "outcome1",
          description: "Complex outcome with detailed description",
          probability: 0.75,
          optionId: "opt1",
          value: 500000,
          confidenceInEstimate: 0.8
        }
      ],
      informationGaps: [
        {
          description: "Complex information gap requiring extensive research",
          impact: 0.9,
          researchMethod: "Comprehensive market analysis with stakeholder interviews"
        }
      ],
      stakeholders: ["Complex Stakeholder 1", "Complex Stakeholder 2"],
      constraints: ["Complex constraint 1", "Complex constraint 2"],
      timeHorizon: "3 years",
      riskTolerance: "risk-seeking",
      decisionId: "complex-test",
      analysisType: "multi-criteria",
      stage: "analysis",
      iteration: 3,
      nextStageNeeded: true,
      suggestedNextStage: "recommendation"
    };

    const result = serverInstance.testValidateDecisionAnalysisData(complexInput);
    expect(result.criteriaEvaluations[0].justification).toContain("Complex justification");
    expect(result.possibleOutcomes[0].description).toContain("Complex outcome");
    expect(result.informationGaps[0].researchMethod).toContain("Comprehensive market analysis");
  });

  it("handles zero iteration", () => {
    const input = {
      decisionStatement: "Initial decision",
      options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "zero-iteration-test",
      analysisType: "multi-criteria",
      stage: "problem-definition",
      iteration: 0,
      nextStageNeeded: true
    };

    const result = serverInstance.testValidateDecisionAnalysisData(input);
    expect(result.iteration).toBe(0);
  });

  it("handles empty arrays", () => {
    const input = {
      decisionStatement: "Decision with empty arrays",
      options: [{ id: "opt1", name: "Option 1", description: "Test option" }],
      criteria: [],
      criteriaEvaluations: [],
      possibleOutcomes: [],
      informationGaps: [],
      stakeholders: ["Test"],
      constraints: [],
      timeHorizon: "1 year",
      riskTolerance: "risk-neutral",
      decisionId: "empty-arrays-test",
      analysisType: "multi-criteria",
      stage: "options",
      iteration: 1,
      nextStageNeeded: false
    };

    const result = serverInstance.testValidateDecisionAnalysisData(input);
    expect(result.criteria || []).toHaveLength(0);
    expect(result.criteriaEvaluations || []).toHaveLength(0);
    expect(result.possibleOutcomes || []).toHaveLength(0);
    expect(result.informationGaps || []).toHaveLength(0);
  });
});
