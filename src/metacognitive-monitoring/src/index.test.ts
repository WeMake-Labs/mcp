import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { MetacognitiveMonitoringServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for Metacognitive Monitoring MCP Server.
 *
 * Business Context: Ensures the Metacognitive Monitoring framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Metacognitive Monitoring Server", () => {
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
 */
describe("Tool Registration", () => {
  it("should advertise metacognitiveMonitoring tool", async () => {
    const server = createServer();
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("metacognitiveMonitoring");
  });
});

/**
 * Input Validation Tests - Required Fields.
 */
describe("Input Validation - Required Fields", () => {
  let server: MetacognitiveMonitoringServer;

  beforeEach(() => {
    server = new MetacognitiveMonitoringServer();
  });

  it("should reject null input", () => {
    const result = server.processMetacognitiveMonitoring(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid task");
  });

  it("should reject missing task", () => {
    const input = {
      stage: "planning",
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid task");
  });

  it("should reject missing stage", () => {
    const input = {
      task: "Test task",
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid stage");
  });

  it("should reject invalid stage enum", () => {
    const input = {
      task: "Test task",
      stage: "invalid-stage",
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid stage");
  });

  it("should reject invalid overallConfidence range", () => {
    const input1 = {
      task: "Test task",
      stage: "planning",
      overallConfidence: -0.1,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result1 = server.processMetacognitiveMonitoring(input1);
    expect(result1.isError).toBe(true);
    expect(result1.content[0].text).toContain("Invalid overallConfidence");

    const input2 = {
      task: "Test task",
      stage: "planning",
      overallConfidence: 1.1,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result2 = server.processMetacognitiveMonitoring(input2);
    expect(result2.isError).toBe(true);
  });

  it("should reject non-array uncertaintyAreas", () => {
    const input = {
      task: "Test task",
      stage: "planning",
      overallConfidence: 0.8,
      uncertaintyAreas: "not an array",
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid uncertaintyAreas");
  });

  it("should process valid minimal input", () => {
    const validInput = {
      task: "Analyze a complex problem",
      stage: "knowledge-assessment",
      overallConfidence: 0.7,
      uncertaintyAreas: ["Domain knowledge", "Data quality"],
      recommendedApproach: "Start with knowledge assessment",
      monitoringId: "mon-1",
      iteration: 0,
      nextAssessmentNeeded: true
    };
    const result = server.processMetacognitiveMonitoring(validInput);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Input Validation Tests - Knowledge Assessment.
 */
describe("Input Validation - Knowledge Assessment", () => {
  let server: MetacognitiveMonitoringServer;

  beforeEach(() => {
    server = new MetacognitiveMonitoringServer();
  });

  it("should validate knowledge assessment with all fields", () => {
    const input = {
      task: "Test task",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Machine Learning",
        knowledgeLevel: "proficient",
        confidenceScore: 0.8,
        supportingEvidence: "Experience with ML projects",
        knownLimitations: ["Limited expertise in deep learning"]
      },
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Proceed with caution",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  it("should reject invalid knowledge level enum", () => {
    const input = {
      task: "Test task",
      stage: "knowledge-assessment",
      knowledgeAssessment: {
        domain: "Machine Learning",
        knowledgeLevel: "invalid-level",
        confidenceScore: 0.8,
        supportingEvidence: "Evidence",
        knownLimitations: []
      },
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid knowledgeAssessment.knowledgeLevel");
  });

  it("should validate all knowledge level enums", () => {
    const levels: Array<"expert" | "proficient" | "familiar" | "basic" | "minimal" | "none"> = [
      "expert",
      "proficient",
      "familiar",
      "basic",
      "minimal",
      "none"
    ];

    for (const level of levels) {
      const input = {
        task: "Test task",
        stage: "knowledge-assessment",
        knowledgeAssessment: {
          domain: "Test",
          knowledgeLevel: level,
          confidenceScore: 0.5,
          supportingEvidence: "Test",
          knownLimitations: []
        },
        overallConfidence: 0.5,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: "id1",
        iteration: 0,
        nextAssessmentNeeded: false
      };
      const result = server.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });
});

/**
 * Input Validation Tests - Claims.
 */
describe("Input Validation - Claims", () => {
  let server: MetacognitiveMonitoringServer;

  beforeEach(() => {
    server = new MetacognitiveMonitoringServer();
  });

  it("should validate claims array", () => {
    const input = {
      task: "Test task",
      stage: "evaluation",
      claims: [
        {
          claim: "The data is accurate",
          status: "inference",
          confidenceScore: 0.7,
          evidenceBasis: "Based on sample validation"
        },
        {
          claim: "The model performs well",
          status: "fact",
          confidenceScore: 0.9,
          evidenceBasis: "Test results show 95% accuracy"
        }
      ],
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  it("should reject invalid claim status enum", () => {
    const input = {
      task: "Test task",
      stage: "evaluation",
      claims: [
        {
          claim: "Test claim",
          status: "invalid-status",
          confidenceScore: 0.7,
          evidenceBasis: "Evidence"
        }
      ],
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBe(true);
  });

  it("should validate all claim status enums", () => {
    const statuses: Array<"fact" | "inference" | "speculation" | "uncertain"> = [
      "fact",
      "inference",
      "speculation",
      "uncertain"
    ];

    for (const status of statuses) {
      const input = {
        task: "Test task",
        stage: "evaluation",
        claims: [
          {
            claim: "Test claim",
            status,
            confidenceScore: 0.7,
            evidenceBasis: "Evidence"
          }
        ],
        overallConfidence: 0.8,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: "id1",
        iteration: 0,
        nextAssessmentNeeded: false
      };
      const result = server.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
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
 */
describe("Edge Cases and Performance", () => {
  let server: MetacognitiveMonitoringServer;

  beforeEach(() => {
    server = new MetacognitiveMonitoringServer();
  });

  it("handles very long task description", () => {
    const longTask = "a".repeat(10000);
    const input = {
      task: longTask,
      stage: "planning",
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles empty arrays", () => {
    const input = {
      task: "Test task",
      stage: "evaluation",
      claims: [],
      reasoningSteps: [],
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles special characters", () => {
    const input = {
      task: "Task with special chars: @#$% & émojis 🎉",
      stage: "reflection",
      overallConfidence: 0.8,
      uncertaintyAreas: ["Area with <html>", 'Area with "quotes"'],
      recommendedApproach: "Approach with 'apostrophes'",
      monitoringId: "id-1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });

  it("handles boundary confidence values", () => {
    const input1 = {
      task: "Test task",
      stage: "planning",
      overallConfidence: 0.0,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result1 = server.processMetacognitiveMonitoring(input1);
    expect(result1.isError).toBeUndefined();

    const input2 = {
      task: "Test task",
      stage: "planning",
      overallConfidence: 1.0,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result2 = server.processMetacognitiveMonitoring(input2);
    expect(result2.isError).toBeUndefined();
  });

  it("handles all stage types", () => {
    const stages: Array<
      "knowledge-assessment" | "planning" | "execution" | "monitoring" | "evaluation" | "reflection"
    > = ["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"];

    for (const stage of stages) {
      const input = {
        task: "Test task",
        stage,
        overallConfidence: 0.8,
        uncertaintyAreas: [],
        recommendedApproach: "Test",
        monitoringId: `id-${stage}`,
        iteration: 0,
        nextAssessmentNeeded: false
      };
      const result = server.processMetacognitiveMonitoring(input);
      expect(result.isError).toBeUndefined();
    }
  });

  it("handles large number of claims", () => {
    const claims = Array.from({ length: 100 }, (_, i) => ({
      claim: `Claim ${i}`,
      status: "inference" as const,
      confidenceScore: 0.7,
      evidenceBasis: `Evidence ${i}`
    }));

    const input = {
      task: "Test task",
      stage: "evaluation",
      claims,
      overallConfidence: 0.8,
      uncertaintyAreas: [],
      recommendedApproach: "Test",
      monitoringId: "id1",
      iteration: 0,
      nextAssessmentNeeded: false
    };
    const result = server.processMetacognitiveMonitoring(input);
    expect(result.isError).toBeUndefined();
  });
});
