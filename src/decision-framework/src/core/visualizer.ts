import chalk from "chalk";
import { DecisionAnalysisData, CriterionEvaluation, Outcome } from "./types.js";

/**
 * DecisionVisualizer - Formats decision analysis data for terminal display
 *
 * Purpose: Generates formatted, colorized text output for decision analysis results
 *
 * Limitations:
 * - Output is optimized for terminal display with ANSI color codes
 * - Not suitable for non-terminal environments without color support
 *
 * Workflow: Converts DecisionAnalysisData to formatted string with sections for
 * context, options, criteria, evaluations, outcomes, gaps, and recommendations
 */
export class DecisionVisualizer {
  public static visualizeDecisionAnalysis(data: DecisionAnalysisData): string {
    let output = `\n${chalk.bold(`DECISION ANALYSIS: ${data.decisionStatement}`)} (ID: ${data.decisionId})\n\n`;

    // Analysis type and stage
    output += `${chalk.cyan("Analysis Type:")} ${data.analysisType}\n`;
    output += `${chalk.cyan("Stage:")} ${data.stage}\n`;
    output += `${chalk.cyan("Iteration:")} ${data.iteration}\n`;
    output += `${chalk.cyan("Risk Tolerance:")} ${data.riskTolerance}\n`;
    output += `${chalk.cyan("Time Horizon:")} ${data.timeHorizon}\n\n`;

    // Context
    output += `${chalk.bold("CONTEXT:")}\n`;
    output += `${chalk.yellow("Stakeholders:")}\n`;
    for (const stakeholder of data.stakeholders) {
      output += `  - ${stakeholder}\n`;
    }
    output += "\n";

    output += `${chalk.yellow("Constraints:")}\n`;
    for (const constraint of data.constraints) {
      output += `  - ${constraint}\n`;
    }
    output += "\n";

    // Options
    output += `${chalk.bold("OPTIONS:")}\n`;
    for (const option of data.options) {
      let optionHeader = `  [${option.id}] ${chalk.bold(option.name)}`;

      // Add scores if available
      if (data.expectedValues && data.expectedValues[option.id] !== undefined) {
        optionHeader += ` ${chalk.green(`(EV: ${data.expectedValues[option.id].toFixed(2)})`)}`;
      }

      if (data.multiCriteriaScores && data.multiCriteriaScores[option.id] !== undefined) {
        optionHeader += ` ${chalk.blue(`(Score: ${(data.multiCriteriaScores[option.id] * 100).toFixed(0)}%)`)}`;
      }

      output += `${optionHeader}\n`;
      output += `     ${option.description}\n\n`;
    }

    // Criteria
    if (data.criteria && data.criteria.length > 0) {
      output += `${chalk.bold("CRITERIA:")}\n`;
      for (const criterion of data.criteria) {
        output += `  [${criterion.id}] ${chalk.bold(criterion.name)} (Weight: ${(criterion.weight * 100).toFixed(0)}%)\n`;
        output += `     ${criterion.description}\n`;
        output += `     Evaluation method: ${criterion.evaluationMethod}\n\n`;
      }
    }

    // Criteria Evaluations
    if (data.criteriaEvaluations && data.criteriaEvaluations.length > 0) {
      output += `${chalk.bold("EVALUATIONS:")}\n`;

      // Group evaluations by option
      const optionEvaluations: Record<string, CriterionEvaluation[]> = {};
      for (const evaluation of data.criteriaEvaluations) {
        if (!optionEvaluations[evaluation.optionId]) {
          optionEvaluations[evaluation.optionId] = [];
        }
        optionEvaluations[evaluation.optionId].push(evaluation);
      }

      for (const [optionId, evaluations] of Object.entries(optionEvaluations)) {
        const option = data.options.find((o) => o.id === optionId);
        if (!option) continue;

        output += `  ${chalk.bold(option.name)}:\n`;

        for (const evaluation of evaluations) {
          const criterion = data.criteria?.find((c) => c.id === evaluation.criterionId);
          if (!criterion) continue;

          const scoreDisplay = (evaluation.score * 100).toFixed(0);
          output += `     ${criterion.name}: ${scoreDisplay}% - ${evaluation.justification}\n`;
        }
        output += "\n";
      }
    }

    // Outcomes
    if (data.possibleOutcomes && data.possibleOutcomes.length > 0) {
      output += `${chalk.bold("POSSIBLE OUTCOMES:")}\n`;

      // Group outcomes by option
      const optionOutcomes: Record<string, Outcome[]> = {};
      for (const outcome of data.possibleOutcomes) {
        if (!optionOutcomes[outcome.optionId]) {
          optionOutcomes[outcome.optionId] = [];
        }
        optionOutcomes[outcome.optionId].push(outcome);
      }

      for (const [optionId, outcomes] of Object.entries(optionOutcomes)) {
        const option = data.options.find((o) => o.id === optionId);
        if (!option) continue;

        output += `  ${chalk.bold(option.name)}:\n`;

        for (const outcome of outcomes) {
          const probabilityDisplay = (outcome.probability * 100).toFixed(0);
          const valueDisplay = outcome.value >= 0 ? `+${outcome.value.toFixed(1)}` : outcome.value.toFixed(1);
          const confidenceDisplay = (outcome.confidenceInEstimate * 100).toFixed(0);

          output += `     ${probabilityDisplay}% chance: ${outcome.description}\n`;
          output += `       Value: ${valueDisplay}, Confidence: ${confidenceDisplay}%\n`;
        }
        output += "\n";
      }
    }

    // Information Gaps
    if (data.informationGaps && data.informationGaps.length > 0) {
      output += `${chalk.bold("INFORMATION GAPS:")}\n`;
      for (const gap of data.informationGaps) {
        const impactDisplay = (gap.impact * 100).toFixed(0);
        output += `  - ${gap.description} (Impact: ${impactDisplay}%)\n`;
        output += `    Research method: ${gap.researchMethod}\n\n`;
      }
    }

    // Sensitivity Insights
    if (data.sensitivityInsights && data.sensitivityInsights.length > 0) {
      output += `${chalk.bold("SENSITIVITY INSIGHTS:")}\n`;
      for (const insight of data.sensitivityInsights) {
        output += `  - ${insight}\n`;
      }
      output += "\n";
    }

    // Recommendation
    if (data.recommendation) {
      output += `${chalk.bold("RECOMMENDATION:")}\n`;
      output += `  ${data.recommendation}\n\n`;
    }

    // Next steps
    if (data.nextStageNeeded) {
      output += `${chalk.blue("SUGGESTED NEXT STAGE:")}\n`;
      if (data.suggestedNextStage) {
        output += `  - Move to ${data.suggestedNextStage} stage\n`;
      } else {
        output += `  - Continue with the current stage\n`;
      }
    }

    return output;
  }
}
