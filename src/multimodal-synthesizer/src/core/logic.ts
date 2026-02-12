import { MultimodalInput, SynthesisResult } from "./types.js";

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
