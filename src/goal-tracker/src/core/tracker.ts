import { Goal } from "./types.js";

/**
 * GoalTracker Core Logic
 *
 * Purpose:
 * Implements the pure business logic for goal management. It handles data validation,
 * state transitions (e.g., marking as complete), and maintains the list of goals.
 * This class is independent of the MCP protocol and can be used in any context.
 *
 * Limitations:
 * - Stores goals in an in-memory array (`this.goals`).
 * - No external database dependency.
 *
 * Operational Workflows:
 * - Use `addGoal()` to insert new unique goals.
 * - Use `completeGoal()` to mark existing goals as finished.
 * - Use `getGoals()` to retrieve the current state.
 */
export class GoalTrackerCore {
  private goals: Goal[] = [];

  constructor() {}

  addGoal(goal: string): void {
    const trimmedGoal = goal?.trim();
    if (!trimmedGoal) {
      throw new Error("Goal cannot be empty");
    }
    // idempotent: prevent duplicate goals
    if (!this.goals.some((g) => g.goal === trimmedGoal)) {
      this.goals.push({ goal: trimmedGoal, completed: false });
    }
  }

  completeGoal(goal: string): void {
    const trimmedGoal = goal?.trim();
    if (!trimmedGoal) {
      throw new Error("Goal cannot be empty");
    }
    const g = this.goals.find((x) => x.goal === trimmedGoal);
    if (g) {
      g.completed = true;
    } else {
      throw new Error(`Goal not found: ${trimmedGoal}`);
    }
  }

  getGoals(): Goal[] {
    return [...this.goals];
  }
}
