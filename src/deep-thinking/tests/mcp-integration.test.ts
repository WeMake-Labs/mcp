import { expect, test, describe, beforeEach } from "vitest";
import { DeepThinkingServer } from "../index.js";

describe("MCP Server Integration", () => {
  let deepThinkingServer: DeepThinkingServer;

  beforeEach(() => {
    deepThinkingServer = new DeepThinkingServer();
  });

  describe("Server Functionality", () => {
    test("should create DeepThinkingServer instance", () => {
      expect(deepThinkingServer).toBeInstanceOf(DeepThinkingServer);
    });

    test("should have processThought method", () => {
      expect(typeof deepThinkingServer.processThought).toBe("function");
    });
  });

  describe("Integration Scenarios", () => {
    test("should process multiple thoughts in sequence", () => {
      const thought1 = {
        thought: "First integration test thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const thought2 = {
        thought: "Second integration test thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const result1 = deepThinkingServer.processThought(thought1);
      const result2 = deepThinkingServer.processThought(thought2);

      expect(result1.isError).toBeUndefined();
      expect(result2.isError).toBeUndefined();

      const parsed1 = JSON.parse(result1.content[0]?.text || "{}");
      const parsed2 = JSON.parse(result2.content[0]?.text || "{}");

      expect(parsed1.thoughtHistoryLength).toBe(1);
      expect(parsed2.thoughtHistoryLength).toBe(2);
    });

    test("should handle complex branching scenario", () => {
      const mainThought = {
        thought: "Main thought for branching test",
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true
      };

      const branch1 = {
        thought: "First branch exploration",
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "exploration-1"
      };

      const branch2 = {
        thought: "Second branch exploration",
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "exploration-2"
      };

      deepThinkingServer.processThought(mainThought);
      deepThinkingServer.processThought(branch1);
      const result = deepThinkingServer.processThought(branch2);

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.branches).toContain("exploration-1");
      expect(parsed.branches).toContain("exploration-2");
      expect(parsed.branches).toHaveLength(2);
    });

    test("should handle revision workflow", () => {
      const originalThought = {
        thought: "Original thought that needs revision",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const revisionThought = {
        thought: "Revised version of the original thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 1
      };

      deepThinkingServer.processThought(originalThought);
      const result = deepThinkingServer.processThought(revisionThought);

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.thoughtHistoryLength).toBe(2);
    });

    test("should handle error recovery", () => {
      const invalidInput = {
        thought: "Valid thought"
        // Missing required fields
      };

      const validInput = {
        thought: "Recovery thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const errorResult = deepThinkingServer.processThought(invalidInput);
      const validResult = deepThinkingServer.processThought(validInput);

      expect(errorResult.isError).toBe(true);
      expect(validResult.isError).toBeUndefined();

      const parsed = JSON.parse(validResult.content[0]?.text || "{}");
      expect(parsed.thoughtHistoryLength).toBe(1);
    });
  });

  describe("Environment Configuration", () => {
    test("should respect DISABLE_THOUGHT_LOGGING environment variable", () => {
      // Test with logging disabled
      process.env.DISABLE_THOUGHT_LOGGING = "true";
      const serverWithLoggingDisabled = new DeepThinkingServer();

      const input = {
        thought: "Test thought with logging disabled",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = serverWithLoggingDisabled.processThought(input);
      expect(result.isError).toBeUndefined();

      // Clean up
      delete process.env.DISABLE_THOUGHT_LOGGING;
    });

    test("should handle case-insensitive environment variable", () => {
      process.env.DISABLE_THOUGHT_LOGGING = "TRUE";
      const server = new DeepThinkingServer();

      expect(server).toBeInstanceOf(DeepThinkingServer);

      // Clean up
      delete process.env.DISABLE_THOUGHT_LOGGING;
    });
  });
});
