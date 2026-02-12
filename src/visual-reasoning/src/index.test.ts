import { describe, expect, it, beforeEach } from "bun:test";
import { createServer, VisualReasoning } from "./index.js";

/**
 * Test suite for Visual Reasoning MCP Server.
 */
describe("Visual Reasoning Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });
});

/**
 * Input Validation Tests (Code Mode API).
 */
describe("Input Validation (Code Mode)", () => {
  let visualReasoning: VisualReasoning;

  beforeEach(() => {
    visualReasoning = new VisualReasoning();
  });

  it("should reject null input", () => {
    expect(() => visualReasoning.processOperation(null)).toThrow("Invalid operation: input must be an object");
  });

  it("should reject missing operation", () => {
    const input = {
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid operation");
  });

  it("should reject missing diagramId", () => {
    const input = {
      operation: "create",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid diagramId");
  });

  it("should reject missing diagramType", () => {
    const input = {
      operation: "create",
      diagramId: "diagram1",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid diagramType");
  });

  it("should process valid input successfully", () => {
    const validInput = {
      operation: "create",
      elements: [
        {
          id: "node1",
          type: "node",
          label: "Start",
          properties: { x: 0, y: 0 }
        }
      ],
      diagramId: "diagram1",
      diagramType: "flowchart",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(validInput);
    expect(result).toBeDefined();
    expect(result.diagramId).toBe("diagram1");
  });

  it("should reject elements array containing invalid element type", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "invalid1",
          type: "invalid_type",
          label: "Invalid element"
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid element type");
  });

  it("should reject element objects missing required type field", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "missing1",
          label: "Missing type field"
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid element type");
  });

  it("should reject transform/operation calls missing transformationType", () => {
    const input = {
      operation: "transform",
      elements: [],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Missing required property: transformationType");
  });

  it("should reject invalid iteration values (negative)", () => {
    const input = {
      operation: "create",
      elements: [],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: -1,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid iteration");
  });

  it("should reject invalid nextOperationNeeded values (non-boolean)", () => {
    const input = {
      operation: "create",
      elements: [],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: "not_boolean",
      transformationType: "move"
    };
    expect(() => visualReasoning.processOperation(input)).toThrow("Invalid nextOperationNeeded");
  });
});

/**
 * Visual Element Tests.
 */
describe("Visual Elements", () => {
  let visualReasoning: VisualReasoning;

  beforeEach(() => {
    visualReasoning = new VisualReasoning();
  });

  it("should handle node elements", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "node1",
          type: "node",
          label: "Node 1",
          properties: { x: 100, y: 100, color: "blue" }
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle edge elements", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "edge1",
          type: "edge",
          source: "node1",
          target: "node2",
          properties: { weight: 5 }
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle container elements", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "container1",
          type: "container",
          label: "Group 1",
          contains: ["node1", "node2", "node3"],
          properties: { color: "lightgray" }
        }
      ],
      diagramId: "diagram1",
      diagramType: "conceptMap",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "regroup"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle annotation elements", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "annot1",
          type: "annotation",
          label: "Important note",
          properties: { x: 50, y: 50, fontSize: 12 }
        }
      ],
      diagramId: "diagram1",
      diagramType: "flowchart",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });
});

/**
 * Operation Type Tests.
 */
describe("Operation Types", () => {
  let visualReasoning: VisualReasoning;

  beforeEach(() => {
    visualReasoning = new VisualReasoning();
  });

  it("should handle create operation", () => {
    const input = {
      operation: "create",
      elements: [{ id: "n1", type: "node", properties: {} }],
      diagramId: "d1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle update operation", () => {
    const input = {
      operation: "update",
      elements: [{ id: "n1", type: "node", properties: { color: "red" } }],
      diagramId: "d1",
      diagramType: "graph",
      iteration: 1,
      nextOperationNeeded: false,
      transformationType: "recolor"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle delete operation", () => {
    const input = {
      operation: "delete",
      elements: [{ id: "n1", type: "node", properties: {} }],
      diagramId: "d1",
      diagramType: "graph",
      iteration: 2,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle transform operation", () => {
    const input = {
      operation: "transform",
      elements: [{ id: "n1", type: "node", properties: { x: 200, y: 200 } }],
      diagramId: "d1",
      diagramType: "graph",
      iteration: 3,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("should handle observe operation", () => {
    const input = {
      operation: "observe",
      diagramId: "d1",
      diagramType: "graph",
      iteration: 4,
      nextOperationNeeded: false,
      observation: "The graph shows a clear cluster pattern",
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let visualReasoning: VisualReasoning;

  beforeEach(() => {
    visualReasoning = new VisualReasoning();
  });

  it("handles large number of elements", () => {
    const elements = Array.from({ length: 1000 }, (_, i) => ({
      id: `node${i}`,
      type: "node" as const,
      properties: { x: i * 10, y: i * 10 }
    }));

    const input = {
      operation: "create",
      elements,
      diagramId: "large-diagram",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("handles empty elements array", () => {
    const input = {
      operation: "observe",
      elements: [],
      diagramId: "d1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("handles special characters in labels", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "n1",
          type: "node",
          label: "Node with special chars: @#$% & émojis 🎉",
          properties: {}
        }
      ],
      diagramId: "d1",
      diagramType: "flowchart",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });

  it("handles all diagram types", () => {
    const diagramTypes: Array<"graph" | "flowchart" | "stateDiagram" | "conceptMap" | "treeDiagram" | "custom"> = [
      "graph",
      "flowchart",
      "stateDiagram",
      "conceptMap",
      "treeDiagram",
      "custom"
    ];

    for (const diagramType of diagramTypes) {
      const input = {
        operation: "create",
        elements: [{ id: "n1", type: "node", properties: {} }],
        diagramId: `diagram-${diagramType}`,
        diagramType,
        iteration: 0,
        nextOperationNeeded: false,
        transformationType: "move"
      };
      const result = visualReasoning.processOperation(input);
      expect(result).toBeDefined();
    }
  });

  it("handles all transformation types", () => {
    const transformationTypes: Array<"rotate" | "move" | "resize" | "recolor" | "regroup"> = [
      "rotate",
      "move",
      "resize",
      "recolor",
      "regroup"
    ];

    for (const transformationType of transformationTypes) {
      const input = {
        operation: "transform",
        elements: [{ id: "n1", type: "node", properties: { x: 200, y: 200 } }],
        diagramId: "d1",
        diagramType: "graph",
        iteration: 0,
        nextOperationNeeded: false,
        transformationType
      };
      const result = visualReasoning.processOperation(input);
      expect(result).toBeDefined();
    }
  });

  it("handles complex nested properties", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "n1",
          type: "node",
          properties: {
            position: { x: 100, y: 200 },
            style: { color: "blue", size: 10, border: { width: 2, color: "black" } },
            metadata: { created: new Date().toISOString(), author: "test" }
          }
        }
      ],
      diagramId: "d1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = visualReasoning.processOperation(input);
    expect(result).toBeDefined();
  });
});
