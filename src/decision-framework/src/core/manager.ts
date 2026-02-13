import { DecisionAnalysisData, Option, Criterion, CriterionEvaluation, Outcome, InformationGap } from "./types.js";

/**
 * DecisionManager - Core decision analysis engine
 *
 * Purpose: Validates decision analysis data, manages decision history, and performs
 * calculations for expected utility and multi-criteria analysis.
 *
 * Limitations:
 * - Assumes probability values sum to 1.0 (normalizes if not)
 * - Assumes criterion weights sum to 1.0 (normalizes if not)
 * - Does not persist decision history across process restarts
 *
 * Workflow:
 * 1. Validate input data structure and types
 * 2. Auto-generate missing IDs for options, criteria, and outcomes
 * 3. Update decision history and registries
 * 4. Calculate expected values (for expected-utility analysis)
 * 5. Calculate multi-criteria scores (for multi-criteria analysis)
 */
export class DecisionManager {
  private decisionHistory: Record<string, DecisionAnalysisData[]> = {};
  private optionRegistry: Record<string, Record<string, Option>> = {};
  private criteriaRegistry: Record<string, Record<string, Criterion>> = {};
  private nextElementId = 1;

  public validateDecisionAnalysisData(input: unknown): DecisionAnalysisData {
    const data = input as Record<string, unknown>;

    // Validate required fields
    if (!data.decisionStatement || typeof data.decisionStatement !== "string") {
      throw new Error("Invalid decisionStatement: must be a string");
    }

    if (!data.decisionId || typeof data.decisionId !== "string") {
      throw new Error("Invalid decisionId: must be a string");
    }

    // stronger runtime validation for analysisType
    const allowedAnalysis = new Set(["expected-utility", "multi-criteria", "maximin", "minimax-regret", "satisficing"]);
    if (!data.analysisType || typeof data.analysisType !== "string" || !allowedAnalysis.has(data.analysisType)) {
      throw new Error("Invalid analysisType: must be one of " + [...allowedAnalysis].join(", "));
    }

    // stronger runtime validation for stage
    const allowedStages = new Set([
      "problem-definition",
      "options",
      "criteria",
      "evaluation",
      "analysis",
      "recommendation"
    ]);
    if (!data.stage || typeof data.stage !== "string" || !allowedStages.has(data.stage)) {
      throw new Error("Invalid stage: must be one of " + [...allowedStages].join(", "));
    }

    // stronger runtime validation for riskTolerance
    const allowedRisk = new Set(["risk-averse", "risk-neutral", "risk-seeking"]);
    if (!data.riskTolerance || typeof data.riskTolerance !== "string" || !allowedRisk.has(data.riskTolerance)) {
      throw new Error("Invalid riskTolerance: must be one of " + [...allowedRisk].join(", "));
    }

    if (!data.timeHorizon || typeof data.timeHorizon !== "string") {
      throw new Error("Invalid timeHorizon: must be a string");
    }

    if (typeof data.iteration !== "number" || data.iteration < 0) {
      throw new Error("Invalid iteration: must be a non-negative number");
    }

    if (typeof data.nextStageNeeded !== "boolean") {
      throw new Error("Invalid nextStageNeeded: must be a boolean");
    }

    // Validate arrays
    if (!Array.isArray(data.options)) {
      throw new Error("Invalid options: must be an array");
    }

    if (!Array.isArray(data.stakeholders)) {
      throw new Error("Invalid stakeholders: must be an array");
    }

    if (!Array.isArray(data.constraints)) {
      throw new Error("Invalid constraints: must be an array");
    }

    // Process options
    const options: Option[] = [];
    for (const option of data.options as Array<Record<string, unknown>>) {
      if (!option.id || typeof option.id !== "string") {
        option.id = `option-${this.nextElementId++}`;
      }

      if (!option.name || typeof option.name !== "string") {
        throw new Error(`Invalid option name for option ${option.id}: must be a string`);
      }

      if (!option.description || typeof option.description !== "string") {
        throw new Error(`Invalid option description for option ${option.id}: must be a string`);
      }

      options.push({
        id: option.id as string,
        name: option.name as string,
        description: option.description as string
      });
    }

    // Process criteria
    const criteria: Criterion[] = [];
    if (Array.isArray(data.criteria)) {
      for (const criterion of data.criteria as Array<Record<string, unknown>>) {
        if (!criterion.id || typeof criterion.id !== "string") {
          criterion.id = `criterion-${this.nextElementId++}`;
        }

        if (!criterion.name || typeof criterion.name !== "string") {
          throw new Error(`Invalid criterion name for criterion ${criterion.id}: must be a string`);
        }

        if (!criterion.description || typeof criterion.description !== "string") {
          throw new Error(`Invalid criterion description for criterion ${criterion.id}: must be a string`);
        }

        if (typeof criterion.weight !== "number" || criterion.weight < 0 || criterion.weight > 1) {
          throw new Error(`Invalid criterion weight for criterion ${criterion.id}: must be a number between 0 and 1`);
        }

        const allowedEval = new Set<Criterion["evaluationMethod"]>(["quantitative", "qualitative", "boolean"]);
        if (
          !criterion.evaluationMethod ||
          typeof criterion.evaluationMethod !== "string" ||
          !allowedEval.has(criterion.evaluationMethod as Criterion["evaluationMethod"])
        ) {
          throw new Error(
            `Invalid criterion evaluationMethod for criterion ${criterion.id}: must be one of ${[...allowedEval].join(", ")}`
          );
        }

        criteria.push({
          id: criterion.id as string,
          name: criterion.name as string,
          description: criterion.description as string,
          weight: criterion.weight as number,
          evaluationMethod: criterion.evaluationMethod as Criterion["evaluationMethod"]
        });
      }
    }

    // Process criteria evaluations
    const criteriaEvaluations: CriterionEvaluation[] = [];
    const optionIds = new Set(options.map((o) => o.id));
    const criterionIds = new Set(criteria.map((c) => c.id));

    if (Array.isArray(data.criteriaEvaluations)) {
      for (const evaluation of data.criteriaEvaluations as Array<Record<string, unknown>>) {
        if (!evaluation.criterionId || typeof evaluation.criterionId !== "string") {
          throw new Error("Invalid criterionId in evaluation: must be a string");
        }
        if (!evaluation.optionId || typeof evaluation.optionId !== "string") {
          throw new Error("Invalid optionId in evaluation: must be a string");
        }
        if (!criterionIds.has(evaluation.criterionId as string)) {
          throw new Error(`Unknown criterionId in evaluation: ${evaluation.criterionId}`);
        }
        if (!optionIds.has(evaluation.optionId as string)) {
          throw new Error(`Unknown optionId in evaluation: ${evaluation.optionId}`);
        }
        if (typeof evaluation.score !== "number" || evaluation.score < 0 || evaluation.score > 1) {
          throw new Error("Invalid score in evaluation: must be a number between 0 and 1");
        }
        if (!evaluation.justification || typeof evaluation.justification !== "string") {
          throw new Error("Invalid justification in evaluation: must be a string");
        }

        criteriaEvaluations.push({
          criterionId: evaluation.criterionId as string,
          optionId: evaluation.optionId as string,
          score: evaluation.score as number,
          justification: evaluation.justification as string
        });
      }
    }

    // Process outcomes
    const possibleOutcomes: Outcome[] = [];
    if (Array.isArray(data.possibleOutcomes)) {
      for (const outcome of data.possibleOutcomes as Array<Record<string, unknown>>) {
        if (!outcome.id || typeof outcome.id !== "string") {
          outcome.id = `outcome-${this.nextElementId++}`;
        }

        if (!outcome.description || typeof outcome.description !== "string") {
          throw new Error(`Invalid outcome description for outcome ${outcome.id}: must be a string`);
        }

        if (!outcome.optionId || typeof outcome.optionId !== "string") {
          throw new Error(`Invalid optionId for outcome ${outcome.id}: must be a string`);
        }
        if (!options.some((o) => o.id === outcome.optionId)) {
          throw new Error(`Unknown optionId for outcome ${outcome.id}: ${outcome.optionId}`);
        }

        if (typeof outcome.probability !== "number" || outcome.probability < 0 || outcome.probability > 1) {
          throw new Error(`Invalid probability for outcome ${outcome.id}: must be a number between 0 and 1`);
        }

        if (typeof outcome.value !== "number") {
          throw new Error(`Invalid value for outcome ${outcome.id}: must be a number`);
        }

        if (
          typeof outcome.confidenceInEstimate !== "number" ||
          outcome.confidenceInEstimate < 0 ||
          outcome.confidenceInEstimate > 1
        ) {
          throw new Error(`Invalid confidenceInEstimate for outcome ${outcome.id}: must be a number between 0 and 1`);
        }

        possibleOutcomes.push({
          id: outcome.id as string,
          description: outcome.description as string,
          optionId: outcome.optionId as string,
          probability: outcome.probability as number,
          value: outcome.value as number,
          confidenceInEstimate: outcome.confidenceInEstimate as number
        });
      }
    }

    // Process information gaps
    const informationGaps: InformationGap[] = [];
    if (Array.isArray(data.informationGaps)) {
      for (const gap of data.informationGaps as Array<Record<string, unknown>>) {
        if (!gap.description || typeof gap.description !== "string") {
          throw new Error("Invalid information gap description: must be a string");
        }

        if (typeof gap.impact !== "number" || gap.impact < 0 || gap.impact > 1) {
          throw new Error("Invalid information gap impact: must be a number between 0 and 1");
        }

        if (!gap.researchMethod || typeof gap.researchMethod !== "string") {
          throw new Error("Invalid information gap researchMethod: must be a string");
        }

        informationGaps.push({
          description: gap.description as string,
          impact: gap.impact as number,
          researchMethod: gap.researchMethod as string
        });
      }
    }

    // Process expected values
    const expectedValues: Record<string, number> = {};
    if (data.expectedValues && typeof data.expectedValues === "object") {
      const optionIdsSet = new Set(options.map((o) => o.id));
      for (const [optionId, value] of Object.entries(data.expectedValues)) {
        if (typeof value === "number") {
          if (!optionIdsSet.has(optionId)) {
            throw new Error(`expectedValues contains unknown optionId: ${optionId}`);
          }
          expectedValues[optionId] = value;
        }
      }
    }

    // Process multi-criteria scores
    const multiCriteriaScores: Record<string, number> = {};
    if (data.multiCriteriaScores && typeof data.multiCriteriaScores === "object") {
      const optionIdsSet = new Set(options.map((o) => o.id));
      for (const [optionId, score] of Object.entries(data.multiCriteriaScores)) {
        if (typeof score === "number") {
          if (!optionIdsSet.has(optionId)) {
            throw new Error(`multiCriteriaScores contains unknown optionId: ${optionId}`);
          }
          multiCriteriaScores[optionId] = score;
        }
      }
    }

    // Process sensitivity insights
    const sensitivityInsights: string[] = [];
    if (Array.isArray(data.sensitivityInsights)) {
      for (const insight of data.sensitivityInsights) {
        if (typeof insight === "string") {
          sensitivityInsights.push(insight);
        }
      }
    }

    // Process stakeholders and constraints
    const stakeholders: string[] = [];
    for (const stakeholder of data.stakeholders) {
      if (typeof stakeholder === "string") {
        stakeholders.push(stakeholder);
      }
    }

    const constraints: string[] = [];
    for (const constraint of data.constraints) {
      if (typeof constraint === "string") {
        constraints.push(constraint);
      }
    }

    // Create validated data object
    const validatedData: Omit<
      DecisionAnalysisData,
      | "suggestedNextStage"
      | "criteria"
      | "criteriaEvaluations"
      | "possibleOutcomes"
      | "informationGaps"
      | "expectedValues"
      | "multiCriteriaScores"
      | "sensitivityInsights"
      | "recommendation"
    > &
      Partial<
        Pick<
          DecisionAnalysisData,
          | "suggestedNextStage"
          | "criteria"
          | "criteriaEvaluations"
          | "possibleOutcomes"
          | "informationGaps"
          | "expectedValues"
          | "multiCriteriaScores"
          | "sensitivityInsights"
          | "recommendation"
        >
      > = {
      decisionStatement: data.decisionStatement as string,
      options,
      stakeholders,
      constraints,
      timeHorizon: data.timeHorizon as string,
      riskTolerance: data.riskTolerance as DecisionAnalysisData["riskTolerance"],
      decisionId: data.decisionId as string,
      analysisType: data.analysisType as DecisionAnalysisData["analysisType"],
      stage: data.stage as DecisionAnalysisData["stage"],
      iteration: data.iteration as number,
      nextStageNeeded: data.nextStageNeeded as boolean
    };

    // Conditionally add optional properties
    if (typeof data.suggestedNextStage === "string") {
      validatedData.suggestedNextStage = data.suggestedNextStage;
    }
    if (criteria.length > 0) {
      validatedData.criteria = criteria;
    }
    if (criteriaEvaluations.length > 0) {
      validatedData.criteriaEvaluations = criteriaEvaluations;
    }
    if (possibleOutcomes.length > 0) {
      validatedData.possibleOutcomes = possibleOutcomes;
    }
    if (informationGaps.length > 0) {
      validatedData.informationGaps = informationGaps;
    }
    if (Object.keys(expectedValues).length > 0) {
      validatedData.expectedValues = expectedValues;
    }
    if (Object.keys(multiCriteriaScores).length > 0) {
      validatedData.multiCriteriaScores = multiCriteriaScores;
    }
    if (sensitivityInsights.length > 0) {
      validatedData.sensitivityInsights = sensitivityInsights;
    }
    if (typeof data.recommendation === "string") {
      validatedData.recommendation = data.recommendation;
    }

    return validatedData as DecisionAnalysisData;
  }

