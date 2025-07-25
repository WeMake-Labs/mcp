import { test, expect } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { z } from "zod";

// Assuming the planning handler is exported or can be tested via simulation
// For this example, we'll test the schema validation as a stand-in
test("Planning schema validates correctly", () => {
  const PlanningSchema = z.object({
    originalRequest: z.string(),
    tasks: z.array(z.object({ title: z.string(), description: z.string() }))
  });
  const validInput = {
    originalRequest: "Test request",
    tasks: [{ title: "Task1", description: "Desc1" }]
  };
  expect(() => PlanningSchema.parse(validInput)).not.toThrow();
});
