import { MultimodalInput, SynthesisResult } from "./types.js";

/**
 * AI Tool: Multimodal Synthesizer Core Logic
 *
 * Purpose:
 * Combines text and image descriptions into a unified summary for multimodal content analysis.
 *
 * Limitations:
 * - Simple concatenation-based synthesis (text joined with spaces, images with commas)
 * - No semantic analysis or intelligent merging of content
 * - Output format is fixed as "text | Images: images"
 *
 * Operational Workflow:
 * 1. Trim whitespace from all text and image items
 * 2. Filter out empty items
 * 3. Join text items with spaces, image items with commas
 * 4. Return formatted summary combining both modalities
 */
export function synthesize(data: MultimodalInput): SynthesisResult {
  const text = data.text
    .map((t) => t.trim())
    .filter(Boolean)
    .join(" ");
  const images = data.images
    .map((i) => i.trim())
    .filter(Boolean)
    .join(", ");
  return { summary: `${text} | Images: ${images}` };
}
