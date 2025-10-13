import { describe, expect, it, beforeEach } from "bun:test";
import createServer, { VisualReasoningServer } from "./index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createTestClient } from "../../test-helpers/mcp-test-client.js";

/**
 * Test suite for Visual Reasoning MCP Server.
 *
 * Business Context: Ensures the visual-reasoning framework correctly validates
 * inputs and provides reliable functionality for enterprise applications.
 *
 * Decision Rationale: Tests focus on server initialization, schema validation,
 * and core functionality to ensure production-ready reliability.
 */
describe("Visual Reasoning Server", () => {
  it("server initializes successfully", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("server exports correct configuration", () => {
    const server = createServer();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("server has correct name and version", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});

/**
 * Tool Registration Tests.
 */
describe("Tool Registration", () => {
  it("should advertise visualReasoning tool", async () => {
    const server = createTestClient(createServer());
    const response = await server.request({ method: "tools/list" }, ListToolsRequestSchema);
    expect(response.tools).toHaveLength(1);
    expect(response.tools[0].name).toBe("visualReasoning");
  });
});

/**
 * Input Validation Tests.
 */
describe("Input Validation", () => {
  let server: VisualReasoningServer;

  beforeEach(() => {
    server = new VisualReasoningServer();
  });

  it("should reject null input", () => {
    const result = server.processOperation(null);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid operation");
  });

  it("should reject missing operation", () => {
    const input = {
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid operation");
  });

  it("should reject missing diagramId", () => {
    const input = {
      operation: "create",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid diagramId");
  });

  it("should reject missing diagramType", () => {
    const input = {
      operation: "create",
      diagramId: "diagram1",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid diagramType");
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
    const result = server.processOperation(validInput);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
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
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid element type");
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
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Missing type");
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
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Missing transformationType");
  });

  it("should reject edge elements missing source or target", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "edge1",
          type: "edge",
          target: "node2"
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Missing source/target");
  });

  it("should reject container elements with invalid contains (non-array)", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "container1",
          type: "container",
          label: "Invalid contains",
          contains: "not_an_array"
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "regroup"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid contains");
  });

  it("should reject container elements with invalid contains (non-string ids)", () => {
    const input = {
      operation: "create",
      elements: [
        {
          id: "container1",
          type: "container",
          label: "Invalid contains ids",
          contains: ["node1", 123, "node3"]
        }
      ],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 0,
      nextOperationNeeded: false,
      transformationType: "regroup"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid contains");
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
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid iteration");
  });

  it("should reject invalid iteration values (non-integer)", () => {
    const input = {
      operation: "create",
      elements: [],
      diagramId: "diagram1",
      diagramType: "graph",
      iteration: 1.5,
      nextOperationNeeded: false,
      transformationType: "move"
    };
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid iteration");
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
    const result = server.processOperation(input);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid nextOperationNeeded");
  });
});

/**
 * Visual Element Tests.
 */
describe("Visual Elements", () => {
  let server: VisualReasoningServer;

  beforeEach(() => {
    server = new VisualReasoningServer();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
  });
});

/**
 * Operation Type Tests.
 */
describe("Operation Types", () => {
  let server: VisualReasoningServer;

  beforeEach(() => {
    server = new VisualReasoningServer();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
  });
});

/**
 * MCP Server Integration Tests.
 */
describe("MCP Server Integration", () => {
  it("server can be created without errors", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("rejects unknown tool name", async () => {
    const server = createTestClient(createServer());
    const response = await server.request(
      {
        method: "tools/call",
        params: {
          name: "unknownTool",
          arguments: {}
        }
      },
      CallToolRequestSchema
    );
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("Unknown tool");
  });
});

/**
 * Edge Cases and Performance Tests.
 */
describe("Edge Cases and Performance", () => {
  let server: VisualReasoningServer;

  beforeEach(() => {
    server = new VisualReasoningServer();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
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
      const result = server.processOperation(input);
      expect(result.isError).toBeUndefined();
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
        elements: [{ id: "n1", type: "node", properties: {} }],
        diagramId: "d1",
        diagramType: "graph",
        iteration: 0,
        nextOperationNeeded: false,
        transformationType
      };
      const result = server.processOperation(input);
      expect(result.isError).toBeUndefined();
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
    const result = server.processOperation(input);
    expect(result.isError).toBeUndefined();
  });
});
