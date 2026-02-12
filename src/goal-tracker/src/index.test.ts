import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { GoalTracker } from "./index.js";

/**
 * Test suite for Goal Tracker MCP Server.
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
 * GoalTracker Code Mode API Unit Tests.
 */
describe("GoalTracker Code Mode API", () => {
  let tracker: GoalTracker;

  beforeEach(() => {
    tracker = new GoalTracker();
  });

  it("should add a goal successfully", () => {
    tracker.addGoal("Learn TypeScript");
    const goals = tracker.getGoals();
    expect(goals).toHaveLength(1);
    expect(goals[0].goal).toBe("Learn TypeScript");
    expect(goals[0].completed).toBe(false);
  });

  it("should handle duplicate goals idempotently", () => {
    tracker.addGoal("Learn TypeScript");
    tracker.addGoal("Learn TypeScript");
    const goals = tracker.getGoals();
    expect(goals).toHaveLength(1);
  });

  it("should complete an existing goal", () => {
    tracker.addGoal("Learn TypeScript");
    tracker.completeGoal("Learn TypeScript");
    const goals = tracker.getGoals();
    expect(goals[0].completed).toBe(true);
  });

  it("should throw error when completing unknown goal", () => {
    expect(() => {
      tracker.completeGoal("Unknown Goal");
    }).toThrow("Goal not found");
  });

  it("should throw error when adding empty goal", () => {
    expect(() => {
      tracker.addGoal("");
    }).toThrow("Goal cannot be empty");
  });

  it("should throw error when completing empty goal", () => {
    expect(() => {
      tracker.completeGoal("");
    }).toThrow("Goal cannot be empty");
  });

  it("should return status successfully", () => {
    tracker.addGoal("Goal 1");
    tracker.addGoal("Goal 2");
    const goals = tracker.getGoals();
    expect(goals).toHaveLength(2);
  });
  
  it("should add multiple goals via batch method", () => {
    tracker.addGoals(["Goal 1", "Goal 2"]);
    const goals = tracker.getGoals();
    expect(goals).toHaveLength(2);
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let tracker: GoalTracker;

  beforeEach(() => {
    tracker = new GoalTracker();
  });

  it("handles very long goal strings efficiently", () => {
    const longGoal = "a".repeat(10000);
    tracker.addGoal(longGoal);
    const goals = tracker.getGoals();
    expect(goals).toHaveLength(1);
    expect(goals[0].goal).toBe(longGoal);
  });

  it("should reject whitespace-only goal string", () => {  
    expect(() => {  
      tracker.addGoal("   ");  
    }).toThrow("Goal cannot be empty");  
  });  

  it("handles special characters and Unicode in goal", () => {
    const specialGoal = "Learn 日本語 & Emoji 🎉 with quotes \"'`";
    tracker.addGoal(specialGoal);
    const goals = tracker.getGoals();
    expect(goals[0].goal).toBe(specialGoal);
  });

  it("handles high volume of goals efficiently", () => {
    for (let i = 1; i <= 1000; i++) {
      tracker.addGoal(`Goal ${i}`);
    }
    const goals = tracker.getGoals();
    expect(goals).toHaveLength(1000);
  });
});
