import { VisualReasoningEngine } from "../core/engine.js";
import { VisualReasoningResult } from "../core/types.js";

export * from "../core/types.js";

/**
 * Visual Reasoning API for Code Mode.
 *
 * This class exposes the visual reasoning functionality as a strongly-typed API
 * that can be used programmatically.
 */
export class VisualReasoning {
  private engine: VisualReasoningEngine;

  constructor() {
    this.engine = new VisualReasoningEngine();
  }

  /**
   * Processes a visual reasoning operation.
   *
   * @param input - The visual operation data
   * @returns The result of the operation including the ASCII diagram
   */
  public processOperation(input: unknown): VisualReasoningResult {
    return this.engine.processVisualOperation(input);
  }
}