  private updateRegistries(data: DecisionAnalysisData): void {
    // Initialize registries if needed
    if (!this.optionRegistry[data.decisionId]) {
      this.optionRegistry[data.decisionId] = {};
    }

    if (!this.criteriaRegistry[data.decisionId]) {
      this.criteriaRegistry[data.decisionId] = {};
    }

    // Update option registry
    for (const option of data.options) {
      this.optionRegistry[data.decisionId][option.id] = option;
    }

    // Update criteria registry
    if (data.criteria) {
      for (const criterion of data.criteria) {
        this.criteriaRegistry[data.decisionId][criterion.id] = criterion;
      }
    }
  }

  public updateDecisionAnalysis(data: DecisionAnalysisData): DecisionAnalysisData {
    // Initialize decision history if needed
    if (!this.decisionHistory[data.decisionId]) {
      this.decisionHistory[data.decisionId] = [];
    }

    // Add to decision history
    this.decisionHistory[data.decisionId].push(data);

    // Update registries
    this.updateRegistries(data);

    // Calculate expected values if needed
    if (data.analysisType === "expected-utility" && data.possibleOutcomes && data.possibleOutcomes.length > 0) {
      this.calculateExpectedValues(data);
    }

    // Calculate multi-criteria scores if needed
    if (
      data.analysisType === "multi-criteria" &&
      data.criteria &&
      data.criteriaEvaluations &&
      data.criteriaEvaluations.length > 0
    ) {
      this.calculateMultiCriteriaScores(data);
    }

    return data;
  }

