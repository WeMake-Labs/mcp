import { AnalogicalReasoningManager } from "../core/manager.js";
import { AnalogicalReasoningData } from "../core/types.js";

export * from "../core/types.js";

export class AnalogicalReasoning {
  private manager: AnalogicalReasoningManager;

  constructor() {
    this.manager = new AnalogicalReasoningManager();
  }

  /**
   * Process analogical reasoning data.
   * Validates the input, updates the internal state, and returns the structured data.
   *
   * @param input - The raw input object matching the AnalogicalReasoning schema.
   * @returns The validated and processed AnalogicalReasoningData.
   */
  public process(input: unknown): AnalogicalReasoningData {
    return this.manager.process(input);
  }

  /**
   * Generate a visualization string for the analogical reasoning data.
   *
   * @param data - The AnalogicalReasoningData to visualize.
   * @returns A string representation of the analogy with ANSI colors.
   */
  public visualize(data: AnalogicalReasoningData): string {
    return this.manager.visualize(data);
  }
}
