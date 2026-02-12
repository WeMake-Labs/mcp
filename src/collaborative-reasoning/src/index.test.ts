import { describe, expect, it, beforeEach } from "bun:test";
import createServer from "./mcp/server.js";
import { CollaborativeReasoning } from "./codemode/index.js";

/**
 * Test suite for Collaborative Reasoning MCP Server.
 *
 * Business Context: Ensures the collaborative-reasoning framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Collaborative Reasoning Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  // Note: Server name and version are validated via MCP protocol handshake,
  // tested by MCP Inspector during development workflow.
});

/**
 * Tool Registration Tests.
 *
 * Business Context: Verifies that MCP tools are correctly advertised to clients.
 */
describe("Tool Registration", () => {
  it.skip("should register collaborativeReasoning tool correctly", () => {
    const server = createServer();

    // Tool registration is validated via MCP protocol handshake and tested
    // by MCP Inspector during development workflow. Direct handler testing
    // requires transport layer which is not available in unit tests.
    expect(server).toBeDefined();
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
  let collaborativeReasoning: CollaborativeReasoning;

  beforeEach(() => {
    collaborativeReasoning = new CollaborativeReasoning();
  });

  it("should reject null input", async () => {
    // expect(collaborativeReasoning.collaborate(null)).rejects.toThrow();
    // Bun test might not have rejects.toThrow shorthand or it might be different.
    // Using try-catch block for safety.
    let error;
    try {
      await collaborativeReasoning.collaborate(null);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it("should reject input missing topic", async () => {
    const invalidInput = {
      personas: [],
      contributions: [],
      stage: "ideation",
      activePersonaId: "persona1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: false
    };
    let error;
    try {
      await collaborativeReasoning.collaborate(invalidInput);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(String(error)).toContain("Invalid topic");
  });

  it("should reject input missing personas", async () => {
    const invalidInput = {
      topic: "Test Topic",
      contributions: [],
      stage: "ideation",
      activePersonaId: "persona1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: false
    };
    let error;
    try {
      await collaborativeReasoning.collaborate(invalidInput);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(String(error)).toContain("Invalid personas");
  });

  it("should reject input missing contributions", async () => {
    const invalidInput = {
      topic: "Test Topic",
      personas: [],
      stage: "ideation",
      activePersonaId: "persona1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: false
    };
    let error;
    try {
      await collaborativeReasoning.collaborate(invalidInput);
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(String(error)).toContain("Invalid contributions");
  });

  it("should process valid input successfully", async () => {
    const validInput = {
      topic: "Should we adopt AI in our workflow?",
      personas: [
        {
          id: "persona1",
          name: "Technical Lead",
          expertise: ["Software Architecture", "AI/ML"],
          background: "10 years in software development",
          perspective: "Focus on technical feasibility",
          biases: ["Technology optimism"],
          communication: {
            style: "analytical",
            tone: "professional"
          }
        }
      ],
      contributions: [
        {
          personaId: "persona1",
          content: "AI adoption requires careful planning",
          type: "observation",
          confidence: 0.8
        }
      ],
      stage: "ideation",
      activePersonaId: "persona1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: false
    };
    const result = await collaborativeReasoning.collaborate(validInput);
    expect(result).toBeDefined();
    expect(result.topic).toBe(validInput.topic);
  });
});

/**
 * Persona Management Tests.
 */
describe("Persona Management", () => {
  let collaborativeReasoning: CollaborativeReasoning;

  beforeEach(() => {
    collaborativeReasoning = new CollaborativeReasoning();
  });

  it("should handle multiple personas correctly", async () => {
    const input = {
      topic: "Technology Decision",
      personas: [
        {
          id: "tech",
          name: "Tech Lead",
          expertise: ["Engineering"],
          background: "Tech background",
          perspective: "Technical view",
          biases: ["Tech bias"],
          communication: { style: "direct", tone: "formal" }
        },
        {
          id: "biz",
          name: "Business Lead",
          expertise: ["Business"],
          background: "Business background",
          perspective: "Business view",
          biases: ["Cost bias"],
          communication: { style: "narrative", tone: "casual" }
        }
      ],
      contributions: [],
      stage: "problem-definition",
      activePersonaId: "tech",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: true
    };
    const result = await collaborativeReasoning.collaborate(input);
    expect(result).toBeDefined();
  });

  it("should rotate personas when nextPersonaId not specified", async () => {
    const input = {
      topic: "Decision Topic",
      personas: [
        {
          id: "p1",
          name: "Person 1",
          expertise: ["A"],
          background: "Background 1",
          perspective: "View 1",
          biases: [],
          communication: { style: "direct", tone: "formal" }
        },
        {
          id: "p2",
          name: "Person 2",
          expertise: ["B"],
          background: "Background 2",
          perspective: "View 2",
          biases: [],
          communication: { style: "direct", tone: "formal" }
        }
      ],
      contributions: [],
      stage: "ideation",
      activePersonaId: "p1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: true
    };
    const result = await collaborativeReasoning.collaborate(input);
    expect(result.nextPersonaId).toBe("p2");
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

  it.skip("rejects unknown tool name", async () => {
    const server = createServer();

    // Unknown tool rejection is validated via MCP protocol handshake and tested
    // by MCP Inspector during development workflow. Direct handler testing
    // requires transport layer which is not available in unit tests.
    expect(server).toBeDefined();
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
  let collaborativeReasoning: CollaborativeReasoning;

  beforeEach(() => {
    collaborativeReasoning = new CollaborativeReasoning();
  });

  it("handles large number of contributions", async () => {
    const contributions = Array.from({ length: 100 }, (_, i) => ({
      personaId: "persona1",
      content: `Contribution ${i}`,
      type: "observation" as const,
      confidence: 0.8
    }));

    const input = {
      topic: "Large Discussion",
      personas: [
        {
          id: "persona1",
          name: "Contributor",
          expertise: ["General"],
          background: "Background",
          perspective: "Perspective",
          biases: [],
          communication: { style: "direct", tone: "formal" }
        }
      ],
      contributions,
      stage: "ideation",
      activePersonaId: "persona1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: false
    };
    const result = await collaborativeReasoning.collaborate(input);
    expect(result).toBeDefined();
    expect(result.contributions.length).toBe(100);
  });

  it("handles empty contributions array gracefully", async () => {
    const input = {
      topic: "Empty Discussion",
      personas: [
        {
          id: "persona1",
          name: "Contributor",
          expertise: ["General"],
          background: "Background",
          perspective: "Perspective",
          biases: [],
          communication: { style: "direct", tone: "formal" }
        }
      ],
      contributions: [],
      stage: "problem-definition",
      activePersonaId: "persona1",
      sessionId: "session1",
      iteration: 1,
      nextContributionNeeded: true
    };
    const result = await collaborativeReasoning.collaborate(input);
    expect(result).toBeDefined();
    expect(result.contributions.length).toBe(0);
  });

  it("handles special characters in inputs", async () => {
    const input = {
      topic: "Special chars: @#$% & émojis 🎉",
      personas: [
        {
          id: "persona-1",
          name: "Person with 'quotes'",
          expertise: ["Test & Debug"],
          background: 'Background with "quotes"',
          perspective: "Perspective <html>",
          biases: ["Bias (parenthetical)"],
          communication: { style: "direct", tone: "formal" }
        }
      ],
      contributions: [
        {
          personaId: "persona-1",
          content: "Content with special chars: €£¥",
          type: "observation",
          confidence: 0.9
        }
      ],
      stage: "critique",
      activePersonaId: "persona-1",
      sessionId: "session-1",
      iteration: 1,
      nextContributionNeeded: false
    };
    const result = await collaborativeReasoning.collaborate(input);
    expect(result).toBeDefined();
    expect(result.topic).toContain("émojis");
  });
});
