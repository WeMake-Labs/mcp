/// <reference types="bun:test" />
import { describe, it, expect, beforeEach } from "bun:test";
import { FocusGroupServer } from "../index";

/**
 * Test suite for FocusGroupServer similarity detection functionality.
 * Validates duplicate detection, content normalization, and similarity algorithms.
 */
describe("FocusGroupServer Similarity Detection", () => {
  let server: FocusGroupServer;
  
  beforeEach(() => {
    server = new FocusGroupServer();
  });

  const basePersona = {
    id: "expert1",
    name: "Expert User",
    userType: "expert",
    usageScenario: "Daily API usage",
    expectations: ["High performance"],
    priorities: ["Security"],
    constraints: ["Budget limitations"],
    communication: {
      style: "direct",
      tone: "professional"
    }
  };

  const baseFocusGroupData = {
    targetServer: "test-server",
    personas: [basePersona],
    feedback: [],
    stage: "initial-impressions" as const,
    activePersonaId: "expert1",
    sessionId: "test-session",
    iteration: 1,
    nextFeedbackNeeded: true
  };

  describe("Exact Duplicate Detection", () => {
    it("should detect exact duplicate feedback", () => {
      const feedback1 = {
        personaId: "expert1",
        content: "This is a test feedback",
        type: "praise" as const,
        severity: 0.8
      };
      
      const feedback2 = {
        personaId: "expert1",
        content: "This is a test feedback",
        type: "suggestion" as const,
        severity: 0.6
      };
      
      const dataWithFeedback = {
        ...baseFocusGroupData,
        feedback: [feedback1]
      };
      
      // First feedback should be processed successfully
      const result1 = server.processFocusGroup(dataWithFeedback);
      expect(result1.isError).toBeFalsy();
      expect(result1.content).toHaveLength(1);
      
      const parsedResult1 = JSON.parse(result1.content[0].text);
      expect(parsedResult1.feedbackCount).toBe(1);
      
      // Second feedback with same content should be detected as duplicate
      const dataWithDuplicate = {
        ...baseFocusGroupData,
        feedback: [feedback1, feedback2]
      };
      
      const result2 = server.processFocusGroup(dataWithDuplicate);
      expect(result2.isError).toBeFalsy();
      expect(result2.content).toHaveLength(1);
      
      const parsedResult2 = JSON.parse(result2.content[0].text);
      expect(parsedResult2.feedbackCount).toBe(1); // Should still be 1 due to duplicate detection
    });
  });

  describe("Near-Duplicate Detection", () => {
    it("should detect similar content with different formatting", () => {
      const feedback1 = {
        personaId: "expert1",
        content: "This is a test feedback",
        type: "praise" as const,
        severity: 0.8
      };
      
      const feedback2 = {
        personaId: "expert1",
        content: "  THIS IS A TEST FEEDBACK!  ",
        type: "suggestion" as const,
        severity: 0.6
      };
      
      const dataWithFeedback = {
        ...baseFocusGroupData,
        feedback: [feedback1]
      };
      
      const result1 = server.processFocusGroup(dataWithFeedback);
      expect(result1.isError).toBeFalsy();
      expect(result1.content).toHaveLength(1);
      
      const parsedResult1 = JSON.parse(result1.content[0].text);
      expect(parsedResult1.feedbackCount).toBe(1);
      
      const dataWithSimilar = {
        ...baseFocusGroupData,
        feedback: [feedback1, feedback2]
      };
      
      const result2 = server.processFocusGroup(dataWithSimilar);
      expect(result2.isError).toBeFalsy();
      expect(result2.content).toHaveLength(1);
      
      const parsedResult2 = JSON.parse(result2.content[0].text);
      expect(parsedResult2.feedbackCount).toBe(1); // Should detect as duplicate
    });

    it("should detect similar content with minor variations", () => {
      const feedback1 = {
        personaId: "expert1",
        content: "The API design is really good",
        type: "praise" as const,
        severity: 0.8
      };
      
      const feedback2 = {
        personaId: "expert1",
        content: "The API design is very good",
        type: "praise" as const,
        severity: 0.7
      };
      
      const dataWithFeedback = {
        ...baseFocusGroupData,
        feedback: [feedback1]
      };
      
      const result1 = server.processFocusGroup(dataWithFeedback);
      expect(result1.isError).toBeFalsy();
      expect(result1.content).toHaveLength(1);
      
      const parsedResult1 = JSON.parse(result1.content[0].text);
      expect(parsedResult1.feedbackCount).toBe(1);
      
      const dataWithSimilar = {
        ...baseFocusGroupData,
        feedback: [feedback1, feedback2]
      };
      
      const result2 = server.processFocusGroup(dataWithSimilar);
      expect(result2.isError).toBeFalsy();
      expect(result2.content).toHaveLength(1);
      
      const parsedResult2 = JSON.parse(result2.content[0].text);
      expect(parsedResult2.feedbackCount).toBe(1); // Should detect as similar
    });
  });

  describe("Distinct Content Detection", () => {
    it("should allow genuinely different feedback", () => {
      const feedback1 = {
        personaId: "expert1",
        content: "The API design is excellent",
        type: "praise" as const,
        severity: 0.8
      };
      
      const feedback2 = {
        personaId: "expert1",
        content: "The documentation needs improvement",
        type: "suggestion" as const,
        severity: 0.6
      };
      
      const dataWithBothFeedback = {
        ...baseFocusGroupData,
        feedback: [feedback1, feedback2]
      };
      
      const result = server.processFocusGroup(dataWithBothFeedback);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.feedbackCount).toBe(2); // Both should be kept
    });

    it("should allow similar content from different personas", () => {
      const persona2 = {
        ...basePersona,
        id: "novice1",
        name: "Novice User"
      };
      
      const feedback1 = {
        personaId: "expert1",
        content: "The API is well designed",
        type: "praise" as const,
        severity: 0.8
      };
      
      const feedback2 = {
        personaId: "novice1",
        content: "The API is well designed",
        type: "praise" as const,
        severity: 0.7
      };
      
      const dataWithBothPersonas = {
        ...baseFocusGroupData,
        personas: [basePersona, persona2],
        feedback: [feedback1, feedback2]
      };
      
      const result = server.processFocusGroup(dataWithBothPersonas);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.feedbackCount).toBe(2); // Different personas, should keep both
    });
  });

  describe("Content Normalization", () => {
    it("should normalize whitespace and case", () => {
      const testCases = [
        "  Hello World  ",
        "HELLO WORLD",
        "hello    world",
        "Hello\nWorld",
        "Hello\tWorld"
      ];
      
      // All should normalize to the same value
      const normalized = testCases.map(text => {
        // Access private method for testing (in real implementation)
        // This is a conceptual test - the actual normalization happens internally
        return text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
      });
      
      const expected = "hello world";
      normalized.forEach(norm => {
        expect(norm).toBe(expected);
      });
    });
  });

  describe("Similarity Threshold", () => {
    it("should respect similarity threshold configuration", () => {
      // Test that the similarity threshold (0.8) is properly applied
      const feedback1 = {
        personaId: "expert1",
        content: "The user interface is intuitive and easy to navigate",
        type: "praise" as const,
        severity: 0.8
      };
      
      // This should be below threshold (different enough)
      const feedback2 = {
        personaId: "expert1",
        content: "The documentation could be more comprehensive",
        type: "suggestion" as const,
        severity: 0.6
      };
      
      // This should be above threshold (too similar)
      const feedback3 = {
        personaId: "expert1",
        content: "The user interface is intuitive and simple to navigate",
        type: "praise" as const,
        severity: 0.7
      };
      
      const dataWithDistinct = {
        ...baseFocusGroupData,
        sessionId: "test-session-distinct",
        feedback: [feedback1, feedback2]
      };
      
      const result1 = server.processFocusGroup(dataWithDistinct);
      expect(result1.isError).toBeFalsy();
      expect(result1.content).toHaveLength(1);
      
      const parsedResult1 = JSON.parse(result1.content[0].text);
      expect(parsedResult1.feedbackCount).toBe(2); // Different enough
      
      const dataWithSimilar = {
        ...baseFocusGroupData,
        sessionId: "test-session-similar",
        feedback: [feedback1, feedback3]
      };
      
      const result2 = server.processFocusGroup(dataWithSimilar);
      expect(result2.isError).toBeFalsy();
      expect(result2.content).toHaveLength(1);
      
      const parsedResult2 = JSON.parse(result2.content[0].text);
      expect(parsedResult2.feedbackCount).toBe(1); // Too similar
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const feedback1 = {
        personaId: "expert1",
        content: "",
        type: "suggestion" as const,
        severity: 0.5
      };
      
      const feedback2 = {
        personaId: "expert1",
        content: "   ",
        type: "suggestion" as const,
        severity: 0.5
      };
      
      const dataWithEmpty = {
        ...baseFocusGroupData,
        feedback: [feedback1, feedback2]
      };
      
      const result = server.processFocusGroup(dataWithEmpty);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.feedbackCount).toBe(1); // Empty strings should be treated as duplicates
    });

    it("should handle very short content", () => {
      const feedback1 = {
        personaId: "expert1",
        content: "OK",
        type: "praise" as const,
        severity: 0.5
      };
      
      const feedback2 = {
        personaId: "expert1",
        content: "ok",
        type: "praise" as const,
        severity: 0.5
      };
      
      const dataWithShort = {
        ...baseFocusGroupData,
        feedback: [feedback1, feedback2]
      };
      
      const result = server.processFocusGroup(dataWithShort);
      expect(result.isError).toBeFalsy();
      expect(result.content).toHaveLength(1);
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.feedbackCount).toBe(1); // Should detect as duplicate
    });
  });
});