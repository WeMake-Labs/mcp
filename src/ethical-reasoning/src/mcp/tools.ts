import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { frameworks } from "../core/types.js";

export const ETHICAL_REASONING_TOOL: Tool = {
  name: "ethicalReasoning",
  description: `Evaluate a proposed action using multiple ethical frameworks.`,
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      scenario: { type: "string", minLength: 1, description: "Description of the situation" },
      action: { type: "string", minLength: 1, description: "Action or policy to evaluate" },
      frameworks: {
        type: "array",
        description: "Ethical frameworks to apply",
        items: { type: "string", enum: frameworks as unknown as string[] },
        minItems: 1
      },
      confidence: { type: "number", minimum: 0, maximum: 1, description: "Confidence in information" },
      nextStepNeeded: { type: "boolean", description: "Whether further analysis is required" },
      suggestedNext: {
        type: "array",
        description: "Suggested frameworks for a follow-up call",
        items: { type: "string", enum: frameworks as unknown as string[] }
      }
    },
    required: ["scenario", "action", "frameworks", "confidence", "nextStepNeeded"]
  }
};
