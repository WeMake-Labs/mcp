import { describe, expect, test, beforeEach } from "bun:test";
import { MetacognitiveMonitoringServer } from "./index.js";

/**
 * Test suite for Metacognitive Monitoring MCP Server.
 *
 * Business Context: Ensures the metacognitive monitoring framework correctly validates
 * knowledge boundaries, claim certainty, and reasoning quality for enterprise AI applications.
 *
 * Decision Rationale: Tests focus on server initialization, validation logic, and state
 * management to ensure production-ready reliability with 90%+ test coverage. Full integration
 * testing is done via MCP Inspector during development workflow.
 */
describe("Metacognitive Monitoring Server", () => {
  test("MetacognitiveMonitoringServer initializes successfully", () => {
    const serverInstance = new MetacognitiveMonitoringServer();
    expect(serverInstance).toBeDefined();
    expect(serverInstance).toBeInstanceOf(MetacognitiveMonitoringServer);
  });

  test("MetacognitiveMonitoringServer has expected methods", () => {
    const serverInstance = new MetacognitiveMonitoringServer();
    expect(typeof serverInstance.processMetacognitiveMonitoring).toBe("function");
  });

  test("metacognitiveMonitoring tool is properly defined", () => {
    const serverInstance = new MetacognitiveMonitoringServer();

    // Test that the server can process monitoring requests
    const minimalInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-init",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(minimalInput);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();
  });
});

/**
 * Direct Server Method Tests - Knowledge Assessment.
 *
 * Business Context: Knowledge boundary tracking is critical for calibrated confidence
 * in enterprise AI systems. These tests ensure proper validation of domain knowledge.
 *
 * Decision Rationale: Test knowledge assessment validation separately to ensure
 * comprehensive coverage of all knowledge levels and validation rules.
 */
describe("MetacognitiveMonitoringServer - Knowledge Assessment", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("validates complete knowledge assessment with all fields", () => {
    const validInput = {
      task: "Test knowledge assessment",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Machine Learning",
        knowledgeLevel: "proficient",
        confidenceScore: 0.8,
        supportingEvidence: "Experience with common ML algorithms",
        knownLimitations: ["Limited deep learning expertise"],
        relevantTrainingCutoff: "2021-09"
      },
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed with standard ML approaches",
      monitoringId: "ka-001",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.hasKnowledgeAssessment).toBe(true);
  });

  test("validates knowledge assessment without optional training cutoff", () => {
    const validInput = {
      task: "Test without training cutoff",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Database Design",
        knowledgeLevel: "expert",
        confidenceScore: 0.95,
        supportingEvidence: "Years of production database experience",
        knownLimitations: []
      },
      overallConfidence: 0.95,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed confidently",
      monitoringId: "ka-002",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();
  });

  test("validates all knowledge levels", () => {
    const levels = ["expert", "proficient", "familiar", "basic", "minimal", "none"];

    for (const level of levels) {
      const input = {
        task: `Test ${level} level`,
        stage: "knowledge-assessment",
        knowledgeAssessment: {
          domain: "Test Domain",
          knowledgeLevel: level,
          confidenceScore: 0.7,
          supportingEvidence: "Test evidence",
          knownLimitations: []
        },
        overallConfidence: 0.7,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: `ka-${level}`,
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = serverInstance.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });

  test("rejects invalid knowledge level", () => {
    const invalidInput = {
      task: "Test invalid level",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Test",
        knowledgeLevel: "invalid-level",
        confidenceScore: 0.5,
        supportingEvidence: "Test",
        knownLimitations: []
      },
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "ka-invalid",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("error");
  });

  test("rejects knowledge assessment with invalid confidence", () => {
    const invalidInput = {
      task: "Test",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Test",
        knowledgeLevel: "expert",
        confidenceScore: 1.5,
        supportingEvidence: "Test",
        knownLimitations: []
      },
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "ka-conf-invalid",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });
});

/**
 * Direct Server Method Tests - Claim Assessment.
 *
 * Business Context: Distinguishing between facts, inferences, speculation, and uncertainty
 * is critical for transparent AI decision-making in enterprise environments.
 *
 * Decision Rationale: Comprehensive testing of claim classification ensures proper
 * confidence calibration and evidence tracking.
 */
