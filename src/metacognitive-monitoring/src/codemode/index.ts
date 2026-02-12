import { MetacognitiveAnalyzer } from "../core/analyzer.js";
import { MetacognitiveMonitoringData, MonitoringResult } from "../core/types.js";

/**
 * Metacognitive Monitoring API for Code Mode.
 *
 * This API allows direct programmatic access to the metacognitive monitoring capabilities,
 * enabling LLMs to write code that performs self-monitoring steps.
 */
export class MetacognitiveCodeMode {
  private analyzer: MetacognitiveAnalyzer;

  constructor() {
    this.analyzer = new MetacognitiveAnalyzer();
  }

  /**
   * Performs a metacognitive monitoring assessment.
   *
   * @param input - The monitoring data input
   * @returns The monitoring result
   */
  public async monitor(input: Partial<MetacognitiveMonitoringData>): Promise<MonitoringResult> {
    // We treat the input as potentially partial but the analyzer validates it.
    // In a real Code Mode scenario, we might want to relax validation or fill defaults,
    // but for now we pass it through.
    const { result } = this.analyzer.process(input);
    return result;
  }
}

/**
 * Default instance for quick usage.
 */
export const metacognitive = new MetacognitiveCodeMode();

// Re-export types for usage in code
export * from "../core/types.js";
