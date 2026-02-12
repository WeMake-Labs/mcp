import { GoalTrackerCore } from "../core/tracker.js";
import { Goal } from "../core/types.js";

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