describe("MetacognitiveMonitoringServer - Claim Assessment", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("validates single claim with all fields", () => {
    const validInput = {
      task: "Test claim assessment",
      stage: "execution",
      claims: [
        {
          claim: "Neural networks require significant computational resources",
          status: "fact",
          confidenceScore: 0.95,
          evidenceBasis: "Documented in research and practice",
          alternativeInterpretations: ["Depends on network size and architecture"],
          falsifiabilityCriteria: "Discovery of efficient zero-resource neural networks"
        }
      ],
      overallConfidence: 0.9,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed with claim",
      monitoringId: "claim-001",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.content).toBeDefined();
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.claimCount).toBe(1);
  });

  test("validates multiple claims with different statuses", () => {
    const validInput = {
      task: "Multiple claims test",
      stage: "evaluation",
      claims: [
        {
          claim: "Water boils at 100°C at sea level",
          status: "fact",
          confidenceScore: 1.0,
          evidenceBasis: "Well-established scientific fact"
        },
        {
          claim: "This pattern will likely continue",
          status: "inference",
          confidenceScore: 0.7,
          evidenceBasis: "Based on observed trends"
        },
        {
          claim: "Future developments might change this",
          status: "speculation",
          confidenceScore: 0.4,
          evidenceBasis: "Theoretical possibility"
        },
        {
          claim: "The exact outcome is unknown",
          status: "uncertain",
          confidenceScore: 0.2,
          evidenceBasis: "Insufficient data"
        }
      ],
      overallConfidence: 0.6,
      uncertaintyAreas: ["Future predictions"],
      recommendedApproach: "Focus on facts and strong inferences",
      monitoringId: "claim-multi",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.claimCount).toBe(4);
  });

  test("validates all claim statuses", () => {
    const statuses = ["fact", "inference", "speculation", "uncertain"];

    for (const status of statuses) {
      const input = {
        task: `Test ${status} status`,
        stage: "execution",
        claims: [
          {
            claim: `Test claim with ${status} status`,
            status: status,
            confidenceScore: 0.7,
            evidenceBasis: "Test evidence"
          }
        ],
        overallConfidence: 0.7,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: `claim-${status}`,
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = serverInstance.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });

  test("rejects invalid claim status", () => {
    const invalidInput = {
      task: "Test invalid status",
      stage: "execution",
      claims: [
        {
          claim: "Test claim",
          status: "invalid-status",
          confidenceScore: 0.5,
          evidenceBasis: "Test"
        }
      ],
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "claim-invalid",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects claim with missing evidence basis", () => {
    const invalidInput = {
      task: "Test",
      stage: "execution",
      claims: [
        {
          claim: "Test claim",
          status: "fact",
          confidenceScore: 0.5
          // Missing evidenceBasis
        }
      ],
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "claim-no-evidence",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });
});

/**
 * Direct Server Method Tests - Reasoning Assessment.
 *
 * Business Context: Identifying biases and assumptions in reasoning chains is essential
 * for transparent and accountable AI decision-making in enterprise contexts.
 *
 * Decision Rationale: Test reasoning step validation to ensure comprehensive bias
 * detection and assumption tracking.
 */
describe("MetacognitiveMonitoringServer - Reasoning Assessment", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("validates single reasoning step", () => {
    const validInput = {
      task: "Test reasoning",
      stage: "monitoring",
      reasoningSteps: [
        {
          step: "Given A and B, we conclude C",
          potentialBiases: ["Confirmation bias"],
          assumptions: ["A and B are accurate", "No other factors influence C"],
          logicalValidity: 0.8,
          inferenceStrength: 0.75
        }
      ],
      overallConfidence: 0.75,
      uncertaintyAreas: [],
      recommendedApproach: "Verify assumptions",
      monitoringId: "reason-001",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.reasoningStepCount).toBe(1);
  });

  test("validates multiple reasoning steps", () => {
    const validInput = {
      task: "Complex reasoning chain",
      stage: "monitoring",
      reasoningSteps: [
        {
          step: "Step 1: Initial observation",
          potentialBiases: ["Anchoring bias"],
          assumptions: ["Observation is representative"],
          logicalValidity: 0.9,
          inferenceStrength: 0.85
        },
        {
          step: "Step 2: Pattern identification",
          potentialBiases: ["Pattern recognition bias", "Availability heuristic"],
          assumptions: ["Pattern is significant", "Sample size is adequate"],
          logicalValidity: 0.7,
          inferenceStrength: 0.6
        },
        {
          step: "Step 3: Conclusion",
          potentialBiases: ["Confirmation bias"],
          assumptions: ["Previous steps are valid"],
          logicalValidity: 0.75,
          inferenceStrength: 0.65
        }
      ],
      overallConfidence: 0.7,
      uncertaintyAreas: ["Pattern significance"],
      recommendedApproach: "Validate pattern with additional data",
      monitoringId: "reason-multi",
      iteration: 1,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["reasoning"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.reasoningStepCount).toBe(3);
  });

  test("validates reasoning with boundary validity scores", () => {
    const input = {
      task: "Test boundary values",
      stage: "monitoring",
      reasoningSteps: [
        {
          step: "Perfect logical validity",
          potentialBiases: [],
          assumptions: [],
          logicalValidity: 1.0,
          inferenceStrength: 1.0
        },
        {
          step: "Zero validity",
          potentialBiases: ["Multiple biases"],
          assumptions: ["Unverified assumptions"],
          logicalValidity: 0.0,
          inferenceStrength: 0.0
        }
      ],
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "reason-boundary",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("rejects reasoning with invalid logical validity", () => {
    const invalidInput = {
      task: "Test",
      stage: "monitoring",
      reasoningSteps: [
        {
          step: "Invalid step",
          potentialBiases: [],
          assumptions: [],
          logicalValidity: 1.5,
          inferenceStrength: 0.5
        }
      ],
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "reason-invalid",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects reasoning with invalid inference strength", () => {
    const invalidInput = {
      task: "Test",
      stage: "monitoring",
      reasoningSteps: [
        {
          step: "Invalid step",
          potentialBiases: [],
          assumptions: [],
          logicalValidity: 0.5,
          inferenceStrength: -0.1
        }
      ],
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "reason-invalid2",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });
});

/**
 * Validation Error Handling Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test all validation error paths to ensure clear error
 * messages and proper input sanitization.
 */
describe("Validation Error Handling", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("rejects missing task", () => {
    const invalidInput = {
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-001",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("task");
  });

  test("rejects non-string task", () => {
    const invalidInput = {
      task: 123,
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-002",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects missing stage", () => {
    const invalidInput = {
      task: "Test task",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-003",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("stage");
  });

  test("rejects invalid stage enum", () => {
    const invalidInput = {
      task: "Test",
      stage: "invalid-stage",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-004",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("validates all stage enum values", () => {
    const stages = ["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"];

    for (const stage of stages) {
      const input = {
        task: "Test",
        stage: stage,
        overallConfidence: 0.5,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: `stage-${stage}`,
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = serverInstance.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });

  test("rejects missing overallConfidence", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-005",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("overallConfidence");
  });

  test("rejects overallConfidence below 0", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: -0.1,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-006",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects overallConfidence above 1", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 1.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-007",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("accepts boundary confidence values", () => {
    const minInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.0,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-min",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const maxInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 1.0,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-max",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    expect(serverInstance.processMetacognitiveMonitoring(minInput).isError).toBeUndefined();
    expect(serverInstance.processMetacognitiveMonitoring(maxInput).isError).toBeUndefined();
  });

  test("rejects missing uncertaintyAreas", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      recommendedApproach: "Test",
      monitoringId: "test-008",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects non-array uncertaintyAreas", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: "not an array",
      recommendedApproach: "Test",
      monitoringId: "test-009",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects missing recommendedApproach", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      monitoringId: "test-010",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects missing monitoringId", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects missing iteration", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-011",
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects negative iteration", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-012",
      iteration: -1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("accepts iteration 0", () => {
    const validInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-iter-0",
      iteration: 0,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(validInput);
    expect(result.isError).toBeUndefined();
  });

  test("rejects missing nextAssessmentNeeded", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-013",
      iteration: 1
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });

  test("rejects non-boolean nextAssessmentNeeded", () => {
    const invalidInput = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "test-014",
      iteration: 1,
      nextAssessmentNeeded: "yes"
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
  });
});

/**
 * Complete Monitoring Session Tests.
 *
 * Business Context: Real-world metacognitive monitoring involves complex combinations
 * of knowledge, claims, and reasoning assessments across multiple iterations.
 *
 * Decision Rationale: Test realistic scenarios to ensure the system handles
 * enterprise use cases with proper state tracking and visualization.
 */
describe("Complete Monitoring Sessions", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("handles complete monitoring session with all components", () => {
    const completeInput = {
      task: "Evaluate database optimization strategy",
      stage: "evaluation",
      knowledgeAssessment: {
        domain: "Database Optimization",
        knowledgeLevel: "proficient",
        confidenceScore: 0.85,
        supportingEvidence: "Experience with indexing and query optimization",
        knownLimitations: ["Limited NoSQL experience"],
        relevantTrainingCutoff: "2021-09"
      },
      claims: [
        {
          claim: "Indexing improves query performance",
          status: "fact",
          confidenceScore: 0.95,
          evidenceBasis: "Well-documented in database literature",
          alternativeInterpretations: ["Can increase write overhead"],
          falsifiabilityCriteria: "Query performance decreases with proper indexing"
        },
        {
          claim: "This specific index will reduce query time by 50%",
          status: "inference",
          confidenceScore: 0.7,
          evidenceBasis: "Based on similar cases and query patterns"
        }
      ],
      reasoningSteps: [
        {
          step: "Analyze query patterns to identify bottlenecks",
          potentialBiases: ["Confirmation bias toward known solutions"],
          assumptions: ["Query patterns are representative", "Metrics are accurate"],
          logicalValidity: 0.9,
          inferenceStrength: 0.85
        },
        {
          step: "Propose indexing strategy based on patterns",
          potentialBiases: ["Anchoring on previous solutions"],
          assumptions: ["Index overhead is acceptable"],
          logicalValidity: 0.8,
          inferenceStrength: 0.75
        }
      ],
      overallConfidence: 0.8,
      uncertaintyAreas: ["Exact performance improvement", "Impact on write operations"],
      recommendedApproach: "Implement with monitoring and rollback plan",
      monitoringId: "db-opt-001",
      iteration: 2,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["claim", "reasoning"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(completeInput);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.hasKnowledgeAssessment).toBe(true);
    expect(parsed.claimCount).toBe(2);
    expect(parsed.reasoningStepCount).toBe(2);
    expect(parsed.uncertaintyAreas).toBe(2);
    expect(parsed.iteration).toBe(2);
  });

  test("handles iterative monitoring sessions with same ID", () => {
    const iteration1 = {
      task: "Iterative task",
      stage: "knowledge-assessment",
      overallConfidence: 0.5,
      uncertaintyAreas: ["Many unknowns"],
      recommendedApproach: "Gather more information",
      monitoringId: "iter-001",
      iteration: 1,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["knowledge"]
    };

    const iteration2 = {
      task: "Iterative task",
      stage: "planning",
      knowledgeAssessment: {
        domain: "Test Domain",
        knowledgeLevel: "basic",
        confidenceScore: 0.6,
        supportingEvidence: "Initial research completed",
        knownLimitations: ["Need deeper understanding"]
      },
      overallConfidence: 0.6,
      uncertaintyAreas: ["Some unknowns"],
      recommendedApproach: "Develop plan",
      monitoringId: "iter-001",
      iteration: 2,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["claim"]
    };

    const iteration3 = {
      task: "Iterative task",
      stage: "evaluation",
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed with confidence",
      monitoringId: "iter-001",
      iteration: 3,
      nextAssessmentNeeded: false
    };

    const result1 = serverInstance.processMetacognitiveMonitoring(iteration1);
    const result2 = serverInstance.processMetacognitiveMonitoring(iteration2);
    const result3 = serverInstance.processMetacognitiveMonitoring(iteration3);

    expect(result1.isError).toBeUndefined();
    expect(result2.isError).toBeUndefined();
    expect(result3.isError).toBeUndefined();

    const parsed3 = JSON.parse(result3.content[0].text);
    expect(parsed3.iteration).toBe(3);
  });

  test("handles minimal valid input", () => {
    const minimalInput = {
      task: "Minimal test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test approach",
      monitoringId: "min-001",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(minimalInput);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.hasKnowledgeAssessment).toBe(false);
    expect(parsed.claimCount).toBe(0);
    expect(parsed.reasoningStepCount).toBe(0);
  });

  test("handles empty uncertainty areas", () => {
    const input = {
      task: "High confidence task",
      stage: "evaluation",
      overallConfidence: 0.95,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed confidently",
      monitoringId: "no-uncertainty",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.uncertaintyAreas).toBe(0);
  });

  test("handles multiple uncertainty areas", () => {
    const input = {
      task: "Uncertain task",
      stage: "planning",
      overallConfidence: 0.4,
      uncertaintyAreas: [
        "Data quality concerns",
        "Methodology validity",
        "External factors impact",
        "Resource availability"
      ],
      recommendedApproach: "Address uncertainties systematically",
      monitoringId: "multi-uncertainty",
      iteration: 1,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["knowledge", "claim", "reasoning"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.uncertaintyAreas).toBe(4);
  });
});

/**
 * Stage Transition Tests.
 *
 * Business Context: Metacognitive monitoring follows a natural progression through
 * stages, essential for tracking the evolution of understanding.
 *
 * Decision Rationale: Test all stage transitions to ensure proper tracking of
 * the metacognitive process lifecycle.
 */
describe("Stage Transitions", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("handles knowledge-assessment stage", () => {
    const input = {
      task: "Test",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Test",
        knowledgeLevel: "basic",
        confidenceScore: 0.5,
        supportingEvidence: "Test",
        knownLimitations: []
      },
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "stage-ka",
      iteration: 1,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["knowledge"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles planning stage", () => {
    const input = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.6,
      uncertaintyAreas: [],
      recommendedApproach: "Develop plan",
      monitoringId: "stage-plan",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles execution stage", () => {
    const input = {
      task: "Test",
      stage: "execution",
      claims: [
        {
          claim: "Execution proceeding",
          status: "fact",
          confidenceScore: 0.9,
          evidenceBasis: "Observable progress"
        }
      ],
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Continue execution",
      monitoringId: "stage-exec",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles monitoring stage", () => {
    const input = {
      task: "Test",
      stage: "monitoring",
      reasoningSteps: [
        {
          step: "Monitor progress",
          potentialBiases: [],
          assumptions: ["Progress is measurable"],
          logicalValidity: 0.8,
          inferenceStrength: 0.7
        }
      ],
      overallConfidence: 0.7,
      uncertaintyAreas: [],
      recommendedApproach: "Continue monitoring",
      monitoringId: "stage-mon",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles evaluation stage", () => {
    const input = {
      task: "Test",
      stage: "evaluation",
      claims: [
        {
          claim: "Results meet expectations",
          status: "inference",
          confidenceScore: 0.75,
          evidenceBasis: "Comparison with goals"
        }
      ],
      overallConfidence: 0.75,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed to reflection",
      monitoringId: "stage-eval",
      iteration: 1,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["overall"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles reflection stage", () => {
    const input = {
      task: "Test",
      stage: "reflection",
      overallConfidence: 0.9,
      uncertaintyAreas: [],
      recommendedApproach: "Document lessons learned",
      monitoringId: "stage-refl",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles full stage progression", () => {
    const stages = ["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"] as const;

    for (let i = 0; i < stages.length; i++) {
      const input = {
        task: "Full progression",
        stage: stages[i],
        overallConfidence: 0.5 + i * 0.08,
        uncertaintyAreas: [],
        recommendedApproach: `Stage ${i + 1}`,
        monitoringId: "full-progression",
        iteration: i + 1,
        nextAssessmentNeeded: i < stages.length - 1
      };

      const result = serverInstance.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });
});

/**
 * Suggested Assessments Tests.
 *
 * Business Context: Guiding the next steps in metacognitive monitoring helps
 * maintain systematic self-assessment processes.
 *
 * Decision Rationale: Test suggested assessment tracking to ensure proper
 * guidance for iterative refinement.
 */
describe("Suggested Assessments", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("validates all suggested assessment types", () => {
    const assessmentTypes = ["knowledge", "claim", "reasoning", "overall"] as const;

    for (const assessment of assessmentTypes) {
      const input = {
        task: "Test",
        stage: "planning",
        overallConfidence: 0.5,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: `suggest-${assessment}`,
        iteration: 1,
        nextAssessmentNeeded: true,
        suggestedAssessments: [assessment]
      };

      const result = serverInstance.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.suggestedAssessments).toContain(assessment);
    }
  });

  test("handles multiple suggested assessments", () => {
    const input = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: ["Multiple areas"],
      recommendedApproach: "Comprehensive assessment needed",
      monitoringId: "multi-suggest",
      iteration: 1,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["knowledge", "claim", "reasoning", "overall"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.suggestedAssessments).toHaveLength(4);
  });

  test("handles no suggested assessments when none needed", () => {
    const input = {
      task: "Test",
      stage: "reflection",
      overallConfidence: 0.95,
      uncertaintyAreas: [],
      recommendedApproach: "Complete",
      monitoringId: "no-suggest",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.suggestedAssessments).toBeUndefined();
  });
});

/**
 * Edge Case and Special Character Tests.
 *
 * Business Context: Real-world data includes edge cases, special characters,
 * and boundary conditions that must be handled correctly.
 *
 * Decision Rationale: Test edge cases to ensure robustness in production
 * environments with diverse input data.
 */
describe("Edge Cases and Special Characters", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("handles very long task descriptions", () => {
    const longTask = "a".repeat(10000);
    const input = {
      task: longTask,
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "long-task",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles special characters in task", () => {
    const input = {
      task: 'Task with special chars: @#$%^&*()[]{}|\\:;"<>?,./~`',
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "special-chars",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles unicode characters", () => {
    const input = {
      task: "Task with unicode: 你好世界 🌍 αβγδε",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: ["Uncertainty: éñçödîñg"],
      recommendedApproach: "Approach: 日本語",
      monitoringId: "unicode-test",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles empty string arrays", () => {
    const input = {
      task: "Test",
      stage: "planning",
      knowledgeAssessment: {
        domain: "Test",
        knowledgeLevel: "basic",
        confidenceScore: 0.5,
        supportingEvidence: "Test",
        knownLimitations: []
      },
      claims: [],
      reasoningSteps: [],
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "empty-arrays",
      iteration: 1,
      nextAssessmentNeeded: false,
      suggestedAssessments: []
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles very long monitoring ID", () => {
    const longId = "id-" + "x".repeat(1000);
    const input = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: longId,
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles very high iteration numbers", () => {
    const input = {
      task: "Test",
      stage: "reflection",
      overallConfidence: 0.9,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "high-iter",
      iteration: 99999,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("handles newlines in text fields", () => {
    const input = {
      task: "Task with\nmultiple\nlines",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: ["Uncertainty\nwith\nnewlines"],
      recommendedApproach: "Approach\nwith\nlines",
      monitoringId: "newlines",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });
});

/**
 * Confidence Scoring Tests.
 *
 * Business Context: Accurate confidence calibration is essential for
 * trustworthy AI systems in enterprise environments.
 *
 * Decision Rationale: Comprehensive testing of confidence scoring ensures
 * proper range validation and boundary handling.
 */
describe("Confidence Scoring", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("validates confidence at 0.0", () => {
    const input = {
      task: "Zero confidence test",
      stage: "planning",
      overallConfidence: 0.0,
      uncertaintyAreas: ["Everything"],
      recommendedApproach: "Gather information",
      monitoringId: "conf-0",
      iteration: 1,
      nextAssessmentNeeded: true
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("validates confidence at 1.0", () => {
    const input = {
      task: "Complete confidence test",
      stage: "reflection",
      overallConfidence: 1.0,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed",
      monitoringId: "conf-1",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("validates confidence at 0.5", () => {
    const input = {
      task: "Medium confidence test",
      stage: "evaluation",
      overallConfidence: 0.5,
      uncertaintyAreas: ["Some areas"],
      recommendedApproach: "Proceed cautiously",
      monitoringId: "conf-0.5",
      iteration: 1,
      nextAssessmentNeeded: true
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  test("validates various confidence levels", () => {
    const levels = [0.0, 0.1, 0.25, 0.33, 0.5, 0.66, 0.75, 0.9, 0.99, 1.0];

    for (const confidence of levels) {
      const input = {
        task: `Test ${confidence}`,
        stage: "planning",
        overallConfidence: confidence,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: `conf-${confidence}`,
        iteration: 1,
        nextAssessmentNeeded: false
      };

      const result = serverInstance.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });
});

/**
 * Data Structure Tests.
 *
 * Business Context: Consistent data structures are essential for audit trails
 * and multi-session workflows in enterprise applications.
 *
 * Decision Rationale: Validate that the server correctly processes and returns
 * structured data with all expected fields.
 */
describe("Data Structure Validation", () => {
  let serverInstance: MetacognitiveMonitoringServer;

  beforeEach(() => {
    serverInstance = new MetacognitiveMonitoringServer();
  });

  test("returns correct structure for minimal input", () => {
    const input = {
      task: "Test",
      stage: "planning",
      overallConfidence: 0.5,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "struct-001",
      iteration: 1,
      nextAssessmentNeeded: false
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    expect(result.content).toBeDefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.monitoringId).toBe("struct-001");
    expect(parsed.task).toBe("Test");
    expect(parsed.stage).toBe("planning");
    expect(parsed.iteration).toBe(1);
    expect(parsed.overallConfidence).toBe(0.5);
    expect(parsed.hasKnowledgeAssessment).toBe(false);
    expect(parsed.claimCount).toBe(0);
    expect(parsed.reasoningStepCount).toBe(0);
    expect(parsed.uncertaintyAreas).toBe(0);
    expect(parsed.nextAssessmentNeeded).toBe(false);
  });

  test("returns correct structure for complete input", () => {
    const input = {
      task: "Complete test",
      stage: "evaluation",
      knowledgeAssessment: {
        domain: "Test",
        knowledgeLevel: "proficient",
        confidenceScore: 0.8,
        supportingEvidence: "Test",
        knownLimitations: ["Limit 1"]
      },
      claims: [
        {
          claim: "Test claim",
          status: "fact",
          confidenceScore: 0.9,
          evidenceBasis: "Test"
        }
      ],
      reasoningSteps: [
        {
          step: "Test step",
          potentialBiases: ["Bias 1"],
          assumptions: ["Assumption 1"],
          logicalValidity: 0.8,
          inferenceStrength: 0.75
        }
      ],
      overallConfidence: 0.85,
      uncertaintyAreas: ["Area 1", "Area 2"],
      recommendedApproach: "Test approach",
      monitoringId: "struct-complete",
      iteration: 2,
      nextAssessmentNeeded: true,
      suggestedAssessments: ["claim", "reasoning"]
    };

    const result = serverInstance.processMetacognitiveMonitoring(input);
    const parsed = JSON.parse(result.content[0].text);

    expect(parsed.hasKnowledgeAssessment).toBe(true);
    expect(parsed.claimCount).toBe(1);
    expect(parsed.reasoningStepCount).toBe(1);
    expect(parsed.uncertaintyAreas).toBe(2);
    expect(parsed.nextAssessmentNeeded).toBe(true);
    expect(parsed.suggestedAssessments).toHaveLength(2);
  });

  test("validates error response structure", () => {
    const invalidInput = {
      task: "Test"
      // Missing required fields
    };

    const result = serverInstance.processMetacognitiveMonitoring(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.error).toBeDefined();
    expect(parsed.status).toBe("failed");
  });
});
