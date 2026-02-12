import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const VISUAL_REASONING_TOOL: Tool = {
  name: "visualReasoning",
  description: `A detailed tool for diagrammatic thinking and spatial representation.
This tool helps models create and manipulate visual representations of problems.
It can be used to develop system diagrams, flowcharts, concept maps, and other visual models.

When to use this tool:
- System architecture design
- Algorithm visualization
- Concept mapping and knowledge organization
- Pattern recognition in complex data
- Spatial problem solving

Key features:
- Create and manipulate abstract visual elements
- Support for multiple visual representation types
- Track iterations of visual thinking
- Translate between verbal descriptions and visual representations
- Generate visual insights from patterns

Parameters explained:
- operation: The type of action to perform (create, update, delete, transform, observe)
- elements: The visual elements to operate on
- diagramId: Identifier for the diagram being created or modified
- diagramType: The type of diagram (graph, flowchart, state diagram, etc.)
- iteration: The current iteration of the visual reasoning process
- observation/insight/hypothesis: Verbal reasoning about the visual representation
- nextOperationNeeded: Whether another operation is needed in the visual reasoning process`,

  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["create", "update", "delete", "transform", "observe"],
        description: "The type of operation to perform"
      },
      elements: {
        type: "array",
        description: "The visual elements to operate on",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the element"
            },
            type: {
              type: "string",
              enum: ["node", "edge", "container", "annotation"],
              description: "The type of visual element"
            },
            label: {
              type: "string",
              description: "Text label for the element"
            },
            properties: {
              type: "object",
              description: "Visual properties like position, size, color"
            },
            source: {
              type: "string",
              description: "For edges: ID of the source element"
            },
            target: {
              type: "string",
              description: "For edges: ID of the target element"
            },
            contains: {
              type: "array",
              description: "For containers: IDs of contained elements",
              items: {
                type: "string"
              }
            }
          },
          required: ["type"]
        }
      },
      transformationType: {
        type: "string",
        enum: ["rotate", "move", "resize", "recolor", "regroup"],
        description: "For transform operations: the type of transformation"
      },
      diagramId: {
        type: "string",
        description: "Identifier for the diagram"
      },
      diagramType: {
        type: "string",
        enum: ["graph", "flowchart", "stateDiagram", "conceptMap", "treeDiagram", "custom"],
        description: "The type of diagram being created or modified"
      },
      iteration: {
        type: "number",
        description: "Current iteration of the visual reasoning process",
        minimum: 0
      },
      observation: {
        type: "string",
        description: "Observations about the current visual state"
      },
      insight: {
        type: "string",
        description: "Insights derived from the visual representation"
      },
      hypothesis: {
        type: "string",
        description: "Hypotheses based on the visual pattern"
      },
      nextOperationNeeded: {
        type: "boolean",
        description: "Whether another operation is needed"
      }
    },
    required: ["operation", "diagramId", "diagramType", "iteration", "nextOperationNeeded"]
  }
};
