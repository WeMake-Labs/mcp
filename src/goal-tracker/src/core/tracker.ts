import { Goal } from "./types.js";

export class GoalTrackerCore {
  private goals: Goal[] = [];

  constructor() {}

  addGoal(goal: string): void {
    if (!goal) {
      throw new Error("Goal cannot be empty");
    }
    // idempotent: prevent duplicate goals
    if (!this.goals.some((g) => g.goal === goal)) {
      this.goals.push({ goal, completed: false });
    }
  }

  completeGoal(goal: string): void {
    if (!goal) {
      throw new Error("Goal cannot be empty");
    }
    const g = this.goals.find((x) => x.goal === goal);
    if (g) {
      g.completed = true;
    } else {
      throw new Error(`Goal not found: ${goal}`);
    }
  }

  getGoals(): Goal[] {
    return [...this.goals];
  }
}
