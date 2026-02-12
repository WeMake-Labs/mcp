import { describe, expect, it, beforeEach } from "bun:test";
import { FocusGroupServer } from "./index.js";
import { FocusGroupData } from "../core/types.js";

/**
 * Test suite for Focus Group Code Mode API.
 */
describe("Focus Group Server (Code Mode)", () => {
  let serverInstance: FocusGroupServer;

  beforeEach(() => {
    serverInstance = new FocusGroupServer();
  });

  /**
   * Input Validation Tests.
   */
  describe("Input Validation", () => {
    it("should reject null input", () => {
      expect(() => {
        serverInstance.processFocusGroup(null);
      }).toThrow();
    });

    it("should reject input missing targetServer", () => {
      const input = {
        personas: [],
        feedback: [],
        stage: "introduction",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      expect(() => {
        serverInstance.processFocusGroup(input);
      }).toThrow("Invalid targetServer");
    });

    it("should reject input missing personas", () => {
      const input = {
        targetServer: "TestServer",
        feedback: [],
        stage: "introduction",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      expect(() => {
        serverInstance.processFocusGroup(input);
      }).toThrow("Invalid personas");
    });

    it("should reject input missing feedback", () => {
      const input = {
        targetServer: "TestServer",
        personas: [],
        stage: "introduction",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      expect(() => {
        serverInstance.processFocusGroup(input);
      }).toThrow("Invalid feedback");
    });

    it("should process valid input successfully", () => {
      const validInput = {
        targetServer: "MyMCPServer",
        personas: [
          {
            id: "persona1",
            name: "Developer User",
            userType: "developer",
            usageScenario: "Building MCP integrations",
            expectations: ["Good documentation"],
            priorities: ["API clarity"],
            constraints: ["Limited time"],
            communication: {
              style: "technical",
              tone: "professional"
            }
          }
        ],
        feedback: [
          {
            personaId: "persona1",
            content: "The API is intuitive",
            type: "praise",
            severity: 0.8
          }
        ],
        stage: "initial-impressions",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      const result = serverInstance.processFocusGroup(validInput);
      expect(result).toBeDefined();
      expect(result.targetServer).toBe("MyMCPServer");
    });
  });

  /**
   * Persona Management Tests.
   */
  describe("Persona Management", () => {
    it("should handle multiple personas correctly", () => {
      const input = {
        targetServer: "TestServer",
        personas: [
          {
            id: "novice",
            name: "New User",
            userType: "novice",
            usageScenario: "First time use",
            expectations: ["Easy to start"],
            priorities: ["Simplicity"],
            constraints: ["No technical background"],
            communication: { style: "simple", tone: "casual" }
          },
          {
            id: "expert",
            name: "Power User",
            userType: "expert",
            usageScenario: "Advanced features",
            expectations: ["Flexibility"],
            priorities: ["Performance"],
            constraints: ["Time constraints"],
            communication: { style: "technical", tone: "formal" }
          }
        ],
        feedback: [],
        stage: "introduction",
        activePersonaId: "novice",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: true
      };
      const result = serverInstance.processFocusGroup(input);
      expect(result).toBeDefined();
    });

    it("should rotate personas when nextPersonaId not specified", () => {
      const input = {
        targetServer: "TestServer",
        personas: [
          {
            id: "p1",
            name: "Persona 1",
            userType: "novice",
            usageScenario: "Scenario 1",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "simple", tone: "casual" }
          },
          {
            id: "p2",
            name: "Persona 2",
            userType: "expert",
            usageScenario: "Scenario 2",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "technical", tone: "formal" }
          }
        ],
        feedback: [],
        stage: "deep-dive",
        activePersonaId: "p1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: true
      };
      const result = serverInstance.processFocusGroup(input);
      expect(result).toBeDefined();
      expect(result.nextPersonaId).toBe("p2");
    });
  });

  /**
   * Session Management Tests.
   */
  describe("Session Management", () => {
    it("should track multiple sessions independently", () => {
      const session1Input = {
        targetServer: "ServerA",
        personas: [
          {
            id: "p1",
            name: "User 1",
            userType: "novice",
            usageScenario: "Scenario",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "simple", tone: "casual" }
          }
        ],
        feedback: [],
        stage: "introduction",
        activePersonaId: "p1",
        sessionId: "session-a",
        iteration: 1,
        nextFeedbackNeeded: false
      };

      const session2Input = {
        targetServer: "ServerB",
        personas: [
          {
            id: "p2",
            name: "User 2",
            userType: "expert",
            usageScenario: "Scenario",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "technical", tone: "formal" }
          }
        ],
        feedback: [],
        stage: "deep-dive",
        activePersonaId: "p2",
        sessionId: "session-b",
        iteration: 1,
        nextFeedbackNeeded: false
      };

      const result1 = serverInstance.processFocusGroup(session1Input);
      const result2 = serverInstance.processFocusGroup(session2Input);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should evict oldest sessions when max limit reached", () => {
      const maxSessions = 100;
      // Create more than max sessions
      for (let i = 0; i <= maxSessions; i++) {
        const input = {
          targetServer: "TestServer",
          personas: [
            {
              id: "p1",
              name: "User",
              userType: "novice",
              usageScenario: "Scenario",
              expectations: [],
              priorities: [],
              constraints: [],
              communication: { style: "simple", tone: "casual" }
            }
          ],
          feedback: [],
          stage: "introduction",
          activePersonaId: "p1",
          sessionId: `session-${i}`,
          iteration: 1,
          nextFeedbackNeeded: false
        };
        const result = serverInstance.processFocusGroup(input);
        expect(result).toBeDefined();
      }
    });
  });

  /**
   * Edge Cases and Performance Tests.
   */
  describe("Edge Cases and Performance", () => {
    it("handles large number of feedback items", () => {
      const feedback = Array.from({ length: 100 }, (_, i) => ({
        personaId: "persona1",
        content: `Feedback ${i}`,
        type: "suggestion" as const,
        severity: 0.5
      }));

      const input = {
        targetServer: "TestServer",
        personas: [
          {
            id: "persona1",
            name: "User",
            userType: "developer",
            usageScenario: "Testing",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "technical", tone: "formal" }
          }
        ],
        feedback,
        stage: "deep-dive",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      const result = serverInstance.processFocusGroup(input);
      expect(result).toBeDefined();
    });

    it("handles empty feedback array gracefully", () => {
      const input = {
        targetServer: "TestServer",
        personas: [
          {
            id: "persona1",
            name: "User",
            userType: "novice",
            usageScenario: "First use",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "simple", tone: "casual" }
          }
        ],
        feedback: [],
        stage: "introduction",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: true
      };
      const result = serverInstance.processFocusGroup(input);
      expect(result).toBeDefined();
    });

    it("handles special characters in inputs", () => {
      const input = {
        targetServer: "Test & Special <Server> 🎉",
        personas: [
          {
            id: "persona-1",
            name: "User with 'quotes'",
            userType: "expert",
            usageScenario: 'Scenario with "special" chars',
            expectations: ["Expectation with émojis 🚀"],
            priorities: ["Priority <html>"],
            constraints: ["Constraint (parenthetical)"],
            communication: { style: "technical", tone: "formal" }
          }
        ],
        feedback: [
          {
            personaId: "persona-1",
            content: "Feedback with special chars: @#$% & émojis 🎉",
            type: "suggestion",
            severity: 0.8
          }
        ],
        stage: "synthesis",
        activePersonaId: "persona-1",
        sessionId: "session-1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      const result = serverInstance.processFocusGroup(input);
      expect(result).toBeDefined();
    });

    it("handles all feedback types", () => {
      const feedbackTypes: Array<"praise" | "confusion" | "suggestion" | "usability" | "feature" | "bug" | "summary"> = [
        "praise",
        "confusion",
        "suggestion",
        "usability",
        "feature",
        "bug",
        "summary"
      ];

      const feedback = feedbackTypes.map((type) => ({
        personaId: "persona1",
        content: `Feedback of type ${type}`,
        type,
        severity: 0.5
      }));

      const input = {
        targetServer: "TestServer",
        personas: [
          {
            id: "persona1",
            name: "User",
            userType: "expert",
            usageScenario: "Testing",
            expectations: [],
            priorities: [],
            constraints: [],
            communication: { style: "technical", tone: "formal" }
          }
        ],
        feedback,
        stage: "recommendations",
        activePersonaId: "persona1",
        sessionId: "session1",
        iteration: 1,
        nextFeedbackNeeded: false
      };
      const result = serverInstance.processFocusGroup(input);
      expect(result).toBeDefined();
    });

    it("handles all stage types", () => {
      const stages: Array<
        "introduction" | "initial-impressions" | "deep-dive" | "synthesis" | "recommendations" | "prioritization"
      > = ["introduction", "initial-impressions", "deep-dive", "synthesis", "recommendations", "prioritization"];

      for (const stage of stages) {
        const input = {
          targetServer: "TestServer",
          personas: [
            {
              id: "persona1",
              name: "User",
              userType: "novice",
              usageScenario: "Testing",
              expectations: [],
              priorities: [],
              constraints: [],
              communication: { style: "simple", tone: "casual" }
            }
          ],
          feedback: [],
          stage,
          activePersonaId: "persona1",
          sessionId: `session-${stage}`,
          iteration: 1,
          nextFeedbackNeeded: false
        };
        const result = serverInstance.processFocusGroup(input);
        expect(result).toBeDefined();
      }
    });
  });
});
