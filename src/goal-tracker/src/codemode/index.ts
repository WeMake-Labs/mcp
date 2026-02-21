import { GoalTrackerCore } from "../core/tracker.js";
import { Goal } from "../core/types.js";

/**
 * GoalTracker Code Mode API
 *
 * Purpose:
 * Provides a high-level, programmable interface for managing goals within an LLM session.
 * It serves as a wrapper around the `GoalTrackerCore` logic, exposing a clean API for
 * adding, completing, and retrieving goals.
 *
 * Limitations:
 * - State is currently in-memory and will be lost when the process restarts.
 * - Does not support persistent storage or multi-user sessions.
 *
 * Workflows:
 * 1. Instantiate the class: `const tracker = new GoalTracker();`
 * 2. Add goals: `tracker.addGoal("My Goal");`
 * 3. Track progress: `tracker.getGoals();`
 * 4. Complete goals: `tracker.completeGoal("My Goal");`
 */
export class GoalTracker {
  private core: GoalTrackerCore;

  constructor() {
    this.core = new GoalTrackerCore();
  }

  /**
   * Adds a single goal to the tracker.
   * @param goal The goal description
   */
  addGoal(goal: string): void {
    this.core.addGoal(goal);
  }

  /**
   * Adds multiple goals to the tracker.
   * @param goals Array of goal descriptions
   */
  addGoals(goals: string[]): void {
    for (const goal of goals) {
      this.core.addGoal(goal);
    }
  }

  /**
   * Marks a goal as completed.
   * @param goal The goal description to complete
   */
  completeGoal(goal: string): void {
    this.core.completeGoal(goal);
  }

  /**
   * Retrieves all goals and their status.
   * @returns Array of Goal objects
   */
  getGoals(): Goal[] {
    return this.core.getGoals();
  }
}
