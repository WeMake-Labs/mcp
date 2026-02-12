import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const BIAS_DETECTION_TOOL: Tool = {
  name: "biasDetection",
  description: "Detects simplistic biased terms in text",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Text to analyze for bias" }
    },
    required: ["text"]
  }
};
