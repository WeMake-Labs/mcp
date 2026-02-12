import { ConstraintProblem, ConstraintResult } from "../core/types.js";
import { solve } from "../core/logic.js";

export class ConstraintSolver {
  /**
   * Checks if a set of variables satisfies all constraints.
   *
   * @param input - The problem definition containing variables and constraints.
   * @returns A promise resolving to the result of the constraint check.
   */
  async check(input: ConstraintProblem): Promise<ConstraintResult> {
    return solve(input);
  }
}
