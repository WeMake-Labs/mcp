import { expect, test } from "vitest";
import { DeepThinkingServer } from "../index";

test("DeepThinkingServer processes a basic thought correctly", () => {
  const server = new DeepThinkingServer();
  const input = {
    thought: "This is a test thought",
    thoughtNumber: 1,
    totalThoughts: 1,
    nextThoughtNeeded: false
  };
  const result = server.processThought(input);
  expect(result.content?.[0]?.type).toBe("text");
  expect(result.content?.[0]?.text).toContain('"thoughtNumber": 1');
  expect(result.isError).toBeUndefined();
});