  private calculateExpectedValues(data: DecisionAnalysisData): void {
    if (!data.possibleOutcomes) return;

    const expectedValues: Record<string, number> = {};
    const optionOutcomes: Record<string, Outcome[]> = {};

    // Group outcomes by option
    for (const outcome of data.possibleOutcomes) {
      if (!optionOutcomes[outcome.optionId]) {
        optionOutcomes[outcome.optionId] = [];
      }
      optionOutcomes[outcome.optionId].push(outcome);
    }

    // Calculate expected value for each option
    for (const [optionId, outcomes] of Object.entries(optionOutcomes)) {
      let expectedValue = 0;
      let totalProbability = 0;

      for (const outcome of outcomes) {
        expectedValue += outcome.probability * outcome.value;
        totalProbability += outcome.probability;
      }

      // Normalize if probabilities don't sum to 1
      if (totalProbability > 0 && totalProbability !== 1) {
        expectedValue = expectedValue / totalProbability;
      }

      expectedValues[optionId] = expectedValue;
    }

    data.expectedValues = expectedValues;
  }

  private calculateMultiCriteriaScores(data: DecisionAnalysisData): void {
    if (!data.criteria || !data.criteriaEvaluations) return;

    const multiCriteriaScores: Record<string, number> = {};
    const optionEvaluations: Record<string, CriterionEvaluation[]> = {};
    const criterionMap = new Map<string, (typeof data.criteria)[0]>(data.criteria.map((c) => [c.id, c]));

    // Group evaluations by option
    for (const evaluation of data.criteriaEvaluations) {
      if (!optionEvaluations[evaluation.optionId]) {
        optionEvaluations[evaluation.optionId] = [];
      }
      optionEvaluations[evaluation.optionId].push(evaluation);
    }

    // Calculate weighted score for each option
    for (const [optionId, evaluations] of Object.entries(optionEvaluations)) {
      let weightedScore = 0;
      let totalWeight = 0;

      for (const evaluation of evaluations) {
        const criterion = criterionMap.get(evaluation.criterionId);
        if (criterion) {
          weightedScore += evaluation.score * criterion.weight;
          totalWeight += criterion.weight;
        }
      }

      // Normalize if weights don't sum to 1
      if (totalWeight > 0 && totalWeight !== 1) {
        weightedScore = weightedScore / totalWeight;
      }

      multiCriteriaScores[optionId] = weightedScore;
    }

    data.multiCriteriaScores = multiCriteriaScores;
  }

  public getHistory(decisionId: string): DecisionAnalysisData[] | undefined {
    return this.decisionHistory[decisionId];
  }
}
