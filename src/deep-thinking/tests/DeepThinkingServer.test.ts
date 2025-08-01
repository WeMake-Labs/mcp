import { expect, test, describe, beforeEach, vi } from "vitest";
import { DeepThinkingServer } from "../index.js";

describe("DeepThinkingServer", () => {
  let server: DeepThinkingServer;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset environment variables
    delete process.env.DISABLE_THOUGHT_LOGGING;
    server = new DeepThinkingServer();

    // Mock console.error to capture thought logging
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("constructor", () => {
    test("should initialize with thought logging enabled by default", () => {
      const server = new DeepThinkingServer();
      expect(server).toBeInstanceOf(DeepThinkingServer);
    });

    test("should disable thought logging when environment variable is set", () => {
      process.env.DISABLE_THOUGHT_LOGGING = "true";
      const server = new DeepThinkingServer();
      expect(server).toBeInstanceOf(DeepThinkingServer);
    });

    test("should handle case-insensitive environment variable", () => {
      process.env.DISABLE_THOUGHT_LOGGING = "TRUE";
      const server = new DeepThinkingServer();
      expect(server).toBeInstanceOf(DeepThinkingServer);
    });
  });

  describe("processThought", () => {
    test("should process valid thought data successfully", () => {
      const validInput = {
        thought: "This is a test thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const result = server.processThought(validInput);

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe("text");

      const parsedResponse = JSON.parse(result.content[0]?.text || "{}");
      expect(parsedResponse.thoughtNumber).toBe(1);
      expect(parsedResponse.totalThoughts).toBe(3);
      expect(parsedResponse.nextThoughtNeeded).toBe(true);
      expect(parsedResponse.thoughtHistoryLength).toBe(1);
    });

    test("should adjust totalThoughts when thoughtNumber exceeds it", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 5,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const result = server.processThought(input);
      const parsedResponse = JSON.parse(result.content[0]?.text || "{}");

      expect(parsedResponse.totalThoughts).toBe(5);
    });

    test("should handle revision thoughts", () => {
      const revisionInput = {
        thought: "This is a revision",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 1
      };

      const result = server.processThought(revisionInput);
      expect(result.isError).toBeUndefined();

      const parsedResponse = JSON.parse(result.content[0]?.text || "{}");
      expect(parsedResponse.thoughtHistoryLength).toBe(1);
    });

    test("should handle branch thoughts", () => {
      const branchInput = {
        thought: "This is a branch",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "alternative-approach-1"
      };

      const result = server.processThought(branchInput);
      expect(result.isError).toBeUndefined();

      const parsedResponse = JSON.parse(result.content[0]?.text || "{}");
      expect(parsedResponse.branches).toContain("alternative-approach-1");
    });

    test("should log formatted thoughts to console when logging is enabled", () => {
      const input = {
        thought: "Test thought for logging",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      server.processThought(input);
      expect(consoleSpy).toHaveBeenCalled();
    });

    test("should not log thoughts when logging is disabled", () => {
      // Reset the spy to clear any previous calls
      consoleSpy.mockClear();

      process.env.DISABLE_THOUGHT_LOGGING = "true";
      const server = new DeepThinkingServer();

      const input = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      server.processThought(input);
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("input validation", () => {
    test("should return error for missing thought", () => {
      const invalidInput = {
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid thought: must be a string");
    });

    test("should return error for invalid thought type", () => {
      const invalidInput = {
        thought: 123,
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid thought: must be a string");
    });

    test("should return error for missing thoughtNumber", () => {
      const invalidInput = {
        thought: "Test",
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid thoughtNumber: must be a number");
    });

    test("should return error for invalid thoughtNumber type", () => {
      const invalidInput = {
        thought: "Test",
        thoughtNumber: "1",
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid thoughtNumber: must be a number");
    });

    test("should return error for missing totalThoughts", () => {
      const invalidInput = {
        thought: "Test",
        thoughtNumber: 1,
        nextThoughtNeeded: true
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid totalThoughts: must be a number");
    });

    test("should return error for invalid totalThoughts type", () => {
      const invalidInput = {
        thought: "Test",
        thoughtNumber: 1,
        totalThoughts: "2",
        nextThoughtNeeded: true
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid totalThoughts: must be a number");
    });

    test("should return error for missing nextThoughtNeeded", () => {
      const invalidInput = {
        thought: "Test",
        thoughtNumber: 1,
        totalThoughts: 2
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid nextThoughtNeeded: must be a boolean");
    });

    test("should return error for invalid nextThoughtNeeded type", () => {
      const invalidInput = {
        thought: "Test",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: "true"
      };

      const result = server.processThought(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0]?.text).toContain("Invalid nextThoughtNeeded: must be a boolean");
    });
  });

  describe("thought history management", () => {
    test("should maintain thought history across multiple thoughts", () => {
      const thought1 = {
        thought: "First thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const thought2 = {
        thought: "Second thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      server.processThought(thought1);
      const result = server.processThought(thought2);

      const parsedResponse = JSON.parse(result.content[0]?.text || "{}");
      expect(parsedResponse.thoughtHistoryLength).toBe(2);
    });

    test("should manage multiple branches correctly", () => {
      const mainThought = {
        thought: "Main thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const branch1 = {
        thought: "Branch 1",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "branch-1"
      };

      const branch2 = {
        thought: "Branch 2",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "branch-2"
      };

      server.processThought(mainThought);
      server.processThought(branch1);
      const result = server.processThought(branch2);

      const parsedResponse = JSON.parse(result.content[0]?.text || "{}");
      expect(parsedResponse.branches).toContain("branch-1");
      expect(parsedResponse.branches).toContain("branch-2");
      expect(parsedResponse.branches).toHaveLength(2);
    });
  });
});
