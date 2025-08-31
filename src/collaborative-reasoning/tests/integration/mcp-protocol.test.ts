/**
 * Integration tests for MCP protocol compliance
 * Tests the collaborative reasoning server's integration with MCP protocol
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { CollaborativeReasoningServer } from "../../index.js";
import { mockCollaborativeReasoningData, TestHelpers, TestEnvironment, CONTRIBUTION_TYPES } from "../utils/test-data.js";

describe("MCP Protocol Integration", () => {
  let collaborativeReasoningServer: CollaborativeReasoningServer;

  beforeEach(() => {
    collaborativeReasoningServer = new CollaborativeReasoningServer();
  });

  describe("MCP Response Format Compliance", () => {
    test("should return MCP-compliant response structure", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      // Verify MCP-compliant response structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty("content");
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content.length).toBeGreaterThan(0);

      // Each content item should have type and text properties
      result.content.forEach((item) => {
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("text");
        expect(typeof item.type).toBe("string");
        expect(typeof item.text).toBe("string");
        expect(item.type.length).toBeGreaterThan(0);
        expect(item.text.length).toBeGreaterThan(0);
      });
    });

    test("should return error responses in MCP format", () => {
      const result = collaborativeReasoningServer.processCollaborativeReasoning(null);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("isError");
      expect(result.isError).toBe(true);
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content.length).toBeGreaterThan(0);

      // Error content should still follow MCP format
      result.content.forEach((item) => {
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("text");
        expect(typeof item.type).toBe("string");
        expect(typeof item.text).toBe("string");
      });
    });

    test("should handle MCP request argument format", () => {
      const mcpRequest = TestHelpers.createMockMCPRequest(
        mockCollaborativeReasoningData as unknown as Record<string, unknown>
      );
      const result = collaborativeReasoningServer.processCollaborativeReasoning(mcpRequest.params.arguments);

      expect(result.isError).toBeFalsy();
      TestHelpers.assertMCPResponse(result);
    });
  });

  describe("Tool Schema Validation", () => {
    test("should validate required fields according to MCP schema", () => {
      const requiredFields = [
        "topic",
        "personas",
        "contributions",
        "stage",
        "activePersonaId",
        "sessionId",
        "iteration",
        "nextContributionNeeded"
      ];

      requiredFields.forEach((field) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        delete (testData as unknown as Record<string, unknown>)[field];

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
        expect(result.isError).toBe(true);
        if (result.content && result.content[0]) {
          expect(result.content[0].text.toLowerCase()).toContain(field.toLowerCase());
        }
      });
    });

    test("should validate enum values for stage field", () => {
      const validStages = ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"];

      validStages.forEach((stage) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.stage = stage as typeof testData.stage;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
      });

      // Test invalid stage
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      (testData as unknown as Record<string, unknown>)["stage"] = "invalid-stage";

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
      expect(result.isError).toBe(true);
    });

    test("should validate contribution type enum values", () => {
      const validTypes = ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"];

      validTypes.forEach((type) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.contributions = [
          {
            personaId: "persona-1",
            content: "Test content",
            type: type as (typeof testData.contributions)[0]["type"],
            confidence: 0.8
          }
        ];

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
      });

      // Test invalid type
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData.contributions = [
        {
          personaId: "persona-1",
          content: "Test content",
          type: "invalid-type" as never,
          confidence: 0.8
        }
      ];

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
      expect(result.isError).toBe(true);
    });

    test("should validate confidence range (0.0-1.0)", () => {
      const validConfidenceValues = [0.0, 0.25, 0.5, 0.75, 1.0];
      const invalidConfidenceValues = [-0.1, 1.1, 2.0, -1.0];

      validConfidenceValues.forEach((confidence) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.contributions = [
          {
            personaId: "persona-1",
            content: "Test content",
            type: "insight",
            confidence: confidence
          }
        ];

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
        expect(result.isError).toBeFalsy();
      });

      invalidConfidenceValues.forEach((confidence) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.contributions = [
          {
            personaId: "persona-1",
            content: "Test content",
            type: "insight",
            confidence: confidence
          }
        ];

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
        expect(result.isError).toBe(true);
      });
    });
  });

  describe("Session Management", () => {
    test("should maintain session state across multiple calls", () => {
      const sessionId = TestHelpers.generateSessionId();
      const testData1 = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData1.sessionId = sessionId;
      testData1.iteration = 1;

      const testData2 = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData2.sessionId = sessionId;
      testData2.iteration = 2;

      // Process first iteration
      const result1 = collaborativeReasoningServer.processCollaborativeReasoning(testData1);
      expect(result1.isError).toBeFalsy();

      // Process second iteration
      const result2 = collaborativeReasoningServer.processCollaborativeReasoning(testData2);
      expect(result2.isError).toBeFalsy();

      // Both should succeed and maintain MCP format
      TestHelpers.assertMCPResponse(result1);
      TestHelpers.assertMCPResponse(result2);
    });

    test("should handle concurrent sessions independently", () => {
      const sessions = Array.from({ length: 3 }, (_, i) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.sessionId = `concurrent-session-${i}`;
        return testData;
      });

      const results = sessions.map((sessionData) =>
        collaborativeReasoningServer.processCollaborativeReasoning(sessionData)
      );

      // All sessions should succeed independently
      results.forEach((result) => {
        expect(result.isError).toBeFalsy();
        TestHelpers.assertMCPResponse(result);
      });
    });
  });

  describe("Performance and Scalability", () => {
    test("should handle large datasets efficiently", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Create large dataset
      testData.personas = Array.from({ length: 20 }, (_, i) => ({
        id: `persona-${i}`,
        name: `Test Persona ${i}`,
        expertise: [`skill-${i}`, `domain-${i}`],
        background: `Background ${i}`,
        perspective: `Perspective ${i}`,
        biases: [`bias-${i}`],
        communication: {
          style: "analytical",
          tone: "professional"
        }
      }));

      const contributionTypes = [...CONTRIBUTION_TYPES, "challenge", "synthesis"
      ] as const;
      testData.contributions = Array.from({ length: 50 }, (_, i) => ({
        personaId: `persona-${i % 20}`,
        content: `Contribution ${i}`,
        type: contributionTypes[i % contributionTypes.length] as (typeof testData.contributions)[0]["type"],
        confidence: Math.random()
      }));

      const startTime = Date.now();
      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
      const endTime = Date.now();

      expect(result.isError).toBeFalsy();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      TestHelpers.assertMCPResponse(result);
    });

    test("should maintain consistent response times", () => {
      const testData = TestHelpers.createMinimalValidData();
      const executionTimes: number[] = [];

      // Run multiple iterations and measure execution time
      for (let i = 0; i < 10; i++) {
        const data = TestHelpers.cloneTestData(testData);
        data.sessionId = `performance-session-${i}`;

        const startTime = Date.now();
        const result = collaborativeReasoningServer.processCollaborativeReasoning(data);
        const endTime = Date.now();

        expect(result.isError).toBeFalsy();
        executionTimes.push(endTime - startTime);
      }

      // Calculate average and check consistency
      const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      const maxDeviation = Math.max(...executionTimes.map((time) => Math.abs(time - avgTime)));

      // CI-aware performance thresholds based on runtime environment
      const maxDeviationThreshold = TestEnvironment.getThreshold(100, 200); // 100ms for Bun, 200ms for Node, 2x in CI
      const avgTimeThreshold = TestEnvironment.getThreshold(300, 500); // 300ms for Bun, 500ms for Node, 2x in CI

      // Execution times should be reasonably consistent
      expect(maxDeviation).toBeLessThan(maxDeviationThreshold);
      expect(avgTime).toBeLessThan(avgTimeThreshold);
    });
  });

  describe("Error Recovery and Resilience", () => {
    test("should recover from malformed input gracefully", () => {
      const malformedInputs = [
        null,
        undefined,
        {},
        { topic: "test" },
        { topic: 123, personas: "invalid" },
        { topic: "test", personas: [], contributions: null }
      ];

      malformedInputs.forEach((input) => {
        const result = collaborativeReasoningServer.processCollaborativeReasoning(input);
        expect(result).toBeDefined();
        expect(result.isError).toBe(true);
        TestHelpers.assertMCPResponse(result);
      });
    });

    test("should provide meaningful error messages", () => {
      const testCases = [
        { input: null, expectedError: /error|invalid/i },
        { input: {}, expectedError: /topic|required/i },
        { input: { topic: "test" }, expectedError: /personas|required/i },
        { input: { topic: "test", personas: [] }, expectedError: /contributions|required/i }
      ];

      testCases.forEach(({ input, expectedError }) => {
        const result = collaborativeReasoningServer.processCollaborativeReasoning(input);
        expect(result.isError).toBe(true);
        if (result.content && result.content[0]) {
          expect(result.content[0].text).toMatch(expectedError);
        }
      });
    });

    test("should handle edge cases in data validation", () => {
      const edgeCases = [
        // Empty arrays
        {
          ...TestHelpers.createMinimalValidData(),
          personas: [],
          contributions: []
        },
        // Very long strings
        {
          ...TestHelpers.createMinimalValidData(),
          topic: "x".repeat(10000)
        },
        // Special characters
        {
          ...TestHelpers.createMinimalValidData(),
          topic: 'Test with special chars: !@#$%^&*(){}[]|\\:;"<>?,./'
        }
      ];

      edgeCases.forEach((testCase) => {
        const result = collaborativeReasoningServer.processCollaborativeReasoning(testCase);
        expect(result).toBeDefined();
        TestHelpers.assertMCPResponse(result);
      });
    });
  });
});
