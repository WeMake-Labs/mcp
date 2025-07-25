import { test, expect } from "bun:test";
import { DeepThinkingServer } from "../index";

test("DeepThinkingServer processes valid thought correctly", () => {
  const server = new DeepThinkingServer();
  const input = {
    thought: "This is a test thought",
    thoughtNumber: 1,
    totalThoughts: 1,
    nextThoughtNeeded: false
  };
  const result = server.processThought(input);
  expect(result.content).toBeDefined();
  expect(result.isError).toBeUndefined();
  const parsed = JSON.parse(result.content[0].text);
  expect(parsed.thoughtNumber).toBe(1);
  expect(parsed.nextThoughtNeeded).toBe(false);
});
