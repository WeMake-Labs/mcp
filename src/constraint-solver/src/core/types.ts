export interface ConstraintProblem {
  variables: Record<string, number>;
  constraints: string[];
}

export interface ConstraintResult {
  satisfied: boolean;
  unsatisfied: string[];
}
