export const MULTIMODAL_SYNTH_TOOL = {
  name: "multimodalSynth",
  description: "Combines text and image descriptions into a unified summary",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "array", items: { type: "string" }, minItems: 1 },
      images: { type: "array", items: { type: "string" }, minItems: 0 }
    },
    required: ["text", "images"],
    additionalProperties: false
  }
};
