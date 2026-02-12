import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const CONSTRAINT_SOLVER_TOOL: Tool = {
  name: "constraintSolver",
  description: "Checks if a set of variables satisfies all constraints",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      variables: {
        type: "object",
        description: "Variable assignments",
        additionalProperties: { type: "number" }
      },
      constraints: {
        type: "array",
        description: "Boolean expressions",
        items: {
          type: "string",
          pattern: "^[A-Za-z0-9_\\s<>=!()+\\-*/.%|&^]+$"
        },
        minItems: 1
      }
    },
    required: ["variables", "constraints"]
  }
};
