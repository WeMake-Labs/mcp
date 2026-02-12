import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const NARRATIVE_PLANNER_TOOL: Tool = {
  name: "narrativePlanner",
  description: "Generates a simple three-act story outline",
  inputSchema: {
    type: "object",
    properties: {
      premise: { type: "string", minLength: 1 },
      characters: { type: "array", items: { type: "string" }, minItems: 1 },
      arcs: { type: "array", items: { type: "string" }, minItems: 1 }
    },
    required: ["premise", "characters", "arcs"],
    additionalProperties: false
  }
};
