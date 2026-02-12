import { BiasDetectionInput, BiasDetectionResult } from "../core/types.js";
import { detectBias } from "../core/logic.js";

/**
 * Client for the Bias Detection API.
 * 
 * Provides methods to analyze text for potentially biased language patterns.
 */
export class BiasDetectionClient {
  /**
   * Detects simplistic biased terms in text.
   *
   * @param input - The input containing text to analyze
   * @returns Promise resolving to the detection result
   */
  async detectBias(input: BiasDetectionInput): Promise<BiasDetectionResult> {
    return detectBias(input);
  }
}
