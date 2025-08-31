/**
 * Unit tests for CollaborativeReasoningServer class
 * Tests all public and private methods with comprehensive coverage
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { CollaborativeReasoningServer } from "../../index.js";
import { mockCollaborativeReasoningData, invalidTestData, TestHelpers } from "../utils/test-data.js";

describe("CollaborativeReasoningServer", () => {
  let server: CollaborativeReasoningServer;

  beforeEach(() => {
    server = new CollaborativeReasoningServer();
  });

  afterEach(() => {
    // Clean up any resources if needed
  });

  describe("Constructor", () => {
    test("should create instance with empty registries", () => {
      expect(server).toBeInstanceOf(CollaborativeReasoningServer);
      // Test that registries are properly initialized (private members)
      const result = server.processCollaborativeReasoning(TestHelpers.createMinimalValidData());
      expect(result).toBeDefined();
      expect(result.isError).toBeFalsy();
    });
  });

  describe("processCollaborativeReasoning", () => {
    test("should process valid collaborative reasoning data", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      const result = server.processCollaborativeReasoning(testData);

      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.isError).toBeFalsy();

      // Verify content structure
      if (result.content) {
        result.content.forEach((item) => {
          expect(item).toHaveProperty("type");
          expect(item).toHaveProperty("text");
          expect(typeof item.type).toBe("string");
          expect(typeof item.text).toBe("string");
        });
      }
    });

    test("should handle minimal valid data", () => {
      const minimalData = TestHelpers.createMinimalValidData();
      const result = server.processCollaborativeReasoning(minimalData);

      expect(result).toBeDefined();
      expect(result.content).toBeInstanceOf(Array);
      expect(result.isError).toBeFalsy();
    });

    test("should return error for invalid input", () => {
      const result = server.processCollaborativeReasoning(null);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content.length).toBeGreaterThan(0);
      if (result.content && result.content[0]) {
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("Error");
      }
    });

    test("should return error for missing required fields", () => {
      const result = server.processCollaborativeReasoning(invalidTestData.missingTopic);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      if (result.content && result.content[0]) {
        expect(result.content[0].text).toContain("topic");
      }
    });

    test("should return error for invalid persona data", () => {
      const result = server.processCollaborativeReasoning(invalidTestData.invalidPersona);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
    });

    test("should return error for invalid contribution data", () => {
      const result = server.processCollaborativeReasoning(invalidTestData.invalidContribution);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
    });

    test("should handle different collaboration stages", () => {
      const stages = ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"] as const;

      stages.forEach((stage) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.stage = stage;

        const result = server.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
        expect(result.content.some((item) => item.text.includes(stage))).toBe(true);
      });
    });

    test("should handle different contribution types", () => {
      const contributionTypes = [
        "observation",
        "question",
        "insight",
        "concern",
        "suggestion",
        "challenge",
        "synthesis"
      ] as const;

      contributionTypes.forEach((type) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.contributions = [
          {
            personaId: "persona-1",
            content: `Test ${type} content`,
            type: type as "observation" | "question" | "insight" | "concern" | "suggestion" | "challenge" | "synthesis",
            confidence: 0.8
          }
        ];

        const result = server.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
      });
    });

    test("should handle disagreements with different resolution types", () => {
      const resolutionTypes = ["consensus", "compromise", "integration", "tabled"] as const;

      resolutionTypes.forEach((resolutionType) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.disagreements = [
          {
            topic: "Test disagreement",
            positions: [
              {
                personaId: "persona-1",
                position: "Position A",
                arguments: ["Argument 1"]
              },
              {
                personaId: "persona-2",
                position: "Position B",
                arguments: ["Argument 2"]
              }
            ],
            resolution: {
              type: resolutionType,
              description: `Test ${resolutionType} resolution`
            }
          }
        ];

        const result = server.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
      });
    });

    test("should handle optional fields correctly", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Remove optional fields
      delete testData.disagreements;
      delete testData.nextPersonaId;
      delete testData.keyInsights;
      delete testData.consensusPoints;
      delete testData.openQuestions;
      delete testData.finalRecommendation;
      delete testData.suggestedContributionTypes;

      const result = server.processCollaborativeReasoning(testData);
      expect(result.isError).toBeFalsy();
    });

    test("should maintain session state across multiple calls", () => {
      const sessionId = TestHelpers.generateSessionId();
      const testData1 = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData1.sessionId = sessionId;
      testData1.iteration = 1;

      const testData2 = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData2.sessionId = sessionId;
      testData2.iteration = 2;

      // Process first iteration
      const result1 = server.processCollaborativeReasoning(testData1);
      expect(result1.isError).toBeFalsy();

      // Process second iteration
      const result2 = server.processCollaborativeReasoning(testData2);
      expect(result2.isError).toBeFalsy();

      // Both should succeed, indicating state management works
      expect(result1.content).toBeDefined();
      expect(result2.content).toBeDefined();
    });

    test("should handle confidence values correctly", () => {
      const confidenceValues = [0.0, 0.25, 0.5, 0.75, 1.0];

      confidenceValues.forEach((confidence) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.contributions = [
          {
            personaId: "persona-1",
            content: "Test contribution",
            type: "insight",
            confidence: confidence
          }
        ];

        const result = server.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
      });
    });

    test("should reject invalid confidence values", () => {
      const invalidConfidenceValues = [-0.1, 1.1, 2.0, -1.0];

      invalidConfidenceValues.forEach((confidence) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.contributions = [
          {
            personaId: "persona-1",
            content: "Test contribution",
            type: "insight",
            confidence: confidence
          }
        ];

        const result = server.processCollaborativeReasoning(testData);
        expect(result.isError).toBe(true);
      });
    });

    test("should handle empty arrays for optional array fields", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData.disagreements = [];
      testData.keyInsights = [];
      testData.consensusPoints = [];
      testData.openQuestions = [];
      testData.suggestedContributionTypes = [];

      const result = server.processCollaborativeReasoning(testData);
      expect(result.isError).toBeFalsy();
    });

    test("should validate persona references in contributions", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData.contributions = [
        {
          personaId: "non-existent-persona",
          content: "Test contribution",
          type: "insight",
          confidence: 0.8
        }
      ];

      const result = server.processCollaborativeReasoning(testData);
      expect(result.isError).toBe(true);
      if (result.content && result.content[0]) {
        expect(result.content[0].text).toContain("persona");
      }
    });

    test("should validate activePersonaId exists in personas", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData.activePersonaId = "non-existent-persona";

      const result = server.processCollaborativeReasoning(testData);
      expect(result.isError).toBe(true);
    });

    test("should handle large datasets efficiently", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Create a large dataset
      testData.personas = Array.from({ length: 20 }, (_, i) => ({
        id: `persona-${i}`,
        name: `Test Persona ${i}`,
        expertise: [`skill-${i}`],
        background: `Background ${i}`,
        perspective: `Perspective ${i}`,
        biases: [`bias-${i}`],
        communication: {
          style: "analytical",
          tone: "professional"
        }
      }));

      const contributionTypes = ["observation", "question", "insight", "concern", "suggestion"] as const;
      testData.contributions = Array.from({ length: 50 }, (_, i) => ({
        personaId: `persona-${i % 20}`,
        content: `Contribution ${i}`,
        type: contributionTypes[i % contributionTypes.length] as
          | "observation"
          | "question"
          | "insight"
          | "concern"
          | "suggestion"
          | "challenge"
          | "synthesis",
        confidence: Math.random()
      }));

      const startTime = Date.now();
      const result = server.processCollaborativeReasoning(testData);
      const endTime = Date.now();

      expect(result.isError).toBeFalsy();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Error Handling", () => {
    test("should handle undefined input gracefully", () => {
      const result = server.processCollaborativeReasoning(undefined);
      expect(result.isError).toBe(true);
      if (result.content && result.content[0]) {
        expect(result.content[0].text).toContain("Error");
      }
    });

    test("should handle empty object input", () => {
      const result = server.processCollaborativeReasoning({});
      expect(result.isError).toBe(true);
    });

    test("should handle malformed JSON-like input", () => {
      const malformedData: Record<string, unknown> = {
        topic: 123, // Should be string
        personas: "not-an-array", // Should be array
        contributions: null, // Should be array
        stage: "invalid-stage", // Should be valid enum
        activePersonaId: null, // Should be string
        sessionId: undefined, // Should be string
        iteration: "not-a-number", // Should be number
        nextContributionNeeded: "not-a-boolean" // Should be boolean
      };

      const result = server.processCollaborativeReasoning(malformedData);
      expect(result.isError).toBe(true);
    });

    test("should provide meaningful error messages", () => {
      const partialData: Record<string, unknown> = { topic: "test" };
      const result = server.processCollaborativeReasoning(partialData);
      expect(result.isError).toBe(true);
      if (result.content && result.content[0]) {
        expect(result.content[0].text).toMatch(/personas|required|missing/i);
      }
    });
  });

  describe("Integration with MCP Protocol", () => {
    test("should return MCP-compliant response structure", () => {
      const testData = TestHelpers.createMinimalValidData();
      const result = server.processCollaborativeReasoning(testData);

      TestHelpers.assertMCPResponse(result);
    });

    test("should handle MCP request format", () => {
      const mcpRequest = TestHelpers.createMockMCPRequest(
        mockCollaborativeReasoningData as unknown as Record<string, unknown>
      );
      const result = server.processCollaborativeReasoning(mcpRequest.params.arguments);

      expect(result.isError).toBeFalsy();
      TestHelpers.assertMCPResponse(result);
    });
  });
});
