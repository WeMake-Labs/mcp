import { DecisionManager } from "../core/manager.js";
import { DecisionAnalysisData } from "../core/types.js";
import { DecisionVisualizer } from "../core/visualizer.js";

export class DecisionFramework {
  private manager: DecisionManager;

  constructor() {
    this.manager = new DecisionManager();
  }

  /**
   * Process a decision analysis request.
   * Validates the input, updates the decision state, and performs calculations.
   *
   * @param data The decision analysis data
   * @returns The processed decision analysis data
   */
  public processDecision(data: unknown): DecisionAnalysisData {
    const validated = this.manager.validateDecisionAnalysisData(data);
    return this.manager.updateDecisionAnalysis(validated);
  }

  /**
   * Generate a visualization for the decision analysis data.
   *
   * @param data The decision analysis data
   * @returns A formatted string visualization
   */
  public visualize(data: DecisionAnalysisData): string {
    return DecisionVisualizer.visualizeDecisionAnalysis(data);
  }

  /**
   * Retrieve the history of a specific decision.
   *
   * @param decisionId The ID of the decision
   * @returns Array of decision analysis data or undefined if not found
   */
  public getHistory(decisionId: string): DecisionAnalysisData[] | undefined {
    return this.manager.getHistory(decisionId);
  }
}

export * from "../core/types.js";
