import { MultimodalInput, SynthesisResult } from "../core/types.js";
import { synthesize } from "../core/logic.js";

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
