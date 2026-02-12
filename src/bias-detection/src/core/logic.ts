import { BiasDetectionInput, BiasDetectionResult } from "./types.js";

export const BIAS_WORDS = ["always", "never", "obviously", "clearly", "everyone", "no one"];

/**
 * Detects potentially biased language patterns in text.
 *
 * @param input - The input containing text to analyze
 * @returns Object containing detected bias words
 */
export function detectBias(input: BiasDetectionInput): BiasDetectionResult {
  const { text } = input;
  const escaped = BIAS_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const matches = text.match(regex) ?? [];
  const uniqueBiases = [...new Set(matches.map((m) => m.toLowerCase()))];
  
  return { biases: uniqueBiases };
}
