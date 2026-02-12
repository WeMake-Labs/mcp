import { describe, expect, it, beforeEach } from "bun:test";
import { MetacognitiveAnalyzer } from "../../src/core/analyzer.js";

/**
 * Test suite for MetacognitiveAnalyzer.
 */
describe("MetacognitiveAnalyzer", () => {
  let analyzer: MetacognitiveAnalyzer;

  beforeEach(() => {
    analyzer = new MetacognitiveAnalyzer();
  });

  describe("Input Validation - Required Fields", () => {
    it("should reject null input", () => {
      expect(() => analyzer.process(null)).toThrow();
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
      expect(() => analyzer.process(input)).toThrow("Invalid task");
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
      expect(() => analyzer.process(input)).toThrow("Invalid stage");
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
      expect(() => analyzer.process(input)).toThrow("Invalid stage");
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
      expect(() => analyzer.process(input1)).toThrow("Invalid overallConfidence");

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
      expect(() => analyzer.process(input2)).toThrow("Invalid overallConfidence");
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
      expect(() => analyzer.process(input)).toThrow("Invalid uncertaintyAreas");
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
      const { result } = analyzer.process(validInput);
      expect(result.task).toBe("Analyze a complex problem");
      expect(result.stage).toBe("knowledge-assessment");
    });
  });

  describe("Input Validation - Knowledge Assessment", () => {
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
      const { data } = analyzer.process(input);
      expect(data.knowledgeAssessment).toBeDefined();
      expect(data.knowledgeAssessment?.domain).toBe("Machine Learning");
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
      expect(() => analyzer.process(input)).toThrow("Invalid knowledgeAssessment.knowledgeLevel");
    });
  });

  describe("Edge Cases", () => {
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
      const { result } = analyzer.process(input);
      expect(result.task.length).toBe(10000);
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
      expect(analyzer.process(input1)).toBeDefined();

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
      expect(analyzer.process(input2)).toBeDefined();
    });
  });
});
