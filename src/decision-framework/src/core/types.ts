export interface Option {
  id: string;
  name: string;
  description: string;
}

export interface Outcome {
  id: string;
  description: string;
  probability: number; // 0.0-1.0
  optionId: string;
  value: number; // Utility value, can be positive or negative
  confidenceInEstimate: number; // 0.0-1.0
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0.0-1.0, with all weights summing to 1.0
  evaluationMethod: "quantitative" | "qualitative" | "boolean";
}

export interface CriterionEvaluation {
  criterionId: string;
  optionId: string;
  score: number; // 0.0-1.0 for normalized scores
  justification: string;
}

export interface InformationGap {
  description: string;
  impact: number; // 0.0-1.0, how much it affects the decision
  researchMethod: string;
}

export interface DecisionAnalysisData {
  // Core decision elements
  decisionStatement: string;
  options: Option[];
  criteria?: Criterion[];
  criteriaEvaluations?: CriterionEvaluation[];
  possibleOutcomes?: Outcome[];
  informationGaps?: InformationGap[];

  // Decision context
  stakeholders: string[];
  constraints: string[];
  timeHorizon: string;
  riskTolerance: "risk-averse" | "risk-neutral" | "risk-seeking";

  // Analysis results
  expectedValues?: Record<string, number>; // optionId -> expected value
  multiCriteriaScores?: Record<string, number>; // optionId -> weighted score
  sensitivityInsights?: string[];
  recommendation?: string;

  // Process metadata
  decisionId: string;
  analysisType: "expected-utility" | "multi-criteria" | "maximin" | "minimax-regret" | "satisficing";
  stage: "problem-definition" | "options" | "criteria" | "evaluation" | "analysis" | "recommendation";
  iteration: number;

  // Next steps
  nextStageNeeded: boolean;
  suggestedNextStage?: string;
}
