import { EthicalAnalyzer } from "../core/logic.js";
import { EthicalAnalysisResult } from "../core/types.js";

export * from "../core/types.js";

/**
 * Programmatic API for Ethical Reasoning.
 */
export class EthicalReasoningAPI {
  private analyzer: EthicalAnalyzer;

  constructor() {
    this.analyzer = new EthicalAnalyzer();
  }

  /**
   * Analyze an ethical scenario using the configured frameworks.
   * 
   * @param input - The input object containing scenario, action, and frameworks.
   * @returns A promise resolving to the ethical analysis result.
   */
  public async analyze(input: unknown): Promise<EthicalAnalysisResult> {
    return this.analyzer.analyze(input);
  }
}
