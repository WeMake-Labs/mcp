import { MultimodalInput, SynthesisResult } from "../core/types.js";
import { synthesize } from "../core/logic.js";

/**
 * AI Tool: Multimodal Synthesizer Code Mode API
 *
 * Purpose:
 * Provides a clean, programmable TypeScript API for multimodal synthesis.
 * Enables direct library usage without MCP server infrastructure.
 *
 * Limitations:
 * - Input validation is performed at this layer (duplicates some MCP schema validation)
 * - Synchronous validation with async method signature
 *
 * Operational Workflow:
 * 1. Validate input structure and types
 * 2. Delegate to core synthesis logic
 * 3. Return synthesis result or throw error
 */
export class MultimodalSynthesizer {
  /**
   * Synthesizes text and images into a summary.
   * @param input The multimodal input containing text and images.
   * @returns A promise resolving to the synthesis result.
   */
  async synthesize(input: MultimodalInput): Promise<SynthesisResult> {
    // Validate input
    if (
      !input ||
      typeof input !== "object" ||
      !Array.isArray(input.text) ||
      !Array.isArray(input.images) ||
      !input.text.every((t) => typeof t === "string") ||
      !input.images.every((i) => typeof i === "string")
    ) {
      throw new Error("Invalid input: text and images must be arrays of strings");
    }

    return synthesize(input);
  }
}
