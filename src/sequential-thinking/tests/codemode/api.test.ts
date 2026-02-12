import { describe, expect, it, beforeEach } from "bun:test";
import { SequentialThinking } from "../../src/codemode/index.js";
import { ThoughtData } from "../../src/core/types.js";

describe("Sequential Thinking Code Mode API", () => {
  let sequentialThinking: SequentialThinking;

  beforeEach(() => {
    sequentialThinking = new SequentialThinking();
  });

  it("should initialize successfully", () => {
    expect(sequentialThinking).toBeDefined();
  });

  it("should process a valid thought", async () => {
    const thought: ThoughtData = {
      thought: "Test thought",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true
    };

    const result = await sequentialThinking.think(thought);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('"thoughtNumber": 1');
  });

  it("should handle invalid input gracefully", async () => {
    // We cast to unknown to simulate runtime type issues if called from JS,
    // though TS would block this.
    const invalidInput = {
      thought: "Missing fields"
    } as unknown as ThoughtData;

    const result = await sequentialThinking.think(invalidInput);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid thoughtNumber");
  });

  it("should maintain state between calls", async () => {
    await sequentialThinking.think({
      thought: "Thought 1",
      thoughtNumber: 1,
      totalThoughts: 2,
      nextThoughtNeeded: true
    });

    const result = await sequentialThinking.think({
      thought: "Thought 2",
      thoughtNumber: 2,
      totalThoughts: 2,
      nextThoughtNeeded: false
    });

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.thoughtNumber).toBe(2);
    expect(parsed.thoughtHistoryLength).toBe(2);
  });
});
