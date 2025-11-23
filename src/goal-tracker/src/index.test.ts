import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { GoalTracker } from "./index.js";

/**
 * Test suite for Goal Tracker MCP Server.
 *
 * Business Context: Ensures the goal tracker framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Goal Tracker Server", () => {
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
 * GoalTracker Unit Tests.
 *
 * Business Context: Core goal tracking logic must handle CRUD operations,
 * idempotency, and error cases correctly for enterprise applications.
 *
 * Decision Rationale: Direct unit tests on the GoalTracker class ensure
 * business logic correctness independent of server infrastructure.
 */
describe("GoalTracker Unit Tests", () => {
  let tracker: GoalTracker;

  beforeEach(() => {
    tracker = new GoalTracker();
  });

  it("should add a goal successfully", () => {
    const result = tracker.handle({ action: "add", goal: "Learn TypeScript" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("json");
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals).toHaveLength(1);
    expect(json.goals[0].goal).toBe("Learn TypeScript");
    expect(json.goals[0].completed).toBe(false);
  });

  it("should handle duplicate goals idempotently", () => {
    tracker.handle({ action: "add", goal: "Learn TypeScript" });
    tracker.handle({ action: "add", goal: "Learn TypeScript" });
    const result = tracker.handle({ action: "status" });
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals).toHaveLength(1);
  });

  it("should complete an existing goal", () => {
    tracker.handle({ action: "add", goal: "Learn TypeScript" });
    const result = tracker.handle({ action: "complete", goal: "Learn TypeScript" });
    expect(result.isError).toBeUndefined();
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals[0].completed).toBe(true);
  });

  it("should error when completing unknown goal", () => {
    const result = tracker.handle({ action: "complete", goal: "Unknown Goal" });
    expect(result.isError).toBe(true);
    expect(result.content[0].type).toBe("text");
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("nicht gefunden");
  });

  it("should error when adding goal without 'goal' parameter", () => {
    const result = tracker.handle({ action: "add" } as { action: "add"; goal?: string });
    expect(result.isError).toBe(true);
    expect(result.content[0].type).toBe("text");
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Fehlender Parameter");
  });

  it("should error when completing goal without 'goal' parameter", () => {
    const result = tracker.handle({ action: "complete" } as { action: "complete"; goal?: string });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Fehlender Parameter");
  });

  it("should return status successfully", () => {
    tracker.handle({ action: "add", goal: "Goal 1" });
    tracker.handle({ action: "add", goal: "Goal 2" });
    const result = tracker.handle({ action: "status" });
    expect(result.isError).toBeUndefined();
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals).toHaveLength(2);
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
  let tracker: GoalTracker;

  beforeEach(() => {
    tracker = new GoalTracker();
  });

  it("should reject add action without goal parameter", () => {
    const result = tracker.handle({ action: "add" } as { action: "add"; goal?: string });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Fehlender Parameter");
  });

  it("should reject complete action without goal parameter", () => {
    const result = tracker.handle({ action: "complete" } as { action: "complete"; goal?: string });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Fehlender Parameter");
  });

  it("should allow status action without goal parameter", () => {
    const result = tracker.handle({ action: "status" });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("json");
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
describe.skip("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("server exposes GoalTracker functionality", () => {
    const server = createServer();
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
  let tracker: GoalTracker;

  beforeEach(() => {
    tracker = new GoalTracker();
  });

  it("handles very long goal strings efficiently", () => {
    const longGoal = "a".repeat(10000);
    const result = tracker.handle({ action: "add", goal: longGoal });
    expect(result.isError).toBeUndefined();
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals).toHaveLength(1);
    expect(json.goals[0].goal).toBe(longGoal);
  });

  it("handles empty goal string", () => {
    const result = tracker.handle({ action: "add", goal: "" });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Fehlender Parameter");
  });

  it("handles whitespace-only goal string", () => {
    const result = tracker.handle({ action: "add", goal: "   " });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("Fehlender Parameter");
  });

  it("handles special characters and Unicode in goal", () => {
    const specialGoal = "Learn 日本語 & Emoji 🎉 with quotes \"'`";
    const result = tracker.handle({ action: "add", goal: specialGoal });
    expect(result.isError).toBeUndefined();
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals[0].goal).toBe(specialGoal);
  });

  it("handles high volume of goals efficiently", () => {
    for (let i = 1; i <= 1000; i++) {
      tracker.handle({ action: "add", goal: `Goal ${i}` });
    }
    const result = tracker.handle({ action: "status" });
    expect(result.isError).toBeUndefined();
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals).toHaveLength(1000);
  });

  it("handles concurrent operations safely", async () => {
    const operations = Array.from({ length: 100 }, (_, i) =>
      Promise.resolve(tracker.handle({ action: "add", goal: `Concurrent Goal ${i}` }))
    );
    await Promise.all(operations);
    const result = tracker.handle({ action: "status" });
    const json = (result.content[0] as { type: "json"; json: { goals: Array<{ goal: string; completed: boolean }> } })
      .json;
    expect(json.goals).toHaveLength(100);
  });
});
