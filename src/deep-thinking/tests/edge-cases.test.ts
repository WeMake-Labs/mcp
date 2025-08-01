import { expect, test, describe, beforeEach } from "vitest";
import { DeepThinkingServer } from "../index.js";

describe("Deep Thinking Edge Cases", () => {
  let server: DeepThinkingServer;

  beforeEach(() => {
    server = new DeepThinkingServer();
  });

  describe("Input Edge Cases", () => {
    test("should handle empty string thought", () => {
      const input = {
        thought: "",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBe(true);

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.error).toContain("Invalid thought");
    });

    test("should handle very long thought text", () => {
      const longThought = "A".repeat(10000);
      const input = {
        thought: longThought,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle thought with special characters", () => {
      const input = {
        thought: "Thought with special chars: !@#$%^&*(){}[]|\\:;\"'<>,.?/~`",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle thought with unicode characters", () => {
      const input = {
        thought: "思考 with émojis 🤔💭 and ñoñó characters",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle thought with newlines and tabs", () => {
      const input = {
        thought: "Multi-line\nthought\twith\ttabs\nand\nnewlines",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });
  });

  describe("Numeric Edge Cases", () => {
    test("should handle zero thoughtNumber", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 0,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBe(true);

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.error).toContain("Invalid thoughtNumber");
    });

    test("should handle negative thoughtNumber", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: -1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle zero totalThoughts", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 0,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBe(true);

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.error).toContain("Invalid totalThoughts");
    });

    test("should handle very large numbers", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: Number.MAX_SAFE_INTEGER,
        totalThoughts: Number.MAX_SAFE_INTEGER,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle floating point numbers", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 1.5,
        totalThoughts: 2.7,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });
  });

  describe("Complex Branching Edge Cases", () => {
    test("should handle branch with empty branchId", () => {
      const input = {
        thought: "Branch with empty ID",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: ""
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      // Empty branchId is falsy, so it won't be added to branches
      expect(parsed.branches).toEqual([]);
    });

    test("should handle branch with special character branchId", () => {
      const specialBranchId = "branch-!@#$%^&*()";
      const input = {
        thought: "Branch with special chars",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: specialBranchId
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.branches).toContain(specialBranchId);
    });

    test("should handle multiple branches with same ID", () => {
      const branchId = "duplicate-branch";

      const branch1 = {
        thought: "First branch",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: branchId
      };

      const branch2 = {
        thought: "Second branch with same ID",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: branchId
      };

      server.processThought(branch1);
      const result = server.processThought(branch2);

      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.branches).toContain(branchId);
      expect(parsed.branches.filter((id: string) => id === branchId)).toHaveLength(1);
    });
  });

  describe("Revision Edge Cases", () => {
    test("should handle revision of non-existent thought", () => {
      const input = {
        thought: "Revising thought that doesn't exist",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 999
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle revision with negative revisesThought", () => {
      const input = {
        thought: "Revision with negative reference",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: -1
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle revision chain", () => {
      const original = {
        thought: "Original thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      const revision1 = {
        thought: "First revision",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 1
      };

      const revision2 = {
        thought: "Second revision",
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        isRevision: true,
        revisesThought: 2
      };

      server.processThought(original);
      server.processThought(revision1);
      const result = server.processThought(revision2);

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0]?.text || "{}");
      expect(parsed.thoughtHistoryLength).toBe(3);
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    test("should handle moderate number of thoughts", () => {
      const thoughtCount = 10;
      let lastResult;

      for (let i = 1; i <= thoughtCount; i++) {
        const input = {
          thought: `Thought number ${i}`,
          thoughtNumber: i,
          totalThoughts: thoughtCount,
          nextThoughtNeeded: i < thoughtCount
        };

        lastResult = server.processThought(input);
        expect(lastResult.isError).toBeUndefined();
      }

      const parsed = JSON.parse(lastResult?.content[0]?.text || "{}");
      expect(parsed.thoughtHistoryLength).toBe(thoughtCount);
    });

    test("should handle multiple branches", () => {
      const branchCount = 5;

      // Create main thought
      const mainThought = {
        thought: "Main thought for many branches",
        thoughtNumber: 1,
        totalThoughts: branchCount + 1,
        nextThoughtNeeded: true
      };

      server.processThought(mainThought);

      // Create multiple branches
      let lastResult;
      for (let i = 0; i < branchCount; i++) {
        const branch = {
          thought: `Branch ${i}`,
          thoughtNumber: 2,
          totalThoughts: branchCount + 1,
          nextThoughtNeeded: true,
          branchFromThought: 1,
          branchId: `branch-${i}`
        };

        lastResult = server.processThought(branch);
        expect(lastResult.isError).toBeUndefined();
      }

      const parsed = JSON.parse(lastResult?.content[0]?.text || "{}");
      expect(parsed.branches).toHaveLength(branchCount);
    });
  });

  describe("Type Coercion Edge Cases", () => {
    test("should handle null values", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        isRevision: null,
        revisesThought: null,
        branchFromThought: null,
        branchId: null
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    test("should handle undefined values", () => {
      const input = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        isRevision: undefined,
        revisesThought: undefined,
        branchFromThought: undefined,
        branchId: undefined
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();
    });
  });

  describe("JSON Serialization Edge Cases", () => {
    test("should handle circular reference in input", () => {
      const circularObj: Record<string, unknown> = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };
      circularObj.self = circularObj;

      const result = server.processThought(circularObj);
      expect(result.isError).toBeUndefined();
    });

    test("should produce valid JSON output", () => {
      const input = {
        thought: "Test for valid JSON",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      const result = server.processThought(input);
      expect(result.isError).toBeUndefined();

      // Should be able to parse the JSON without throwing
      expect(() => {
        JSON.parse(result.content[0]?.text || "{}");
      }).not.toThrow();
    });
  });
});
