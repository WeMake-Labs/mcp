import { describe, expect, it, beforeEach } from "bun:test";
import { SequentialThinkingTracker } from "../../src/core/tracker.js";

describe("Sequential Thinking Core Tracker", () => {
  let tracker: SequentialThinkingTracker;

  beforeEach(() => {
    tracker = new SequentialThinkingTracker();
  });

  describe("Input Validation", () => {
    it("should reject null input", () => {
      const result = tracker.processThought(null);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid input");
    });

    it("should reject missing thought", () => {
      const input = {
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid thought");
    });

    it("should reject missing thoughtNumber", () => {
      const input = {
        thought: "First thought",
        totalThoughts: 5,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid thoughtNumber");
    });

    it("should reject missing totalThoughts", () => {
      const input = {
        thought: "First thought",
        thoughtNumber: 1,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid totalThoughts");
    });

    it("should reject missing nextThoughtNeeded", () => {
      const input = {
        thought: "First thought",
        thoughtNumber: 1,
        totalThoughts: 5
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid nextThoughtNeeded");
    });

    it("should process valid input successfully", () => {
      const validInput = {
        thought: "Let me think about this problem step by step",
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(validInput);
      expect(result.isError).toBeUndefined();
      expect(result.content[0].type).toBe("text");
    });
  });

  describe("Thought Processing", () => {
    it("should process a single thought", () => {
      const input = {
        thought: "First thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.thoughtNumber).toBe(1);
    });

    it("should process multiple thoughts in sequence", () => {
      tracker.processThought({
        thought: "First thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });
      tracker.processThought({
        thought: "Second thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });
      const result = tracker.processThought({
        thought: "Third thought",
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false
      });
      expect(result.isError).toBeUndefined();
    });

    it("should adjust totalThoughts if thoughtNumber exceeds it", () => {
      const input = {
        thought: "Unexpected additional thought",
        thoughtNumber: 6,
        totalThoughts: 5,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.totalThoughts).toBe(6);
    });
  });

  describe("Thought Revision", () => {
    it("should handle revision of a previous thought", () => {
      tracker.processThought({
        thought: "Initial thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });
      const result = tracker.processThought({
        thought: "Revised thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 1
      });
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.isRevision).toBe(true);
      expect(parsed.revisesThought).toBe(1);
    });
  });

  describe("Branch Tracking", () => {
    it("should handle branching from a thought", () => {
      tracker.processThought({
        thought: "Main thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });
      const result = tracker.processThought({
        thought: "Branching thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "branch-a"
      });
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.branchFromThought).toBe(1);
      expect(parsed.branchId).toBe("branch-a");
    });

    it("should track multiple branches independently", () => {
      tracker.processThought({
        thought: "Main thought",
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true
      });
      tracker.processThought({
        thought: "Branch A thought",
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "branch-a"
      });
      const result = tracker.processThought({
        thought: "Branch B thought",
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: "branch-b"
      });
      expect(result.isError).toBeUndefined();
    });
  });

  describe("Edge Cases and Performance", () => {
    it("handles very long thought strings", () => {
      const longThought = "a".repeat(10000);
      const input = {
        thought: longThought,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    it("handles empty thought string", () => {
      const input = {
        thought: "",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid thought");
    });

    it("handles special characters in thought", () => {
      const input = {
        thought: 'Thought with special chars: @#$% & émojis 🎉 <html> "quotes"',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBeUndefined();
    });

    it("handles many thoughts in sequence", () => {
      for (let i = 1; i <= 100; i++) {
        const result = tracker.processThought({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 100,
          nextThoughtNeeded: i < 100
        });
        expect(result.isError).toBeUndefined();
      }
    });

    it("handles needsMoreThoughts flag", () => {
      const input = {
        thought: "Realizing I need more thoughts",
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        needsMoreThoughts: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.needsMoreThoughts).toBe(true);
    });

    it("handles zero and negative thought numbers gracefully", () => {
      const input = {
        thought: "Edge case thought",
        thoughtNumber: 0,
        totalThoughts: 5,
        nextThoughtNeeded: true
      };
      const result = tracker.processThought(input);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid thoughtNumber");
    });
  });
});
