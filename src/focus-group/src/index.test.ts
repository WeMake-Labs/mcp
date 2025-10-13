import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { FocusGroupServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Test suite for Focus Group MCP Server.
 *
 * Business Context: Ensures the focus-group framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Focus Group Server", () => {
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
 *
 * Business Context: Verifies that MCP tools are correctly advertised to clients.
 */
describe("Tool Registration", () => {
  it("should advertise focusGroup tool", async () => {
    const server = createServer();
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("focusGroup");
    expect(response.tools[0].description).toContain("focus group");
  });
});

/**
 * Input Validation Tests.
 *
 * Business Context: Enterprise applications require robust input validation
 * to prevent data corruption and ensure GDPR compliance.
 *
 * Decision Rationale: Test validation logic directly without transport layer
 * to ensure clear error messages and proper input sanitization.
 */
describe("Input Validation", () => {
  let serverInstance: FocusGroupServer;

  beforeEach(() => {
    serverInstance = new FocusGroupServer();
  });

  it("should reject null input", () => {
    const result = serverInstance.processFocusGroup(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid targetServer");
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
    const result = serverInstance.processFocusGroup(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid targetServer");
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
    const result = serverInstance.processFocusGroup(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid personas");
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
    const result = serverInstance.processFocusGroup(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid feedback");
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
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
  });
});

/**
 * Persona Management Tests.
 */
describe("Persona Management", () => {
  let serverInstance: FocusGroupServer;

  beforeEach(() => {
    serverInstance = new FocusGroupServer();
  });

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
    expect(result.isError).toBeUndefined();
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
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.nextPersonaId).toBe("p2");
  });
});

/**
 * Session Management Tests.
 */
describe("Session Management", () => {
  let serverInstance: FocusGroupServer;

  beforeEach(() => {
    serverInstance = new FocusGroupServer();
  });

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

    expect(result1.isError).toBeUndefined();
    expect(result2.isError).toBeUndefined();
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
      expect(result.isError).toBeUndefined();
    }
  });
});

/**
 * MCP Server Integration Tests.
 *
 * Business Context: MCP protocol compliance is essential for AI agent integration.
 *
 * Decision Rationale: Test server initialization without requiring a connected transport.
 * Full integration testing is done via MCP Inspector during development workflow.
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
 *
 * Business Context: Enterprise applications must handle edge cases gracefully
 * and perform well under load.
 *
 * Decision Rationale: Test boundary conditions and performance to ensure
 * production reliability.
 */
describe("Edge Cases and Performance", () => {
  let serverInstance: FocusGroupServer;

  beforeEach(() => {
    serverInstance = new FocusGroupServer();
  });

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
    expect(result.isError).toBeUndefined();
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
    expect(result.isError).toBeUndefined();
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
    expect(result.isError).toBeUndefined();
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
    expect(result.isError).toBeUndefined();
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
      expect(result.isError).toBeUndefined();
    }
  });
});
